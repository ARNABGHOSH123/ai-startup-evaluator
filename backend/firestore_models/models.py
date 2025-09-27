from pydantic import BaseModel
from typing import Optional

class CompanyDoc(BaseModel):
    company_name: str
    domain: str
    company_phone_no: str
    company_email: str
    pitch_deck_filename: str
    company_address: str
    stage_of_development: str
    business_details: str
    usp: str
    revenue_model: str
    founder_name: str
    comments: Optional[str] = None
    company_pitch_deck_gcs_uri: Optional[str] = None
    benchmark_agent_job_id: Optional[str] = None
    extract_output_gcs_uri: Optional[str] = None
    benchmark_gcs_uri: Optional[str] = None
    benchmark_agent_job_status: Optional[str] = None
    benchmark_agent_job_name: Optional[str] = None
