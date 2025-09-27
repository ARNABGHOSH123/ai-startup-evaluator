from google.cloud import storage, firestore
from google import auth
import requests
from google.auth.transport.requests import Request
from fastapi import HTTPException, Path
from datetime import timedelta
from pydantic import BaseModel
from config import Config
from app import app
from utils import read_text_from_gcs
from firestore_models import CompanyDoc
from routes.trigger_extract_benchmark_job import trigger_job_with_filename

GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GOOGLE_CLOUD_PROJECT = Config.GOOGLE_CLOUD_PROJECT
GCP_PITCH_DECK_INPUT_FOLDER = Config.GCP_PITCH_DECK_INPUT_FOLDER
FIRESTORE_DATABASE = Config.FIRESTORE_DATABASE
FIRESTORE_COMPANY_COLLECTION = Config.FIRESTORE_COMPANY_COLLECTION


class SignedUrlRequest(BaseModel):
    object_name: str
    expiration_seconds: int = 3600

def get_service_account_email():      
    metadata_server_url = "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email"
    headers = {"Metadata-Flavor":"Google"}
    response = requests.get(metadata_server_url, headers=headers)
    response.raise_for_status()
    return response.text


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
        credentials, project_id  = auth.default()
        credentials.refresh(Request())
        storage_client = storage.Client(project=project_id, credentials=credentials)

        bucket = storage_client.bucket(GCS_BUCKET_NAME)

        blob = bucket.blob(f"{GCP_PITCH_DECK_INPUT_FOLDER}/{object_name}")

        service_account_email = get_service_account_email()

        # include x-goog-resumable header in SignedURL options, so client can send that header
        url = blob.generate_signed_url(
            version="v4",
            method="POST",  # for initiating the resumable session
            expiration=timedelta(seconds=expiration_seconds),
            service_account_email=credentials.service_account_email,
            access_token=credentials.token,
            # force the client to include this header when sending the POST
            headers={"x-goog-resumable": "start"},
        )

        return {"signedUrl": url}
    except Exception as e:
        # Log error
        raise HTTPException(
            status_code=500, detail=f"Could not generate signed URL: {str(e)}")


@app.post("/add_to_companies_list")
async def add_to_companies_list(req: CompanyDoc):
    company_name = req.company_name.strip()
    founder_name = req.founder_name.strip()
    domain = req.domain.strip()
    company_phone_no = req.company_phone_no.strip()
    company_email = req.company_email.strip()
    company_address = req.company_address.strip()
    stage_of_development = req.stage_of_development.strip()
    business_details = req.business_details.strip()
    usp = req.usp.strip()
    revenue_model = req.revenue_model.strip()
    comments = req.comments.strip() if req.comments else None
    pitch_deck_filename = req.pitch_deck_filename.strip(
    ) if req.pitch_deck_filename else None

    if not company_name:
        raise HTTPException(
            status_code=400, detail="company_name cannot be empty")
    if not founder_name:
        raise HTTPException(
            status_code=400, detail="founder_name cannot be empty")
    if not pitch_deck_filename:
        raise HTTPException(
            status_code=400, detail="pitch_deck_filename cannot be empty")

    doc_data = {
        "company_name": company_name,
        "domain": domain,
        "company_phone_no": company_phone_no,
        "company_email": company_email,
        "company_address": company_address,
        "stage_of_development": stage_of_development,
        "business_details": business_details,
        "usp": usp,
        "revenue_model": revenue_model,
        "comments": comments,
        "founder_name": founder_name,
        "company_pitch_deck_gcs_uri": f"gs://{GCS_BUCKET_NAME}/{GCP_PITCH_DECK_INPUT_FOLDER}/{pitch_deck_filename}",
        "benchmark_agent_job_id": "",
        "extract_output_gcs_uri": "",
        "benchmark_gcs_uri": "",
        # write firestore server timestamp sentinel into Firestore
        "created_at": firestore.SERVER_TIMESTAMP,
    }

    try:
        credentials, project_id  = auth.default()
        credentials.refresh(Request())

        firestore_client = firestore.Client(project=GOOGLE_CLOUD_PROJECT, database=FIRESTORE_DATABASE, credentials=credentials)
        collection_ref = firestore_client.collection(
            FIRESTORE_COMPANY_COLLECTION)
        doc_ref = collection_ref.document()
        doc_ref.set(doc_data)
        status = "created"
        # read the document back so created_at is an actual datetime (not the sentinel)
        snapshot = doc_ref.get()
        if not snapshot.exists:
            raise HTTPException(
                status_code=500, detail="Document write succeeded but read-back failed.")

        result = snapshot.to_dict() or {}

        # convert created_at (Firestore Timestamp) to ISO string for JSON
        created_at = result.get("created_at")
        if created_at is not None and hasattr(created_at, "isoformat"):
            result["created_at"] = created_at.isoformat()

        # Trigger the Cloud Run Job to process this pitch deck
        try:
            trigger_job_with_filename(
                filename=pitch_deck_filename, firestore_doc_id=doc_ref.id)
        except Exception as e:
            # keep errors explicit for debugging
            raise HTTPException(
                status_code=500, detail=f"Failed to trigger Cloud Run Job: {e}")

        return {"status": status, "doc_id": doc_ref.id, "doc": result}

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Failed to prepare company data: {exc}")


