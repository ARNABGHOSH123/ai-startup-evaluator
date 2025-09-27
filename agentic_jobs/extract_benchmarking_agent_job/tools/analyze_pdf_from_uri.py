# analyze_pdf_async.py
from google.genai import types
from google.genai.types import Part
from concurrent.futures import ThreadPoolExecutor
from google.cloud import storage
import logging
from typing import List, Optional, Callable, Any
from google import genai
import tempfile
import asyncio
import uuid
import gc
import os
import math
import fitz
import atexit
from config import Config

# --------- Config / constants ----------
AGENT_MODEL = Config.AGENT_MODEL
GOOGLE_CLOUD_PROJECT = Config.GOOGLE_CLOUD_PROJECT
GOOGLE_CLOUD_REGION = Config.GOOGLE_CLOUD_REGION
GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GCP_PITCH_DECK_OUTPUT_FOLDER = Config.GCP_PITCH_DECK_OUTPUT_FOLDER

CHUNK_PAGES = 10            # lower this for image-heavy PDFs
GCS_TEMP_PREFIX = "tmp_chunks"
# conservative for Cloud Run 512MiB; tune upward if you have more memory
MAX_CONCURRENT_CHUNKS = 3
EXECUTOR_WORKERS = MAX_CONCURRENT_CHUNKS + 4

logger = logging.getLogger("analyze_pdf_from_uri")
logger.setLevel(logging.INFO)

# thread executor used for blocking I/O (GCS + genai sync calls)
_EXECUTOR = ThreadPoolExecutor(max_workers=EXECUTOR_WORKERS)
# ensure executor shuts down cleanly on process exit
atexit.register(lambda: _EXECUTOR.shutdown(wait=False))

# clients
storage_client = storage.Client(project=GOOGLE_CLOUD_PROJECT)
genai_client = genai.Client(
    vertexai=True, project=GOOGLE_CLOUD_PROJECT, location=GOOGLE_CLOUD_REGION)

PDF_ANALYZER_INSTRUCTION = """
You are a meticulous, expert startup analyst with multimodal understanding.
Your task is to analyze the entire PDF document provided, including ALL text and visual elements (images, graphs, charts, diagrams).

CRITICAL INSTRUCTIONS:
- Stick STRICTLY to the information presented in the pitch deck. Do not infer or add any information that is not explicitly present.
- If a specific piece of information is not in the deck, you MUST return a `null` value for that field. Do not write "not specified" or "N/A".
- Your output MUST be a valid JSON object containing the extracted data. Do not add any other text or markdown formatting.
- Pitch deck may have multiple company names. Therefore you must extract the company websites if you find it.

Extract the following information into a structured JSON object:
    - company_name: The name of the company.
    - company_websites: List of company websites extracted from pitching deck if available.
    - parent_company_details: List of parent companies if available along with their website links.
    - contact_information: Contact information of the founders or of the company (mobile no, phone no, email ids, etc.) if available.
    - problem: The specific problem the company is solving.
    - solution: The solution the company is offering.
    - market_size: The Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Serviceable Obtainable Market (SOM), if mentioned.
    - team_members: A list of key team members, their names, and their roles/experience.
    - traction: Key metrics, customer names, pilots, or revenue figures that demonstrate progress.
    - public_competitor_symbols: A list of any public companies mentioned as competitors. If stock symbols are not given, state the company names.
    - funding_details: The amount of funding being sought ("The Ask") and the intended "Use of Funds".
    - business_model: The company's revenue model, pricing, and target customer profile.
    - financial_projections: A summary of future revenue or financial projections, often found in charts or tables.
"""

PDF_SYNTHESIS_INSTRUCTION = """
You are an expert data synthesis agent. I have analyzed a large document in chunks and have received multiple JSON objects, one for each chunk.
Your task is to merge these partial JSON objects into a single, coherent JSON object that represents the entire document.

CRITICAL INSTRUCTIONS:
- The final output MUST be a single, valid JSON object.
- Consolidate information from all chunks accurately.
- For list fields (like 'team_members', 'public_competitor_symbols', 'financial_projections'), combine all unique items from all chunks. Do not create nested lists.
- For string or object fields (like 'company_name', 'problem', 'solution'), if a value is found in any chunk, use it. If different chunks provide different non-null values for the same field, use the value from the earliest chunk (first in the list) as it is more likely to be the primary definition. If a field is null in all chunks, it should be `null` in the final JSON.
- Adhere strictly to the original JSON structure provided in the first chunk.

Here are the JSON objects from the document chunks:
"""

