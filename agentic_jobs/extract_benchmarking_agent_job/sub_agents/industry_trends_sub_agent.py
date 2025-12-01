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
    print("State after industry trends sub agent:", current_state)
    company_doc_id = current_state.get("firestore_doc_id")
    corpus_name = current_state.get("rag_corpus_name")
    industry_trends_sub_agent_result = json.loads(current_state.get(
        "industry_trends_sub_agent_result").removeprefix("```json").removesuffix("```").strip())
    if not industry_trends_sub_agent_result or not company_doc_id:
        return None
    gcs_uri = await save_file_content_to_gcs(bucket_name=GCS_BUCKET_NAME,
                                             folder_name=f"processed/{company_doc_id}/sub_agents/{agent_name}",
                                             file_content=json.dumps(
                                                 industry_trends_sub_agent_result),
                                             file_extension="json",
                                             file_name=f"{agent_name}_result"
                                             )
    update_sub_agent_result_to_firestore(collection_name=FIRESTORE_COMPANY_COLLECTION, document_id=company_doc_id,
                                         sub_agent_field="industry_trends_sub_agent_gcs_uri", gcs_uri=gcs_uri)
    update_data_to_corpus(corpus_name=corpus_name, document_gcs_paths=[gcs_uri])
    print(f"Industry Trends Sub Agent result saved to GCS URI: {gcs_uri}")

    return None

industry_trends_sub_agent = LlmAgent(
    name="industry_trends_sub_agent",
    model=report_generation_model,
    description="An agent that generates detailed industry trends analysis for startup companies",
    instruction=f"""
    You are an expert in researching and generating detailed industry trends analysis.

    INPUT:
        - Pitch deck JSON object: 
            {{pitch_deck}}
        - List of company official websites under the key named {{company_websites}}
    
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
    - Provide the industry trends analysis for the startup company based on the pitch deck and official websites. Include trends related to total market size, sector market size, AI investment surge, AI adoption rates, market growth trends, emerging technologies, market CAGR analysis and comparison, adoption and investment momentum,
     funding breakdowns, regulatory changes, consumer behavior, and any other relevant industry insights.
    - Collect all the website sources being used for the research. DONT MENTION THE PITCH DECK AS A SOURCE. ONLY MENTION THE WEBSITES USED FOR RESEARCH AS SOURCES.
    - Take a note of the missing or incomplete information in the pitch deck related to the industry trends analysis or not available on the internet when you searched via 'search' or 'extract' and mention those in the output as well. Categorize them under mandatory and optional information. THIS IS IMPORTANT TO HIGHLIGHT THE GAPS IN THE PITCH DECK. IT SHOULD BE REAL AND PROPERLY GROUNDED BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. DO NOT MAKE UP ANY DATA.


    OUTPUT:
        Execute all the tasks and output the final result in JSON format as provided in the format below:-
        {{
            "total_market_size": "...",
            "sector_market_size": "...",
            "ai_investment_surge": "...",
            "ai_adoption_rates": "...",
            "market_growth_trends": "...",
            "emerging_technologies": "...",
            "CAGR_analysis": "...",
            "adoption_and_investment_momentum": "...",
            "funding_breakdowns": "...",
            "regulatory_changes": "...",
            "consumer_behavior": "...",
            "other_relevant_insights": "...",
            "sources": [
                "...",
                "..."
            ],
            "gaps": {{
                "mandatory_information": [
                    "...",
                    "..."
                ],
                "optional_information": [
                    "...",
                    "..."
                ]
            }}
        }}

        Example Output:-
        {{
            "total_market_size": "The total market size is estimated to be $50 billion in 2024, with a projected growth to $80 billion by 2028.",
            "sector_market_size": "The specific sector market size is around $10 billion, focusing on SaaS solutions for SMEs.",
            "ai_investment_surge": "AI investments have surged by 40% in the last year, with significant funding directed towards machine learning and automation technologies.",
            "ai_adoption_rates": "AI adoption rates among enterprises have increased to 65%, with a focus on customer service and data analytics applications.",
            "market_growth_trends": "The industry is experiencing a growth rate of 15% annually, driven by increased demand for digital solutions.",
            "emerging_technologies": "AI and machine learning are becoming integral to product offerings, enhancing user experience and operational efficiency.",
            "CAGR_analysis": "The Compound Annual Growth Rate (CAGR) for the industry is projected to be 12% over the next five years, indicating robust expansion.",
            "adoption_and_investment_momentum": "There is a significant increase in adoption rates among SMEs, with venture capital investments rising by 30% year-over-year.",
            "funding_breakdowns": "In 2023, the industry saw $500M in funding, with 60% allocated to early-stage startups and 40% to growth-stage companies.",
            "regulatory_changes": "New data privacy regulations are being implemented, requiring companies to enhance their compliance measures.",
            "consumer_behavior": "Consumers are increasingly favoring mobile-first solutions, with a 25% rise in mobile app usage.",
            "other_relevant_insights": "Sustainability is becoming a key focus, with companies integrating eco-friendly practices into their operations.",
            "sources": [
                "https://www.industryreport.com/trends-2024",
                "https://www.technews.com/emerging-technologies"
            ],
            "gaps": {{
                "mandatory_information": [
                    "Lack of detailed market segmentation data in the pitch deck.",
                    "No information on recent regulatory changes affecting the industry."
                ],
                "optional_information": [
                    "Missing insights on consumer behavior trends specific to emerging markets.",
                    "No data on competitor funding patterns over the last two years."
                ]
            }}
        }}

    CRITICAL:
    - ENSURE THAT ALL THE INFORMATION PROVIDED IN THE OUTPUT IS REAL AND PROPERLY GROUNDED BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. DO NOT MAKE UP ANY DATA.
    - EXAMPLE OUTPUT SHOWS SHORT TEXTS AND IS ONLY FOR YOUR REFERENCE. IN REAL OUTPUT, PROVIDE DETAILED INSIGHTS AND ANALYSIS UNDER EACH KEY AS PER THE TASKS MENTIONED ABOVE.
    
    YOU MUST RETURN THE JSON OUTPUT AS SPECIFIED ABOVE AND NOTHING ELSE.

    """,
    output_key="industry_trends_sub_agent_result",
    after_agent_callback=post_agent_execution,
    generate_content_config=types.GenerateContentConfig(temperature=0),
    tools=[search, extract]
)
