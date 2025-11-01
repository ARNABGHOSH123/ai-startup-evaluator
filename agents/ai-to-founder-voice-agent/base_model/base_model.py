from google.adk.models.google_llm import Gemini
from google.genai import types
from config import Config

LIVE_AGENT_MODEL = Config.LIVE_AGENT_MODEL
AGENT_MODEL = Config.AGENT_MODEL

live_model = Gemini(
    model=LIVE_AGENT_MODEL,
    retry_options=types.HttpRetryOptions(
        initial_delay=1,
        attempts=10,
        max_delay=120,
    ),
)

base_model = Gemini(
    model=AGENT_MODEL,
    retry_options=types.HttpRetryOptions(
        initial_delay=1,
        attempts=10,
        max_delay=120,
    ),
)
