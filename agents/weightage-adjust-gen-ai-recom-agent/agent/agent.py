from google.adk.agents.llm_agent import LlmAgent
from google.adk.tools.tool_context import ToolContext
from typing import Optional, Dict, Any
from google.adk.tools.base_tool import BaseTool
# from google.cloud import firestore, storage
from google import auth
import vertexai
from vertexai.preview import rag
from google.adk.agents.callback_context import CallbackContext
from llm_model_config import llm
from google.genai import types
# import json
from config import Config
from tools import extract, retrieve, search
from utils import read_benchmark_framework_text

GCP_CLOUD_PROJECT = Config.GCP_CLOUD_PROJECT
GCP_CLOUD_REGION = Config.GCP_CLOUD_REGION
COMPANY_COLLECTION_NAME = Config.COMPANY_COLLECTION_NAME
FIRESTORE_DATABASE = Config.FIRESTORE_DATABASE
AGENT_MODEL = Config.AGENT_MODEL

# firestore_client: firestore.Client = None

benchmarking_framework_text = read_benchmark_framework_text()

def initialize_vertex_ai():
    """
    Initializes the Vertex AI SDK and Firestore client with the project configuration.
    
    Sets up the global firestore_client and authenticates using default credentials.
    """
    # global firestore_client
    credentials, _ = auth.default(
        scopes=["https://www.googleapis.com/auth/cloud-platform"])
    vertexai.init(
        project=Config.GCP_CLOUD_PROJECT,
        location=Config.GCP_CLOUD_REGION,
        credentials=credentials
    )
    # firestore_client = firestore.Client(project=GCP_CLOUD_PROJECT, database=FIRESTORE_DATABASE, credentials=credentials) if credentials else firestore.Client(
    #     project=GCP_CLOUD_PROJECT, database=FIRESTORE_DATABASE)


# def chunk_text(text: str, chunk_size: int = 1500) -> List[str]:
#     """
#     Splits a large string into smaller chunks to avoid RAG import errors.
#     Approx 1500 characters is a safe bet for Vertex AI RAG records.
#     """
#     if not text:
#         return []
#     return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

# # 2. Existing Helper (Kept the same)
# def flatten_json_to_text(data: Any, level: int = 0) -> str:
#     """Recursively converts nested JSON/Dict into a readable text format."""
#     lines = []
#     indent = "  " * level
    
#     if isinstance(data, dict):
#         for key, value in data.items():
#             clean_key = key.replace("_", " ").title()
#             if isinstance(value, (dict, list)):
#                 lines.append(f"{indent}## {clean_key}")
#                 lines.append(flatten_json_to_text(value, level + 1))
#             else:
#                 lines.append(f"{indent}* **{clean_key}**: {value}")
#     elif isinstance(data, list):
#         for item in data:
#             if isinstance(item, (dict, list)):
#                 lines.append(flatten_json_to_text(item, level))
#                 lines.append(f"{indent}---") 
#             else:
#                 lines.append(f"{indent}* {item}")
#     elif data is not None:
#         lines.append(f"{indent}{data}")
        
#     return "\n".join(lines)

# def dump_all_sub_agents_as_text(company_doc_id: str, sub_agents_gcs_uris: List[str]) -> str:
#     """Dumps all sub-agents results stored in GCS URIs into a single JSONL file in GCS.

#     Args:
#         company_doc_id (str): The Firestore document ID of the company.
#         sub_agents_gcs_uris (List[str]): List of GCS URIs containing sub-agents results.
#     """
#     credentials, project_id = auth.default(
#         scopes=["https://www.googleapis.com/auth/cloud-platform"])
#     storage_client = storage.Client(
#             project=project_id, credentials=credentials) if credentials else storage.Client(project=project_id)
#     full_text_content = []
#     for gcs_uri in sub_agents_gcs_uris:
#         if not gcs_uri.startswith("gs://"):
#             print(f"Invalid GCS URI: {gcs_uri}, skipping.")
#             continue

