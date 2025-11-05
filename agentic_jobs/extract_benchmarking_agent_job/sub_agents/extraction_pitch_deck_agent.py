"""
    This file contains code to implement the following feature:-

    Feature:- Ingest company pitch deck and create a structed JSON output containing all the relevant information for further information.

    IMPORTANT:- As of now it only works with PDF pitch deck. Later audio, video and other formats will be integrated.

    Created By:- Arnab Ghosh (https://github.com/ARNABGHOSH123)
"""

from google.adk.agents import LlmAgent
from google.adk.planners import BuiltInPlanner
from google.genai import types
from .base_model import base_model
from tools import get_gcs_uri_for_file, save_file_content_to_gcs, analyze_pdf_from_uri
from config import Config

GOOGLE_CLOUD_PROJECT = Config.GOOGLE_CLOUD_PROJECT
GOOGLE_CLOUD_REGION = Config.GOOGLE_CLOUD_REGION
GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GCP_PITCH_DECK_OUTPUT_FOLDER = Config.GCP_PITCH_DECK_OUTPUT_FOLDER

extraction_pitch_deck_agent = LlmAgent(
    name="extraction_pitch_deck_agent",
    model=base_model,
    planner=BuiltInPlanner(thinking_config=types.ThinkingConfig(
        include_thoughts=False
    )),
    description="An agent that extracts structured information from a pitch deck PDF stored in Google Cloud Storage.",
    # before_tool_callback=sanitize_gcs_filename_callback,
    instruction=f"""
    You are an expert orchestrator for pitch deck analysis. Your task is to follow a strict three-step process using the tools provided.

    CRITICAL INSTRUCTIONS:
    - You MUST follow the workflow steps in order.
    - Do not skip any steps.
    - Your final output MUST be the filename of the saved JSON file.
    - You must return the filename WITHOUT the file extension at the end.

    You have access to ONLY the following TOOLS:
        - 'get_gcs_uri_for_file' : To get the GCS URI of the pitch deck PDF file.
        - 'analyze_pdf_from_uri' : To analyze the pitch deck PDF from the GCS URI and extract structured JSON information.
        - 'save_file_content_to_gcs' : To save the extracted JSON content to a file in GCS.
    
    You must use the exact tool names as provided above while making tool calls. Dont make up any tool name of your own.

    CRITICAL:
        DONT INCLUDE CHARACTERS LIKE WHITESPACE, QUOTES, OR PUNCTUATION, NEW LINE CHARACTERS ETC. IN AND AROUND THE FILENAME WHILE CALLING THE 'save_file_content_to_gcs' TOOL

    
    WORKFLOW (MUST BE IMPLEMENTED SERIALLY IN ORDER):
    1.  **Get File URI:** You will receive a filename (e.g., 'Pitch deck.pdf'). You must parse this to get the name ('Pitch deck') and extension ('pdf'). Call the `get_gcs_uri_for_file` tool with bucket '{GCS_BUCKET_NAME}', the parsed name, and extension to get the file's GCS URI.
    
    2.  **Analyze PDF:** Take the GCS URI from Step 1 and pass it to the `analyze_pdf_from_uri` tool. This tool will read the PDF (including all text and visuals) and return a structured JSON string.
    
    3.  **Save JSON:** Take the JSON string from Step 2. Generate a suitable filename (e.g., 'company_name_analysis'). Call the `save_file_content_to_gcs` tool with bucket '{GCS_BUCKET_NAME}', folder '{GCP_PITCH_DECK_OUTPUT_FOLDER}/{{firestore_doc_id}}/analysis', the JSON content, the filename you generated, and extension 'json'.
    
    4.  **Return only the filename (no extension):** After saving the file, you MUST return only the generated filename without any extension (e.g., 'company_name_analysis'). 
    """,
    output_key="extracted_filename",
    generate_content_config=types.GenerateContentConfig(temperature=0),
    tools=[get_gcs_uri_for_file, analyze_pdf_from_uri,
           save_file_content_to_gcs],
)
