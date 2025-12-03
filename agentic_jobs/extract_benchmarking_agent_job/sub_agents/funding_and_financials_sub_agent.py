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
    print("State after funding and financials sub agent:", current_state)
    corpus_name = current_state.get("rag_corpus_name")
    company_doc_id = current_state.get("firestore_doc_id")
    funding_and_financials_sub_agent_result = json.loads(current_state.get(
        "funding_and_financials_sub_agent_result").removeprefix("```json").removesuffix("```").strip())
    if not funding_and_financials_sub_agent_result or not company_doc_id:
        return None
    gcs_uri = await save_file_content_to_gcs(bucket_name=GCS_BUCKET_NAME,
                                             folder_name=f"processed/{company_doc_id}/sub_agents/{agent_name}",
                                             file_content=json.dumps(
                                                 funding_and_financials_sub_agent_result),
                                             file_extension="json",
                                             file_name=f"{agent_name}_result"
                                             )
    update_sub_agent_result_to_firestore(collection_name=FIRESTORE_COMPANY_COLLECTION, document_id=company_doc_id,
                                         sub_agent_field="funding_and_financials_sub_agent_gcs_uri", gcs_uri=gcs_uri)
    update_data_to_corpus(corpus_name=corpus_name, document_gcs_paths=[gcs_uri])
    print(
        f"Funding and Financials Sub Agent result saved to GCS URI: {gcs_uri}")

    return None