#         filename = gcs_uri.split("/")[-1]
#         clean_title = filename.replace(".json", "").replace("_result", "").replace("_sub_agent", "").replace("_", " ").upper()

#         try:
#             path_parts = gcs_uri[5:].split("/", 1)
#             bucket = storage_client.bucket(path_parts[0])
#             blob = bucket.blob(path_parts[1])
#             raw_content = blob.download_as_text()

#             if not raw_content.strip():
#                 print(f"Warning: File {gcs_uri} is empty. Skipping.")
#                 continue
#             json_data = json.loads(raw_content)
#             readable_text = flatten_json_to_text(json_data)

#             section = f"\n\n{'='*20}\nSOURCE: {clean_title}\n{'='*20}\n\n"
#             section += readable_text
#             full_text_content.append(section)
#         except Exception as e:
#             print(f"Skipping {filename}: {e}")
        
#     merged_text = "".join(full_text_content)
#     size_in_bytes = len(merged_text.encode('utf-8'))
#     size_in_mb = size_in_bytes / (1024 * 1024)
#     print(f"Total Combined Size: {size_in_mb:.2f} MB")

#     if size_in_mb > 9.5:
#         print("WARNING: File approaches the 10MB limit. Consider splitting into two files.")

#     output_blob_name = f"processed/{company_doc_id}/sub_agents/all_sub_agents_results.txt"
#     output_bucket = storage_client.bucket(Config.GCS_BUCKET_NAME)
#     output_blob = output_bucket.blob(output_blob_name)
#     output_blob.upload_from_string(merged_text, content_type="text/plain")
#     print(f"Saved single file: gs://{Config.GCS_BUCKET_NAME}/{output_blob_name}")
#     return f"gs://{Config.GCS_BUCKET_NAME}/{output_blob_name}"


SUB_AGENTS_RAG_CORPUS_PREFIX = Config.SUB_AGENTS_RAG_CORPUS_PREFIX


def list_corpus_files(corpus_name):
    """Lists files in the specified corpus."""
    files = list(rag.list_files(corpus_name=corpus_name))
    print(f"Total files in corpus: {len(files)}")
    for file in files:
        print(f"File: {file.display_name} - {file.name}")


async def prepare_rag_corpus(callback_context: CallbackContext) -> None:
    """Prepares the RAG corpus for the sub-agents."""
    initialize_vertex_ai()
    current_state = callback_context.state.to_dict()
    company_doc_id = current_state.get("company_doc_id")
    if not company_doc_id:
        raise ValueError(
            "company_doc_id is missing in the callback context state.")
    corpus_display_name = f"{SUB_AGENTS_RAG_CORPUS_PREFIX}_{company_doc_id}"
    # Check if a corpus for this company already exists to avoid duplicates
    existing_corpora = rag.list_corpora()
    for existing_corpus in existing_corpora:
        if existing_corpus.display_name == corpus_display_name:
            print(f"Corpus '{corpus_display_name}' already exists.")
            callback_context.state.update({
                **callback_context.state.to_dict(),
                "rag_corpus_display_name": existing_corpus.display_name,
                "rag_corpus_name": existing_corpus.name
            })
            return None
    raise RuntimeError(f"Corpus '{corpus_display_name}' does not exist.")

    # Create a new RAG corpus if it doesn't exist
    # corpus = rag.create_corpus(
    #     display_name=corpus_display_name,
    #     description=f"RAG corpus for company {company_doc_id}",
    #     embedding_model_config=rag.EmbeddingModelConfig(
    #         publisher_model="publishers/google/models/text-multilingual-embedding-002"
    #     ),
    #     vector_db=rag.RagManagedDb(retrieval_strategy=rag.KNN()),
    # )
    # print(f"Created new corpus: {corpus.display_name} with ID: {corpus.name}")
    # company_ref = firestore_client.collection(COMPANY_COLLECTION_NAME)
    # doc_ref = company_ref.document(company_doc_id).get().to_dict()
    # sub_agents_results = doc_ref.get("sub_agents_results")
    # sub_agents_gcs_uris = [
    #     gcs_uri for gcs_uri in sub_agents_results.values() if gcs_uri]

    # # Aggregate sub-agent results into a single text file and upload to GCS
    # text_uri = dump_all_sub_agents_as_text(company_doc_id=company_doc_id, sub_agents_gcs_uris=sub_agents_gcs_uris)
    # print(
    #     f"Importing dump to corpus from GCS URI: {text_uri}")

    # # Import the aggregated file into the RAG corpus
    # rag.import_files(
    #     corpus_name=corpus.name,
    #     paths=[text_uri],
    # )

    # list_corpus_files(corpus_name=corpus.name)
    # callback_context.state.update({
    #     **callback_context.state.to_dict(),
    #     "rag_corpus_display_name": corpus.display_name,
    #     "rag_corpus_name": corpus.name
    # })
    # return None


