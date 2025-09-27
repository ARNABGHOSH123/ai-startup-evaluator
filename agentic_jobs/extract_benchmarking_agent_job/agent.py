"""
    This file contains code to create our root agent.

    Root agent triggers the following agents in order (SequentialAgent):-
        - extraction_pitch_deck_agent
        - benchmarking_startup_agent

    Created By:- Arnab Ghosh (https://github.com/ARNABGHOSH123)
"""

from google.adk.agents import SequentialAgent
from sub_agents import benchmarking_startup_agent, extraction_pitch_deck_agent
# from config import Config
# import os

# agent_model = Config.AGENT_MODEL
# GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
# GOOGLE_APPLICATION_CREDENTIALS = Config.GOOGLE_APPLICATION_CREDENTIALS

# if GOOGLE_APPLICATION_CREDENTIALS is not None:
#     os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS

# os.environ["GOOGLE_CLOUD_PROJECT"] = Config.GOOGLE_CLOUD_PROJECT
# os.environ["GOOGLE_API_KEY"] = Config.GOOGLE_API_KEY
# os.environ["GOOGLE_CLOUD_LOCATION"] = Config.GOOGLE_CLOUD_REGION
# os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = Config.GOOGLE_GENAI_USE_VERTEXAI

root_agent = SequentialAgent(
    name="ai_analyst_root_agent",
    sub_agents=[extraction_pitch_deck_agent, benchmarking_startup_agent],
    description="The main coordinator root agent that manages the workflow for analyzing startup pitch decks and benchmarking startups. Coordinator: extract -> benchmark (sequential pipeline).",
)