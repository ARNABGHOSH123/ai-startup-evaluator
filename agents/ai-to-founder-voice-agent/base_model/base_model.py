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
    speech_config=types.SpeechConfig(
        language_code="en-US",
        voice_config=types.VoiceConfig(
            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                voice_name="Aoede"
            )
        )
    )
)

base_model = Gemini(
    model=AGENT_MODEL,
    retry_options=types.HttpRetryOptions(
        initial_delay=1,
        attempts=10,
        max_delay=120,
    ),
)
