import vertexai
import json
from google import auth
from google.cloud import storage, firestore
from fastapi import HTTPException
from config import Config
from app import app
from pydantic import BaseModel, Field

client = vertexai.Client(  # For service interactions via client.agent_engines
    project=Config.GOOGLE_CLOUD_PROJECT,
    location=Config.RAG_CORPUS_REGION,
)

class InvestmentDealNoteAgentRequest(BaseModel):
    company_doc_id: str = Field(..., description="Firestore document ID of the company")

remote_app = client.agent_engines.get(name=Config.INVESTMENT_DEAL_NOTE_AGENT_ENGINE_RESOURCE_NAME)


@app.post("/fetch_investment_deal_note")
async def fetch_investment_deal_note(req: InvestmentDealNoteAgentRequest = ...,):
    """
    Endpoint to trigger the weightage adjustment recommendation agent for a given company.

    Args:
        company_doc_id (str): The Firestore document ID of the company.

    Returns:
        dict: A dictionary containing the response from the investment deal note agent.
    """
    try:
        company_doc_id = req.company_doc_id
        ## First check if the deal note already exists in cloud storage
        credentials, project_id = auth.default(
            scopes=["https://www.googleapis.com/auth/cloud-platform"])
        storage_client = storage.Client(
            project=project_id, credentials=credentials) if credentials else storage.Client(project=project_id)
        firestore_client = firestore.Client(project=Config.GOOGLE_CLOUD_PROJECT, database=Config.FIRESTORE_DATABASE, credentials=credentials) if credentials else firestore.Client(
            project=Config.GOOGLE_CLOUD_PROJECT, database=Config.FIRESTORE_DATABASE)

        collection_ref = firestore_client.collection(Config.FIRESTORE_COMPANY_COLLECTION)
        doc_ref = collection_ref.document(company_doc_id).get().to_dict()
        if not doc_ref:
            raise HTTPException(status_code=404, detail="Company document not found in Firestore.")
        company_name = doc_ref.get("company_name")
        if not company_name:
            raise HTTPException(status_code=400, detail="Company name not found in the document.")
        bucket = storage_client.bucket(Config.GCS_BUCKET_NAME)
        blob = bucket.blob(f"{Config.GCP_PITCH_DECK_OUTPUT_FOLDER}/{company_doc_id}/deal_notes/{company_name}_investment_deal_note.md")
        if blob.exists():
            deal_note_content = blob.download_as_text()
            return {"deal_note": deal_note_content}

        remote_session = await remote_app.async_create_session(user_id=company_doc_id, state={
            "company_doc_id": company_doc_id,
            "company_name": company_name,
        })

        message = f'Please generate the detailed investment deal note for the company:- "{company_name}"'

        events = []
        async for event in remote_app.async_stream_query(
            user_id=company_doc_id,
            session_id=remote_session["id"],
            message=message,
        ):
            events.append(event)

        final_text_responses = [
            e for e in events
            if e.get("content", {}).get("parts", [{}])[0].get("text")
            and not e.get("content", {}).get("parts", [{}])[0].get("function_call")
        ]
        if final_text_responses:
            return {"deal_note": final_text_responses[0]["content"]["parts"][0]["text"]}
        await remote_app.async_delete_session(user_id=company_doc_id, session_id=remote_session["id"])
        return {"message": "No response from weightage adjustment recommendation agent."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
