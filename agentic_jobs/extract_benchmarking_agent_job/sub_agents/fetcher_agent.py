from google.adk.agents import LlmAgent
from google.genai import types
from google.adk.planners import BuiltInPlanner
from config import Config
from .base_model import base_model
from tools import get_file_content_from_gcs

GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GCP_PITCH_DECK_OUTPUT_FOLDER = Config.GCP_PITCH_DECK_OUTPUT_FOLDER

# fetch pitch deck analysis content (created by extraction agent) from GCS bucket
fetcher_agent = LlmAgent(
    name="PitchDeckFetcher",
    model=base_model,
    planner=BuiltInPlanner(thinking_config=types.ThinkingConfig(
        include_thoughts=False,
        thinking_budget=0
    )),
    description="An agent that fetches the processed pitch-deck JSON from GCS and place its content into state['pitch_deck'] as a JSON object.",
    instruction=f"""
    You will receive the **base filename** (without extension) for a processed pitch deck JSON produced by the previous step as: {{extracted_filename}}

    You have access to ONLY the following TOOL:
        'get_file_content_from_gcs': Use this tool to fetch the file content from GCS (Google Cloud Storage) bucket.
    
    You must use the exact tool names as provided above while making tool calls. Dont make up any tool name of your own.

    WORKFLOW (MUST BE IMPLEMENTED SERIALLY IN ORDER):

    1) Use the 'get_file_content_from_gcs' tool to fetch the file from GCS with the arguments as:-
        - bucket_name: '{GCS_BUCKET_NAME}', 
        - folder_name: '{GCP_PITCH_DECK_OUTPUT_FOLDER}/{{firestore_doc_id}}/analysis', 
        - file_name: {{extracted_filename}}, 
        - file_extension: 'json'

    2) Return the JSON content which was extracted in step 1. Do not return anything else.
    If file fetch fails respond like 'Sorry! I was unable to fetch the file. Please check the file details and try again.'.
    Do not make anything up on your own.

    """,
    tools=[get_file_content_from_gcs],
    output_key="pitch_deck",
    generate_content_config=types.GenerateContentConfig(temperature=0)
)
