from pydantic import BaseModel
from typing import Optional

class FounderDoc(BaseModel):
    founder_name: str
    founder_email: str
    founder_account_pwd: str
    founder_phone_no: str
    founder_address: str
    founder_linkedin: str
    founder_twitter: str
    founder_bio: str
    founder_profile_pic_url: Optional[str] = None
    company_id: str
    comments: Optional[str] = None
    company_doc_id: Optional[str] = None

class InvestorDoc(BaseModel):
    investor_name: str
    investor_email: str
    investor_account_pwd: str
    investor_phone_no: str
    investor_address: str
    investor_linkedin: str
    investor_twitter: str
    investor_bio: str
    investor_profile_pic_url: Optional[str] = None
    comments: Optional[str] = None

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


