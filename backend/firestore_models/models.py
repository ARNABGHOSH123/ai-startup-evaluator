from pydantic import BaseModel
from typing import Optional, List

class FounderDoc(BaseModel):
    founder_name: Optional[str] = None
    founder_email: str
    founder_account_pwd: str
    founder_phone_no: Optional[str] = None
    founder_address: Optional[str] = None
    founder_linkedin: Optional[str] = None
    founder_twitter: Optional[str] = None
    founder_bio: Optional[str] = None
    founder_profile_pic_url: Optional[str] = None
    company_id: Optional[str] = None
    comments: Optional[str] = None
    company_doc_id: Optional[str] = None

class InvestorDoc(BaseModel):
    investor_name: Optional[str] = None
    investor_email: str
    investor_account_pwd: str
    investor_phone_no: Optional[str] = None
    investor_address: Optional[str] = None
    investor_linkedin: Optional[str] = None
    investor_twitter: Optional[str] = None
    investor_bio: Optional[str] = None
    investor_profile_pic_url: Optional[str] = None
    comments: Optional[str] = None

class CompanyDoc(BaseModel):
    company_name: str
    domain: str
    company_phone_no: str
    company_email: str
    company_address: str
    stage_of_development: str
    business_details: str
    usp: str
    revenue_model: str
    founder_id: str
    company_websites: List[str]
    comments: Optional[str] = None
    company_pitch_deck_gcs_uri: Optional[str] = None
    benchmark_agent_job_id: Optional[str] = None
    extract_output_gcs_uri: Optional[str] = None
    benchmark_gcs_uri: Optional[str] = None
    benchmark_agent_job_status: Optional[str] = None
    benchmark_agent_job_name: Optional[str] = None


