import os
from dotenv import load_dotenv
from google.cloud import secretmanager

# Load environment variables (only once)
if os.path.exists(".env.development") and not os.getenv("PRODUCTION"):
    load_dotenv(dotenv_path=os.path.join(os.getcwd(), '.env.development'), override=True)
elif os.getenv("GOOGLE_CLOUD_PROJECT") and os.getenv("GOOGLE_CLOUD_REGION"):
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    settings_name = os.getenv("SETTINGS_NAME", "env-keys-extract-benchmark-job")
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{settings_name}/versions/latest"
    payload = client.access_secret_version(name=name).payload.data.decode("UTF-8")
    for line in payload.split("\n"):
        key, value = line.split("=", 1)
        os.environ[key] = value
else:
    raise RuntimeError("No .env.development file found and not running in GCP")


class Config:
    APP_NAME = os.getenv("APP_NAME")
    GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")
    GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")
    GOOGLE_CLOUD_REGION = os.getenv("GOOGLE_CLOUD_REGION", "asia-south1")
    AGENT_MODEL = os.getenv("AGENT_MODEL", "gemini-2.5-pro")
    GCP_PITCH_DECK_INPUT_FOLDER = os.getenv(
        "GCP_PITCH_DECK_INPUT_FOLDER", "uploads")
    GCP_PITCH_DECK_OUTPUT_FOLDER = os.getenv(
        "GCP_PITCH_DECK_OUTPUT_FOLDER", "processed")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    GOOGLE_GENAI_USE_VERTEXAI = os.getenv("GOOGLE_GENAI_USE_VERTEXAI")
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    FOCUS_POINTS_PER_AGENT = os.getenv("FOCUS_POINTS_PER_AGENT")
    JOB_RUN_TIMEOUT_SECONDS = int(os.getenv("JOB_RUN_TIMEOUT_SECONDS", "900"))
    JOB_USER_ID = os.getenv("JOB_USER_ID", "system")
    JOB_SESSION_ID = os.getenv("JOB_SESSION_ID", "system-session")
    FIRESTORE_DATABASE = os.getenv("FIRESTORE_DATABASE")
    FIRESTORE_COMPANY_COLLECTION = os.getenv("FIRESTORE_COMPANY_COLLECTION", "companies_applied")

