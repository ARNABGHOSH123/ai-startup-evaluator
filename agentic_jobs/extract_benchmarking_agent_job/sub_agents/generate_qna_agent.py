import json
from google.adk.agents import LlmAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.agents.readonly_context import ReadonlyContext
from google.genai import types
from config import Config
from llm_model_config import report_generation_model
from utils import read_benchmark_framework_text, save_file_content_to_gcs

GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GCP_PITCH_DECK_OUTPUT_FOLDER = Config.GCP_PITCH_DECK_OUTPUT_FOLDER

benchmarking_framework_text = read_benchmark_framework_text()


async def post_agent_execution(callback_context: CallbackContext) -> None:
    current_state = callback_context.state.to_dict()
    generated_questions_result = json.loads(current_state.get(
        "generated_questions").removeprefix("```json").removesuffix("```").strip())
    questions = generated_questions_result.get(
        "questions") if generated_questions_result else None
    company_doc_id = current_state.get("firestore_doc_id")
    if not questions or not company_doc_id:
        return None
    gcs_uri = await save_file_content_to_gcs(bucket_name=GCS_BUCKET_NAME, file_content=json.dumps(generated_questions_result),
                                             folder_name=f"{GCP_PITCH_DECK_OUTPUT_FOLDER}/{company_doc_id}/questions",
                                             file_extension="json",
                                             file_name="generated_questions"
                                             )
    print(f"Generated QnA Agent result saved to GCS URI: {gcs_uri}")
    return None


def generate_dynamic_instruction(ctx: ReadonlyContext) -> str:
    pitch_deck = ctx.session.state.get("pitch_deck", "{}")
    gaps = {
        "business_model_sub_agent_gaps": json.loads(ctx.session.state.get("business_model_sub_agent_result", {}).removeprefix("```json").removesuffix("```").strip()).get("gaps", {}),
        "funding_and_financials_sub_agent_gaps": json.loads(ctx.session.state.get("funding_and_financials_sub_agent_result", {}).removeprefix("```json").removesuffix("```").strip()).get("gaps", {}),
        "industry_trends_sub_agent_gaps": json.loads(ctx.session.state.get("industry_trends_sub_agent_result", {}).removeprefix("```json").removesuffix("```").strip()).get("gaps", {}),
        "overview_sub_agent_gaps": json.loads(ctx.session.state.get("overview_sub_agent_result", {}).removeprefix("```json").removesuffix("```").strip()).get("gaps", {}),
        "partnerships_and_strategic_analysis_sub_agent_gaps": json.loads(ctx.session.state.get("partnerships_and_strategic_analysis_sub_agent_result", {}).removeprefix("```json").removesuffix("```").strip()).get("gaps", {}),
        "team_profiling_sub_agent_gaps": json.loads(ctx.session.state.get("team_profiling_sub_agent_result", {}).removeprefix("```json").removesuffix("```").strip()).get("gaps", {}),
        "traction_sub_agent_gaps": json.loads(ctx.session.state.get("traction_sub_agent_result", {}).removeprefix("```json").removesuffix("```").strip()).get("gaps", {}),
    }

    return f"""

    You are an expert data collection agent. Your task is to generate a list of questions to be asked to the startup founder for further clarification based on the gaps provided by the sub agents based on the benchmarking framework text.
    
    INPUT:
        - Pitch deck JSON:
            {pitch_deck}
        - Gaps:
            {str(gaps)}
        - Benchmarking framework text (to be used for generating questions) as follows:
            {benchmarking_framework_text}

    CRITICAL INSTRUCTIONS:
    - You MUST follow the workflow steps in order, for each focus point.
    - Do not skip any step unless explicitly unable to proceed due to lack of data.

    WORKFLOW (MUST BE IMPLEMENTED SERIALLY IN ORDER):
    1. **Understand the Input Documents:** You will receive the pitch deck JSON, gaps from sub agents, and the benchmarking framework text. Familiarize yourself with the key points, data, and any ambiguities present in these documents.
    2. **Generate Questions:** Based on your understanding of the pitch deck, gaps from sub agents, and the benchmarking framework text, generate a comprehensive list of questions that would help clarify any uncertainties or gather additional information from the startup founder. Ensure that the questions are relevant, clear, and concise.
    3. ** Remove Duplicate Questions:** Go through the question list generated in step 2 and ensure that there are no duplicate questions in the final list. Each question should be unique and address a specific gap or area of uncertainty.
    4. **Question generation guideline:** Questions should be in such a way that an AI voice assisant will ask these questions to the startup founder during a live interaction. The questions should be open-ended to encourage detailed responses. Avoid yes/no questions unless absolutely necessary. Prioritize questions that address critical aspects of the startup's business model, market strategy, financials, and growth plans.
    
    OUTPUT FORMAT FOR QUESTIONS:
    {{
        "questions": [
            "Question 1",
            "Question 2",
            ...
        ]
    }}

    EXAMPLE OUTPUT:
    {{
        "questions": [
            "Can you provide more details about your customer acquisition strategy and the channels you are using to reach your target market?",
            "What are the key milestones you have achieved so far in terms of product development and market traction?",
            "Could you elaborate on your revenue model and how you plan to scale it in the next 12 months?"
        ]
    }}

    CRITICAL:
    - ENSURE THAT ALL THE INFORMATION PROVIDED IN THE OUTPUT IS REAL AND PROPERLY GROUNDED BASED ON THE DATA FETCHED FROM THE TOOLS AND THE PITCH DECK. DO NOT MAKE UP ANY DATA.
    - EXAMPLE OUTPUT SHOWS SHORT TEXTS AND IS ONLY FOR YOUR REFERENCE. IN REAL OUTPUT, PROVIDE DETAILED INSIGHTS AND ANALYSIS UNDER EACH KEY AS PER THE TASKS MENTIONED ABOVE.

    RETURN ONLY THE JSON OUTPUT AS SPECIFIED ABOVE AND NOTHING ELSE.
    """


generate_qna_agent = LlmAgent(
    name=f"generate_qna_agent",
    model=report_generation_model,
    description=f"An agent that understands the gaps in the sub agents and creates a list of questions to be asked to the startup founder for further clarification.",
    instruction=generate_dynamic_instruction,
    generate_content_config=types.GenerateContentConfig(temperature=0),
    output_key="generated_questions",
    after_agent_callback=post_agent_execution,
)