# --------- Helper functions (I/O in executor) ----------


async def _upload_blob_in_executor(bucket_name: str, local_path: str, blob_name: str) -> bool:
    loop = asyncio.get_running_loop()

    def _upload():
        b = storage_client.bucket(bucket_name).blob(blob_name)
        b.upload_from_filename(local_path, content_type="application/pdf")
        return True

    return await loop.run_in_executor(_EXECUTOR, _upload)


async def _delete_blob_in_executor(bucket_name: str, blob_name: str) -> bool:
    loop = asyncio.get_running_loop()

    def _delete():
        storage_client.bucket(bucket_name).blob(blob_name).delete()
        return True

    return await loop.run_in_executor(_EXECUTOR, _delete)


async def _call_model_in_executor(gcs_chunk_uri: str, attempts: int = 3, per_try_timeout: int = 120) -> str:
    """
    Call the synchronous genai client.generate_content in executor, with retries + timeout.
    Returns the most appropriate textual content (prefers structured response parts if present).
    """
    loop = asyncio.get_running_loop()

    def _call_sync():
        part = Part.from_uri(file_uri=gcs_chunk_uri,
                             mime_type="application/pdf")
        resp = genai_client.models.generate_content(
            model=AGENT_MODEL,
            contents=[PDF_ANALYZER_INSTRUCTION, part],
            config=types.GenerateContentConfig(temperature=0),
        )
        return resp

    last_exc = None
    for i in range(attempts):
        try:
            resp = await asyncio.wait_for(loop.run_in_executor(_EXECUTOR, _call_sync), timeout=per_try_timeout)

            # Prefer structured candidate.parts if available (handles function_call / non-text parts)
            try:
                candidates = getattr(resp, "candidates", None)
                if candidates and len(candidates) > 0:
                    content = getattr(candidates[0], "content", None)
                    if content and getattr(content, "parts", None):
                        texts = [getattr(p, "text", "")
                                 for p in content.parts if getattr(p, "text", None)]
                        joined = "\n".join([t for t in texts if t])
                        if joined:
                            return joined
            except Exception:
                logger.debug(
                    "Failed to parse structured response parts; falling back to resp.text", exc_info=True)

            # fallback
            return resp.text or ""
        except Exception as e:
            last_exc = e
            backoff = 1.5 * (2 ** i)
            logger.warning(
                "model call attempt %d/%d failed: %s; retry in %.1f s", i + 1, attempts, e, backoff)
            await asyncio.sleep(backoff)

    raise RuntimeError(
        f"Model call failed after {attempts} attempts: {last_exc}")


async def _retry_with_backoff(fn: Callable[..., Any], *args, attempts: int = 3, base: float = 1.0, **kwargs) -> Any:
    """
    Generic async retry wrapper (exponential backoff). `fn` must be an async callable.
    """
    last_exc = None
    for n in range(attempts):
        try:
            return await fn(*args, **kwargs)
        except Exception as e:
            last_exc = e
            wait = base * (2 ** n)
            logger.debug(
                "retryable op failed (attempt %d/%d): %s. sleeping %.2fs", n + 1, attempts, e, wait)
            await asyncio.sleep(wait)
    raise last_exc

# --------- Chunk processing worker ----------