@app.post("/get_companies_list")
async def get_companies_list():
    try:
        credentials, project_id  = auth.default()
        credentials.refresh(Request())
        firestore_client = firestore.Client(project=GOOGLE_CLOUD_PROJECT, database=FIRESTORE_DATABASE, credentials=credentials)

        collection_ref = firestore_client.collection(
            FIRESTORE_COMPANY_COLLECTION)

        # Base query: order by created_at descending so newest appear first
        query = collection_ref.order_by(
            "created_at", direction=firestore.Query.DESCENDING)

        docs = list(query.stream())

        companies = []
        for doc in docs:
            data = doc.to_dict() or {}
            created_at = data.get("created_at")
            # Convert Firestore timestamp to ISO string if possible
            if created_at is not None and hasattr(created_at, "isoformat"):
                data["created_at"] = created_at.isoformat()
            companies.append({
                "doc_id": doc.id,
                "company_name": data.get("company_name", ""),
                "domain": data.get("domain", ""),
                "company_phone_no": data.get("company_phone_no", ""),
                "company_email": data.get("company_email", ""),
                "company_address": data.get("company_address", ""),
                "stage_of_development": data.get("stage_of_development", ""),
                "business_details": data.get("business_details", ""),
                "usp": data.get("usp", ""),
                "revenue_model": data.get("revenue_model", ""),
                "founder_name": data.get("founder_name", ""),
                "comments": data.get("comments", ""),
            })

        return {"companies": companies}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch companies: {e}")


