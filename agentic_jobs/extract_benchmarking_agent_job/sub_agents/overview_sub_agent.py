from google.adk.agents import LlmAgent
from google.genai import types
import json
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
    company_doc_id = current_state.get("firestore_doc_id")
    corpus_name = current_state.get("rag_corpus_name")
    overview_sub_agent_result = json.loads(current_state.get(
        "overview_sub_agent_result").removeprefix("```json").removesuffix("```").strip())
    if not overview_sub_agent_result or not company_doc_id:
        return None
    gcs_uri = await save_file_content_to_gcs(bucket_name=GCS_BUCKET_NAME,
                                       folder_name=f"processed/{company_doc_id}/sub_agents/{agent_name}",
                                       file_content=json.dumps(
                                           overview_sub_agent_result),
                                       file_extension="json",
                                       file_name=f"{agent_name}_result"
                                       )
    update_sub_agent_result_to_firestore(collection_name=FIRESTORE_COMPANY_COLLECTION, document_id=company_doc_id,
                                         sub_agent_field="overview_sub_agent_gcs_uri", gcs_uri=gcs_uri)
    update_data_to_corpus(corpus_name=corpus_name, document_gcs_paths=[gcs_uri])
    print(f"Overview Sub Agent result saved to GCS URI: {gcs_uri}")

    return None


