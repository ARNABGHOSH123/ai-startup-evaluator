import json
from google.adk.agents.callback_context import CallbackContext
from google.adk.agents import LlmAgent
from google.adk.planners import BuiltInPlanner
from google.genai import types
from config import Config
from llm_model_config import report_generation_model
from utils import update_sub_agent_result_to_firestore, save_file_content_to_gcs

GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GCP_PITCH_DECK_OUTPUT_FOLDER = Config.GCP_PITCH_DECK_OUTPUT_FOLDER
FIRESTORE_COMPANY_COLLECTION = Config.FIRESTORE_COMPANY_COLLECTION


async def post_agent_execution(callback_context: CallbackContext) -> None:
    current_state = callback_context.state.to_dict()
    corpus_name = current_state.get("rag_corpus_name")
    investment_recommendation_result = json.loads(current_state.get(
        "investment_recommendation_sub_agent_result").removeprefix("```json").removesuffix("```").strip())
    investment_recommendation_summary = investment_recommendation_result.get(
        "investment_recommendation_summary") if investment_recommendation_result else None
    confidence_score = investment_recommendation_result.get(
        "confidence_score") if investment_recommendation_result else None
    firestore_doc_id = current_state.get("firestore_doc_id")
    if not investment_recommendation_summary or confidence_score is None or not firestore_doc_id:
        return None
    gcs_uri = await save_file_content_to_gcs(bucket_name=GCS_BUCKET_NAME, file_content=json.dumps(investment_recommendation_result),
                                       folder_name=f"{GCP_PITCH_DECK_OUTPUT_FOLDER}/{firestore_doc_id}/investment_recommendation",
                                       file_extension="json",
                                       file_name="investment_recommendation"
                                       )
    update_sub_agent_result_to_firestore(collection_name=FIRESTORE_COMPANY_COLLECTION, document_id=firestore_doc_id,
                                         sub_agent_field="investment_recommendation_sub_agent_gcs_uri", gcs_uri=gcs_uri)
    print(
        f"Investment Recommendation Sub Agent result saved to GCS URI: {gcs_uri}")
    return None


investment_recommendation_sub_agent = LlmAgent(
    name="investment_recommendation_sub_agent",
    model=report_generation_model,
    planner=BuiltInPlanner(
        thinking_config=types.ThinkingConfig(include_thoughts=False)),
    description="An agent that synthesizes information from various sub-agents to generate a comprehensive investment recommendation summary for startup companies.",
    instruction=f"""
    You are an expert financial analyst and investment advisor specializing in startup investments.

    INPUT:
        - JSON response from all the sub agents under their respective key names.
          Keys are: 'business_model_sub_agent_result', 'competitor_analysis_sub_agent_result',
          'funding_and_financials_sub_agent_result', 'industry_trends_sub_agent_result',
          'overview_sub_agent_result', 'partnerships_and_strategic_analysis_sub_agent_result',
          'team_profiling_sub_agent_result', 'traction_sub_agent_result'

    (Every item is an object with "fact", "sources", "reference_type".)
    
    Your ONLY task is to synthesize these facts and generate an investment summary for the startup company based on the information provided and generate a confidence score (0-100) for investment recommendation.

    OUTPUT FORMAT:
    {{
        "investment_recommendation_summary": "<DETAILED_INVESTMENT_RECOMMENDATION_SUMMARY_STRING>",
        "confidence_score": "<CONFIDENCE_SCORE_INTEGER>"
    }}

    CRITICAL OUTPUT NOTE:
        - YOU MUST RETURN THE JSON OUTPUT AS SPECIFIED ABOVE AND NOTHING ELSE.
    """,
    output_key="investment_recommendation_sub_agent_result",
    after_agent_callback=post_agent_execution,
    generate_content_config=types.GenerateContentConfig(temperature=0)
)
