from vertexai.preview import rag
import vertexai
from google import auth
from google.adk.agents.callback_context import CallbackContext
from config import Config

GOOGLE_CLOUD_PROJECT = Config.GOOGLE_CLOUD_PROJECT
GOOGLE_CLOUD_REGION = Config.GOOGLE_CLOUD_REGION
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
        project=GOOGLE_CLOUD_PROJECT,
        location=GOOGLE_CLOUD_REGION,
        credentials=credentials
    )


def prepare_rag_corpus(callback_context: CallbackContext) -> None:
    """Prepares the RAG corpus for the sub-agents."""
    initialize_vertex_ai()
    current_state = callback_context.state.to_dict()
    company_doc_id = current_state.get("firestore_doc_id")
    if not company_doc_id:
        raise ValueError(
            "company_doc_id is missing in the callback context state.")
    corpus_display_name = f"{SUB_AGENTS_RAG_CORPUS_PREFIX}_{company_doc_id}"
    # Check if a corpus for this company already exists to avoid duplicates
    existing_corpora = rag.list_corpora()
    for existing_corpus in existing_corpora:
        if existing_corpus.display_name == corpus_display_name:
            print(f"Corpus '{corpus_display_name}' already exists. Deleting the existing corpus.")
            rag.delete_corpus(name=existing_corpus.name)
            break

    # Create a new RAG corpus if it doesn't exist
    corpus = rag.create_corpus(
        display_name=corpus_display_name,
        description=f"RAG corpus for company {company_doc_id}",
        embedding_model_config=rag.EmbeddingModelConfig(
            publisher_model="publishers/google/models/text-multilingual-embedding-002"
        ),
        vector_db=rag.RagManagedDb(retrieval_strategy=rag.KNN()),
    )
    callback_context.state.update({
        **callback_context.state.to_dict(),
        "rag_corpus_display_name": corpus.display_name,
        "rag_corpus_name": corpus.name
    })
    print(f"Created new corpus: {corpus.display_name} with ID: {corpus.name}")
