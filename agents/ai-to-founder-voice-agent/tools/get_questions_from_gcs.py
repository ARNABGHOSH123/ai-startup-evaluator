from google.cloud import storage
import json
from config import Config


def get_questions_from_gcs(company_doc_id: str, folder_name: str = Config.GCP_PITCH_DECK_OUTPUT_FOLDER) -> str:
    """
    Retrieves the questions file content from a Google Cloud Storage bucket.

    Args:
        company_doc_id (str): The Firestore document ID to retrieve the questions for.
        folder_name (str): The name of the folder in the GCS bucket.

    Returns:
        str: The content of the file as a string.
    """

    storage_client = storage.Client(project=Config.GOOGLE_CLOUD_PROJECT)
    bucket = storage_client.bucket(bucket_name=Config.GCS_BUCKET_NAME)
    blobs = list(bucket.list_blobs(
        prefix=f"{folder_name}/{company_doc_id}/questions/"))
    questions = blobs[0] if len(blobs) > 0 else None
    if not questions:
        return None

    try:
        content_str = questions.download_as_string()
        questions = json.loads(content_str).get("questions", [])
        if not questions:
            raise Exception("No questions found in the questions file.")
        return questions
    except json.JSONDecodeError:
        raise Exception("Failed to decode JSON from questions file.")
