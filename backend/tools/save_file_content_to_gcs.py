from config import Config
from google.cloud import storage
from google.adk.tools import FunctionTool

GCP_PITCH_DECK_OUTPUT_FOLDER = Config.GCP_PITCH_DECK_OUTPUT_FOLDER
GCP_PROJECT_ID = Config.GCP_PROJECT_ID

CONTENT_TYPE_MAP = {
    "json": "application/json",
    "md": "text/markdown",
    "txt": "text/plain",
}


def save_file_content_to_gcs(bucket_name: str, folder_name: str, file_content: str, file_extension: str, file_name: str) -> None:
    """
    Saves content to a file in a Google Cloud Storage bucket. If the file
    already exists, it will be overwritten.

    Args:
        bucket_name (str): The name of the GCS bucket.
        folder_name (str): The name of the folder in the GCS bucket.
        file_content (str): The content of the file to be saved.
        file_extension (str): The extension of the file (e.g., 'json', 'txt', 'md') without leading '.'.
        file_name (str): The name of the file in the GCS bucket.
    """

    storage_client = storage.Client(project=GCP_PROJECT_ID)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(
        f"{folder_name}/{file_name}.{file_extension.lower()}")

    content_type = CONTENT_TYPE_MAP.get(
        file_extension.lower(), "application/octet-stream")

    # The upload_from_string method will overwrite the file if it already exists.
    blob.upload_from_string(data=file_content,
                            content_type=content_type)

save_file_content_to_gcs_tool = FunctionTool(func=save_file_content_to_gcs)