async def _process_chunk(local_chunk_path: str, bucket_name: str, semaphore: asyncio.Semaphore) -> Optional[str]:
    """
    Upload the local chunk to GCS, call the model, validate JSON output, then cleanup (local & GCS).
    Returns cleaned JSON string on success or None on failure.
    """
    async with semaphore:
        chunk_blob_name = f"{GCS_TEMP_PREFIX}/{uuid.uuid4().hex}.pdf"
        gcs_chunk_uri = f"gs://{bucket_name}/{chunk_blob_name}"

        try:
            # Upload with retries
            await _retry_with_backoff(_upload_blob_in_executor, bucket_name, local_chunk_path, chunk_blob_name,
                                      attempts=3, base=1.0)

            # Model call (function has its own retries/timeouts)
            raw_text = await _call_model_in_executor(gcs_chunk_uri)

            # Clean wrapper fences and validate JSON
            cleaned = raw_text.strip().removeprefix("```json").removesuffix("```").strip()
            try:
                import json
                json.loads(cleaned)
                return cleaned
            except Exception:
                logger.warning(
                    "Chunk model output invalid JSON for %s", local_chunk_path)
                return None

        finally:
            # Best-effort local cleanup
            try:
                if os.path.exists(local_chunk_path):
                    os.remove(local_chunk_path)
            except Exception as e:
                logger.debug("Failed to remove local chunk %s: %s",
                             local_chunk_path, e)

            # Best-effort delete GCS temporary chunk (retry)
            try:
                await _retry_with_backoff(_delete_blob_in_executor, bucket_name, chunk_blob_name, attempts=2, base=0.5)
            except Exception as e:
                # don't stall whole flow for delete failures; log and move on
                logger.debug(
                    "Failed to delete temporary GCS blob %s after retries: %s", chunk_blob_name, e)

            # encourage immediate reclaim of Python-level references
            try:
                gc.collect()
            except Exception:
                pass

# --------- Main async analyze function ----------