funding_and_financials_sub_agent = LlmAgent(
    name="funding_and_financials_sub_agent",
    model=report_generation_model,
    include_contents='none',
    description="An agent that generates detailed funding and financials analysis for startup companies",
    instruction=f"""
    You are an expert in researching and generating detailed funding and financials analysis.

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
    - ** Funding Ask Analysis **: Provide a detailed analysis of the startup's funding ask, including the amount being raised, valuation, equity offered, and use of funds. Compare the ask with industry benchmarks for similar startups at the same stage.
    - ** Financial Projections Review **: Analyze the startup's financial projections, including revenue forecasts, expense estimates, and profitability timelines. Assess the realism of these projections based on market data and comparable companies.
    - ** Historical Financial Performance **: Review the startup's historical financial performance, including past revenue, expenses, and cash flow. Identify trends and key drivers of financial performance.
    - ** Funding History Evaluation **: Examine the startup's funding history, including previous rounds, investors, and amounts raised. Assess how past funding has been utilized and its impact on growth.
    - ** Financial Health Indicators **: Analyze key financial health indicators such as burn rate, runway, gross margin, and EBITDA. Provide insights into the startup's financial stability and sustainability.
    - ** Startup funding status and trends **: Provide insights into the current funding status of the startup, including any ongoing fundraising efforts, investor interest, and market conditions affecting funding opportunities.
    - ** Financial Projections and Milestones **: Analyze the startup's financial projections and key milestones. Evaluate the feasibility of achieving these milestones based on current financials and market conditions. If available give a year wise breakup of financial projections.
    - ** Funding timelines **: Provide an overview of the typical funding timelines for startups in the same industry and stage. Compare the startup's funding timeline with industry norms and provide insights into any deviations.
    - ** Funding history **: Review the startup's funding history, including previous rounds, investors, and amounts raised. Assess how past funding has been utilized and its impact on growth. If possible give a year wise breakup of funding history.
    - ** Generating gaps **: Take a note of the missing or incomplete information in the pitch deck related to the funding and financial analysis or not available on the internet when you searched via 'search' or 'extract' and mention those in the output as well. Categorize them under mandatory and optional information. THIS IS IMPORTANT TO HIGHLIGHT THE GAPS IN THE PITCH DECK. IT SHOULD BE REAL AND PROPERLY GROUNDED BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. DO NOT MAKE UP ANY DATA.

    - Collect all the website sources being used for the research. DONT MENTION THE PITCH DECK AS A SOURCE. ONLY MENTION THE WEBSITES USED FOR RESEARCH AS SOURCES.


    OUTPUT:
        Execute all the tasks and output the final result in JSON format as provided in the format below:-
        {{
            "funding_ask_analysis": "...",
            "financial_projections_review": "...",
            "historical_financial_performance": "...",
            "funding_history_evaluation": "...",
            "financial_health_indicators": "...",
            "startup_funding_status_and_trends": "...",
            "financial_projections_and_milestones": "...",
            "funding_timelines": "...",
            "funding_history": "...",
            "sources": [
                "...",
                "..."
            ],
            "gaps": {{
                "mandatory_information": [
                    "..."
                ],
                "optional_information": [
                    "..."
                ]
            }}
        }}

        Example Output:-
        {{
            "funding_ask_analysis": "The startup is seeking $5 million in Series A funding at a $20 million valuation, offering 25% equity. The funds will be used for product development (40%), marketing (30%), and hiring (30%). This ask aligns with industry benchmarks for similar startups at this stage.",
            "financial_projections_review": "The startup projects $2 million in revenue for the next fiscal year, with expenses of $1.5 million, leading to a net profit of $500,000. These projections are realistic based on market data and comparable companies in the sector.",
            "historical_financial_performance": "Over the past two years, the startup has seen a steady increase in revenue from $200,000 to $1 million, with expenses growing proportionally. Cash flow has remained positive, indicating strong financial management.",
            "funding_history_evaluation": "The startup has raised $1 million in seed funding from angel investors and early-stage VCs. This funding has been effectively utilized for product development and initial market entry, contributing to the current growth trajectory.",
            "financial_health_indicators": "Key financial health indicators show a burn rate of $50,000 per month, with a runway of 10 months. Gross margin stands at 60%, and EBITDA is positive, indicating financial stability.",
            "startup_funding_status_and_trends": "The startup is currently in active discussions with potential investors for its Series A round. Market conditions are favorable, with increased investor interest in the sector.",
            "financial_projections_and_milestones": "The startup aims to achieve $5 million in revenue within three years, with key milestones including product launches and market expansion. These projections are feasible given current financials and market conditions.",
            "funding_timelines": "Typical funding timelines for similar startups range from 6 to 12 months. The startup's timeline is on track, with plans to close the Series A round within the next 9 months.",
            "funding_history": "The startup raised $500,000 in seed funding in Year 1 and an additional $500,000 in Year 2 from angel investors and early-stage VCs.",
            "sources": [
                "https://www.crunchbase.com/organization/example-startup",
                "https://www.pitchbook.com/profiles/example-startup"
            ],
            "gaps": {{
                "mandatory_information": [
                    "Detailed breakdown of use of funds for the current funding ask",
                    "Year-wise financial projections for the next 5 years"
                ],
                "optional_information": [
                    "List of previous investors and their investment amounts",
                    "Details on any government grants or subsidies received"
                ]
            }}
        }}

    CRITICAL:
    - ENSURE THAT ALL THE INFORMATION PROVIDED IN THE OUTPUT IS REAL AND PROPERLY GROUNDED BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. DO NOT MAKE UP ANY DATA.
    - EXAMPLE OUTPUT SHOWS SHORT TEXTS AND IS ONLY FOR YOUR REFERENCE. IN REAL OUTPUT, PROVIDE DETAILED INSIGHTS AND ANALYSIS UNDER EACH KEY AS PER THE TASKS MENTIONED ABOVE.
    
    YOU MUST RETURN THE JSON OUTPUT AS SPECIFIED ABOVE AND NOTHING ELSE.

    CRITICAL INSTRUCTION FOR FINAL OUTPUT:
    When you have gathered all necessary information and are ready to generate the final JSON output, DO NOT call any tool. Simply output the JSON text as your final response to the user.

    """,
    output_key="funding_and_financials_sub_agent_result",
    after_agent_callback=post_agent_execution,
    generate_content_config=types.GenerateContentConfig(temperature=0),
    tools=[search, extract]
)
