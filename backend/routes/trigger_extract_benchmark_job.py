import logging
from config import Config
from google.cloud import run_v2
from google.cloud.run_v2.types import RunJobRequest

LOG = logging.getLogger(__name__)

GOOGLE_CLOUD_PROJECT = Config.GOOGLE_CLOUD_PROJECT
GOOGLE_CLOUD_REGION = Config.GOOGLE_CLOUD_REGION
EXTRACT_BENCHMARK_CLOUD_RUN_JOB_NAME = Config.EXTRACT_BENCHMARK_CLOUD_RUN_JOB_NAME

def trigger_job_with_filename(filename: str, firestore_doc_id: str, tasks: int = 1, wait_for_completion: bool = False):
    """
    Triggers the Cloud Run Job with the filename passed as an env var override.
    returns: Operation (google.api_core.operation.Operation) if not waiting,
             or the job execution response if wait_for_completion True.
    """
    if not GOOGLE_CLOUD_PROJECT or not GOOGLE_CLOUD_REGION or not EXTRACT_BENCHMARK_CLOUD_RUN_JOB_NAME:
        raise RuntimeError("PROJECT/LOCATION/JOB_NAME env vars must be set")

    client = run_v2.JobsClient()

    # Fully qualified job name
    job_full_name = f"projects/{GOOGLE_CLOUD_PROJECT}/locations/{GOOGLE_CLOUD_REGION}/jobs/{EXTRACT_BENCHMARK_CLOUD_RUN_JOB_NAME}"

    container_override = {
        "name": EXTRACT_BENCHMARK_CLOUD_RUN_JOB_NAME,  # optional; can be left empty; using job name is fine
        "env": [
            {"name": "INPUT_FILE", "value": filename},
            {"name": "FIRESTORE_DOC_ID", "value": firestore_doc_id}
        ],
    }

    overrides = {"container_overrides": [container_override], "task_count": tasks}

    request = RunJobRequest(name=job_full_name, overrides=overrides)

    # This returns a long-running Operation. You can choose not to block on it.
    operation = client.run_job(request=request)

    if wait_for_completion:
        # Block until finished (may take long). Operation.result() returns response.
        response = operation.result()
        return response

    # Don't wait — return operation metadata (caller can poll or ignore)
    return operation
