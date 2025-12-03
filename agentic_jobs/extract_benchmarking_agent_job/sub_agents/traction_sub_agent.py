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
    print("State after traction sub agent:", current_state)
    company_doc_id = current_state.get("firestore_doc_id")
    corpus_name = current_state.get("rag_corpus_name")
    traction_sub_agent_result = json.loads(current_state.get(
        "traction_sub_agent_result").removeprefix("```json").removesuffix("```").strip())
    if not traction_sub_agent_result or not company_doc_id:
        return None
    gcs_uri = await save_file_content_to_gcs(bucket_name=GCS_BUCKET_NAME,
                                       folder_name=f"processed/{company_doc_id}/sub_agents/{agent_name}",
                                       file_content=json.dumps(
                                           traction_sub_agent_result),
                                       file_extension="json",
                                       file_name=f"{agent_name}_result"
                                       )
    update_sub_agent_result_to_firestore(collection_name=FIRESTORE_COMPANY_COLLECTION, document_id=company_doc_id,
                                         sub_agent_field="traction_sub_agent_gcs_uri", gcs_uri=gcs_uri)
    update_data_to_corpus(corpus_name=corpus_name, document_gcs_paths=[gcs_uri])
    print(f"Traction Sub Agent result saved to GCS URI: {gcs_uri}")

    return None


