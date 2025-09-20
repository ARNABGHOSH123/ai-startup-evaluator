"""
    This file contains code to implement the following feature:-

    Feature:- Ingest company pitch deck and create a structed JSON output containing all the relevant information for further information.

    IMPORTANT:- As of now it only works with PDF pitch deck. Later audio, video and other formats will be integrated.

    Created By:- Arnab Ghosh (https://github.com/ARNABGHOSH123)
"""

from google.adk.agents import LlmAgent
from tools import gcs_uri_for_file_tool, save_file_content_to_gcs_tool
from config import Config
from google.genai import types
import vertexai
from vertexai.generative_models import GenerativeModel, Part
import json
import math
import fitz  # PyMuPDF
from google.cloud import storage
from google.adk.tools import FunctionTool

# Initialize Vertex AI (if not already done)
if Config.GCP_PROJECT_ID and Config.GCP_REGION:
    vertexai.init(project=Config.GCP_PROJECT_ID)

AGENT_MODEL = Config.AGENT_MODEL
GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GCP_PITCH_DECK_OUTPUT_FOLDER = Config.GCP_PITCH_DECK_OUTPUT_FOLDER
GCP_PITCH_DECK_INPUT_FOLDER = Config.GCP_PITCH_DECK_INPUT_FOLDER

print(f"Using agent model: {AGENT_MODEL}")

PDF_ANALYZER_INSTRUCTION = """
You are a meticulous, expert startup analyst with multimodal understanding.
Your task is to analyze the entire PDF document provided, including ALL text and visual elements (images, graphs, charts, diagrams).

CRITICAL INSTRUCTIONS:
- Stick STRICTLY to the information presented in the pitch deck. Do not infer or add any information that is not explicitly present.
- If a specific piece of information is not in the deck, you MUST return a `null` value for that field. Do not write "not specified" or "N/A".
- Your output MUST be a valid JSON object containing the extracted data. Do not add any other text or markdown formatting.
- Pitch deck may have multiple company names. Therefore you must extract the company websites if you find it.

Extract the following information into a structured JSON object:
    - company_name: The name of the company.
    - company_websites: List of company websites extracted from pitching deck if available.
    - parent_company_details: List of parent companies if available along with their website links.
    - contact_information: Contact information of the founders or of the company (mobile no, phone no, email ids, etc.) if available.
    - problem: The specific problem the company is solving.
    - solution: The solution the company is offering.
    - market_size: The Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Serviceable Obtainable Market (SOM), if mentioned.
    - team_members: A list of key team members, their names, and their roles/experience.
    - traction: Key metrics, customer names, pilots, or revenue figures that demonstrate progress.
    - public_competitor_symbols: A list of any public companies mentioned as competitors. If stock symbols are not given, state the company names.
    - funding_details: The amount of funding being sought ("The Ask") and the intended "Use of Funds".
    - business_model: The company's revenue model, pricing, and target customer profile.
    - financial_projections: A summary of future revenue or financial projections, often found in charts or tables.
"""

PDF_SYNTHESIS_INSTRUCTION = """
You are an expert data synthesis agent. I have analyzed a large document in chunks and have received multiple JSON objects, one for each chunk.
Your task is to merge these partial JSON objects into a single, coherent JSON object that represents the entire document.

CRITICAL INSTRUCTIONS:
- The final output MUST be a single, valid JSON object.
- Consolidate information from all chunks accurately.
- For list fields (like 'team_members', 'public_competitor_symbols', 'financial_projections'), combine all unique items from all chunks. Do not create nested lists.
- For string or object fields (like 'company_name', 'problem', 'solution'), if a value is found in any chunk, use it. If different chunks provide different non-null values for the same field, use the value from the earliest chunk (first in the list) as it is more likely to be the primary definition. If a field is null in all chunks, it should be `null` in the final JSON.
- Adhere strictly to the original JSON structure provided in the first chunk.

Here are the JSON objects from the document chunks:
"""


def _analyze_single_pdf_chunk(gcs_uri: str) -> str:
    """Analyzes a single PDF chunk from GCS."""
    raw_text = ""
    try:
        model = GenerativeModel(AGENT_MODEL)
        pdf_file = Part.from_uri(uri=gcs_uri, mime_type='application/pdf')
        response = model.generate_content([PDF_ANALYZER_INSTRUCTION, pdf_file])

        raw_text = response.text
        # This part is important to handle markdown code blocks
        cleaned_response = raw_text.strip().removeprefix(
            "```json").removesuffix("```").strip()

        # Validate that the cleaned response is valid JSON
        json.loads(cleaned_response)

        print(f"Successfully analyzed chunk: {gcs_uri}")
        return cleaned_response
    except json.JSONDecodeError as e:
        error_message = f'{{"error": "Model output for chunk {gcs_uri} is not valid JSON", "details": "{str(e)}", "raw_output": {json.dumps(raw_text)}}}'
        print(f"Error in '_analyze_single_pdf_chunk': {error_message}")
        return error_message
    except Exception as e:
        # Catch other potential API errors for a single chunk
        error_message = f'{{"error": "Failed to analyze PDF chunk from URI: {gcs_uri}", "details": "{str(e)}"}}'
        print(f"Error in '_analyze_single_pdf_chunk': {error_message}")
        return error_message


