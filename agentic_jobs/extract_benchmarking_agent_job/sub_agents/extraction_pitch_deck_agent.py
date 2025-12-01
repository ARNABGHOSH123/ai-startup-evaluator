"""
    This file contains code to implement the following feature:-

    Feature:- Ingest company pitch deck and create a structed JSON output containing all the relevant information for further information.

    Created By:- Arnab Ghosh (https://github.com/ARNABGHOSH123)
"""

import json
from google.adk.agents import LlmAgent
from google.adk.planners import BuiltInPlanner
from google.genai import types
from google.adk.agents.callback_context import CallbackContext
from llm_model_config import report_generation_model
from tools import get_gcs_uri_for_file, analyze_doc_from_uri
from config import Config
from utils import prepare_rag_corpus, update_data_to_corpus, update_sub_agent_result_to_firestore, save_file_content_to_gcs

GOOGLE_CLOUD_PROJECT = Config.GOOGLE_CLOUD_PROJECT
GOOGLE_CLOUD_REGION = Config.GOOGLE_CLOUD_REGION
GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GCP_PITCH_DECK_OUTPUT_FOLDER = Config.GCP_PITCH_DECK_OUTPUT_FOLDER
FIRESTORE_COMPANY_COLLECTION = Config.FIRESTORE_COMPANY_COLLECTION


async def post_agent_execution(callback_context: CallbackContext) -> None:
    try:
        current_state = callback_context.state.to_dict()
        corpus_name = current_state.get("rag_corpus_name")
        extraction_pitch_deck_result = json.loads(current_state.get(
            "extraction_pitch_deck_result").removeprefix("```json").removesuffix("```").strip())
        extracted_filename = extraction_pitch_deck_result.get(
            "extracted_filename") if extraction_pitch_deck_result else None
        extracted_content = extraction_pitch_deck_result.get(
            "extracted_content") if extraction_pitch_deck_result else None
        firestore_doc_id = current_state.get("firestore_doc_id")
        if not extracted_filename or not extracted_content or not firestore_doc_id:
            return None
        callback_context.state.update(
            {**current_state, "pitch_deck": extracted_content})
        gcs_uri = await save_file_content_to_gcs(bucket_name=GCS_BUCKET_NAME, file_content=json.dumps(extracted_content),
                                                 folder_name=f"{GCP_PITCH_DECK_OUTPUT_FOLDER}/{firestore_doc_id}/analysis",
                                                 file_extension="json",
                                                 file_name=extracted_filename
                                                 )
        update_sub_agent_result_to_firestore(collection_name=FIRESTORE_COMPANY_COLLECTION, document_id=firestore_doc_id,
                                             sub_agent_field="extraction_pitch_deck_sub_agent_gcs_uri", gcs_uri=gcs_uri)
        update_data_to_corpus(corpus_name=corpus_name, document_gcs_paths=[gcs_uri])
        print(
            f"Extraction Pitch Deck Agent result saved to GCS URI: {gcs_uri}")
        return None
    except Exception as e:
        print(
            f"Error in post_agent_execution of extraction_pitch_deck_agent: {e}")
        return None


extraction_pitch_deck_agent = LlmAgent(
    name="extraction_pitch_deck_agent",
    model=report_generation_model,
    planner=BuiltInPlanner(thinking_config=types.ThinkingConfig(
        include_thoughts=False
    )),
    description="An agent that extracts structured information from a pitch deck textual document stored in Google Cloud Storage.",
    # before_tool_callback=sanitize_gcs_filename_callback,
    instruction=f"""
    You are an expert orchestrator for pitch deck analysis. Your task is to follow a strict three-step process using the tools provided.

    CRITICAL INSTRUCTIONS:
    - You MUST follow the workflow steps in order.
    - Do not skip any steps.
    - Your final output MUST be the filename of the saved JSON file.
    - You must return the filename WITHOUT the file extension at the end.

    You have access to ONLY the following TOOLS:
        - 'get_gcs_uri_for_file' : To get the GCS URI of the pitch deck {{file_extension}} file.
        - 'analyze_doc_from_uri' : To analyze the pitch deck {{file_extension}} from the GCS URI and extract structured JSON information.
    
    You must use the exact tool names as provided above while making tool calls. Dont make up any tool name of your own.

    CRITICAL:
        DONT INCLUDE CHARACTERS LIKE WHITESPACE, QUOTES, OR PUNCTUATION, NEW LINE CHARACTERS ETC. IN AND AROUND THE FILENAME.

    
    WORKFLOW (MUST BE IMPLEMENTED SERIALLY IN ORDER):
    1.  **Get File URI:** Call the `get_gcs_uri_for_file` tool exactly as follows:
        - bucket_name: '{GCS_BUCKET_NAME}'
        - file_name: '{{founder_id}}/{{input_deck_filename}}'
        - file_extension: '{{file_extension}}'

    2.  **Analyze {{file_extension}}:** Take the GCS URI from Step 1 and pass it to the `analyze_doc_from_uri` tool. This tool will read the {{file_extension}} (including all text and visuals) and return a structured JSON string. CALL THE TOOL EXACTLY AS FOLLOWS:
        - gcs_uri: '<GCS_URI_FROM_STEP_1>'
        - file_extension: '{{file_extension}}'
    
    3.  **Generate Filename:** Take the JSON string from Step 2 and generate a suitable filename (e.g., 'company_name_analysis'). The filename MUST be descriptive of the content and relevant to the company.
    
    4.  **Return the filename (no extension) and the JSON content:** After saving the file, you MUST return the generated filename without any extension (e.g., 'company_name_analysis') and the JSON content as described in the format below:-

    OUTPUT FORMAT:
    {{
        "extracted_filename": "<FILENAME_WITHOUT_EXTENSION>",
        "extracted_content": <STRUCTURED_JSON_CONTENT>
    }}

    YOU MUST RETURN THE JSON OUTPUT AS SPECIFIED ABOVE AND NOTHING ELSE.
    """,
    output_key="extraction_pitch_deck_result",
    after_agent_callback=post_agent_execution,
    before_agent_callback=prepare_rag_corpus,
    generate_content_config=types.GenerateContentConfig(temperature=0),
    tools=[get_gcs_uri_for_file, analyze_doc_from_uri],
)
