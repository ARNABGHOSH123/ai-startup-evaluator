from config import Config
from google.adk.tools import FunctionTool

GCP_PITCH_DECK_INPUT_FOLDER = Config.GCP_PITCH_DECK_INPUT_FOLDER or "uploads"


def get_gcs_uri_for_file(bucket_name: str, file_name: str, file_extension: str) -> str:
    """
    Constructs the GCS URI for a given file.

    Args:
        bucket_name (str): The name of the GCS bucket.
        file_name (str): The name of the file in the GCS bucket.
        file_extension (str): The extension of the file (e.g., 'pdf') without a leading '.'.

    Returns:
        str: The GCS URI for the file (e.g., 'gs://bucket/folder/file.pdf').
    """
    blob_path = f"{GCP_PITCH_DECK_INPUT_FOLDER}/{file_name}.{file_extension.lower()}"
    gcs_uri = f"gs://{bucket_name}/{blob_path}"
    print(f"Constructed GCS URI: {gcs_uri}")
    return gcs_uri

gcs_uri_for_file_tool = FunctionTool(func=get_gcs_uri_for_file)
