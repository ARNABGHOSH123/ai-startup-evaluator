import json
import base64
import uuid
from google.cloud import storage, firestore
from fastapi import HTTPException, Request, BackgroundTasks, Path
from datetime import timedelta
from config import Config
from app import app
from extract_benchmark_agent.run_agent import _run_agent_for_file as run_extract_benchmark_agent
from pydantic import BaseModel
from utils import read_text_from_gcs

GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GCP_PROJECT_ID = Config.GCP_PROJECT_ID
GCP_PITCH_DECK_INPUT_FOLDER = Config.GCP_PITCH_DECK_INPUT_FOLDER
APP_NAME = Config.APP_NAME
FIRESTORE_DATABASE = Config.FIRESTORE_DATABASE

firestore_client = firestore.Client(project=GCP_PROJECT_ID, database=FIRESTORE_DATABASE)

storage_client = storage.Client(project=GCP_PROJECT_ID)

class SignedUrlRequest(BaseModel):
    object_name: str
    expiration_seconds: int = 3600

class AddCompanyRequest(BaseModel):
    company_name: str
    founder_name: str
    # company_pitch_deck_gcs_uri: str
    # is_deck_extracted_and_benchmarked: bool


@app.get("/hello")
async def root():
    return {"message": "Hello World"}


@app.post("/generate_v4_signed_url")
async def generate_v4_resumable_signed_url(req: SignedUrlRequest):
    """
    Returns a V4 signed URL that the client will POST to with header
    'x-goog-resumable:start' to obtain the resumable session URL.
    """
    object_name = req.object_name
    expiration_seconds = req.expiration_seconds

    # optional: validate object_name, e.g. ensure no "../", correct prefix, extension is ".pdf", etc.
    if not object_name or ".." in object_name:
        raise HTTPException(status_code=400, detail="Invalid object_name")

    try:
        
        bucket = storage_client.bucket(GCS_BUCKET_NAME)
        blob = bucket.blob(f"{GCP_PITCH_DECK_INPUT_FOLDER}/{object_name}")

        # include x-goog-resumable header in SignedURL options, so client can send that header
        url = blob.generate_signed_url(
            version="v4",
            method="POST",  # for initiating the resumable session
            expiration=timedelta(seconds=expiration_seconds),
            # force the client to include this header when sending the POST
            headers={"x-goog-resumable": "start"},
        )

        return {"signedUrl": url}
    except Exception as e:
        # Log error
        raise HTTPException(
            status_code=500, detail=f"Could not generate signed URL: {str(e)}")

@app.post("/add_to_companies_list")
async def add_to_companies_list(req: AddCompanyRequest):
    company_name = req.company_name.strip()
    founder_name = req.founder_name.strip()

    if not company_name:
        raise HTTPException(status_code=400, detail="company_name cannot be empty")
    if not founder_name:
        raise HTTPException(status_code=400, detail="founder_name cannot be empty")

    # normalise for file/path use (you may want to keep a human-readable company_name field separately)
    normalized_name = company_name.lower().replace(" ", "_")

    doc_data = {
        "company_name": normalized_name,
        "founder_name": founder_name,
        "company_pitch_deck_gcs_uri": f"gs://{GCS_BUCKET_NAME}/{GCP_PITCH_DECK_INPUT_FOLDER}/{normalized_name}_pitch_deck.pdf",
        "is_deck_extracted_and_benchmarked": False,
        "extract_benchmark_gcs_uri": "",
        # write firestore server timestamp sentinel into Firestore
        "created_at": firestore.SERVER_TIMESTAMP,
    }

    collection_ref = firestore_client.collection("companies_applied")

    # look for existing by company_name
    query = collection_ref.where("company_name", "==", normalized_name).limit(1).stream()
    existing_docs = [d for d in query]

    try:
        if existing_docs:
            doc_ref = existing_docs[0].reference
            # merge=True will set/overwrite the fields we provided
            doc_ref.set(doc_data, merge=True)
            status = "updated"
        else:
            doc_ref = collection_ref.document()  # auto-id
            doc_ref.set(doc_data)
            status = "created"

        # read the document back so created_at is an actual datetime (not the sentinel)
        snapshot = doc_ref.get()
        if not snapshot.exists:
            raise HTTPException(status_code=500, detail="Document write succeeded but read-back failed.")

        result = snapshot.to_dict() or {}

        # convert created_at (Firestore Timestamp) to ISO string for JSON
        created_at = result.get("created_at")
        if created_at is not None and hasattr(created_at, "isoformat"):
            result["created_at"] = created_at.isoformat()

        return {"status": status, "doc_id": doc_ref.id, "doc": result}

    except HTTPException:
        raise
    except Exception as exc:
        # keep errors explicit for debugging
        raise HTTPException(status_code=500, detail=f"Failed to add/update company: {exc}")

