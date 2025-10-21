import os
from dotenv import load_dotenv
from google.cloud import secretmanager

if os.path.exists(".env.development") and not os.getenv("PRODUCTION"):
    load_dotenv(dotenv_path=os.path.join(
        os.getcwd(), '.env.development'), override=True)
elif os.getenv("GOOGLE_CLOUD_PROJECT"):
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    settings_name = os.getenv(
        "SETTINGS_NAME", "env-keys-ai-analyst-backend-service")
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
    GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")
    GOOGLE_CLOUD_REGION = os.getenv("GOOGLE_CLOUD_REGION", "us-central1")
    GCP_PITCH_DECK_INPUT_FOLDER = os.getenv(
        "GCP_PITCH_DECK_INPUT_FOLDER", "uploads")
    GCP_PITCH_DECK_OUTPUT_FOLDER = os.getenv(
        "GCP_PITCH_DECK_OUTPUT_FOLDER", "processed")
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv(
        "GOOGLE_APPLICATION_CREDENTIALS")
    FIRESTORE_DATABASE = os.getenv("FIRESTORE_DATABASE", "startupevaluator")
    EXTRACT_BENCHMARK_CLOUD_RUN_JOB_NAME = os.getenv(
        "EXTRACT_BENCHMARK_CLOUD_RUN_JOB_NAME", "extract-benchmark-pitch-agent-job")
    FIRESTORE_COMPANY_COLLECTION = os.getenv(
        "FIRESTORE_COMPANY_COLLECTION", "companies_applied")
    DEPLOYED_FRONTEND_URL = os.getenv("DEPLOYED_FRONTEND_URL")
