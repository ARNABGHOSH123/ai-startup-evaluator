from pydantic import BaseModel
from typing import Optional

class CompanyDoc(BaseModel):
    company_name: str
    founder_name: str
    company_pitch_deck_gcs_uri: Optional[str]
    is_deck_extracted_and_benchmarked: bool = False
    extract_benchmark_gcs_uri: Optional[str]