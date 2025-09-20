"""
    This file contains code to create our root agent.

    Root agent triggers the following agents in order (SequentialAgent):-
        - extraction_pitch_deck_agent
        - benchmarking_startup_agent

    Created By:- Arnab Ghosh (https://github.com/ARNABGHOSH123)
"""

from google.adk.agents import SequentialAgent
from .benchmarking_startup_agent import benchmarking_startup_agent
from .extraction_pitch_deck_agent import extraction_pitch_deck_agent
from config import Config

agent_model = Config.AGENT_MODEL
GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME

root_agent = SequentialAgent(
    name="ai_analyst_root_agent",
    sub_agents=[extraction_pitch_deck_agent, benchmarking_startup_agent],
    description="The main coordinator root agent that manages the workflow for analyzing startup pitch decks and benchmarking startups. Coordinator: extract -> benchmark (sequential pipeline).",
)