@app.post("/get_company_details/{company_id}")
async def get_company_details(company_id: str = Path(..., description="Company id")):
    if not company_id or not company_id.strip():
        raise HTTPException(
            status_code=400, detail="company_id cannot be empty")

    try:
        credentials, project_id  = auth.default()
        credentials.refresh(Request())
        storage_client = storage.Client(project=project_id, credentials=credentials)
        firestore_client = firestore.Client(project=GOOGLE_CLOUD_PROJECT, database=FIRESTORE_DATABASE, credentials=credentials)

        collection_ref = firestore_client.collection(
            FIRESTORE_COMPANY_COLLECTION)
        query = collection_ref.document(company_id)
        doc = query.get()
        if not doc.exists:
            raise HTTPException(
                status_code=404, detail=f"No company found with id='{company_id}'")

        data = {"extract_benchmark_agent_response": "", **doc.to_dict()} or {}

        if len(data.get("benchmark_gcs_uri")) > 0:
            gcs_uri = data.get("benchmark_gcs_uri")
            content = read_text_from_gcs(
                storage_client=storage_client, gs_uri=gcs_uri)
            if content is not None:
                data["extract_benchmark_agent_response"] = content

        return {
            "status": "ok",
            "doc_id": doc.id,
            "company_name": data.get("company_name", ""),
            "domain": data.get("domain", ""),
            "company_phone_no": data.get("company_phone_no", ""),
            "company_email": data.get("company_email", ""),
            "company_address": data.get("company_address", ""),
            "stage_of_development": data.get("stage_of_development", ""),
            "business_details": data.get("business_details", ""),
            "usp": data.get("usp", ""),
            "revenue_model": data.get("revenue_model", ""),
            "founder_name": data.get("founder_name", ""),
            "comments": data.get("comments", ""),
            "extract_benchmark_agent_response": data.get("extract_benchmark_agent_response", ""),
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch company details: {exc}")

    #     docs = list(query.stream())

    #     if not docs:
    #         raise HTTPException(
    #             status_code=404, detail=f"No company found with company_name='{company_name}'")

    #     results = []
    #     for doc in docs:
    #         data = doc.to_dict() or {}
    #         created_at = data.get("created_at")
    #         if created_at is not None and hasattr(created_at, "isoformat"):
    #             data["created_at"] = created_at.isoformat()

    #         data["extract_benchmark_agent_response"] = None
    #         # only try to fetch the GCS content if the flag is True and the URI exists
    #         try:
    #             gcs_uri = "gs://pitching_decks/processed/sia_analytics_pitch_deck_analysis_investment_memo.md"
    #             content = read_text_from_gcs(
    #                 storage_client=storage_client, gs_uri=gcs_uri)
    #             # if content is None, you could populate an error string instead, e.g. "failed to load"
    #             data["extract_benchmark_agent_response"] = content

    #             # if bool(data.get("is_deck_extracted_and_benchmarked")) is True and data.get("extract_benchmark_gcs_uri"):
    #             #     gcs_uri = data["extract_benchmark_gcs_uri"]
    #             #     content = read_text_from_gcs(storage_client=storage_client, gs_uri=gcs_uri)
    #             #     # if content is None, you could populate an error string instead, e.g. "failed to load"
    #             #     data["extract_benchmark_agent_response"] = content
    #         except Exception:
    #             # keep it robust: don't crash the whole loop if one download fails
    #             data["extract_benchmark_agent_response"] = None
    #         results.append({"doc_id": doc.id, **data})

    #     return {"status": "ok", "count": len(results), "companies": results}

    # except HTTPException:
    #     # re-raise HTTP errors we intentionally raised
    #     raise
    # except Exception as exc:
    #     raise HTTPException(
    #         status_code=500, detail=f"Failed to fetch company details: {exc}")


# @app.post("/pubsub/pitchdeck-event")
# async def pubsub_push(request: Request, background_tasks: BackgroundTasks):
#     envelope = await request.json()
#     message = envelope.get("message", {})
#     # Pub/Sub encodes message.data as base64
#     data_b64 = message.get("data") or ""
#     try:
#         data_json = json.loads(base64.b64decode(data_b64).decode("utf-8"))
#     except Exception:
#         return {"status": "bad_data", "error": "invalid base64 payload"}

#     name = data_json.get("name")
#     if not name:
#         return {"status": "ignored", "reason": "no name"}

#     # only handle uploads/ folder
#     if not name.startswith("uploads/"):
#         return {"status": "ignored", "reason": "not in uploads/"}

#     # sanitize / convert to safe id; avoid spaces and extremely long ids
#     safe_basename = name.replace("/", "_")  # simple
#     # Better: use a UUID session id for uniqueness
#     job_session_id = f"job_{safe_basename}_{uuid.uuid4().hex}"

#     # choose a user id (can be system or owner id). Keep consistent if you want to track
#     user_id = "system_job_runner"

#     # schedule the long-running agent run in background (non-blocking HTTP response)
#     background_tasks.add_task(
#         run_extract_benchmark_agent, name[8:], user_id, job_session_id, firestore_client)

#     # Immediately ack the Pub/Sub push with success
#     return {"status": "ok", "session_id": job_session_id}
