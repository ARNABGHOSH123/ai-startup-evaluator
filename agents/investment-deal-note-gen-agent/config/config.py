import os
from dotenv import load_dotenv
from google.cloud import secretmanager

if os.path.exists(".env.development") and not os.getenv("PRODUCTION"):
    load_dotenv(dotenv_path=os.path.join(
        os.getcwd(), '.env.development'), override=True)
elif os.getenv("GOOGLE_CLOUD_PROJECT"):
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    settings_name = os.getenv(
        "SETTINGS_NAME", "env-keys-investment-deal-note-gen-agent")
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{settings_name}/versions/latest"
    payload = client.access_secret_version(
        name=name).payload.data.decode("UTF-8")
    for line in payload.split("\n"):
        key, value = line.split("=", 1)
        os.environ[key] = value
else:
    raise RuntimeError("No .env.development file found and not running in GCP")


class Config:
    GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")
    GCP_CLOUD_PROJECT = os.getenv("GCP_CLOUD_PROJECT")
    GCP_CLOUD_REGION = os.getenv("GCP_CLOUD_REGION", "europe-west4")
    AGENT_MODEL = os.getenv("AGENT_MODEL", "gemini-3-pro-preview")
    GCP_PITCH_DECK_OUTPUT_FOLDER = os.getenv(
        "GCP_PITCH_DECK_OUTPUT_FOLDER", "processed")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    GOOGLE_GENAI_USE_VERTEXAI = os.getenv("GOOGLE_GENAI_USE_VERTEXAI")
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    SUB_AGENTS_RAG_CORPUS_PREFIX = os.getenv("SUB_AGENTS_RAG_CORPUS_PREFIX", "sub_agents_rag_corpus")
    COMPANY_COLLECTION_NAME = os.getenv("COMPANY_COLLECTION_NAME", "companies_applied")
    FIRESTORE_DATABASE = os.getenv("FIRESTORE_DATABASE", "startupevaluator")
    DEPLOYMENT_STAGING_BUCKET = os.getenv("DEPLOYMENT_STAGING_BUCKET", "weightage_adjust_gen_ai_recom_agent_staging")