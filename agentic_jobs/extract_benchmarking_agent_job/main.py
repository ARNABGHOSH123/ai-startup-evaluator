from config import Config
from google.cloud import firestore
from agent import root_agent
import os
import sys
import asyncio
import logging
import traceback
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types

logger = logging.getLogger("extract_benchmark_agent")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter(
    "%(asctime)s %(levelname)s %(name)s %(message)s"))
logger.addHandler(handler)

# Required envs you already set
os.environ["GOOGLE_CLOUD_PROJECT"] = Config.GOOGLE_CLOUD_PROJECT
os.environ["GOOGLE_API_KEY"] = Config.GOOGLE_API_KEY
os.environ["GOOGLE_CLOUD_LOCATION"] = Config.GOOGLE_CLOUD_REGION
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = Config.GOOGLE_GENAI_USE_VERTEXAI

APP_NAME = Config.APP_NAME
RUN_TIMEOUT_SECONDS = int(Config.JOB_RUN_TIMEOUT_SECONDS)
SESSION_USER_ID = Config.JOB_USER_ID
SESSION_ID = Config.JOB_SESSION_ID
FIRESTORE_COMPANY_COLLECTION = Config.FIRESTORE_COMPANY_COLLECTION

# Firestore
# <- keep consistent with your service
firestore_client = firestore.Client(
    project=Config.GOOGLE_CLOUD_PROJECT, database=Config.FIRESTORE_DATABASE)


async def _run_agent_once(firestore_doc_id: str, input_deck_filename: str, file_extension: str, founder_id: str, company_websites: list):
    # Capture Cloud Run execution id (e.g., "projects/.../jobs/<job>/executions/<exec-id>")
    execution_name = os.environ.get("CLOUD_RUN_EXECUTION", "")
    job_name = os.environ.get("CLOUD_RUN_JOB", "")

    # Write "RUNNING" + execution id as soon as we start
    try:
        firestore_client.collection(FIRESTORE_COMPANY_COLLECTION).document(firestore_doc_id).update(
            {
                "benchmark_agent_job_id": execution_name,
                "benchmark_agent_job_status": "RUNNING",
                "benchmark_agent_job_name": job_name,
            },
        )
        logger.info("Wrote execution id to Firestore: %s", execution_name)
    except Exception as e:
        logger.warning("Failed to write execution id to Firestore: %s", e)

    session_service = InMemorySessionService()
    await session_service.create_session(app_name=APP_NAME, user_id=SESSION_USER_ID, session_id=SESSION_ID, state={"firestore_doc_id": firestore_doc_id, "input_deck_filename": input_deck_filename, "file_extension": file_extension, "founder_id": founder_id, "company_websites": company_websites, "pitch_deck": ""})
    logger.info("Created session %s for user %s", SESSION_ID, SESSION_USER_ID)

    runner = Runner(agent=root_agent, app_name=APP_NAME,
                    session_service=session_service)

    content = types.Content(
        role="user",
        parts=[types.Part(
            text=f"Please analyze the pitch deck.")]
    )

    try:
        async def _iter_events():
            async for event in runner.run_async(user_id=SESSION_USER_ID, session_id=SESSION_ID, new_message=content):
                if event.content and event.content.parts and event.content.parts[0].text:
                    logger.info("[%-24s] %s", event.author,
                                event.content.parts[0].text[:120])

        await asyncio.wait_for(_iter_events(), timeout=RUN_TIMEOUT_SECONDS)
        logger.info("Agent completed run (session=%s).", SESSION_ID)

    finally:
        # Read state and clean up
        try:
            session_state = await session_service.get_session(app_name=APP_NAME, user_id=SESSION_USER_ID, session_id=SESSION_ID)
            state = session_state.state if session_state and session_state.state else {}
            logger.info("Session state keys: %s", list(state.keys()))
        except Exception as e_get:
            logger.warning("Failed to read session state: %s", e_get)
            state = {}

        try:
            await session_service.delete_session(app_name=APP_NAME, user_id=SESSION_USER_ID, session_id=SESSION_ID)
            logger.info("Deleted session %s for user %s",
                        SESSION_ID, SESSION_USER_ID)
        except Exception as e_del:
            logger.warning("Failed to delete session: %s", e_del)

        # Pull outputs from state (your agents save these keys)
        # investment_recommendation_gcs_uri = state.get("output_gcs_uri") or ""
        # extraction_pitch_deck_result_gcs_uri = state.get("extraction_pitch_deck_result_gcs_uri") or ""
        # if extraction_pitch_deck_result_gcs_uri:
        #     extract_output_gcs_uri = extraction_pitch_deck_result_gcs_uri
        # if investment_recommendation_gcs_uri:
        #     benchmark_gcs_uri = investment_recommendation_gcs_uri
        # Write final URIs & status back to the same Firestore doc
        try:
            update_doc = {
                # will be corrected below on exception paths
                "benchmark_agent_job_status": "SUCCEEDED",
            }
            # if extraction_pitch_deck_result_gcs_uri:
            #     update_doc["benchmark_gcs_uri"] = benchmark_gcs_uri
            # if extract_output_gcs_uri:
            #     update_doc["extract_output_gcs_uri"] = extract_output_gcs_uri

            firestore_client.collection(FIRESTORE_COMPANY_COLLECTION).document(
                firestore_doc_id).update(update_doc)
            logger.info("Updated Firestore doc %s with outputs",
                        firestore_doc_id)
        except Exception as e_fs:
            logger.warning("Failed to update Firestore outputs: %s", e_fs)

    # return clean dict (no `.state` mistake)
    # return {
    #     "benchmark_gcs_uri": benchmark_gcs_uri or None,
    #     "extract_output_gcs_uri": extract_output_gcs_uri or None,
    # }