@app.post("/get_companies_list")
async def get_companies_list():
    try:
        collection_ref = firestore_client.collection("companies_applied")

        # Base query: order by created_at descending so newest appear first
        query = collection_ref.order_by("created_at", direction=firestore.Query.DESCENDING)

        docs = list(query.stream())

        companies = []
        for doc in docs:
            data = doc.to_dict() or {}
            created_at = data.get("created_at")
            # Convert Firestore timestamp to ISO string if possible
            if created_at is not None and hasattr(created_at, "isoformat"):
                data["created_at"] = created_at.isoformat()
            companies.append({"doc_id": doc.id, **data})

        return {"companies": companies}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch companies: {e}")
    

@app.post("/get_company_details/{company_name}")
async def get_company_details(company_name: str = Path(..., description="Company name to look up (exact match, case-sensitive)")):
    """
    Find company documents in `companies_applied` where company_name == {company_name}.
    Returns a list of matching documents (could be 0, 1, or more).
    Note: Firestore text queries are case-sensitive and exact by default.
    """
    if not company_name or not company_name.strip():
        raise HTTPException(status_code=400, detail="company_name cannot be empty")

    try:
        collection_ref = firestore_client.collection("companies_applied")
        query = collection_ref.where("company_name", "==", company_name)
        docs = list(query.stream())

        if not docs:
            raise HTTPException(status_code=404, detail=f"No company found with company_name='{company_name}'")

        results = []
        for doc in docs:
            data = doc.to_dict() or {}
            created_at = data.get("created_at")
            if created_at is not None and hasattr(created_at, "isoformat"):
                data["created_at"] = created_at.isoformat()
            
            data["extract_benchmark_agent_response"] = None
            # only try to fetch the GCS content if the flag is True and the URI exists
            try:
                gcs_uri = "gs://pitching_decks/processed/sia_analytics_pitch_deck_analysis_investment_memo.md"
                content = read_text_from_gcs(storage_client=storage_client, gs_uri=gcs_uri)
                # if content is None, you could populate an error string instead, e.g. "failed to load"
                data["extract_benchmark_agent_response"] = content


                # if bool(data.get("is_deck_extracted_and_benchmarked")) is True and data.get("extract_benchmark_gcs_uri"):
                #     gcs_uri = data["extract_benchmark_gcs_uri"]
                #     content = read_text_from_gcs(storage_client=storage_client, gs_uri=gcs_uri)
                #     # if content is None, you could populate an error string instead, e.g. "failed to load"
                #     data["extract_benchmark_agent_response"] = content
            except Exception:
                # keep it robust: don't crash the whole loop if one download fails
                data["extract_benchmark_agent_response"] = None
            results.append({"doc_id": doc.id, **data})

        return {"status": "ok", "count": len(results), "companies": results}

    except HTTPException:
        # re-raise HTTP errors we intentionally raised
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch company details: {exc}")


@app.post("/pubsub/pitchdeck-event")
async def pubsub_push(request: Request, background_tasks: BackgroundTasks):
    envelope = await request.json()
    message = envelope.get("message", {})
    # Pub/Sub encodes message.data as base64
    data_b64 = message.get("data") or ""
    try:
        data_json = json.loads(base64.b64decode(data_b64).decode("utf-8"))
    except Exception:
        return {"status": "bad_data", "error": "invalid base64 payload"}

    name = data_json.get("name")
    if not name:
        return {"status": "ignored", "reason": "no name"}

    # only handle uploads/ folder
    if not name.startswith("uploads/"):
        return {"status": "ignored", "reason": "not in uploads/"}

    # sanitize / convert to safe id; avoid spaces and extremely long ids
    safe_basename = name.replace("/", "_")  # simple
    # Better: use a UUID session id for uniqueness
    job_session_id = f"job_{safe_basename}_{uuid.uuid4().hex}"

    # choose a user id (can be system or owner id). Keep consistent if you want to track
    user_id = "system_job_runner"

    # schedule the long-running agent run in background (non-blocking HTTP response)
    background_tasks.add_task(
        run_extract_benchmark_agent, name[8:], user_id, job_session_id, firestore_client)

    # Immediately ack the Pub/Sub push with success
    return {"status": "ok", "session_id": job_session_id}
