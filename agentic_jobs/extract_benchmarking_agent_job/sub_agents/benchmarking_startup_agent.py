from .industry_trends_sub_agent import industry_trends_sub_agent
from .funding_and_financials_sub_agent import funding_and_financials_sub_agent
from .traction_sub_agent import traction_sub_agent
from .team_profiling_sub_agent import team_profiling_sub_agent
from .overview_sub_agent import overview_sub_agent
from .competitor_analysis_sub_agent import competitor_analysis_sub_agent
from .partnerships_strategic_analysis_sub_agent import partnerships_and_strategic_analysis_sub_agent
from .business_model_sub_agent import business_model_sub_agent
from google.adk.agents import ParallelAgent
from config import Config

GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GCP_PITCH_DECK_OUTPUT_FOLDER = Config.GCP_PITCH_DECK_OUTPUT_FOLDER


benchmarking_startup_agent = ParallelAgent(
    name="benchmarking_startup_agent",
    sub_agents=[business_model_sub_agent,
                competitor_analysis_sub_agent,
                funding_and_financials_sub_agent,
                industry_trends_sub_agent,
                overview_sub_agent,
                partnerships_and_strategic_analysis_sub_agent,
                team_profiling_sub_agent,
                traction_sub_agent],
    description="An agent that benchmarks a startup against its competitors using a processed pitch deck JSON file and web search. Saves the human readable markdown response to Google Cloud Storage.",
)
