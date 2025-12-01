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
    company_doc_id = current_state.get("firestore_doc_id")
    corpus_name = current_state.get("rag_corpus_name")
    partnerships_and_strategic_analysis_sub_agent_result = json.loads(current_state.get(
        "partnerships_and_strategic_analysis_sub_agent_result").removeprefix("```json").removesuffix("```").strip())
    if not partnerships_and_strategic_analysis_sub_agent_result or not company_doc_id:
        return None
    gcs_uri = await save_file_content_to_gcs(bucket_name=GCS_BUCKET_NAME,
                                       folder_name=f"processed/{company_doc_id}/sub_agents/{agent_name}",
                                       file_content=json.dumps(
                                           partnerships_and_strategic_analysis_sub_agent_result),
                                       file_extension="json",
                                       file_name=f"{agent_name}_result"
                                       )
    update_sub_agent_result_to_firestore(collection_name=FIRESTORE_COMPANY_COLLECTION, document_id=company_doc_id,
                                         sub_agent_field="partnerships_and_strategic_analysis_sub_agent_gcs_uri", gcs_uri=gcs_uri)
    update_data_to_corpus(corpus_name=corpus_name, document_gcs_paths=[gcs_uri])
    print(f"Partnerships and Strategic Analysis Sub Agent result saved to GCS URI: {gcs_uri}")

    return None

