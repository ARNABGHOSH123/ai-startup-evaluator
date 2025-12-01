import vertexai
from vertexai import agent_engines
from agent import root_agent
from config import Config

# TODO: Fill in these values for your project
PROJECT_ID = Config.GCP_CLOUD_PROJECT
LOCATION = Config.GCP_CLOUD_REGION  # For other options, see https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview#supported-regions
STAGING_BUCKET = Config.DEPLOYMENT_STAGING_BUCKET

# Initialize the Vertex AI SDK
vertexai.init(
    project=PROJECT_ID,
    location=LOCATION,
    staging_bucket=f"gs://{STAGING_BUCKET}",
)

app = agent_engines.AdkApp(
    agent=root_agent,
    enable_tracing=True,
)

remote_app = agent_engines.create(
    agent_engine=app,
    requirements=[
        "google-cloud-aiplatform[adk,agent_engines]",
        "google-adk",
        "google-cloud-storage",
        "google-cloud-firestore",
        "google-cloud-secret-manager",
        "google-genai",
        "python-dotenv",
        "google-auth",
        "requests",
        "beautifulsoup4",
        "tavily-python",
        "aiohttp",
        "fastapi",
        "PyMuPDF",
        "uvicorn[standard]"
    ],
    extra_packages=["assets", "tools", "llm_model_config", "agent", "utils", "config"],
    display_name="weightage-adjust-gen-ai-recom-agent",
    description="An agent that accepts investor weightage adjustments and generates updated startup recommendations based on Gen AI analysis.",
    env_vars={
        "GCS_BUCKET_NAME": Config.GCS_BUCKET_NAME,
        "GCP_CLOUD_PROJECT": Config.GCP_CLOUD_PROJECT,
        "GCP_CLOUD_REGION": Config.GCP_CLOUD_REGION,
        "AGENT_MODEL": Config.AGENT_MODEL,
        "GCP_PITCH_DECK_OUTPUT_FOLDER": Config.GCP_PITCH_DECK_OUTPUT_FOLDER,
        "GOOGLE_GENAI_USE_VERTEXAI": Config.GOOGLE_GENAI_USE_VERTEXAI,
        "TAVILY_API_KEY": Config.TAVILY_API_KEY,
        "SUB_AGENTS_RAG_CORPUS_PREFIX": Config.SUB_AGENTS_RAG_CORPUS_PREFIX,
        "COMPANY_COLLECTION_NAME": Config.COMPANY_COLLECTION_NAME,
        "FIRESTORE_DATABASE": Config.FIRESTORE_DATABASE,
        "DEPLOYMENT_STAGING_BUCKET": Config.DEPLOYMENT_STAGING_BUCKET,
    },
)

# remote_app = agent_engines.get("<RESOURCE_NAME>")  # Replace <RESOURCE_NAME> with your deployed agent resource name

# remote_app.update(env_vars={
#     "GCS_BUCKET_NAME": Config.GCS_BUCKET_NAME,
#     "GCP_CLOUD_PROJECT": Config.GCP_CLOUD_PROJECT,
#     "GCP_CLOUD_REGION": Config.GCP_CLOUD_REGION,
#     "AGENT_MODEL": Config.AGENT_MODEL,
#     "GCP_PITCH_DECK_OUTPUT_FOLDER": Config.GCP_PITCH_DECK_OUTPUT_FOLDER,
#     # "GOOGLE_API_KEY": Config.GOOGLE_API_KEY,
#     "GOOGLE_GENAI_USE_VERTEXAI": "True",
#     "some_other_key": "some_other_value",
#     "TAVILY_API_KEY": Config.TAVILY_API_KEY,
#     "SUB_AGENTS_RAG_CORPUS_PREFIX": Config.SUB_AGENTS_RAG_CORPUS_PREFIX,
#     "COMPANY_COLLECTION_NAME": Config.COMPANY_COLLECTION_NAME,
#     "FIRESTORE_DATABASE": Config.FIRESTORE_DATABASE,
#     "DEPLOYMENT_STAGING_BUCKET": Config.DEPLOYMENT_STAGING_BUCKET,
# })

# print(f"Deployment finished!")
# print(f"Resource Name: {remote_app.resource_name}")
