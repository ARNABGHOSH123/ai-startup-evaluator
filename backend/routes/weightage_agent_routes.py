import vertexai
import json
from fastapi import HTTPException
from config import Config
from app import app
from pydantic import BaseModel, Field

client = vertexai.Client(  # For service interactions via client.agent_engines
    project=Config.GOOGLE_CLOUD_PROJECT,
    location=Config.RAG_CORPUS_REGION,
)

class WeightageAgentRequest(BaseModel):
    investor_weightage_preferences: dict = Field(..., description="Investor's weightage preferences for different aspects")
    original_recommendation_score: str = Field(..., description="Original recommendation score for the startup")
    company_doc_id: str = Field(..., description="Firestore document ID of the company")

remote_app = client.agent_engines.get(name=Config.WEIGHTAGE_AGENT_ENGINE_RESOURCE_NAME)


@app.post("/fetch_weightage_agent_recommendations")
async def fetch_weightage_agent_recommendations(req: WeightageAgentRequest = ...,):
    """
    Endpoint to trigger the weightage adjustment recommendation agent for a given company.

    Args:
        company_doc_id (str): The Firestore document ID of the company.

    Returns:
        dict: A dictionary containing the response from the weightage adjustment recommendation agent.
    """
    try:
        company_doc_id = req.company_doc_id
        remote_session = await remote_app.async_create_session(user_id=company_doc_id, state=req.model_dump())

        final_response = None
        async for event in remote_app.async_stream_query(
            user_id=company_doc_id,
            session_id=remote_session["id"],
            message="Generate AI recommendations for the startup",
        ):
            event_dict = dict(event)
            if 'actions' in event_dict and 'state_delta' in event_dict['actions']:
                if 'weightage_adjustment_recommendation_response' in event_dict['actions']['state_delta']:
                    final_response = event_dict['actions']['state_delta']['weightage_adjustment_recommendation_response']
        
        if final_response:
            cleaned_response = final_response.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[7:]
            elif cleaned_response.startswith("```"):
                cleaned_response = cleaned_response[3:]
            
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]
                
            try:
                response_json = json.loads(cleaned_response.strip())
                await remote_app.async_delete_session(user_id=company_doc_id, session_id=remote_session["id"])
                return response_json
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to parse agent response: {str(e)}")
        return {"message": "No response from weightage adjustment recommendation agent."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