# extract the company official websites
overview_sub_agent = LlmAgent(
    name="overview_sub_agent",
    model=report_generation_model,
    description="An agent that generates the overview summary of investment on the given startup company",
    instruction=f"""
    You are an expert in generating overview summary of startup companies based on their pitch decks and official websites.

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
    1. Generate the detailed problem statement that the startup is trying to solve. Use the pitch deck and call the 'search' and 'extract' tools to gather relevant information from the company official websites provided in the {{company_websites}} list.
    2. Generate the solution provided by the startup to solve the problem statement.  Use the pitch deck and call the 'search' and 'extract' tools to gather relevant information from the company official websites provided in the {{company_websites}} list.
    3. Generate a detailed market analysis and position of startup as follows (Make use of the pitch deck and call the 'search' and 'extract' tools to gather relevant information from the company official websites provided in the {{company_websites}} list):
        - Fetch the year of foundation of the company from the pitch deck or the official websites using the tools.
        - Fetch the approximate current employee count of the company from the pitch deck or the official websites using the tools.
        - Fetch the tag line or slogan of the company from the pitch deck or the official websites using the tools. Do not make up any tag line on your own if not found.
        - Create a short description (2-3 lines) about the company using the information from the pitch deck and the official websites using the tools. Do not make up any description on your own if not found.
        - Fetch the geographic location (City, State, Country) of the company from the pitch deck or the official websites using the tools.
        - Fetch the no of similar competitors in the market along with a one line summary such as "Indicative of early but competitive landscape." or likewise from the pitch deck or the official websites using the tools.
        - Generate the status of the innovation cycle involved such as "Rapid Innovation Cycles" or "Slow Innovation Cycles" or likewise. Generate a brief reasoning for the same such as "High opportunity for differentiation and category leadership.".
        The reasoning must be based on the information fetched from the tools and the pitch deck and MUST NOT be made up.
        - Generate the TAM, SOM and SAM details in value.
        - Generate (MUST BE REAL AND NOT MADE UP) the SOM (Serviceable Obtainable Market) data in JSON as provided below:-
          {{
              "title": "Serviceable Obtainable Market (SOM) Projection",
              "unit": "<Unit of measurement obtained from pitch deck and tools>",
              "data": [
                    {{ "year": "2024", "value": 5 }},
                    {{ "year": "2026", "value": 20 }},
                    {{ "year": "2028", "value": 80 }},
                    {{ "year": "2030", "value": 150 }},
                    {{ "year": "2034", "value": 200 }},
            ]
          }}
        - Generate the technology and innovation section (ONLY GENETRATE IF THE COMPANY IS INVOLVING ANY INNOVATIVE TECHNOLOGY SUCH AS AI/ML/ETC. OTHERWISE SKIP THIS SECTION) covering the following points:-
            * Technology Stack Used - Give a detailed description of the technology stack used by the startup.
            * Innovation & R&D - Give a detailed description of the innovation and R&D being done by the startup.
            * Vision & USP - Give a detailed description of the vision and USP of the startup.
        4. Collect all the website sources being used for the research. DONT MENTION THE PITCH DECK AS A SOURCE. ONLY MENTION THE WEBSITES USED FOR RESEARCH AS SOURCES.
        5. Take a note of the missing or incomplete information in the pitch deck related to the overview analysis or not available on the internet when you searched via 'search' or 'extract' and mention those in the output as well. Categorize them under mandatory and optional information. THIS IS IMPORTANT TO HIGHLIGHT THE GAPS IN THE PITCH DECK. IT SHOULD BE REAL AND PROPERLY GROUNDED BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. DO NOT MAKE UP ANY DATA.
    
    OUTPUT:
        Execute all the tasks and output the final result in JSON format as provided in the format below:-

        {{
            "problem_statement": "...",
            "solution": "...",
            "market_size_and_position": {{
                "foundation_year": "...",
                "employee_count": "...",
                "tag_line": "...",
                "short_description": "...",
                "geographic_location": "...",
                "competitors_summary": {{
                    "number_of_competitors": "...",
                    "summary": "..."
                }},
                "innovation_cycle_status": {{
                    "status": "...",
                    "reasoning": "..."
                }},
                "TAM": "...",
                "SAM": "...",
                "SOM": "...",
                "SOM_Projection": {{
                    "title": "Serviceable Obtainable Market (SOM) Projection",
                    "unit": "Units of measurement obtained from pitch deck and tools",
                    "data": [
                        {{ "year": "...", "value": ... }},
                        {{ "year": "...", "value": ... }},
                        {{ "year": "...", "value": ... }},
                        {{ "year": "...", "value": ... }},
                        {{ "year": "...", "value": ... }}
                    ]
                }}
            }},
            "technology_and_innovation": {{
                "technology_stack_used": "...",
                "innovation_and_R_and_D": "...",
                "vision_and_USP": "..."
            }},
            "sources": ["...", "..."],
            "gaps": {{
                "mandatory_information": ["...", "..."],
                "optional_information": ["...", "..."]
            }}
        }}

        Example Output (companies involving technology and innovation):-
        {{
            "problem_statement": "The startup aims to solve...",
            "solution": "The startup provides...",
            "market_size_and_position": {{
                "foundation_year": "2020",
                "employee_count": "50",
                "tag_line": "Innovating the Future",
                "short_description": "The startup is focused on delivering cutting-edge solutions in the tech industry",
                "geographic_location": "San Francisco, CA, USA",
                "competitors_summary": {{
                    "number_of_competitors": "15",
                    "summary": "Indicative of early but competitive landscape."
                }},
                "innovation_cycle_status": {{
                    "status": "Rapid Innovation Cycles",
                    "reasoning": "High opportunity for differentiation and category leadership."
                }},
                "TAM": "$10 Billion",
                "SAM": "$2 Billion",
                "SOM": "$500 Million",
                "SOM_Projection": {{
                    "title": "Serviceable Obtainable Market (SOM) Projection",
                    "unit": "Million USD",
                    "data": [
                        {{ "year": "2024", "value": 5 }},
                        {{ "year": "2026", "value": 20 }},
                        {{ "year": "2028", "value": 80 }},
                        {{ "year": "2030", "value": 150 }},
                        {{ "year": "2034", "value": 200 }}
                    ]
                }}
            }},
            "technology_and_innovation": {{
                "technology_stack_used": "AI/ML, Cloud Computing",
                "innovation_and_R_and_D": "Focus on cutting-edge AI algorithms to enhance user experience.",
                "vision_and_USP": "To revolutionize the industry with innovative solutions."
            }},
            "sources": ["https://www.example1.com", "https://www.example2.com"],
            "gaps": {{
                "mandatory_information": ["Founder's background details", "Detailed financial projections"],
                "optional_information": ["Customer testimonials", "Partnership details"]
            }}
        }}

        Example Output (companies WITHOUT involving technology and innovation):-
        {{
            "problem_statement": "The startup aims to solve...",
            "solution": "The startup provides...",
            "market_size_and_position": {{
                "foundation_year": "2018",
                "employee_count": "100",
                "tag_line": "Established Excellence",
                "short_description": "The startup has a strong presence in the traditional market with a focus on quality and customer satisfaction.",
                "geographic_location": "New York, NY, USA",
                "competitors_summary": {{
                    "number_of_competitors": "10",
                    "summary": "Moderately competitive market."
                }},
                "innovation_cycle_status": {{
                    "status": "Slow Innovation Cycles",
                    "reasoning": "Established market with incremental improvements."
                }},
                "TAM": "$5 Billion",
                "SAM": "$1 Billion",
                "SOM": "$300 Million",
                "SOM_Projection": {{
                    "title": "Serviceable Obtainable Market (SOM) Projection",
                    "unit": "INR Crores",
                    "data": [
                        {{ "year": "2024", "value": 3 }},
                        {{ "year": "2026", "value": 10 }},
                        {{ "year": "2028", "value": 30 }},
                        {{ "year": "2030", "value": 70 }},
                        {{ "year": "2034", "value": 100 }}
                    ]
                }}
            }},
            "sources": ["https://www.example1.com", "https://www.example2.com"],
            "gaps": {{
                "mandatory_information": ["Market analysis details", "Customer acquisition strategy"],
                "optional_information": ["Advisory board details"]
            }}
        }}
    
    CRITICAL:
    - ENSURE THAT ALL THE INFORMATION PROVIDED IN THE OUTPUT IS REAL AND PROPERLY GROUNDED BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. DO NOT MAKE UP ANY DATA.
    - EXAMPLE OUTPUT SHOWS SHORT TEXTS AND IS ONLY FOR YOUR REFERENCE. IN REAL OUTPUT, PROVIDE DETAILED INSIGHTS AND ANALYSIS UNDER EACH KEY AS PER THE TASKS MENTIONED ABOVE.
    
    YOU MUST RETURN THE JSON OUTPUT AS SPECIFIED ABOVE AND NOTHING ELSE.
    """,
    output_key="overview_sub_agent_result",
    after_agent_callback=post_agent_execution,
    generate_content_config=types.GenerateContentConfig(temperature=0),
    tools=[search, extract]
)
