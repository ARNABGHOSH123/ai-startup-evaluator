from google.adk.sessions import InMemorySessionService
from .agent import root_agent
from config import Config
from google.adk.runners import Runner
from google.genai import types
import logging

logger = logging.getLogger(__name__)

APP_NAME = Config.APP_NAME
GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME

async def _run_agent_for_file(extracted_filename: str, user_id: str, session_id: str, firestore_client):
    try:
        # ensure session exists
        session_service = InMemorySessionService()
        await session_service.create_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
        logger.info("Created session %s for user %s", session_id, user_id)

        runner = Runner(agent=root_agent, app_name=APP_NAME, session_service=session_service)

        content = types.Content(role="user", parts=[types.Part(text=f"Please analyze the startup using the pitch deck file named '{extracted_filename}'")])

        # consume events (example: log final response). This will run until the agent finishes
        async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
            if event.is_final_response():
                # use event.content.parts[0].text (if present)
                if event.content and event.content.parts:
                    final_text = event.content.parts[0].text[:100]
                    logger.info("Agent final response (session=%s): %.200s", session_id, final_text)
                    # Optionally save final_text to GCS / DB / trigger another job
                else:
                    logger.info("Agent finished but no content (session=%s).", session_id)
        
        session_state = await session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)

        output_gcs_uri = None

        if session_state:
            # Depending on ADK version, session_state may have "state" dict
            state = session_state.state
            output_gcs_uri = state.get("output_gcs_uri")
        
        if output_gcs_uri:
            logger.info("Got output_gcs_uri from session: %s", output_gcs_uri)

            company_name = extracted_filename.split("_pitch_deck")[0]

            collection_ref = firestore_client.collection("companies_applied")
            query = collection_ref.where("company_name", "==", company_name).limit(1).stream()
            existing_docs = [d for d in query]

            if existing_docs:
                # Update the first matching document
                doc_ref = existing_docs[0].reference
                doc_ref.update({
                    "extract_benchmark_gcs_uri": output_gcs_uri,
                    "is_deck_extracted_and_benchmarked": True
                })
                logger.info("Updated Firestore doc %s with extract_benchmark_gcs_uri", doc_ref.id)
            else:
                logger.warning("No Firestore doc found for company_name=%s", company_name)
        else:
            logger.error("No output_gcs_uri found in session state")

    except Exception as exc:
        logger.exception("Error while running agent for file %s: %s", extracted_filename, exc)
    
    finally:
        # Optionally delete the session to free memory
        try:
            await session_service.delete_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
        except Exception:
            logger.debug("Failed to delete session", exc_info=True)