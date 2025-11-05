from google.adk.models.google_llm import Gemini
from google.genai import types
from config import Config

base_model = Gemini(
    model=Config.FAST_AGENT_MODEL,
    retry_options=types.HttpRetryOptions(
        initial_delay=1,
        attempts=10,
        max_delay=120,
    )
)

report_generation_model = Gemini(
    model=Config.REPORT_GENERATION_AGENT_MODEL,
    retry_options=types.HttpRetryOptions(
        initial_delay=1,
        attempts=10,
        max_delay=120,
    )
)