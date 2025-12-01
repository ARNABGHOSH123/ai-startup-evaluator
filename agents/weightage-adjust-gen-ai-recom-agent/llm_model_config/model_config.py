from google.adk.models.google_llm import Gemini
from google.genai import types
from config import Config

llm = Gemini(
    model=Config.AGENT_MODEL,
    retry_options=types.HttpRetryOptions(
        initial_delay=1,
        attempts=10,
        max_delay=120,
    )
)