partnerships_and_strategic_analysis_sub_agent = LlmAgent(
    name="partnerships_and_strategic_analysis_sub_agent",
    model=report_generation_model,
    description="An agent that analyzes the partnerships and strategic aspects of the startup company",
    instruction=f"""
    You are an expert in researching and generating detailed analysis of partnerships and strategic aspects of startup companies based on their pitch decks and official websites.

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
    1. ** Partnerships & Alliance: ** : Analyze the key partnerships and alliances that the startup has established to support its business model. Cover the following aspects:-
        - Strategic Alliances: Identify and describe any strategic alliances or partnerships that enhance the startup's value proposition.
        - Supplier Relationships: Detail the relationships with key suppliers and how they contribute to the startup's operations.
        - Distribution Partners: Analyze any distribution partnerships that help the startup reach its customers more effectively.
    2. ** Four Vector Analysis: ** : Conduct a comprehensive Four Vector Analysis of the startup covering the following points:-
        - Market Attractiveness: Evaluate the attractiveness of the market in which the startup operates,
            considering factors such as market size, growth potential, and competitive landscape.
        - Competitive Position: Analyze the startup's competitive position within the market, including its strengths, weaknesses, opportunities, and threats (SWOT analysis).
        - Strategic Fit: Assess how well the startup's business model and strategies align with market trends
            and customer needs.
        - Financial Performance: Review the startup's financial performance, including revenue growth, profitability, and funding status.

        Give score out of 100 for each of the above four vectors depending on your analysis along with the appropriate real reason of why you gave that score. DO NOT GENERATE RANDOM / MADE UP SCORES. ONLY BASE THE SCORES ON THE ANALYSIS YOU HAVE DONE BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. REASONS MUST BE BASED ON THE DATA AS WELL AND MUST BE REAL AND PROPERLY GROUNDED. IF DATA IS NOT SUFFICIENT TO GIVE A SCORE, MENTION THAT IN THE REASONING AND LEAVE THE SCORE BLANK AS "" (EMPTY STRING).
    3. **SWOT Analysis** : Perform a detailed SWOT analysis of the startup covering the following aspects:-
        - Strengths: Identify and elaborate on the internal strengths of the startup that give it a competitive advantage.
        - Weaknesses: Detail the internal weaknesses or challenges that the startup faces which may hinder its growth.
        - Opportunities: Analyze the external opportunities in the market that the startup can leverage for growth and expansion.
        - Threats: Identify the external threats or risks in the market that could potentially impact the startup's success.
    4. *Risk Assessment** : Conduct a thorough risk assessment of the startup covering the following points:-
        - Market Risks: Identify and analyze the market-related risks that could affect the startup's performance
        - Operational Risks: Detail the operational risks associated with the startup's business model and processes.
        - Financial Risks: Evaluate the financial risks, including funding challenges and cash flow issues.
        - Sales Cycle Risks: Analyze the risks related to the startup's sales cycle, including customer acquisition and retention challenges.

        Consider inconsistent metrics, inflated market size, or unusual churn patterns.
    5. ** Generating gaps **: Take a note of the missing or incomplete information in the pitch deck related to the partnerships and strategic analysis or not available on the internet when you searched via 'search' or 'extract' and mention those in the output as well. Categorize them under mandatory and optional information. THIS IS IMPORTANT TO HIGHLIGHT THE GAPS IN THE PITCH DECK. IT SHOULD BE REAL AND PROPERLY GROUNDED BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. DO NOT MAKE UP ANY DATA.
    6. Collect all the website sources being used for the research. DONT MENTION THE PITCH DECK AS A SOURCE. ONLY MENTION THE WEBSITES USED FOR RESEARCH AS SOURCES.
    
    OUTPUT:
        Execute all the tasks and output the final result in JSON format as provided in the format below:-
        {{
            "partnerships_and_alliance": {{
                "strategic_alliances": "...",
                "supplier_relationships": "...",
                "distribution_partners": "..."
            }},
            "four_vector_analysis": {{
                "market_attractiveness": {{
                    "detail": "...",
                    "score": "...",
                    "reasoning": "..."
                }},
                "competitive_position": {{
                    "detail": "...",
                    "score": "...",
                    "reasoning": "..."
                }},
                "strategic_fit": {{
                    "detail": "...",
                    "score": "...",
                    "reasoning": "..."
                }},
                "financial_performance": {{
                    "detail": "...",
                    "score": "...",
                    "reasoning": "..."
                }}
            }},
            "swot_analysis": {{
                "strengths": "...",
                "weaknesses": "...",
                "opportunities": "...",
                "threats": "..."
            }},
            "risk_assessment": {{
                "market_risks": "...",
                "operational_risks": "...",
                "financial_risks": "...",
                "sales_cycle_risks": "..."
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
            "partnerships_and_alliance": {{
                "strategic_alliances": "Partnership with XYZ Corp to enhance distribution channels.",
                "supplier_relationships": "Long-term contracts with key suppliers ensuring quality and reliability.",
                "distribution_partners": "Collaboration with ABC Distributors to reach wider markets."
            }},
            "four_vector_analysis": {{
                "market_attractiveness": {{
                    "detail": "The market shows strong growth potential with increasing demand for innovative solutions.",
                    "score": "85",
                    "reasoning": "Based on market size and growth trends observed."
                }},
                "competitive_position": {{
                    "detail": "The startup has a unique value proposition but faces stiff competition from established players.",
                    "score": "70",
                    "reasoning": "SWOT analysis indicates strengths in innovation but weaknesses in market presence."
                }},
                "strategic_fit": {{
                    "detail": "The startup's strategy aligns well with current market trends and customer needs.",
                    "score": "90",
                    "reasoning": "Strong alignment observed through market research and customer feedback."
                }},
                "financial_performance": {{
                    "detail": "The startup has shown consistent revenue growth but is yet to achieve profitability.",
                    "score": "75",
                    "reasoning": "Financial analysis indicates positive trends but highlights funding challenges."
                }}
            }},
            "swot_analysis": {{
                "strengths": "Innovative technology, skilled team, strong partnerships.",
                "weaknesses": "Limited market presence, high operational costs.",
                "opportunities": "Expanding market, potential for new product lines.",
                "threats": "Intense competition, regulatory challenges."
            }},
            "risk_assessment": {{
                "market_risks": "Market volatility and changing customer preferences.",
                "operational_risks": "Supply chain disruptions and scalability challenges.",
                "financial_risks": "Funding uncertainties and cash flow management.",
                "sales_cycle_risks": "Long sales cycles and customer acquisition challenges."
            }},
            "sources": [
                "https://www.example1.com",
                "https://www.example2.com"
            ],
            "gaps": {{
                "mandatory_information": ["Details of key partnerships", "Comprehensive financial data"],
                "optional_information": ["Customer testimonials", "Advisory board details"]
            }}
        }}


    CRITICAL:
    - ENSURE THAT ALL THE INFORMATION PROVIDED IN THE OUTPUT IS REAL AND PROPERLY GROUNDED BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. DO NOT MAKE UP ANY DATA.
    - EXAMPLE OUTPUT SHOWS SHORT TEXTS AND IS ONLY FOR YOUR REFERENCE. IN REAL OUTPUT, PROVIDE DETAILED INSIGHTS AND ANALYSIS UNDER EACH KEY AS PER THE TASKS MENTIONED ABOVE.
    
    YOU MUST RETURN THE JSON OUTPUT AS SPECIFIED ABOVE AND NOTHING ELSE.

    """,
    output_key="partnerships_and_strategic_analysis_sub_agent_result",
    after_agent_callback=post_agent_execution,
    generate_content_config=types.GenerateContentConfig(temperature=0),
    tools=[search, extract]
)