async def before_tool_callback(tool: BaseTool, args: Dict[str, Any], tool_context: ToolContext) -> Optional[Dict]:
    """
    Callback function executed before a tool is called by the agent.
    
    It validates the presence of necessary context variables (like company_doc_id)
    and injects dynamic arguments (like corpus_name for RAG retrieval) into the tool arguments.
    
    Args:
        tool (BaseTool): The tool being called.
        args (Dict[str, Any]): The arguments passed to the tool.
        tool_context (ToolContext): The context in which the tool is executed.
        
    Returns:
        Optional[Dict]: Updated arguments or None.
        
    Raises:
        ValueError: If required context or arguments are missing.
    """
    tool_name = tool.name
    company_doc_id = tool_context.state.get("company_doc_id")
    rag_corpus_name = tool_context.state.get("rag_corpus_name")
    if not company_doc_id:
        raise ValueError(
            "company_doc_id is missing in the tool context state.")
    rag_tool_name = "retrieve"
    web_search_tool_name = "search"
    web_extraction_tool_name = "extract"

    if tool_name == web_search_tool_name:
        query = args.get("query")
        if not query:
            raise ValueError("Query parameter is missing for web search tool.")
        # Call the search tool
    elif tool_name == web_extraction_tool_name:
        url = args.get("url")
        if not url:
            raise ValueError(
                "URL parameter is missing for web extraction tool.")
    elif tool_name == rag_tool_name:
        query = args.get("query")
        if not query:
            raise ValueError(
                "Query parameter is missing for RAG retrieval tool.")
        corpus_name = rag_corpus_name
        args['corpus_name'] = corpus_name
    else:
        raise ValueError(f"Unsupported tool: {tool_name}")
    return None

