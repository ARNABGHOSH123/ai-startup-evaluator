from google.adk.agents import SequentialAgent, LoopAgent
from google.adk.agents.callback_context import CallbackContext
from sub_agents import critic_sub_agent, gen_initial_note_sub_agent, refiner_sub_agent
from utils import save_file_content_to_gcs
from config import Config

GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GCP_PITCH_DECK_OUTPUT_FOLDER = Config.GCP_PITCH_DECK_OUTPUT_FOLDER

async def post_agent_execution(callback_context: CallbackContext) -> None:
    current_state = callback_context.state.to_dict()
    company_doc_id = current_state.get("company_doc_id")
    company_name = current_state.get("company_name")
    markdown = current_state.get("current_document")
    if not markdown:
        return None
    gcs_uri = await save_file_content_to_gcs(bucket_name=GCS_BUCKET_NAME, file_content=markdown,
                                             folder_name=f"{GCP_PITCH_DECK_OUTPUT_FOLDER}/{company_doc_id}/deal_notes",
                                             file_extension="md",
                                             file_name=f"{company_name}_investment_deal_note"
                                             )
    print(f"Generated QnA Agent result saved to GCS URI: {gcs_uri}")
    return None

refinement_loop_agent = LoopAgent(
    name="refinement_loop_agent",
    # Agent order is crucial: Critique first, then Refine/Exit
    sub_agents=[
        critic_sub_agent,
        refiner_sub_agent,
    ],
    max_iterations=2, # Limit loops,
    after_agent_callback=post_agent_execution
)

root_agent = SequentialAgent(
    name="root_investment_deal_note_gen_agent",
    sub_agents=[
        gen_initial_note_sub_agent, # Run first to create initial doc
        refinement_loop_agent       # Then run the critique/refine loop
    ],
    description="The main coordinator root agent that manages the workflow for generating and refining investment deal notes for startups based on benchmarking frameworks.",
)