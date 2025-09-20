import asyncio
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from agents.root_agent import root_agent
from google.genai import types
import warnings
import logging
import os
from config import Config

logging.basicConfig(level=logging.ERROR)

warnings.filterwarnings("ignore")

if Config.GOOGLE_API_KEY:
    os.environ["GOOGLE_API_KEY"] = Config.GOOGLE_API_KEY

if Config.GOOGLE_GENAI_USE_VERTEXAI:
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = Config.GOOGLE_GENAI_USE_VERTEXAI

APP_NAME = Config.APP_NAME
USER_ID = "user_1"
SESSION_ID = "session_001"


async def call_agent_async(query: str, runner, user_id, session_id):
    """Sends a query to the agent and prints the final response."""
    print(f"\n>>> User Query: {query}")

    # Prepare the user's message in ADK format
    content = types.Content(role='user', parts=[types.Part(text=query)])

    final_response_text = "Agent did not produce a final response."
    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
        if event.is_final_response():
            if event.content and event.content.parts:
                # Assuming text response in the first part
                final_response_text = event.content.parts[0].text
            elif event.actions and event.actions.escalate:  # Handle potential errors/escalations
                final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
            # Add more checks here if needed (e.g., specific error codes)
            break  # Stop processing events once the final response is found

    print(f"<<< Agent Response: \n\n {final_response_text}")


async def start_analysis():
    session_service = InMemorySessionService()

    await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=SESSION_ID
    )

    print(
        f"Session created: App='{APP_NAME}', User='{USER_ID}', Session='{SESSION_ID}'")

    runner_agent_team = Runner(  # Or use InMemoryRunner
        agent=root_agent,
        app_name=APP_NAME,
        session_service=session_service
    )

    print(f"Runner created for agent '{root_agent.name}'.")

    await call_agent_async(query = "Please analyze the startup using the pitch deck file named 'Pitch deck.pdf'",
                               runner=runner_agent_team,
                               user_id=USER_ID,
                               session_id=SESSION_ID)

if __name__ == "__main__": # Ensures this runs only when script is executed directly
    print("Executing using 'asyncio.run()' (for standard Python scripts)...")
    try:
        # This creates an event loop, runs your async function, and closes the loop.
        asyncio.run(start_analysis())
    except Exception as e:
        print(f"An error occurred: {e}")