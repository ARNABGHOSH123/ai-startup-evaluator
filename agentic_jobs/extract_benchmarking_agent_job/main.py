# from config import Config
# from google.cloud import firestore
# from agent import root_agent
# import os
# import asyncio
# from google.adk.sessions import InMemorySessionService
# from google.adk.runners import Runner
# from google.genai import types
# import logging
# import traceback
# import sys

# logger = logging.getLogger("extract_benchmark_agent")
# logger.setLevel(logging.INFO)
# handler = logging.StreamHandler(sys.stdout)
# handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
# logger.addHandler(handler)


# os.environ["GOOGLE_CLOUD_PROJECT"] = Config.GOOGLE_CLOUD_PROJECT
# os.environ["GOOGLE_API_KEY"] = Config.GOOGLE_API_KEY
# os.environ["GOOGLE_CLOUD_LOCATION"] = Config.GOOGLE_CLOUD_REGION
# os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = Config.GOOGLE_GENAI_USE_VERTEXAI

# APP_NAME = Config.APP_NAME


# RUN_TIMEOUT_SECONDS = int(Config.JOB_RUN_TIMEOUT_SECONDS)  # default 15m
# SESSION_USER_ID = Config.JOB_USER_ID
# SESSION_ID = Config.JOB_SESSION_ID

# firestore_client = firestore.Client(project=Config.GOOGLE_CLOUD_PROJECT, database=Config.FIRESTORE_DATABASE)

# async def _run_agent_once(extracted_filename: str, firestore_doc_id: str = None):
#     session_service = InMemorySessionService()
#     await session_service.create_session(app_name=APP_NAME, user_id=SESSION_USER_ID, session_id=SESSION_ID)
#     logger.info("Created session %s for user %s", SESSION_ID, SESSION_USER_ID)

#     session_state = {}

#     runner = Runner(agent=root_agent, app_name=APP_NAME, session_service=session_service)

#     benchmark_gcs_uri = None
#     extract_output_gcs_uri = None

#     content = types.Content(
#         role="user",
#         parts=[types.Part(text=f"Please analyze the startup using the pitch deck file named '{extracted_filename}'")]
#     )

#     try:
#         async def _iter_events():
#             async for event in runner.run_async(user_id=SESSION_USER_ID, session_id=SESSION_ID, new_message=content):
#                 if event.content and event.content.parts and event.content.parts[0].text:
#                     logger.info("[%-20s] %s", event.author, event.content.parts[0].text[:120])

#         await asyncio.wait_for(_iter_events(), timeout=RUN_TIMEOUT_SECONDS)
#         logger.info("Agent completed run (session=%s).", SESSION_ID)

#     finally:
#         # Always attempt to fetch and delete the session for cleanup
#         try:
#             session_state = await session_service.get_session(app_name=APP_NAME, user_id=SESSION_USER_ID, session_id=SESSION_ID)
#             logger.info("Session state length: %s", len(session_state.state) if session_state and session_state.state else 0)
#         except Exception as e_get:
#             logger.warning("Failed to read session state: %s", e_get)

#         try:
#             await session_service.delete_session(app_name=APP_NAME, user_id=SESSION_USER_ID, session_id=SESSION_ID)
#             logger.info("Deleted session %s for user %s", SESSION_ID, SESSION_USER_ID)
#         except Exception as e_del:
#             logger.warning("Failed to delete session: %s", e_del)

#         if firestore_doc_id and session_state and session_state.state:
#             try:
#                 benchmark_gcs_uri = session_state.state.get("output_gcs_uri") if session_state and session_state.state else ""
#                 extract_output_gcs_uri = f"gs://{Config.GCS_BUCKET_NAME}/{Config.GCP_PITCH_DECK_OUTPUT_FOLDER}/{session_state.state.get("extracted_filename")}.json" if session_state.state.get("extracted_filename") else ""

#                 if benchmark_gcs_uri and extract_output_gcs_uri:
#                     firestore_client.collection("agent_jobs").document(firestore_doc_id).update({
#                         "benchmark_gcs_uri": benchmark_gcs_uri,
#                         "extract_output_gcs_uri": extract_output_gcs_uri,
#                     }, merge=True)
#                     logger.info("Updated Firestore document %s with output URIs", firestore_doc_id)
#             except Exception as e_fs:
#                 logger.warning("Failed to update Firestore document: %s", e_fs)

#     return {
#         "benchmark_gcs_uri": benchmark_gcs_uri if benchmark_gcs_uri else None,
#         "extract_output_gcs_uri": extract_output_gcs_uri if extract_output_gcs_uri else None,
#     } if benchmark_gcs_uri and extract_output_gcs_uri.state else {"benchmark_gcs_uri": None, "extract_output_gcs_uri": None}

