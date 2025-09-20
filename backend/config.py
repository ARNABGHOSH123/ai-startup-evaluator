import os
from dotenv import load_dotenv

# Load environment variables (only once)
load_dotenv()


class Config:
    APP_NAME = os.getenv("APP_NAME")
    GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")
    GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
    GCP_REGION = os.getenv("GCP_REGION", "asia-south1")
    AGENT_MODEL = os.getenv("AGENT_MODEL", "gemini-2.5-pro")
    GCP_PITCH_DECK_INPUT_FOLDER = os.getenv(
        "GCP_PITCH_DECK_INPUT_FOLDER", "uploads")
    GCP_PITCH_DECK_OUTPUT_FOLDER = os.getenv(
        "GCP_PITCH_DECK_OUTPUT_FOLDER", "processed")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    GOOGLE_GENAI_USE_VERTEXAI = os.getenv("GOOGLE_GENAI_USE_VERTEXAI")
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    FOCUS_POINTS_PER_AGENT = int(os.getenv("FOCUS_POINTS_PER_AGENT")) or 3
