"""
    This file contains code to create our root agent.

    Root agent triggers the following agents in order (SequentialAgent):-
        - extraction_pitch_deck_agent
        - benchmarking_startup_agent

    Created By:- Arnab Ghosh (https://github.com/ARNABGHOSH123)
"""

from google.adk.agents import SequentialAgent
from sub_agents import benchmarking_startup_agent, extraction_pitch_deck_agent, generate_qna_agent, investment_recommendation_sub_agent

root_agent = SequentialAgent(
    name="ai_analyst_root_agent",
    sub_agents=[extraction_pitch_deck_agent,
                benchmarking_startup_agent, investment_recommendation_sub_agent, generate_qna_agent],
    description="The main coordinator root agent that manages the workflow for analyzing startup pitch decks and benchmarking startups. Coordinator: extract -> benchmark (sequential pipeline).",
)