def _analyze_large_pdf_in_chunks(blob: storage.Blob) -> str:
    """Splits a large PDF, analyzes chunks from memory, and synthesizes the results."""

    # Download the large PDF into memory
    print("Downloading large PDF into memory...")
    pdf_bytes = blob.download_as_bytes()

    # Open the PDF from the byte stream
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    total_pages = len(doc)
    chunk_size = 10  # pages per chunk
    num_chunks = math.ceil(total_pages / chunk_size)
    print(
        f"Splitting PDF into {num_chunks} chunks of up to {chunk_size} pages each.")

    partial_json_results = []
    model = GenerativeModel(AGENT_MODEL)

    for i in range(num_chunks):
        start_page = i * chunk_size
        end_page = min((i + 1) * chunk_size, total_pages)

        chunk_doc = fitz.open()
        chunk_doc.insert_pdf(doc, from_page=start_page, to_page=end_page - 1)

        # Get chunk as bytes instead of saving to disk/GCS
        chunk_bytes = chunk_doc.tobytes()
        chunk_doc.close()

        print(f"Analyzing chunk {i+1}/{num_chunks} from memory...")

        raw_text = ""
        try:
            pdf_part = Part.from_data(
                data=chunk_bytes, mime_type='application/pdf')
            response = model.generate_content(
                [PDF_ANALYZER_INSTRUCTION, pdf_part])

            raw_text = response.text
            cleaned_response = raw_text.strip().removeprefix(
                "```json").removesuffix("```").strip()

            json.loads(cleaned_response)  # Validate
            partial_json_results.append(cleaned_response)
            print(f"Successfully analyzed chunk {i+1}/{num_chunks}.")

        except json.JSONDecodeError as e:
            # Log error for the chunk and continue
            print(
                f"Skipping chunk {i+1}/{num_chunks} due to invalid JSON output: {e}")
        except Exception as e:
            # Catch other potential API errors for a single chunk
            print(
                f"Skipping chunk {i+1}/{num_chunks} due to an analysis error: {e}")

    if not partial_json_results:
        return '{"error": "No valid JSON could be extracted from any of the PDF chunks."}'

    # Synthesize the results
    print("Synthesizing results from all chunks...")
    synthesis_prompt = [PDF_SYNTHESIS_INSTRUCTION] + partial_json_results
    response = model.generate_content(synthesis_prompt)

    raw_text = response.text
    cleaned_response = raw_text.strip().removeprefix(
        "```json").removesuffix("```").strip()

    # Final validation
    json.loads(cleaned_response)

    print("Synthesis complete.")
    return cleaned_response


def analyze_pdf_from_uri(gcs_uri: str) -> str:
    """
    Analyzes a pitch deck PDF from a GCS URI. Handles large PDFs by splitting them.

    Args:
        gcs_uri (str): The GCS URI of the PDF file to analyze (e.g., 'gs://bucket/file.pdf').

    Returns:
        str: A JSON string containing the extracted information.
    """
    print(f"Tool 'analyze_pdf_from_uri' started for GCS URI: {gcs_uri}")
    try:
        storage_client = storage.Client(project=Config.GCP_PROJECT_ID)
        bucket_name, blob_name = gcs_uri.replace("gs://", "").split("/", 1)
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)

        blob.reload()
        file_size = blob.size
        SIZE_LIMIT_BYTES = 50 * 1024 * 1024  # 50 MB threshold

        if file_size < SIZE_LIMIT_BYTES:
            print("File size is within limit, processing directly.")
            return _analyze_single_pdf_chunk(gcs_uri)
        else:
            print(
                f"File size {file_size} exceeds limit, starting chunk-based processing.")
            return _analyze_large_pdf_in_chunks(blob)
    except Exception as e:
        error_message = f'{{"error": "Failed to analyze PDF from URI: {gcs_uri}", "details": "{str(e)}"}}'
        print(f"Error in 'analyze_pdf_from_uri' tool: {error_message}")
        return error_message


analyze_pdf_from_uri_tool = FunctionTool(func=analyze_pdf_from_uri)


extraction_pitch_deck_agent = LlmAgent(
    name="extraction_pitch_deck_agent",
    model=AGENT_MODEL,
    description="An agent that extracts structured information from a pitch deck PDF stored in Google Cloud Storage.",
    instruction=f"""
    You are an expert orchestrator for pitch deck analysis. Your task is to follow a strict three-step process using the tools provided.

    CRITICAL INSTRUCTIONS:
    - You MUST follow the workflow steps in order.
    - Do not skip any steps.
    - Your final output MUST be the filename of the saved JSON file.
    - You must return the filename WITHOUT the file extension at the end.
    
    WORKFLOW:
    1.  **Get File URI:** You will receive a filename (e.g., 'Pitch deck.pdf'). You must parse this to get the name ('Pitch deck') and extension ('pdf'). Call the `gcs_uri_for_file_tool` tool with bucket '{GCS_BUCKET_NAME}', the parsed name, and extension to get the file's GCS URI.
    
    2.  **Analyze PDF:** Take the GCS URI from Step 1 and pass it to the `analyze_pdf_from_uri` tool. This tool will read the PDF (including all text and visuals) and return a structured JSON string.
    
    3.  **Save JSON:** Take the JSON string from Step 2. Generate a suitable filename (e.g., 'company_name_analysis'). Call the `save_file_content_to_gcs_tool` tool with bucket '{GCS_BUCKET_NAME}', folder '{GCP_PITCH_DECK_OUTPUT_FOLDER}', the JSON content, the filename you generated, and extension 'json'.
    
    4.  **Return only the filename (no extension):** After saving the file, you MUST return only the generated filename without any extension (e.g., 'company_name_analysis').
    """,
    output_key="extracted_filename",
    generate_content_config=types.GenerateContentConfig(temperature=0),
    tools=[gcs_uri_for_file_tool, analyze_pdf_from_uri_tool,
           save_file_content_to_gcs_tool],
)

print(
    f"Agent '{extraction_pitch_deck_agent.name}' created using model '{AGENT_MODEL}'.")