# Initialize the main LLM Agent for weightage adjustment and recommendation
root_agent = LlmAgent(
    name="weightage_adjust_gen_ai_recom_agent",
    description="An agent that accepts investor weightage adjustments and generates updated startup recommendations based on Gen AI analysis.",
    model=llm,
    instruction=f"""

    You are an expert investment recommendation agent that provides startup investment recommendations to investors based on their specified weightage preferences across various evaluation criteria by using the benchmarking framework.
    
    INPUT:
        - Investor weightage preferences JSON object: 
            {{investor_weightage_preferences}}
        - Original recommendation score:
            {{original_recommendation_score}}
        - Benchmarking framework:
            {benchmarking_framework_text}

    INPUT DETAILS:
    - The investor weightage preferences JSON object contains the investor's desired weightages (in percentages) for Team, Market, Product and Financials criteria. If each of them has 25% weightage, it means equal importance is given to all criteria.
    - The original recommendation score is the initial investment recommendation score (out of 100) generated before applying the investor's weightage preferences.

    You have access to ONLY the following TOOLS:
        1. 'search' : Use this tool to perform a web search using the Tavily API to gather information as instructed in the "TASK" section.
        2. 'extract' : Use this tool to extract textual content from a given webpage URL as instructed in the "TASK" section.
        3. 'retrieve' : Use this tool to retrieve relevant information from the RAG corpus built from the pitch deck analysis report and sub agents results.

    Example of how to call the tools:-
        search(query="What is the weather in New York?") 
        extract(url="https://www.example.com")
        retrieve(query="Relevant information about the startup's market potential")
    
    CRITICAL:
    - YOU MUST USE THE EXACT TOOL NAMES AS PROVIDED ABOVE WHILE MAKING TOOL CALLS. DO NOT INVENT ANY TOOL NAME OF YOUR OWN. YOU MUST DOUBLE CHECK THE TOOL NAME WITH THE ONES PROVIDED ABOVE BEFORE CALLING A TOOL.

    EVALUATION CRITERIA:
    - Team: Evaluate the startup's founding team, their experience, skills, and track record.
    - Market: Assess the market size, growth potential, competition, and market fit.
    - Product: Analyze the product's uniqueness, development stage, and customer feedback.
    - Financials: Review the financial health, revenue projections, and funding status.

    TASK:
    - Analyze the investor weightage preferences and adjust the original recommendation score based on the specified weightages for Team, Market, Product and Financials.
    - Use the benchmarking framework to generate queries to gather any additional information needed via the available tools to support your analysis. Prefer the retrieve tool first to get relevant information from the RAG corpus. If needed, use the search and extract tools to gather more data from the web.
    - Calculate the updated recommendation score out of 100, ensuring that the weightages sum up to 100% along with a detailed reasoning for giving the updated score.
    - Generate a brief explaination of how the weightage adjustments impacted the final recommendation score for each of Team, Market, Product and Financials.

    OUTPUT:
    - A JSON object with the following structure:
    {{
        "updated_recommendation_score": float (The updated recommendation score out of 100),
        "reasoning": str (Detailed reasoning for the updated score),
        "weightage_impact_explanation": {{
            "team": str (Explanation of how team weightage impacted the score),
            "market": str (Explanation of how market weightage impacted the score),
            "product": str (Explanation of how product weightage impacted the score),
            "financials": str (Explanation of how financials weightage impacted the score)
        }}
    }}

    EXAMPLE OUTPUT:
    {{
        "updated_recommendation_score": 87.5,
        "reasoning": "The original recommendation score was 80. With the investor's weightages of Team: 20%, Market: 40%, Product: 30%, and Financials: 10%, the adjustments were made as follows: The strong market potential and innovative product features boosted the score, while the average team experience and financial projections had a lesser impact due to their lower weightages.",
        "weightage_impact_explanation": {{
            "team": "With a 20% weightage, the team's moderate experience slightly lowered the score, but its impact was limited due to the lower weightage.",
            "market": "The 40% weightage on Market allowed the startup's impressive market size and growth potential to significantly elevate the score.",
            "product": "A 30% weightage on Product highlighted the startup's innovative features, positively influencing the score.",
            "financials": "The 10% weightage on Financials meant that while the financial projections were average, their impact on the overall score was minimal."
        }}
    }}

    CRITICAL:
    - ENSURE THE OUTPUT IS A VALID JSON OBJECT AS PER THE STRUCTURE PROVIDED ABOVE. INVALID FORMATS WILL CAUSE PROCESSING ERRORS.
    - DATA MUST NOT BE MADE UP AND MUST BE REAL AND PROPERLY GROUNDED AND STICK TO THE FACTS. ONLY USE THE INFORMATION PROVIDED IN THE INPUTS.
    - IF DATA FOR A FIELD IS NOT AVAILABLE, LEAVE IT BLANK AS "" (Empty String) or [] (Empty Array) or null (Null Value) following the structure of field as discussed in the format above. DO NOT MAKE UP DATA ON YOUR OWN.
    
    """,
    generate_content_config=types.GenerateContentConfig(temperature=0),
    output_key="weightage_adjustment_recommendation_response",
    before_agent_callback=prepare_rag_corpus,
    before_tool_callback=before_tool_callback,
    tools=[extract, search, retrieve]
)