# async def analyze_startup_pitch_deck():
#     extracted_filename = os.environ.get("INPUT_FILE")
#     firestore_doc_id = os.environ.get("FIRESTORE_DOC_ID")
#     if not extracted_filename:
#         raise RuntimeError("INPUT_FILE environment variable is required")

#     # Sanitize small values -- ensure no path traversal etc.
#     if "/" in extracted_filename or "\\" in extracted_filename:
#         logger.warning("INPUT_FILE contains a path separator; make sure this is expected: %s", extracted_filename)

#     try:
#         result = await _run_agent_once(extracted_filename, firestore_doc_id)
#         logger.info("Agent run result: %s", result)
#         result_text = f"Benchmark GCS URI: {result.get('benchmark_gcs_uri')}\nExtracted Output GCS URI: {result.get('extract_output_gcs_uri')}"
#         logger.info("Final result summary: %s", (result_text if result_text else "<no-result>"))

#         return result
#     except asyncio.TimeoutError:
#         logger.exception("Agent run timed out after %s seconds", RUN_TIMEOUT_SECONDS)
#         raise
#     except Exception as exc:
#         logger.exception("Agent run failed: %s", exc)
#         raise

# if __name__ == "__main__":
#     import asyncio, sys
#     try:
#         res = asyncio.run(analyze_startup_pitch_deck())
#         logger.info("Job finished")
#     except Exception:
#         logger.error("Job failed: %s", traceback.format_exc())
#         sys.exit(2)

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


async def _run_agent_once(extracted_filename: str, firestore_doc_id: str | None = None):
    # Capture Cloud Run execution id (e.g., "projects/.../jobs/<job>/executions/<exec-id>")
    execution_name = os.environ.get("CLOUD_RUN_EXECUTION", "")
    job_name = os.environ.get("CLOUD_RUN_JOB", "")

    # Write "RUNNING" + execution id as soon as we start
    if firestore_doc_id:
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
    await session_service.create_session(app_name=APP_NAME, user_id=SESSION_USER_ID, session_id=SESSION_ID)
    logger.info("Created session %s for user %s", SESSION_ID, SESSION_USER_ID)

    runner = Runner(agent=root_agent, app_name=APP_NAME,
                    session_service=session_service)

    content = types.Content(
        role="user",
        parts=[types.Part(
            text=f"Please analyze the startup using the pitch deck file named '{extracted_filename}'")]
    )

    benchmark_gcs_uri = None
    extract_output_gcs_uri = None

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
        benchmark_filename = state.get("output_gcs_uri") or ""
        extracted_basename = state.get("extracted_filename") or ""
        if extracted_basename:
            extract_output_gcs_uri = f"gs://{Config.GCS_BUCKET_NAME}/{Config.GCP_PITCH_DECK_OUTPUT_FOLDER}/{extracted_basename}.json"
        if benchmark_filename:
            benchmark_gcs_uri = f"gs://{Config.GCS_BUCKET_NAME}/{Config.GCP_PITCH_DECK_OUTPUT_FOLDER}/{benchmark_filename}"


        # Write final URIs & status back to the same Firestore doc
        if firestore_doc_id:
            try:
                update_doc = {
                    # will be corrected below on exception paths
                    "benchmark_agent_job_status": "SUCCEEDED",
                }
                if benchmark_gcs_uri:
                    update_doc["benchmark_gcs_uri"] = benchmark_gcs_uri
                if extract_output_gcs_uri:
                    update_doc["extract_output_gcs_uri"] = extract_output_gcs_uri

                firestore_client.collection(FIRESTORE_COMPANY_COLLECTION).document(
                    firestore_doc_id).update(update_doc)
                logger.info("Updated Firestore doc %s with outputs",
                            firestore_doc_id)
            except Exception as e_fs:
                logger.warning("Failed to update Firestore outputs: %s", e_fs)

    # return clean dict (no `.state` mistake)
    return {
        "benchmark_gcs_uri": benchmark_gcs_uri or None,
        "extract_output_gcs_uri": extract_output_gcs_uri or None,
    }


async def analyze_startup_pitch_deck():
    extracted_filename = os.environ.get("INPUT_FILE")
    firestore_doc_id = os.environ.get("FIRESTORE_DOC_ID")
    if not extracted_filename:
        raise RuntimeError("INPUT_FILE environment variable is required")

    # (Optional) sanitize name
    if "/" in extracted_filename or "\\" in extracted_filename:
        logger.warning(
            "INPUT_FILE contains a path separator; make sure this is expected: %s", extracted_filename)

    try:
        result = await _run_agent_once(extracted_filename, firestore_doc_id)
        logger.info("Agent run result: %s", result)
        return result
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
