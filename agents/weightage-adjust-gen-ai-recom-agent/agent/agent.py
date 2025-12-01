from google.adk.agents.llm_agent import LlmAgent
from google.adk.tools.tool_context import ToolContext
from typing import Optional, Dict, Any
from google.adk.tools.base_tool import BaseTool
from google import auth
import vertexai
from vertexai.preview import rag
from google.adk.agents.callback_context import CallbackContext
from llm_model_config import llm
from google.genai import types
from config import Config
from tools import extract, retrieve, search
from utils import read_benchmark_framework_text

GCP_CLOUD_PROJECT = Config.GCP_CLOUD_PROJECT
GCP_CLOUD_REGION = Config.GCP_CLOUD_REGION
COMPANY_COLLECTION_NAME = Config.COMPANY_COLLECTION_NAME
FIRESTORE_DATABASE = Config.FIRESTORE_DATABASE
AGENT_MODEL = Config.AGENT_MODEL
SUB_AGENTS_RAG_CORPUS_PREFIX = Config.SUB_AGENTS_RAG_CORPUS_PREFIX

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


async def fetch_rag_corpus(callback_context: CallbackContext) -> None:
    """Prepares the RAG corpus for the sub-agents."""
    initialize_vertex_ai()

    # Retrieve the company document ID from the callback context state
    current_state = callback_context.state.to_dict()
    company_doc_id = current_state.get("company_doc_id")

    # Validate that company_doc_id is present
    if not company_doc_id:
        raise ValueError(
            "company_doc_id is missing in the callback context state.")

    # Construct the expected corpus display name
    corpus_display_name = f"{SUB_AGENTS_RAG_CORPUS_PREFIX}_{company_doc_id}"

    # Check if the corpus already exists in Vertex AI
    existing_corpora = rag.list_corpora()
    for existing_corpus in existing_corpora:
        if existing_corpus.display_name == corpus_display_name:
            print(f"Corpus '{corpus_display_name}' already exists.")
            # Update state with corpus details for downstream tools
            callback_context.state.update({
                **callback_context.state.to_dict(),
                "rag_corpus_display_name": existing_corpus.display_name,
                "rag_corpus_name": existing_corpus.name
            })
            return None

    # If corpus is not found, raise an error (creation is handled elsewhere)
    raise RuntimeError(f"Corpus '{corpus_display_name}' does not exist.")


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
    # Retrieve context variables
    tool_name = tool.name
    company_doc_id = tool_context.state.get("company_doc_id")
    rag_corpus_name = tool_context.state.get("rag_corpus_name")

    # Validate company_doc_id
    if not company_doc_id:
        raise ValueError(
            "company_doc_id is missing in the tool context state.")

    # Define tool names
    rag_tool_name = "retrieve"
    web_search_tool_name = "search"
    web_extraction_tool_name = "extract"

    # Validate arguments based on the tool being called
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
        
        # Inject the corpus name into the tool arguments
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
    before_agent_callback=fetch_rag_corpus,
    before_tool_callback=before_tool_callback,
    tools=[extract, search, retrieve]
)