from typing import Optional
from google.cloud import storage
from typing import Dict, Any, List, Tuple
import asyncio
import json

MAX_BYTES_TO_READ = 5 * 1024 * 1024  # 5 MB safety cap (adjust as needed)

def read_text_from_gcs(storage_client, gs_uri: str, max_bytes: int = MAX_BYTES_TO_READ) -> Optional[str]:
    """
    Download and return the contents of a GCS object referenced by a gs://... URI.
    Returns None on failure (not found / permission / empty / invalid URI).
    """
    if not gs_uri:
        return None

    if not gs_uri.startswith("gs://"):
        # not a GCS URI
        return None

    # Parse gs://bucket/path/to/blob.ext
    try:
        path = gs_uri[5:]  # strip "gs://"
        bucket_name, blob_path = path.split("/", 1)
    except ValueError:
        # no path part after bucket
        return None

    try:
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_path)

        # Optionally check existence and size first:
        if not blob.exists():
            return None

        # If size known and too big, optionally avoid full download
        if blob.size is not None and blob.size > max_bytes:
            # download only first max_bytes bytes to avoid memory spike
            # Note: google-cloud-storage doesn't support ranged reads with download_as_bytes directly,
            # so we do a full download here unless you implement streaming. For now, refuse.
            return None

        content_bytes = blob.download_as_bytes()
        if not content_bytes:
            return None

        # Try decode; fallback to ignoring errors
        try:
            content = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            content = content_bytes.decode("utf-8", errors="ignore")

        return content

    except Exception:
        # You might want to log the exception in real code
        return None


async def get_charts_for_a_company_async(storage_client: storage.Client, bucket_name: str, folder_name: str, max_concurrency: int = 10) -> Dict[str, List[Any]]:
    """
    Async version: fetch JSON files under `folder_name` in parallel using threads.

    Returns a dict mapping subfolder -> list of parsed JSON contents.
    """
    charts: Dict[str, List[Any]] = {}

    try:
        bucket = storage_client.bucket(bucket_name)
        prefix = folder_name.rstrip("/") + "/"
        blobs = list(bucket.list_blobs(prefix=prefix))
    except Exception:
        return {}

    # prepare work items (subfolder, gs_uri)
    work_items: List[Tuple[str, str]] = []
    for blob in blobs:
        if blob.name.endswith("/"):
            continue
        relative_path = blob.name[len(prefix):]
        if not relative_path:
            continue
        path_parts = relative_path.split("/")
        if len(path_parts) <= 1:
            # skip files directly under the folder
            continue
        subfolder_name = path_parts[0]
        gs_uri = f"gs://{bucket_name}/{blob.name}"
        work_items.append((subfolder_name, gs_uri))

    semaphore = asyncio.Semaphore(max_concurrency)

    async def _load_item(subfolder: str, uri: str):
        async with semaphore:
            try:
                text = await asyncio.to_thread(read_text_from_gcs, storage_client, uri)
                if not text:
                    return subfolder, None, f"empty:{uri}"
                data = json.loads(text)
                return subfolder, data, None
            except json.JSONDecodeError as je:
                return subfolder, None, f"json_error:{je}"
            except Exception as e:
                return subfolder, None, str(e)

    tasks = [asyncio.create_task(_load_item(s, u)) for s, u in work_items]
    if not tasks:
        return {}

    results = await asyncio.gather(*tasks)

    for subfolder, content, err in results:
        if content is None:
            continue
        charts.setdefault(subfolder, []).append(content)

    return charts


def get_charts_for_a_company(storage_client: storage.Client, bucket_name: str, folder_name: str, max_concurrency: int = 10) -> Dict[str, List[Any]]:
    """
    Synchronous wrapper for compatibility: runs the async loader if no running event loop.
    If called from an active event loop, raises RuntimeError and caller should use the async API.
    """
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(get_charts_for_a_company_async(storage_client, bucket_name, folder_name, max_concurrency))
    else:
        raise RuntimeError("get_charts_for_a_company called inside running event loop; use get_charts_for_a_company_async instead")
