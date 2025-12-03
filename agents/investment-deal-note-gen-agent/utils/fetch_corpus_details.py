from google import auth
import vertexai
from vertexai.preview import rag
from google.adk.agents.callback_context import CallbackContext
from config import Config
from utils import read_benchmark_framework_text

GCP_CLOUD_PROJECT = Config.GCP_CLOUD_PROJECT
GCP_CLOUD_REGION = Config.GCP_CLOUD_REGION
SUB_AGENTS_RAG_CORPUS_PREFIX = Config.SUB_AGENTS_RAG_CORPUS_PREFIX

def initialize_vertex_ai():
    """
    Initializes the Vertex AI SDK and Firestore client with the project configuration.
    
    Sets up the global firestore_client and authenticates using default credentials.
    """
    # global firestore_client
    credentials, _ = auth.default(
        scopes=["https://www.googleapis.com/auth/cloud-platform"])
    vertexai.init(
        project=Config.GCP_CLOUD_PROJECT,
        location=Config.GCP_CLOUD_REGION,
        credentials=credentials
    )


async def fetch_rag_corpus(callback_context: CallbackContext) -> None:
    """Prepares the RAG corpus for the sub-agents."""
    initialize_vertex_ai()

    # Retrieve the company document ID from the callback context state
    current_state = callback_context.state.to_dict()
    company_doc_id = current_state.get("company_doc_id")

    # Validate that company_doc_id is present
    if not company_doc_id:
        raise ValueError(
            "company_doc_id is missing in the callback context state.")

    # Construct the expected corpus display name
    corpus_display_name = f"{SUB_AGENTS_RAG_CORPUS_PREFIX}_{company_doc_id}"

    # Check if the corpus already exists in Vertex AI
    existing_corpora = rag.list_corpora()
    for existing_corpus in existing_corpora:
        if existing_corpus.display_name == corpus_display_name:
            print(f"Corpus '{corpus_display_name}' already exists.")
            # Update state with corpus details for downstream tools
            callback_context.state.update({
                **callback_context.state.to_dict(),
                "rag_corpus_display_name": existing_corpus.display_name,
                "rag_corpus_name": existing_corpus.name,
                "benchmarking_framework_text": read_benchmark_framework_text()
            })
            return None

    # If corpus is not found, raise an error (creation is handled elsewhere)
    raise RuntimeError(f"Corpus '{corpus_display_name}' does not exist.")