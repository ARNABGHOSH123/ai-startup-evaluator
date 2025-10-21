from google.adk.models.google_llm import Gemini
from google.genai import types
from config import Config

AGENT_MODEL = Config.AGENT_MODEL

base_model = Gemini(
    model=AGENT_MODEL,
    retry_options=types.HttpRetryOptions(
        initial_delay=1,
        attempts=10,
        max_delay=120,
    )
)