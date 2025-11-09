# analyze_pdf_async.py
from google.genai import types
from google.genai.types import Part
from concurrent.futures import ThreadPoolExecutor
from google.cloud import storage
import logging
import subprocess
import shutil
from typing import List, Optional, Callable, Any, Tuple
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
GOOGLE_CLOUD_PROJECT = Config.GOOGLE_CLOUD_PROJECT
GOOGLE_CLOUD_REGION = Config.GOOGLE_CLOUD_REGION
GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GCP_PITCH_DECK_OUTPUT_FOLDER = Config.GCP_PITCH_DECK_OUTPUT_FOLDER
MODEL = Config.REPORT_GENERATION_AGENT_MODEL

CHUNK_PAGES = 10            # lower this for image-heavy PDFs
GCS_TEMP_PREFIX = "tmp_chunks"
# conservative for Cloud Run 512MiB; tune upward if you have more memory
MAX_CONCURRENT_CHUNKS = 3
EXECUTOR_WORKERS = MAX_CONCURRENT_CHUNKS + 4

logger = logging.getLogger("analyze_doc_from_uri")
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

# Instruction for audio/video analysis (long recordings/presentations)
AUDIO_VIDEO_ANALYZER_INSTRUCTION = """
You are a meticulous, expert startup analyst with multimodal understanding.
Your task is to analyze the entire recording/presentation provided (audio or video), including spoken content and any described visuals.

CRITICAL INSTRUCTIONS:
- Stick STRICTLY to the information presented in the recording/presentation. Do not infer or add any information that is not explicitly present.
- If a specific piece of information is not present, you MUST return a `null` value for that field. Do not write "not specified" or "N/A".
- Your output MUST be a valid JSON object containing the extracted data. Do not add any other text or markdown formatting.

Extract the following information into a structured JSON object:
    - company_name: The name of the company.
    - company_websites: List of company websites if mentioned.
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
    - financial_projections: A summary of future revenue or financial projections if mentioned.
"""

# --------- Helper functions (I/O in executor) ----------


async def _upload_blob_in_executor(bucket_name: str, local_path: str, blob_name: str, content_type: str) -> bool:
    loop = asyncio.get_running_loop()

    def _upload():
        b = storage_client.bucket(bucket_name).blob(blob_name)
        b.upload_from_filename(local_path, content_type=content_type)
        return True

    return await loop.run_in_executor(_EXECUTOR, _upload)


async def _delete_blob_in_executor(bucket_name: str, blob_name: str) -> bool:
    loop = asyncio.get_running_loop()

    def _delete():
        storage_client.bucket(bucket_name).blob(blob_name).delete()
        return True

    return await loop.run_in_executor(_EXECUTOR, _delete)


async def _call_model_in_executor(gcs_chunk_uri: str, mime_type: str = "application/pdf", attempts: int = 3, per_try_timeout: int = 120) -> str:
    """
    Call the synchronous genai client.generate_content in executor, with retries + timeout.
    Returns the most appropriate textual content (prefers structured response parts if present).
    """
    loop = asyncio.get_running_loop()

    def _call_sync():
        part = Part.from_uri(file_uri=gcs_chunk_uri,
                             mime_type=mime_type)
        resp = genai_client.models.generate_content(
            model=MODEL,
            contents=[PDF_ANALYZER_INSTRUCTION if mime_type == "application/pdf" else AUDIO_VIDEO_ANALYZER_INSTRUCTION, part],
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


async def _process_chunk(local_chunk_path: str, bucket_name: str, semaphore: asyncio.Semaphore, mime_type: str) -> Optional[str]:
    """
    Upload the local chunk to GCS, call the model, validate JSON output, then cleanup (local & GCS).
    Returns cleaned JSON string on success or None on failure.
    """
    async with semaphore:
        # Preserve appropriate extension for content type
        ext = os.path.splitext(local_chunk_path)[1].lstrip(".") or "bin"
        chunk_blob_name = f"{GCS_TEMP_PREFIX}/{uuid.uuid4().hex}.{ext}"
        gcs_chunk_uri = f"gs://{bucket_name}/{chunk_blob_name}"

        try:
            # Upload with retries
            await _retry_with_backoff(_upload_blob_in_executor, bucket_name, local_chunk_path, chunk_blob_name, mime_type,
                                      attempts=3, base=1.0)

            # Model call (function has its own retries/timeouts)
            raw_text = await _call_model_in_executor(gcs_chunk_uri, mime_type=mime_type)

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

def _soffice_convert_to_pdf(input_path: str, output_dir: str, timeout: int = 120) -> str:
    """Convert an Office document to PDF using LibreOffice (soffice) headless.

    Returns the path to the generated PDF inside output_dir.
    Raises RuntimeError on failure.
    """
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice:
        raise RuntimeError("LibreOffice (soffice) not found in PATH. Please ensure it is installed in the runtime image.")

    cmd = [
        soffice,
        "--headless",
        "--nologo",
        "--nolockcheck",
        "--nodefault",
        "--view",
        "--convert-to",
        "pdf",
        "--outdir",
        output_dir,
        input_path,
    ]
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True, timeout=timeout)
    except subprocess.TimeoutExpired as e:
        raise RuntimeError(f"LibreOffice conversion timed out: {e}")
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"LibreOffice conversion failed: {e.stderr.decode(errors='ignore') or e.stdout.decode(errors='ignore')}")

    # Determine expected output path: same basename with .pdf in output_dir
    base = os.path.splitext(os.path.basename(input_path))[0]
    out_path = os.path.join(output_dir, f"{base}.pdf")
    if not os.path.exists(out_path):
        # LibreOffice might change name slightly; try to locate a single PDF in output_dir with matching prefix
        cand = [p for p in os.listdir(output_dir) if p.lower().endswith(".pdf")]
        if len(cand) == 1:
            out_path = os.path.join(output_dir, cand[0])
    if not os.path.exists(out_path):
        raise RuntimeError("LibreOffice did not produce an output PDF as expected.")
    return out_path


