"""
Pydantic models used across CivicBenefit AI backend.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class CitizenProfile(BaseModel):
    # Personal
    name: str = "Citizen"
    age: int = 18
    gender: str = "Other"                 # Male / Female / Other
    state: str = "Maharashtra"
    district: str = ""
    marital_status: str = "Single"

    # Economic
    annual_income: float = 0
    employment_status: str = "Unemployed"  # Farmer/Student/Salaried/Self-employed/Unemployed/Daily Wage Worker/Other
    bpl_status: bool = False
    income_category: str = "APL"           # APL / BPL / EWS / LIG / etc

    # Social
    category: str = "General"              # General/OBC/SC/ST/Other
    disability_status: bool = False
    minority_status: bool = False

    # Family
    family_members: int = 1
    children: int = 0
    girl_children: int = 0
    pregnant_or_lactating: bool = False

    # Education
    education_level: str = ""              # e.g. 8th, 9th, 10th, Graduate...
    student_status: bool = False
    course: str = ""
    institution_type: str = ""             # School / College / Professional/Technical

    # Occupation
    occupation: str = "Unemployed"          # Farmer/Student/Salaried/Self-employed/Unemployed/Daily Wage Worker/Other

    # Housing
    owns_house: bool = False
    rural: bool = True
    homeless: bool = False

    # Agriculture
    owns_land: bool = False

    # Health
    health_insurance: bool = False

    # Documents available
    documents: List[str] = Field(default_factory=list)
    # e.g. ["Aadhaar","PAN","Income Certificate","Caste Certificate","Domicile Certificate",
    #       "Bank Account","Ration Card","Disability Certificate","Land Records",
    #       "Birth Certificate","Education Certificate"]

    # convenience derived flags used by rule engine (auto-computed on the backend,
    # but exposed here in case the frontend wants to pass them explicitly)
    bank_account: Optional[bool] = None


class AnalyzeRequest(BaseModel):
    profile: CitizenProfile


class ChecklistUpdateRequest(BaseModel):
    profile: CitizenProfile
    completed_steps: List[str] = Field(default_factory=list)
