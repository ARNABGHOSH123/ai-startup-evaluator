from google.cloud import firestore
from config import Config

firestore_client = firestore.Client(
    project=Config.GOOGLE_CLOUD_PROJECT, database=Config.FIRESTORE_DATABASE)


def update_sub_agent_result_to_firestore(collection_name: str, document_id: str, sub_agent_field: str, gcs_uri: str):
    """
    Save the given content to a Firestore document.

    Args:
        document_id (str): The ID of the Firestore document to update.
        content (dict): The content to save in the document.
    """
    try:
        curr_content = firestore_client.collection(
            collection_name).document(document_id).get().to_dict()
        if not curr_content:
            raise ValueError(
                f"Document {document_id} not found in collection {collection_name}.")
        curr_sub_agents_results = curr_content.get("sub_agents_results", {})
        curr_sub_agents_results[sub_agent_field] = gcs_uri
        content = {"sub_agents_results": curr_sub_agents_results}
        firestore_client.collection(collection_name).document(
            document_id).update(content)
        print(
            f"Successfully saved content to Firestore document {document_id}.")
    except Exception as e:
        print(f"Error saving content to Firestore document {document_id}: {e}")