async def analyze_pdf_from_uri(gcs_uri: str) -> str:
    """Analyze a pitch-deck PDF stored in Google Cloud Storage and return merged JSON.

    This coroutine performs a multi-step, chunked analysis of a PDF located at the
    given `gcs_uri`. The function:

      1. Downloads the PDF to a temporary directory (blocking I/O performed in a
         threadpool executor).
      2. Splits the PDF sequentially into smaller chunk files using PyMuPDF
         (fitz). PyMuPDF is *not* thread-safe, so splitting is performed
         sequentially in-process.
      3. Uploads each chunk to a temporary GCS path and invokes a synchronous
         GenAI model call in parallel for each chunk (bounded concurrency).
      4. Collects the per-chunk JSON outputs, synthesizes them via a final
         GenAI call, and returns the merged JSON string.

    The returned string is expected to be a valid JSON document (typically the
    JSON produced by the synthesis step). The function tries to validate each
    chunk's JSON before synthesis; chunks that fail validation are skipped.

    Args:
        gcs_uri (str): Google Cloud Storage URI of the input PDF (format
            "gs://bucket/path/to/file.pdf").

    Returns:
        str: A JSON string that represents the merged extraction/synthesis of the
        entire document. On error, the function may return a JSON string
        describing the error (for example: '{"error":"..."}') or raise an exception
        (see **Raises**).

    Raises:
        FileNotFoundError: If the input `gcs_uri` is malformed or the GCS blob is
            not available at download time.
        RuntimeError: If the GenAI model calls fail repeatedly (after configured
            retries) or if the synthesis step fails.
        Exception: Other unexpected exceptions (network, GCS, filesystem, or
            PyMuPDF errors) may be raised; callers should catch and handle them
            as appropriate.

    Side effects:
        * Creates temporary files under a process-local temporary directory
          (e.g., `/tmp` inside the container). Chunk files are removed as each
          chunk is processed; the temporary directory is removed when the
          coroutine returns or when the context exits.
        * Uploads temporary chunk files to a configured GCS temporary prefix
          (deleted after each chunk is processed).

    Notes:
        * Splitting uses PyMuPDF (fitz) and must be done sequentially because
          PyMuPDF is not thread-safe. Network / model calls are performed in
          parallel (bounded) to improve throughput.
        * On container platforms such as Cloud Run, the service's `/tmp` is an
          ephemeral tmpfs (in-memory) filesystem; temporary files consume instance
          memory while present. Delete and close file handles early to avoid
          memory pressure or OOMs. See Cloud Run docs for ephemeral storage
          details. :contentReference[oaicite:1]{index=1}
        * The function uses a thread executor for blocking calls (GCS upload/download,
          synchronous model calls) and `asyncio` for coordinating concurrency.
        * Tune `MAX_CONCURRENT_CHUNKS` (or equivalent) based on available memory.
          On small instances (e.g., 512 MiB) prefer a conservative concurrency
          (2–3) to avoid tmpfs memory exhaustion.

    Example:
        >>> result_json = await analyze_pdf_from_uri_async("gs://my-bucket/pitch.pdf")
        >>> obj = json.loads(result_json)
        >>> print(obj.get("company_name"))
    """
    bucket_name, blob_name = gcs_uri.replace("gs://", "").split("/", 1)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    loop = asyncio.get_running_loop()

    # Create ephemeral tempdir (auto-cleaned when context exits)
    with tempfile.TemporaryDirectory(prefix="pdf_worker_") as tmpdir:
        local_pdf = os.path.join(tmpdir, f"input_{uuid.uuid4().hex}.pdf")

        # Download (blocking) in executor
        def _download():
            blob.download_to_filename(local_pdf)
            return True

        await loop.run_in_executor(_EXECUTOR, _download)

        # Open and split sequentially (PyMuPDF is NOT thread-safe)
        doc = fitz.open(local_pdf)
        total_pages = len(doc)
        num_chunks = math.ceil(total_pages / CHUNK_PAGES)

        local_chunk_paths: List[str] = []
        for i in range(num_chunks):
            start = i * CHUNK_PAGES
            end = min((i + 1) * CHUNK_PAGES, total_pages)
            chunk_doc = fitz.open()
            chunk_doc.insert_pdf(doc, from_page=start, to_page=end - 1)
            local_chunk = os.path.join(tmpdir, f"chunk_{uuid.uuid4().hex}.pdf")
            chunk_doc.save(local_chunk)
            chunk_doc.close()
            local_chunk_paths.append(local_chunk)
            # small hint to GC between chunk saves
            gc.collect()

        # Close master doc and remove original downloaded PDF BEFORE the parallel phase
        try:
            doc.close()
        except Exception:
            pass

        try:
            if os.path.exists(local_pdf):
                os.remove(local_pdf)
        except Exception:
            pass

        # Attempt to shrink PyMuPDF internal caches (if available)
        try:
            try:
                fitz.TOOLS.store_shrink()
            except Exception:
                pass
        except Exception:
            pass

        gc.collect()

        # Process chunk uploads + model calls in parallel (bounded concurrency)
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_CHUNKS)
        tasks = [asyncio.create_task(_process_chunk(
            p, bucket_name, semaphore)) for p in local_chunk_paths]

        # Use return_exceptions=True to collect per-task failures
        results = await asyncio.gather(*tasks, return_exceptions=True)

        partial_results: List[str] = []
        for idx, res in enumerate(results):
            if isinstance(res, Exception):
                logger.warning("chunk task %d raised: %s", idx, res)
            elif res:
                partial_results.append(res)

        if not partial_results:
            return '{"error":"No valid JSON could be extracted from any of the PDF chunks."}'

        # Synthesis step (single blocking call in executor). Extract structured parts if possible.
        def _synth_call():
            resp = genai_client.models.generate_content(
                model=AGENT_MODEL,
                contents=[PDF_SYNTHESIS_INSTRUCTION] + partial_results,
                config=types.GenerateContentConfig(temperature=0),
            )
            # prefer structured parts
            try:
                candidates = getattr(resp, "candidates", None)
                if candidates and len(candidates) > 0:
                    content = getattr(candidates[0], "content", None)
                    if content and getattr(content, "parts", None):
                        texts = [getattr(p, "text", "")
                                 for p in content.parts if getattr(p, "text", None)]
                        joined = "\n".join([t for t in texts if t])
                        if joined:
                            return joined
            except Exception:
                logger.debug(
                    "Failed to parse synthesis structured parts; falling back to resp.text", exc_info=True)
            return resp.text or ""

        synthesis_raw = await loop.run_in_executor(_EXECUTOR, _synth_call)
        final_clean = synthesis_raw.strip().removeprefix(
            "```json").removesuffix("```").strip()
        # optional: validate JSON
        return final_clean
