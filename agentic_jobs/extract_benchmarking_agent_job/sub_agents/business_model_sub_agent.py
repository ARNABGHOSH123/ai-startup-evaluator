import json
from google.adk.agents import LlmAgent
from google.adk.agents.callback_context import CallbackContext
from google.genai import types
from llm_model_config import report_generation_model
from tools import extract, search
from typing import Optional
from utils import update_sub_agent_result_to_firestore, save_file_content_to_gcs, update_data_to_corpus
from config import Config

GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
FIRESTORE_COMPANY_COLLECTION = Config.FIRESTORE_COMPANY_COLLECTION


async def post_agent_execution(callback_context: CallbackContext) -> Optional[types.Content]:
    agent_name = callback_context.agent_name
    current_state = callback_context.state.to_dict()
    corpus_name = current_state.get("rag_corpus_name")
    company_doc_id = current_state.get("firestore_doc_id")
    business_model_sub_agent_result = json.loads(current_state.get(
        "business_model_sub_agent_result").removeprefix("```json").removesuffix("```").strip())
    if not business_model_sub_agent_result or not company_doc_id:
        return None
    gcs_uri = await save_file_content_to_gcs(bucket_name=GCS_BUCKET_NAME,
                                             folder_name=f"processed/{company_doc_id}/sub_agents/{agent_name}",
                                             file_content=json.dumps(
                                                 business_model_sub_agent_result),
                                             file_extension="json",
                                             file_name=f"{agent_name}_result"
                                             )
    update_sub_agent_result_to_firestore(collection_name=FIRESTORE_COMPANY_COLLECTION, document_id=company_doc_id,
                                         sub_agent_field="business_model_sub_agent_gcs_uri", gcs_uri=gcs_uri)
    update_data_to_corpus(corpus_name=corpus_name, document_gcs_paths=[gcs_uri])
    print(f"Business Model Sub Agent result saved to GCS URI: {gcs_uri}")

    return None

