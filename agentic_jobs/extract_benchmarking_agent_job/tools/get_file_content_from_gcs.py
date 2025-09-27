from google.cloud import storage
from config import Config


def get_file_content_from_gcs(bucket_name: str, folder_name: str, file_name: str, file_extension: str) -> str:
    """
    Retrieves the content of a file from a Google Cloud Storage bucket.

    Args:
        bucket_name (str): The name of the GCS bucket.
        folder_name (str): The name of the folder in the GCS bucket.
        file_name (str): The name of the file in the GCS bucket.
        file_extension (str): The extension of the file (e.g., 'pdf', 'json', 'txt', 'md') without leading '.'.

    Returns:
        str: The content of the file as a string.
    """

    storage_client = storage.Client(project=Config.GOOGLE_CLOUD_PROJECT)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(f"{folder_name}/{file_name}.{file_extension.lower()}")
    content_bytes = blob.download_as_bytes()
    content = content_bytes.decode('utf-8', errors='ignore')

    return content