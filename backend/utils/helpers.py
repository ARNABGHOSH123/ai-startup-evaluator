from typing import Optional;
from google.cloud import storage
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

def get_charts_for_a_company(storage_client: storage.Client, bucket_name: str, folder_name: str) -> dict:
    """
    Returns the charts generated while creating investment deal note v1 for a company by extract_benchmarking_agent_job.
    """
    charts = {}

    try:

        bucket = storage_client.bucket(bucket_name)
        prefix = folder_name + "/" if not folder_name.endswith("/") else folder_name
        blobs = bucket.list_blobs(prefix=prefix)

        for blob in blobs:
            if blob.name.endswith('/'):
                continue  # skip folders
            relative_path = blob.name[len(prefix):]  # path relative to folder_name
            path_parts = relative_path.split('/')

            if len(path_parts) > 1:
                subfolder_name = path_parts[0]
            else:
                # Skip files directly under the 'visualisations' folder
                print(f"Skipping file not in a subfolder: {blob.name}")
                continue

            content = json.loads(read_text_from_gcs(storage_client, f"gs://{bucket_name}/{blob.name}"))

            charts.setdefault(subfolder_name, []).append(content)
        
    except json.JSONDecodeError as e_json:
        print(f"Error occured while decoding JSON: {e_json}")
        
    except Exception as e:
        print(f"Error while fetching charts from GCS: {e}")

    return charts
