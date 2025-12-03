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
    print("State after team profiling sub agent:", current_state)
    company_doc_id = current_state.get("firestore_doc_id")
    corpus_name = current_state.get("rag_corpus_name")
    team_profiling_sub_agent_result = json.loads(current_state.get(
        "team_profiling_sub_agent_result").removeprefix("```json").removesuffix("```").strip())
    if not team_profiling_sub_agent_result or not company_doc_id:
        return None
    gcs_uri = await save_file_content_to_gcs(bucket_name=GCS_BUCKET_NAME,
                                       folder_name=f"processed/{company_doc_id}/sub_agents/{agent_name}",
                                       file_content=json.dumps(
                                           team_profiling_sub_agent_result),
                                       file_extension="json",
                                       file_name=f"{agent_name}_result"
                                       )
    update_sub_agent_result_to_firestore(collection_name=FIRESTORE_COMPANY_COLLECTION, document_id=company_doc_id,
                                         sub_agent_field="team_profiling_sub_agent_gcs_uri", gcs_uri=gcs_uri)
    update_data_to_corpus(corpus_name=corpus_name, document_gcs_paths=[gcs_uri])
    print(f"Team Profiling Sub Agent result saved to GCS URI: {gcs_uri}")

    return None

team_profiling_sub_agent = LlmAgent(
    name="team_profiling_sub_agent",
    model=report_generation_model,
    include_contents='none',
    description="An agent that generates the detailed team profiling of the startup company",
    instruction=f"""
    You are an expert in researching and generating detailed team profiling of startup companies based on their pitch decks and official websites.

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
    1. ** Team Strength Overview ** : Analyze the backgrounds of the founding team members, including their previous experiences, skills, and expertise. Evaluate how well their combined skills align with the startup's mission and objectives.
    Generate bullet points covering the following aspects:-
        - Founders' Relevant Experience: Detail the prior experiences of each founder and how these experiences contribute to the startup's goals.
        - Complementary Skills: Highlight how the founders' skills complement each other and contribute to a well-rounded leadership team.
        - Industry Knowledge: Assess the founders' knowledge of the industry in which the startup operates and how this knowledge benefits the startup.
    Generate a summary paragraph consolidating the above points.
    2. Generate the detailed team profiling of each founding team member covering the following aspects for EACH FOUNDER:-
        - Name and Role: Provide the full name and designated role of the founder within the startup
        - Professional Background: Detail the founder's previous work experiences, notable achievements, and relevant skills that contribute to their role in the startup.
        - Educational Qualifications: Mention the educational background of the founder, including degrees obtained and institutions attended
        - Industry Expertise: Highlight any specific industry knowledge or expertise that the founder brings to the startup.
        - Vision and Motivation: Describe the founder's vision for the startup and their motivation for being involved in the venture.
    3. Take a note of the missing or incomplete information in the pitch deck related to the team profiling analysis or not available on the internet when you searched via 'search' or 'extract' and mention those in the output as well. Categorize them under mandatory and optional information. THIS IS IMPORTANT TO HIGHLIGHT THE GAPS IN THE PITCH DECK. IT SHOULD BE REAL AND PROPERLY GROUNDED BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. DO NOT MAKE UP ANY DATA.
    4. Collect all the website sources being used for the research. DONT MENTION THE PITCH DECK AS A SOURCE. ONLY MENTION THE WEBSITES USED FOR RESEARCH AS SOURCES.

    OUTPUT:
        Execute all the tasks and output the final result in JSON format as provided in the format below:-
        {{
            "team_strength_overview": {{
                "bullet_points": [
                    "...",
                    "..."
                ],
                "summary_paragraph": "..."
            }},
            "founder_profiles": [
                {{
                    "name_and_role": "...",
                    "professional_background": "...",
                    "educational_qualifications": "...",
                    "industry_expertise": "...",
                    "vision_and_motivation": "..."
                }},
                {{
                    "name_and_role": "...",
                    "professional_background": "...",
                    "educational_qualifications": "...",
                    "industry_expertise": "...",
                    "vision_and_motivation": "..."
                }}
            ],
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
            "team_strength_overview": {{
                "bullet_points": [
                    "Founder A has 10 years of experience in the tech industry, including leadership roles at major companies.",
                    "Founder B brings expertise in marketing and business development, complementing Founder A's technical skills.",
                    "The founders possess deep industry knowledge, having worked in the relevant sector for over a decade."
                ],
                "summary_paragraph": "The founding team of the startup is well-equipped with a diverse set of skills and experiences that align perfectly with the company's mission. Founder A's extensive technical background, combined with Founder B's marketing expertise, creates a balanced leadership team capable of driving the startup towards success."
            }},
            "founder_profiles": [
                {{
                    "name_and_role": "Founder A - CEO",
                    "professional_background": "Founder A has held various leadership positions in the tech industry, including CTO at XYZ Corp and VP of Engineering at ABC Inc. They have a track record of successful product launches and team management.",
                    "educational_qualifications": "Founder A holds a Master's degree in Computer Science from Stanford University.",
                    "industry_expertise": "With over 15 years in the tech sector, Founder A
    has deep insights into software development and emerging technologies.",
                    "vision_and_motivation": "Founder A is driven by a passion for innovation and aims to revolutionize the industry with cutting-edge solutions."
                }},
                {{
                    "name_and_role": "Founder B - CMO",
                    "professional_background": "Founder B has a strong background in marketing and business development, having worked at top firms like DEF Marketing and GHI Ventures. They have successfully led multiple marketing campaigns that resulted in significant growth.",
                    "educational_qualifications": "Founder B holds an MBA from Harvard Business School.",
                    "industry_expertise": "Founder B specializes in digital marketing strategies and has a keen understanding of market trends.",
                    "vision_and_motivation": "Founder B is motivated by the desire to create impactful
    brand experiences and drive customer engagement."
                }}
            ],
            "sources": [
                "https://www.example1.com",
                "https://www.example2.com"
            ],
            "gaps": {{
                "mandatory_information": [
                    "Lack of detailed information on Founder C's professional background.",
                    "Missing data on the team's prior startup experiences."
                ],
                "optional_information": [
                    "Additional insights into the founders' personal motivations.",
                    "More comprehensive educational histories of the team members."
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
    output_key="team_profiling_sub_agent_result",
    after_agent_callback=post_agent_execution,
    generate_content_config=types.GenerateContentConfig(temperature=0),
    tools=[search, extract]
)
