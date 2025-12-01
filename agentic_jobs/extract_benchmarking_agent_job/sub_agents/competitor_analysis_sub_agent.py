import json
from google.adk.agents import LlmAgent
from google.genai import types
from google.adk.agents.callback_context import CallbackContext
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
    competitor_analysis_sub_agent_result = json.loads(current_state.get(
        "competitor_analysis_sub_agent_result").removeprefix("```json").removesuffix("```").strip())
    if not competitor_analysis_sub_agent_result or not company_doc_id:
        return None
    gcs_uri = await save_file_content_to_gcs(bucket_name=GCS_BUCKET_NAME,
                                             folder_name=f"processed/{company_doc_id}/sub_agents/{agent_name}",
                                             file_content=json.dumps(
                                                 competitor_analysis_sub_agent_result),
                                             file_extension="json",
                                             file_name=f"{agent_name}_result"
                                             )
    update_sub_agent_result_to_firestore(collection_name=FIRESTORE_COMPANY_COLLECTION, document_id=company_doc_id,
                                         sub_agent_field="competitor_analysis_sub_agent_gcs_uri", gcs_uri=gcs_uri)
    update_data_to_corpus(corpus_name=corpus_name, document_gcs_paths=[gcs_uri])
    print(f"Competitor Analysis Sub Agent result saved to GCS URI: {gcs_uri}")

    return None


competitor_analysis_sub_agent = LlmAgent(
    name="competitor_analysis_sub_agent",
    model=report_generation_model,
    description="An agent that generates the competitor analysis of the startup company",
    instruction=f"""
    You are an expert in researching and generating detailed competitor analysis of startup companies based on their pitch decks and official websites.

    INPUT:
        - Pitch deck JSON object: 
            {{pitch_deck}}
        - List of company official websites:
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
    - IF DATA FOR A FIELD IS NOT AVAILABLE, LEAVE IT BLANK AS "" (Empty String) or [] (Empty Array) following the structure of field as discussed in the format below in THE ** OUTPUT ** section. DO NOT MAKE UP DATA ON YOUR OWN.

    TASKS:
    - Provide the competitive analysis comparing key metrics of the startup and its main competitors. Competitors should be segregated geography wise. If the company is Indian, try to list down Indian competitors first and then global competitors. Include columns for metrics such as market share, team size, funding, user base, headquarters, description, founded year, last round, last raised, total raised, status (private/public), detailed offerings and features, USP, B2B/B2C, Target Market, Key Clients, Growth Market (Sales-led/Self-serve), domain url, and any other relevant KPIs.
    - Collect all the website sources being used for the research. DONT MENTION THE PITCH DECK AS A SOURCE. ONLY MENTION THE WEBSITES USED FOR RESEARCH AS SOURCES.


    OUTPUT:
        Execute all the tasks and output the final result in JSON format as provided in the format below:-
        {{
            "company_geographical_country": "...",
            "company_domain": "...",
            "sources": [
                "...",
                "..."
            ],
            "competitor_analysis": {{
                "domain_wise_competitor_analysis": [ 
                    {{
                        "name": "...",
                        "market_share": "...",
                        "differentiators": "...",
                        "team_size": "...",
                        "funding": "...",
                        "user_base": "...",
                        "headquarters": "...",
                        "description": "...",
                        "founded_year": "...",
                        "last_round": "...",
                        "last_raised": "...",
                        "total_raised": "...",
                        "status": "...",
                        "detailed_offerings_and_features": "...",
                        "USP": "...",
                        "b2b_b2c": "...",
                        "target_market": "...",
                        "key_clients": "...",
                        "growth_market": "...",
                        "domain_url": "...",
                        "... other relevant KPIs ..."
                    }},
                    ...
                ],
                "geography_wise_competitor_analysis": [ 
                    {{
                        "name": "...",
                        "market_share": "...",
                        "differentiators": "...",
                        "team_size": "...",
                        "funding": "...",
                        "user_base": "...",
                        "headquarters": "...",
                        "description": "...",
                        "founded_year": "...",
                        "last_round": "...",
                        "last_raised": "...",
                        "total_raised": "...",
                        "status": "...",
                        "detailed_offerings_and_features": "...",
                        "USP": "...",
                        "b2b_b2c": "...",
                        "target_market": "...",
                        "key_clients": "...",
                        "growth_market": "...",
                        "domain_url": "...",
                        "... other relevant KPIs ..."
                    }},
                    ...
                ]
            }}
        }}

        Example Output:-
        {{
            "company_geographical_country": "India",
            "company_domain": "Fintech",
            "sources": [
                "https://www.example1.com",
                "https://www.example2.com"
            ],
            "competitor_analysis": {{
                "domain_wise_competitor_analysis": [ 
                    {{
                        "name": "Fintech Solutions Pvt Ltd",
                        "market_share": "15%",
                        "differentiators": "Advanced AI-driven analytics",
                        "team_size": "150",
                        "funding": "$20M",
                        "user_base": "500,000",
                        "headquarters": "Bangalore, India",
                        "description": "A leading fintech company providing innovative payment solutions.",
                        "founded_year": "2018",
                        "last_round": "Series B",
                        "last_raised": "$10M",
                        "total_raised": "$20M",
                        "status": "Private",
                        "detailed_offerings_and_features": "AI-driven payment gateway, fraud detection, mobile wallet.",
                        "USP": "Cutting-edge AI technology for secure transactions.",
                        "b2b_b2c": "B2B",
                        "target_market": "SMEs in India",
                        "key_clients": "ABC Corp, XYZ Ltd",
                        "growth_market": "Sales-led",
                        "domain_url": "https://fintechsolutions.com"
                    }},
                    ...
                ],
                "geography_wise_competitor_analysis": [ 
                    {{
                        "name": "Global Fintech Inc.",
                        "market_share": "10%",
                        "differentiators": "Global reach with multi-currency support",
                        "team_size": "300",
                        "funding": "$50M",
                        "user_base": "1 Million",
                        "headquarters": "New York, USA",
                        "description": "A global fintech company offering cross-border payment solutions.",
                        "founded_year": "2015",
                        "last_round": "Series C",
                        "last_raised": "$20M",
                        "total_raised": "$50M",
                        "status": "Private",
                        "detailed_offerings_and_features": "Cross-border payments, multi-currency wallets, API integrations.",
                        "USP": "Seamless international transactions.",
                        "b2b_b2c": "B2B and B2C",
                        "target_market": "Enterprises worldwide",
                        "key_clients": "Global Enterprises Inc, TechWorld",
                        "growth_market": "Sales-led",
                        "domain_url": "https://globalfintech.com"
                    }},
                    ...
                ]
            }}
        }}

    CRITICAL:
    - ENSURE THAT ALL THE INFORMATION PROVIDED IN THE OUTPUT IS REAL AND PROPERLY GROUNDED BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. DO NOT MAKE UP ANY DATA.
    - EXAMPLE OUTPUT SHOWS SHORT TEXTS AND IS ONLY FOR YOUR REFERENCE. IN REAL OUTPUT, PROVIDE DETAILED INSIGHTS AND ANALYSIS UNDER EACH KEY AS PER THE TASKS MENTIONED ABOVE.
    
    YOU MUST RETURN THE JSON OUTPUT AS SPECIFIED ABOVE AND NOTHING ELSE.

    """,
    output_key="competitor_analysis_sub_agent_result",
    after_agent_callback=post_agent_execution,
    generate_content_config=types.GenerateContentConfig(temperature=0),
    tools=[search, extract]
)