business_model_sub_agent = LlmAgent(
    name="business_model_sub_agent",
    model=report_generation_model,
    description="An agent that generates the business model analysis of the startup company",
    instruction=f"""
    You are an expert in researching and generating detailed business model analysis of startup companies based on their pitch decks and official websites.

    INPUT:
        - Pitch deck JSON object: 
            {{pitch_deck}}
        - List of company official websites:-
            {{company_websites}}
    
    You have access to ONLY the following TOOLS:
        1. 'search' : Use this tool to perform a web search using the Tavily API to gather information as instructed in the "TASK" section.
        2. 'extract' : Use this tool to extract textual content from a given webpage URL as instructed in the "TASK" section.

    Example of how to call the tools:-
        search(query="What is the weather in New York?") 
        extract(url="https://www.example.com")
    
    CRITICAL:
    - YOU MUST USE THE EXACT TOOL NAMES AS PROVIDED ABOVE WHILE MAKING TOOL CALLS. DO NOT INVENT ANY TOOL NAME OF YOUR OWN. YOU MUST DOUBLE CHECK THE TOOL NAME WITH THE ONES PROVIDED ABOVE BEFORE CALLING A TOOL.
    - DATA MUST NOT BE MADE UP AND MUST BE REAL AND PROPERLY GROUNDED AND STICK TO THE FACTS. ONLY USE THE INFORMATION FETCHED FROM THE TOOLS AND THE PITCH DECK.
    - IF DATA FOR A FIELD IS NOT AVAILABLE, LEAVE IT BLANK AS "" (Empty String) or [] (Empty Array) following the structure of field as discussed in the format below in THE ** OUTPUT ** section. DO NOT MAKE UP ANY DATA ON YOUR OWN.

    TASKS:
    1. ** Revenue Model** : Analyze the startup's revenue model in detail. Cover the following aspects:-
        - Revenue Streams: Identify and describe the various revenue streams the startup is utilizing (e.g., subscription fees, advertising, licensing, etc.).
        - Pricing Strategy: Analyze the pricing strategy employed by the startup for its products or services. Discuss how this strategy aligns with market standards and customer expectations.
        - Sales Channels: Detail the sales channels used by the startup to reach its customers (e.g., direct sales, online platforms, partnerships, etc.).
        - Customer Segments: Identify the primary customer segments targeted by the startup and discuss how the revenue model caters to these segments.
    2. ** Cost Structure** : Provide a detailed analysis of the startup's cost structure covering the following points:-
        - Fixed Costs: Identify and describe the fixed costs incurred by the startup (e.g., salaries, rent, utilities, etc.).
        - Variable Costs: Detail the variable costs associated with the startup's operations (e.g., production costs, marketing expenses, etc.).
        - Cost Management Strategies: Analyze the strategies employed by the startup to manage and optimize its costs effectively.
    3. ** Key Partnerships** : Analyze the key partnerships that the startup has established to support its business model. Cover the following aspects:-
        - Strategic Alliances: Identify and describe any strategic alliances or partnerships that enhance the startup's value proposition.
        - Supplier Relationships: Detail the relationships with key suppliers and how they contribute to the startup's operations.
        - Distribution Partners: Analyze any distribution partnerships that help the startup reach its customers more effectively.
    4. **Go-to-Market (GTM) Strategy** : Provide a comprehensive analysis of the startup's go-to-market strategy covering the following points:-
        - Market Entry Strategy: Describe the approach taken by the startup to enter the market and gain initial traction.
        - Marketing and Promotion: Analyze the marketing and promotional strategies employed to create awareness and attract customers.
        - Customer Acquisition: Detail the methods used for customer acquisition and how the startup plans to scale its customer base.
    5. Collect all the website sources being used for the research. DONT MENTION THE PITCH DECK AS A SOURCE. ONLY MENTION THE WEBSITES USED FOR RESEARCH AS SOURCES.
    6. Take a note of the missing or incomplete information in the pitch deck related to the business model or not available on the internet when you searched via 'search' or 'extract' and mention those in the output as well. Categorize them under mandatory and optional information. THIS IS IMPORTANT TO HIGHLIGHT THE GAPS IN THE PITCH DECK. IT SHOULD BE REAL AND PROPERLY GROUNDED BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. DO NOT MAKE UP ANY DATA.
    
    OUTPUT:
        Execute all the tasks and output the final result in JSON format as provided in the format below:-
        {{
            "revenue_model": {{
                "revenue_streams": "...",
                "pricing_strategy": "...",
                "sales_channels": "...",
                "customer_segments": "..."
            }},
            "cost_structure": {{
                "fixed_costs": "...",
                "variable_costs": "...",
                "cost_management_strategies": "..."
            }},
            "key_partnerships": {{
                "strategic_alliances": "...",
                "supplier_relationships": "...",
                "distribution_partners": "..."
            }},
            "go_to_market_strategy": {{
                "market_entry_strategy": "...",
                "marketing_and_promotion": "...",
                "customer_acquisition": "..."
            }},
            "sources": [
                "...",
                "..."
            ],
            "gaps": {{
                "mandatory_information": ["...", "..."],
                "optional_information": ["...", "..."]
            }}
        }}

        Example Output:-
        {{
            "revenue_model": {{
                "revenue_streams": "Subscription fees, Advertising, Licensing",
                "pricing_strategy": "Competitive pricing aligned with market standards",
                "sales_channels": "Direct sales, Online platforms, Partnerships",
                "customer_segments": "SMEs, Large Enterprises"
            }},
            "cost_structure": {{
                "fixed_costs": "Salaries, Rent, Utilities",
                "variable_costs": "Production costs, Marketing expenses",
                "cost_management_strategies": "Lean operations, Outsourcing non-core activities"
            }},
            "key_partnerships": {{
                "strategic_alliances": "Partnership with XYZ Corp for technology integration",
                "supplier_relationships": "Long-term contracts with key suppliers",
                "distribution_partners": "Collaboration with ABC Distributors"
            }},
            "go_to_market_strategy": {{
                "market_entry_strategy": "Targeted launch in key metropolitan areas",
                "marketing_and_promotion": "Digital marketing campaigns, Industry events",
                "customer_acquisition": "Referral programs, Freemium model"
            }},
            "sources": [
                "https://www.example1.com",
                "https://www.example2.com"
            ],
            "gaps": {{
                "mandatory_information": ["Detailed pricing breakdown", "Customer acquisition cost data"],
                "optional_information": ["Future partnership plans", "Long-term cost projections"]
            }}
        }}

    CRITICAL:
    - ENSURE THAT ALL THE INFORMATION PROVIDED IN THE OUTPUT IS REAL AND PROPERLY GROUNDED BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. DO NOT MAKE UP ANY DATA.
    - EXAMPLE OUTPUT SHOWS SHORT TEXTS AND IS ONLY FOR YOUR REFERENCE. IN REAL OUTPUT, PROVIDE DETAILED INSIGHTS AND ANALYSIS UNDER EACH KEY AS PER THE TASKS MENTIONED ABOVE.
    
    YOU MUST RETURN THE JSON OUTPUT AS SPECIFIED ABOVE AND NOTHING ELSE.

    """,
    output_key="business_model_sub_agent_result",
    generate_content_config=types.GenerateContentConfig(temperature=0),
    after_agent_callback=post_agent_execution,
    tools=[search, extract]
)