traction_sub_agent = LlmAgent(
    name="traction_sub_agent",
    model=report_generation_model,
    include_contents='none',
    description="An agent that generates the traction analysis of the startup company",
    instruction=f"""
    You are an expert in researching and generating detailed traction analysis of startup companies based on their pitch decks and official websites.

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
    1. ** Customer Acquisition & Growth Metrics **: Analyze the startup's customer acquisition strategies and growth metrics. Cover the following aspects:-
        •	Customer Acquisition Cost (CAC): Average spend to acquire one customer (e.g. total marketing/sales spend divided by new customers). Lower CAC or an improving trend indicates efficient marketing. Track CAC by channel to optimize spend.
        •	Customer Lifetime Value (LTV or CLV): Revenue a customer generates over their relationship. Compare LTV to CAC in ratios. A higher LTV:CAC ratio indicates better unit economics.
        •	Sign-ups / New Users: Raw counts of new registrations, installs or leads per period. While raw sign-ups are "vanity" alone, growth in this number signals awareness. Compute growth rate of user base (e.g. % MoM increase). Early startups often cite sign-up milestones or waitlist sizes as traction. THIS IS DOMAIN WISE AND MAY NOT BE RELEVANT FOR ALL DOMAINS.
        •	Conversion Rate: Percentage of visitors who take key actions (e.g. trial signup→paid customer, or lead→opportunity). A funnel analysis (visitor→signup→paying customer) reveals bottlenecks. Improving conversion at each step is a key focus.
        •	Growth Velocity: Measure the speed of growth in users/customers/revenue over time (e.g. MoM or QoQ growth rates). High and accelerating growth rates indicate strong traction.
        •	Referral & Virality Indicators: Metrics like Viral Coefficient (how many new users each existing user brings in) and % of users acquired via referrals. High virality indicates organic growth potential.
    2. ** Revenue & Financial Metrics **: Provide a detailed analysis of the startup's revenue and financial health covering the following points:-
        •	Monthly Recurring Revenue (MRR) / Annual Recurring Revenue (ARR): Key for subscription businesses. Track MRR/ARR growth rates and churn impact.
        •	Revenue Growth Rate: Measure how quickly revenue is increasing over time (MoM, QoQ, YoY). High growth rates indicate strong market demand.
        •	Churn Rate: Percentage of customers or revenue lost over a period. Lower churn indicates better retention. Analyze churn by customer segment to identify issues.
        •	Cash Flow & Runway: Evaluate cash burn rate and runway (months until cash runs out). A longer runway provides stability to focus on growth.
    3. ** Product Engagement & Retention Metrics **: Analyze how users are engaging with the product and retention rates. Cover the following aspects:-
        •	Active Users: Daily Active Users (DAU), Monthly Active Users (MAU), and their growth rates. A growing active user base indicates product-market fit.
        •	User Retention Rates: Percentage of users who continue using the product over time (e.g. Day 1, Day 7, Day 30 retention). Higher retention indicates user satisfaction.
        •	Engagement Metrics: Average session duration, frequency of use, and feature adoption rates. Higher engagement signals a valuable product.
    4. ** Market Validation & Adoption Signals **: Provide a comprehensive analysis of the startup's market validation and adoption signals covering the following points:-
        •	Partnerships & Collaborations: Key partnerships that validate market interest.
        •	Pilot Customers & Letters of Intent: Early adopters or LOIs indicating future business.
        •	Waitlists & Pre-orders: Indicate demand before launch.
        •	Customer Testimonials & Case Studies: Evidence of customer satisfaction and success stories.
    5. ** Stage-specific Focus Areas **: Depending on the startup's stage, focus on relevant traction aspects:-
        •	Early-stage Startups (Seed/Pre-seed): Emphasize user acquisition metrics, sign-up growth rates, initial product-market fit signals, early customer interviews and feedback, landing page conversions, social media engagement, prototype testing results, and initial revenue streams or pilot program outcomes.
        •	Growth-stage Startups (Series A/B): Highlight revenue growth metrics, MRR/ARR expansion, customer retention and churn analysis, market penetration rates, competitive positioning, sales team performance, marketing channel effectiveness, and operational efficiency improvements.
        •	Mature Startups (Series C+): Focus on profitability metrics, sustainable cash flow generation, market leadership indicators, long-term customer relationships and enterprise accounts, international expansion metrics, operational scalability, and potential exit preparation indicators.
        •	B2B SaaS Companies: Emphasize enterprise customer acquisition, contract values, sales cycle optimization, feature adoption rates, API usage metrics, and customer success indicators.
        •	Consumer/B2C Companies: Focus on viral growth metrics, user engagement depth, brand awareness indicators, mobile app performance, social media reach, and consumer behavior analytics.
        •	Marketplace Businesses: Analyze supply-demand balance, transaction volume growth, take rates, network effects strength, and both buyer and seller satisfaction metrics.
        •	Hardware/Physical Product Companies: Track manufacturing scale, distribution partnerships, retail placement, inventory turnover, pre-order fulfillment, and supply chain efficiency.
    6. Based on your research, take a note of the missing or incomplete information in the pitch deck related to the traction analysis or not available on the internet when you searched via 'search' or 'extract' and mention those in the output as well. Categorize them under mandatory and optional information. THIS IS IMPORTANT TO HIGHLIGHT THE GAPS IN THE PITCH DECK. IT SHOULD BE REAL AND PROPERLY GROUNDED BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. DO NOT MAKE UP ANY DATA.
    7. Collect all the website sources being used for the research. DONT MENTION THE PITCH DECK AS A SOURCE. ONLY MENTION THE WEBSITES USED FOR RESEARCH AS SOURCES.

    OUTPUT:
        Execute all the tasks and output the final result in JSON format as provided in the format below:-
        {{
            "customer_acquisition_and_growth_metrics": {{
                "customer_acquisition_cost": "...",
                "customer_lifetime_value": "...",
                "sign_ups_new_users": "...",
                "conversion_rate": "...",
                "growth_velocity": "...",
                "referral_and_virality_indicators": "...",
            }},
            "revenue_and_financial_metrics": {{
                "monthly_recurring_revenue_annual_recurring_revenue": "...",
                "revenue_growth_rate": "...",
                "churn_rate": "...",
                "cash_flow_and_runway": "..."
            }},
            "product_engagement_and_retention_metrics": {{
                "active_users": "...",
                "user_retention_rates": "...",
                "engagement_metrics": "..."
            }},
            "market_validation_and_adoption_signals": {{
                "partnerships_and_collaborations": "...",
                "pilot_customers_and_letters_of_intent": "...",
                "waitlists_and_pre_orders": "...",
                "customer_testimonials_and_case_studies": "..."
            }},
            "stage_specific_focus_areas": ["..."],
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
    
    EXAMPLE OUTPUT:-
        {{
            "customer_acquisition_and_growth_metrics": {{
                "customer_acquisition_cost": "$50 per customer",
                "customer_lifetime_value": "$500",
                "sign_ups_new_users": "2000 new users in the last month",
                "conversion_rate": "5%",
                "growth_velocity": "20% MoM growth",
                "referral_and_virality_indicators": "Viral Coefficient of 1.2"
            }},
            "revenue_and_financial_metrics": {{
                "monthly_recurring_revenue_annual_recurring_revenue": "$10,000 MRR",
                "revenue_growth_rate": "15% MoM",
                "churn_rate": "3%",
                "cash_flow_and_runway": "6 months runway"
            }},
            "product_engagement_and_retention_metrics": {{
                "active_users": "5000 MAU",
                "user_retention_rates": "40% Day 30 retention",
                "engagement_metrics": "Average session duration of 10 minutes"
            }},
            "market_validation_and_adoption_signals": {{
                "partnerships_and_collaborations": "Partnership with ABC Corp",
                "pilot_customers_and_letters_of_intent": "5 pilot customers",
                "waitlists_and_pre_orders": "1000 pre-orders",
                "customer_testimonials_and_case_studies": "Positive testimonials from key clients"
            }},
            "stage_specific_focus_areas": ["Early-stage focus: Landing page conversion rate of 12%, 500+ user interviews completed, 3 pilot programs launched with positive feedback", "Growth-stage metrics: 150% YoY revenue growth, expanding into 3 new markets, sales team achieving 120% of quota", "B2B SaaS indicators: Average contract value of $50K, 6-month sales cycle, 95% feature adoption rate among enterprise clients"],
            "sources": [
                "https://www.example1.com",
                "https://www.example2.com"
            ],
            "gaps": {{
                "mandatory_information": [
                    "Detailed CAC breakdown by channel",
                    "Exact churn rate figures"
                ],
                "optional_information": [
                    "User engagement metrics by feature",
                    "Additional customer testimonials"
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
    output_key="traction_sub_agent_result",
    after_agent_callback=post_agent_execution,
    generate_content_config=types.GenerateContentConfig(temperature=0),
    tools=[search, extract]
)