async def analyze_startup_pitch_deck():
    input_deck_filename = os.environ.get("input_deck_filename")
    firestore_doc_id = os.environ.get("firestore_doc_id")
    file_extension = os.environ.get("file_extension")
    founder_id = os.environ.get("founder_id")
    company_websites = os.environ.get("company_websites")
    if not input_deck_filename:
        raise RuntimeError(
            "input_deck_filename environment variable is required")

    if not firestore_doc_id:
        raise RuntimeError("firestore_doc_id environment variable is required")

    if not file_extension:
        raise RuntimeError("file_extension environment variable is required")

    if not founder_id:
        raise RuntimeError("founder_id environment variable is required")

    if not company_websites or company_websites.strip() == "" or company_websites.strip() == "[]":
        raise RuntimeError("company_websites environment variable is required")

    company_websites = company_websites.strip().split()

    try:
        await _run_agent_once(input_deck_filename=input_deck_filename, firestore_doc_id=firestore_doc_id, file_extension=file_extension, founder_id=founder_id, company_websites=company_websites)
        # logger.info("Agent run result: %s", result)
        # return result
    except asyncio.TimeoutError:
        # mark as failed on timeout
        if firestore_doc_id:
            firestore_client.collection(FIRESTORE_COMPANY_COLLECTION).document(
                firestore_doc_id).update({"benchmark_agent_job_status": "FAILED"})
        logger.exception(
            "Agent run timed out after %s seconds", RUN_TIMEOUT_SECONDS)
        raise
    except Exception:
        if firestore_doc_id:
            firestore_client.collection(FIRESTORE_COMPANY_COLLECTION).document(
                firestore_doc_id).update({"benchmark_agent_job_status": "FAILED"})
        logger.error("Job failed: %s", traceback.format_exc())
        raise

if __name__ == "__main__":
    try:
        asyncio.run(analyze_startup_pitch_deck())
        logger.info("Job finished")
    except Exception:
        sys.exit(2)