async def _analyze_local_pdf(local_pdf: str, tmpdir: str, bucket_name: str) -> str:
    """Core pipeline that takes a local PDF path and performs chunking + model calls + synthesis."""
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
        p, bucket_name, semaphore, "application/pdf")) for p in local_chunk_paths]

    # Use return_exceptions=True to collect per-task failures
    results = await asyncio.gather(*tasks, return_exceptions=True)

    partial_results: List[str] = []
    for idx, res in enumerate(results):
        if isinstance(res, Exception):
            logger.warning("chunk task %d raised: %s", idx, res)
        elif res:
            partial_results.append(res)

    if not partial_results:
        return '{"error":"No valid JSON could be extracted from any of the chunks."}'

    # Synthesis step (single blocking call in executor). Extract structured parts if possible.
    def _synth_call():
        resp = genai_client.models.generate_content(
            model=MODEL,
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

    loop = asyncio.get_running_loop()
    synthesis_raw = await loop.run_in_executor(_EXECUTOR, _synth_call)
    final_clean = synthesis_raw.strip().removeprefix(
        "```json").removesuffix("```").strip()
    # optional: validate JSON
    return final_clean


# --------- Main async analyze functions ----------

async def analyze_textual_doc_from_uri(gcs_uri: str) -> str:
    """Analyze a pitch-deck document (pdf, doc, docx, ppt, pptx) in GCS and return merged JSON.

    Normalizes Office formats to PDF via headless LibreOffice conversion, then
    reuses the existing PDF chunking pipeline. Visuals and text are preserved
    through PDF normalization. Methodology otherwise remains identical to the
    previous PDF-only implementation.
    """
    bucket_name, blob_name = gcs_uri.replace("gs://", "").split("/", 1)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    ext = os.path.splitext(blob_name)[1].lower().lstrip(".")

    loop = asyncio.get_running_loop()
    with tempfile.TemporaryDirectory(prefix="doc_worker_") as tmpdir:
        # Download original file
        local_input = os.path.join(tmpdir, f"input_{uuid.uuid4().hex}.{ext or 'bin'}")

        def _download():
            blob.download_to_filename(local_input)
            return True

        await loop.run_in_executor(_EXECUTOR, _download)

        # If not PDF, convert to PDF using LibreOffice
        if ext not in {"pdf"}:
            try:
                local_pdf = _soffice_convert_to_pdf(local_input, tmpdir)
            except Exception as e:
                logger.error("Failed to convert %s to PDF: %s", blob_name, e)
                return '{"error":"Failed to convert document to PDF for analysis."}'
        else:
            local_pdf = local_input

        # Run the existing chunking + model pipeline
        return await _analyze_local_pdf(local_pdf, tmpdir, bucket_name)


MEDIA_SEGMENT_SECONDS = 300  # 5 minutes per chunk for long recordings


def _ffmpeg_path() -> str:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ffmpeg not found in PATH. Please ensure it is installed in the runtime image.")
    return ffmpeg


def _split_audio_to_chunks(input_path: str, output_dir: str, segment_seconds: int = MEDIA_SEGMENT_SECONDS) -> Tuple[List[str], str]:
    """Split audio into ~segment_seconds MP3 mono 16kHz chunks using ffmpeg. Returns (paths, mime)."""
    ffmpeg = _ffmpeg_path()
    out_pattern = os.path.join(output_dir, "audio_chunk_%03d.mp3")
    cmd = [
        ffmpeg,
        "-hide_banner",
        "-loglevel", "error",
        "-i", input_path,
        "-ac", "1",
        "-ar", "16000",
        "-c:a", "libmp3lame",
        "-b:a", "64k",
        "-f", "segment",
        "-segment_time", str(segment_seconds),
        "-reset_timestamps", "1",
        out_pattern,
    ]
    subprocess.run(cmd, check=True)
    # Collect resulting files in order
    files = [os.path.join(output_dir, f) for f in sorted(os.listdir(output_dir)) if f.startswith("audio_chunk_") and f.endswith(".mp3")]
    if not files:
        raise RuntimeError("ffmpeg did not produce audio chunks as expected.")
    return files, "audio/mpeg"


def _split_video_to_chunks(input_path: str, output_dir: str, segment_seconds: int = MEDIA_SEGMENT_SECONDS) -> Tuple[List[str], str]:
    """Split video into ~segment_seconds MP4 chunks using ffmpeg with lightweight re-encode. Returns (paths, mime)."""
    ffmpeg = _ffmpeg_path()
    out_pattern = os.path.join(output_dir, "video_chunk_%03d.mp4")
    cmd = [
        ffmpeg,
        "-hide_banner",
        "-loglevel", "error",
        "-i", input_path,
        "-vf", "scale=w=854:h=-2:force_original_aspect_ratio=decrease",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "28",
        "-c:a", "aac",
        "-b:a", "96k",
        "-f", "segment",
        "-segment_time", str(segment_seconds),
        "-reset_timestamps", "1",
        out_pattern,
    ]
    subprocess.run(cmd, check=True)
    files = [os.path.join(output_dir, f) for f in sorted(os.listdir(output_dir)) if f.startswith("video_chunk_") and f.endswith(".mp4")]
    if not files:
        raise RuntimeError("ffmpeg did not produce video chunks as expected.")
    return files, "video/mp4"


async def _analyze_local_media(local_input: str, tmpdir: str, bucket_name: str, media_type: str) -> str:
    """Analyze audio or video by splitting to chunks, uploading, running model per chunk, then synthesizing."""
    try:
        if media_type == "audio":
            chunk_paths, mime_type = _split_audio_to_chunks(local_input, tmpdir)
        else:
            chunk_paths, mime_type = _split_video_to_chunks(local_input, tmpdir)
    except Exception as e:
        logger.error("Failed to split %s: %s", media_type, e)
        print(e)
        return '{"error":"Failed to split media into chunks for analysis."}'

    semaphore = asyncio.Semaphore(MAX_CONCURRENT_CHUNKS)
    tasks = [asyncio.create_task(_process_chunk(p, bucket_name, semaphore, mime_type)) for p in chunk_paths]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    partial_results: List[str] = []
    for idx, res in enumerate(results):
        if isinstance(res, Exception):
            logger.warning("media chunk task %d raised: %s", idx, res)
        elif res:
            partial_results.append(res)

    if not partial_results:
        return '{"error":"No valid JSON could be extracted from any of the media chunks."}'

    def _synth_call():
        resp = genai_client.models.generate_content(
            model=MODEL,
            contents=[PDF_SYNTHESIS_INSTRUCTION] + partial_results,
            config=types.GenerateContentConfig(temperature=0),
        )
        try:
            candidates = getattr(resp, "candidates", None)
            if candidates and len(candidates) > 0:
                content = getattr(candidates[0], "content", None)
                if content and getattr(content, "parts", None):
                    texts = [getattr(p, "text", "") for p in content.parts if getattr(p, "text", None)]
                    joined = "\n".join([t for t in texts if t])
                    if joined:
                        return joined
        except Exception:
            logger.debug("Failed to parse synthesis structured parts; falling back to resp.text", exc_info=True)
        return resp.text or ""

    loop = asyncio.get_running_loop()
    synthesis_raw = await loop.run_in_executor(_EXECUTOR, _synth_call)
    final_clean = synthesis_raw.strip().removeprefix("```json").removesuffix("```").strip()
    return final_clean


async def analyze_doc_from_uri(gcs_uri: str, file_extension: str) -> str:
    """
    Analyze a pitch-deck artifact (pdf, doc, docx, ppt, pptx, m4a, mp4, mp3) in GCS and return merged JSON.
    """
    file_extension = (file_extension or "").lower()
    if file_extension in {"pdf", "doc", "docx", "ppt", "pptx"}:
        return await analyze_textual_doc_from_uri(gcs_uri)

    AUDIO_EXTS = {"mp3", "wav", "m4a", "aac", "flac", "ogg", "oga", "opus"}
    VIDEO_EXTS = {"mp4", "mov", "mkv", "webm", "avi", "m4v", "wmv"}

    bucket_name, blob_name = gcs_uri.replace("gs://", "").split("/", 1)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    media_type: Optional[str] = None
    if file_extension in AUDIO_EXTS:
        media_type = "audio"
    elif file_extension in VIDEO_EXTS:
        media_type = "video"
    else:
        return '{"error":"Unsupported file type for analysis."}'

    loop = asyncio.get_running_loop()
    with tempfile.TemporaryDirectory(prefix="media_worker_") as tmpdir:
        local_input = os.path.join(tmpdir, f"input_{uuid.uuid4().hex}.{file_extension}")

        def _download():
            blob.download_to_filename(local_input)
            return True

        await loop.run_in_executor(_EXECUTOR, _download)

        return await _analyze_local_media(local_input, tmpdir, bucket_name, media_type)

# if __name__ == "__main__":

#     import asyncio
#     asyncio.run(analyze_doc_from_uri("gs://pitching_decks/uploads/AXVNSoOLtvR2oGfgMeZ0/India_s_Pet_Healthcare_Revolution__Decoding_Dr.m4a", "m4a"))
