from google.cloud import storage
import json
from config import Config


def get_deck_inv_deal_note(firestore_doc_id: str, folder_name: str = Config.GCP_PITCH_DECK_OUTPUT_FOLDER) -> dict:
    """
    Retrieves the pitch deck JSON and investment deal note markdown content from a Google Cloud Storage bucket.

    Args:
        firestore_doc_id (str): The Firestore document ID to retrieve the files for.
        folder_name (str): The name of the folder in the GCS bucket.

    Returns:
        dict: A dictionary containing the content of the pitch deck as well as investment deal note markdown.
    """

    if not firestore_doc_id:
        return None

    storage_client = storage.Client(project=Config.GOOGLE_CLOUD_PROJECT)
    bucket = storage_client.bucket(bucket_name=Config.GCS_BUCKET_NAME)

    pitch_deck_path = f"{folder_name.rstrip('/')}/{firestore_doc_id}/analysis/"
    pitch_deck_blob_list = list(bucket.list_blobs(prefix=pitch_deck_path))
    pitch_deck_blob = next((b for b in pitch_deck_blob_list if b.name.endswith(".json")), None)
    if not pitch_deck_blob:
        return None

    investment_deal_note_path = f"{folder_name.rstrip('/')}/{firestore_doc_id}/investment_memos/"
    investment_deal_note_blob_list = list(
        bucket.list_blobs(prefix=investment_deal_note_path))
    investment_deal_note_blob = next((b for b in investment_deal_note_blob_list if b.name.endswith(".md")), None)

    if not investment_deal_note_blob:
        return None

    pitch_deck_content = None
    if pitch_deck_blob:
        try:
            # Download as string and parse with json.loads()
            pitch_deck_content = json.loads(
                pitch_deck_blob.download_as_string())
        except json.JSONDecodeError:
            # Handle cases where the file is not valid JSON
            pitch_deck_content = {
                "error": "Failed to decode JSON from pitch deck file."}

    return {
        "pitch_deck": pitch_deck_content,
        "investment_deal_note": investment_deal_note_blob.download_as_string().decode('utf-8', errors='ignore') if investment_deal_note_blob else None
    }
