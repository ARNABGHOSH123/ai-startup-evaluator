from google.cloud import storage, firestore
from google import auth
import json
from fastapi import HTTPException, Path as FastAPIPath
from config import Config
from app import app
from utils import read_text_from_gcs
from google.cloud import firestore

GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GCP_PITCH_DECK_OUTPUT_FOLDER = Config.GCP_PITCH_DECK_OUTPUT_FOLDER
GOOGLE_CLOUD_PROJECT = Config.GOOGLE_CLOUD_PROJECT
GCP_PITCH_DECK_INPUT_FOLDER = Config.GCP_PITCH_DECK_INPUT_FOLDER
FIRESTORE_DATABASE = Config.FIRESTORE_DATABASE
FIRESTORE_COMPANY_COLLECTION = Config.FIRESTORE_COMPANY_COLLECTION
FIRESTORE_FOUNDER_COLLECTION = Config.FIRESTORE_FOUNDER_COLLECTION
FIRESTORE_INVESTOR_COLLECTION = Config.FIRESTORE_INVESTOR_COLLECTION


@app.post("/sub_agents/{company_doc_id}/{sub_agent_name}")
def get_sub_agent_result(
    company_doc_id: str = FastAPIPath(
        ..., description="The Firestore document ID of the company"),
    sub_agent_name: str = FastAPIPath(
        ..., description="The name of the sub-agent whose result is to be fetched")
):
    """
    Endpoint to retrieve the GCS URI of a specific sub-agent's result for a given company.

    Args:
        company_doc_id (str): The Firestore document ID of the company.
        sub_agent_name (str): The name of the sub-agent whose result is to be fetched.

    Returns:
        dict: A dictionary containing the GCS URI of the sub-agent's result.
    """
    try:
        credentials, project_id = auth.default(
            scopes=["https://www.googleapis.com/auth/cloud-platform"])
        storage_client = storage.Client(
            project=project_id, credentials=credentials) if credentials else storage.Client(project=project_id)
        firestore_client = firestore.Client(project=GOOGLE_CLOUD_PROJECT, database=FIRESTORE_DATABASE, credentials=credentials) if credentials else firestore.Client(
            project=GOOGLE_CLOUD_PROJECT, database=FIRESTORE_DATABASE)
        collection_ref = firestore_client.collection(
            FIRESTORE_COMPANY_COLLECTION)
        company_ref = collection_ref.document(company_doc_id)
        company_doc = company_ref.get()

        if not company_doc.exists:
            raise HTTPException(
                status_code=404, detail="Company document not found")

        company_data = company_doc.to_dict()
        sub_agent_field_map = {
            "business_model": "business_model_sub_agent_gcs_uri",
            "competitor_analysis": "competitor_analysis_sub_agent_gcs_uri",
            "team_profiling": "team_profiling_sub_agent_gcs_uri",
            "funding_and_financials": "funding_and_financials_sub_agent_gcs_uri",
            "industry_trends": "industry_trends_sub_agent_gcs_uri",
            "overview": "overview_sub_agent_gcs_uri",
            "traction": "traction_sub_agent_gcs_uri",
            "partnerships_and_strategic_analysis": "partnerships_and_strategic_analysis_sub_agent_gcs_uri",
            "investment_recommendation": "investment_recommendation_sub_agent_gcs_uri",
            "extraction_pitch_deck": "extraction_pitch_deck_sub_agent_gcs_uri",
            "investment_deal_note": "investment_deal_note_sub_agent_gcs_uri",
        }

        if sub_agent_name not in sub_agent_field_map:
            raise HTTPException(
                status_code=400, detail="Invalid sub-agent name")

        gcs_uri_field = sub_agent_field_map[sub_agent_name]
        sub_agents_dict = company_data.get("sub_agents_results", {})
        gcs_uri = sub_agents_dict.get(gcs_uri_field)

        if not gcs_uri and gcs_uri != "":
            raise HTTPException(
                status_code=404, detail=f"{sub_agent_name} result not found for this company")
        if gcs_uri == "":
            return {f"{sub_agent_name}": None}
        text_content = read_text_from_gcs(
                storage_client=storage_client, gcs_uri=gcs_uri)
        return {f"{sub_agent_name}": json.loads(text_content) if text_content else None}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
