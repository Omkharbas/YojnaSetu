"""
CivicBenefit AI — Backend
=========================
Autonomous Scheme-Bundle Optimizer for Citizens (PS16 Hackathon Prototype)

Runs the full agentic pipeline:
Profile Analyzer -> Eligibility Reasoner -> Conflict Detector ->
Benefit Optimizer -> Document Checker -> Application Planner
"""

import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from agent.orchestrator import civic_benefit_agent

from models import AnalyzeRequest, CitizenProfile
from services.document_verifier import verify_document

from services import (
    eligibility_engine,
    conflict_detector,
    optimizer,
    document_checker,
    recommendation_engine,
)

from auth.auth import (
    SignupRequest,
    OTPRequest,
    VerifyOTPRequest,
    OTPS,
    normalize_email,
    create_otp,
    create_token,
    hash_otp,
    get_current_user,
)

from database import (
    get_user_by_email,
    create_user,
    delete_user,
    get_user_profile,
    update_user_profile,
    user_to_dict,
)

from auth.email_service import send_otp_email


# =========================================================
# CONFIGURATION
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCHEMES_PATH = os.path.join(BASE_DIR, "schemes.json")


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="CivicBenefit AI API",
    description=(
        "Prototype API for the Autonomous Scheme-Bundle Optimizer. "
        "Scheme data is sample/demo data for hackathon purposes only — "
        "always verify eligibility with official government sources."
    ),
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# LOAD SCHEMES
# =========================================================

def load_schemes() -> List[Dict[str, Any]]:
    with open(SCHEMES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


SCHEMES = load_schemes()


# =========================================================
# DISCLAIMER
# =========================================================

DISCLAIMER = (
    "Government scheme eligibility rules and benefits can change. This tool provides "
    "preliminary guidance based on its prototype knowledge base and does not constitute "
    "an official eligibility determination. Citizens should verify eligibility and "
    "application requirements through official government sources."
)


# =========================================================
# DEMO PROFILE
# =========================================================

DEMO_PROFILE: Dict[str, Any] = {
    "name": "Rahul Patil",
    "age": 27,
    "gender": "Male",
    "state": "Maharashtra",
    "district": "Pune",
    "marital_status": "Married",
    "annual_income": 180000,
    "employment_status": "Farmer",
    "bpl_status": True,
    "income_category": "BPL",
    "category": "OBC",
    "disability_status": False,
    "minority_status": False,
    "family_members": 4,
    "children": 2,
    "girl_children": 1,
    "pregnant_or_lactating": False,
    "education_level": "Diploma",
    "student_status": True,
    "course": "Diploma in Agricultural Engineering (evening program)",
    "institution_type": "Professional/Technical",
    "occupation": "Farmer",
    "owns_house": False,
    "rural": True,
    "homeless": False,
    "owns_land": True,
    "health_insurance": False,
    "documents": [
        "Aadhaar",
        "Caste Certificate",
        "Bank Account",
        "Ration Card",
    ],
    "bank_account": True,
}


# =========================================================
# AGENTIC PIPELINE
# =========================================================

def _run_pipeline(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run the LangChain-based YojnaSetu orchestrator.

    Eligibility, conflict detection, optimization, document checking and
    application planning remain deterministic services. LangChain only
    orchestrates their execution.
    """
    return civic_benefit_agent.run(
        profile=profile,
        schemes=SCHEMES,
    )


# =========================================================
# AUTH — SIGNUP
# =========================================================

@app.post("/api/auth/signup")
def signup(request: SignupRequest):

    email = normalize_email(str(request.email))
    name = request.name.strip()


    # -----------------------------------------------------
    # VALIDATE NAME
    # -----------------------------------------------------

    if len(name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please enter your full name",
        )


    # -----------------------------------------------------
    # CHECK DUPLICATE EMAIL
    # -----------------------------------------------------

    if get_user_by_email(email):
        raise HTTPException(
            status_code=409,
            detail=(
                "User already exists. "
                "This email is already registered. "
                "Please login instead."
            ),
        )


    # -----------------------------------------------------
    # CREATE USER
    # -----------------------------------------------------

    create_user(email, name)


    # -----------------------------------------------------
    # CREATE OTP
    # -----------------------------------------------------

    otp = create_otp(email)


    # -----------------------------------------------------
    # SEND OTP
    # -----------------------------------------------------

    try:

        send_otp_email(
            email,
            otp,
        )

    except Exception as exc:

        # Remove the user if email delivery fails
        delete_user(email)

        OTPS.pop(email, None)

        raise HTTPException(
            status_code=500,
            detail=f"Could not send OTP: {exc}",
        )


    return {
        "message": "OTP sent to your email",
        "email": email,
    }


# =========================================================
# AUTH — LOGIN OTP
# =========================================================

@app.post("/api/auth/send-otp")
def send_login_otp(request: OTPRequest):

    email = normalize_email(
        str(request.email)
    )


    if not get_user_by_email(email):

        raise HTTPException(
            status_code=404,
            detail=(
                "No account found. "
                "Please sign up first."
            ),
        )


    otp = create_otp(email)


    try:

        send_otp_email(
            email,
            otp,
        )

    except Exception as exc:

        OTPS.pop(email, None)

        raise HTTPException(
            status_code=500,
            detail=f"Could not send OTP: {exc}",
        )


    return {
        "message": "OTP sent to your email",
        "email": email,
    }


# =========================================================
# AUTH — VERIFY OTP
# =========================================================

@app.post("/api/auth/verify-otp")
def verify_otp(request: VerifyOTPRequest):

    email = normalize_email(
        str(request.email)
    )

    record = OTPS.get(email)


    if not record:

        raise HTTPException(
            status_code=400,
            detail=(
                "OTP not found. "
                "Please request a new OTP."
            ),
        )


    # -----------------------------------------------------
    # CHECK EXPIRY
    # -----------------------------------------------------

    if datetime.now(timezone.utc) > record["expires_at"]:

        OTPS.pop(email, None)

        raise HTTPException(
            status_code=400,
            detail=(
                "OTP expired. "
                "Please request a new one."
            ),
        )


    # -----------------------------------------------------
    # CHECK ATTEMPTS
    # -----------------------------------------------------

    record["attempts"] += 1


    if record["attempts"] > 5:

        OTPS.pop(email, None)

        raise HTTPException(
            status_code=429,
            detail=(
                "Too many attempts. "
                "Please request a new OTP."
            ),
        )


    # -----------------------------------------------------
    # VERIFY OTP
    # -----------------------------------------------------

    if hash_otp(
        request.otp.strip()
    ) != record["otp_hash"]:

        raise HTTPException(
            status_code=400,
            detail="Incorrect OTP",
        )


    # -----------------------------------------------------
    # SUCCESS
    # -----------------------------------------------------

    OTPS.pop(email, None)

    token = create_token(email)


    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_to_dict(get_user_by_email(email)),
    }


# =========================================================
# CURRENT USER
# =========================================================

@app.get("/api/profile")
def get_profile(user=Depends(get_current_user)):
    profile = get_user_profile(user["email"])
    return {"profile": profile, "exists": profile is not None}


@app.put("/api/profile")
def save_profile(request: CitizenProfile, user=Depends(get_current_user)):
    profile = request.model_dump()
    profile["name"] = str(profile.get("name") or user["name"]).strip()
    updated = update_user_profile(user["email"], profile)
    if not updated:
        raise HTTPException(status_code=404, detail="User account not found")
    return {"message": "Profile saved successfully", "profile": profile, "user": user_to_dict(updated)}


@app.get("/api/auth/me")
def me(
    user=Depends(get_current_user),
):
    return user


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "CivicBenefit AI API is running",
        "docs": "/docs",
    }


# =========================================================
# DEMO PROFILE
# =========================================================

@app.get("/api/demo-profile")
def get_demo_profile():
    return DEMO_PROFILE


# =========================================================
# SCHEMES
# =========================================================

@app.get("/api/schemes")
def get_schemes(
    category: str = None,
    level: str = None,
    q: str = None,
):

    results = SCHEMES


    if category:

        results = [
            s
            for s in results
            if s["category"].lower()
            == category.lower()
        ]


    if level:

        results = [
            s
            for s in results
            if level.lower()
            in s["level"].lower()
        ]


    if q:

        ql = q.lower()

        results = [
            s
            for s in results
            if (
                ql in s["name"].lower()
                or ql in s["description"].lower()
                or ql in s["category"].lower()
            )
        ]


    return {
        "count": len(results),
        "schemes": results,
    }


# =========================================================
# SINGLE SCHEME
# =========================================================

@app.get("/api/schemes/{scheme_id}")
def get_scheme(
    scheme_id: str,
):

    for s in SCHEMES:

        if s["id"] == scheme_id:
            return s


    raise HTTPException(
        status_code=404,
        detail="Scheme not found",
    )



# =========================================================
# AI DOCUMENT VERIFICATION
# =========================================================

@app.post("/api/verify-document")
async def verify_uploaded_document(
    document_type: str = Form(...),
    profile: str = Form(...),
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    """
    Perform preliminary AI-assisted verification of an uploaded
    government document.

    The selected document type is kept and compared with the type
    detected from OCR. This is NOT an official authenticity check.
    """
    if not document_type.strip():
        raise HTTPException(
            status_code=400,
            detail="Please select a document type.",
        )

    allowed_types = {
        "Aadhaar",
        "PAN",
        "Income Certificate",
        "Caste Certificate",
        "Domicile Certificate",
        "Bank Account",
        "Ration Card",
        "Disability Certificate",
        "Land Records",
        "Birth Certificate",
        "Education Certificate",
    }

    if document_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported document type.",
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Please upload a document.",
        )

    try:
        profile_data = json.loads(profile)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid citizen profile data.",
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    try:
        result = verify_document(
            filename=file.filename,
            content=content,
            content_type=file.content_type or "",
            document_type=document_type,
            profile=profile_data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )
    except Exception as exc:
        print("Document verification error:", exc)
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not process this document. "
                "Please try a clearer JPG, PNG, or PDF."
            ),
        )

    return result

# =========================================================
# FULL AI ANALYSIS
# =========================================================

@app.post("/api/analyze-profile")
def analyze_profile(
    request: AnalyzeRequest,
    user=Depends(get_current_user),
):

    profile = request.profile.model_dump()
    update_user_profile(user["email"], profile)

    return _run_pipeline(profile)


# =========================================================
# ELIGIBILITY
# =========================================================

@app.post("/api/eligibility")
def check_eligibility(
    request: AnalyzeRequest,
    user=Depends(get_current_user),
):

    profile = request.profile.model_dump()

    evaluations = (
        eligibility_engine.evaluate_all_schemes(
            SCHEMES,
            profile,
        )
    )

    return {
        "evaluations": evaluations
    }


# =========================================================
# OPTIMIZE BUNDLE
# =========================================================

@app.post("/api/optimize-bundle")
def optimize_bundle_endpoint(
    request: AnalyzeRequest,
    user=Depends(get_current_user),
):

    profile = request.profile.model_dump()

    evaluations = (
        eligibility_engine.evaluate_all_schemes(
            SCHEMES,
            profile,
        )
    )

    return optimizer.optimize_bundle(
        evaluations,
        profile,
    )


# =========================================================
# CHECK DOCUMENTS
# =========================================================

@app.post("/api/check-documents")
def check_documents_endpoint(
    request: AnalyzeRequest,
    user=Depends(get_current_user),
):

    profile = request.profile.model_dump()

    evaluations = (
        eligibility_engine.evaluate_all_schemes(
            SCHEMES,
            profile,
        )
    )

    bundle_result = optimizer.optimize_bundle(
        evaluations,
        profile,
    )

    return document_checker.check_documents(
        bundle_result["bundle"],
        profile.get("documents", []),
    )


# =========================================================
# APPLICATION PLAN
# =========================================================

@app.post("/api/application-plan")
def application_plan_endpoint(
    request: AnalyzeRequest,
    user=Depends(get_current_user),
):

    result = _run_pipeline(
        request.profile.model_dump()
    )

    return {
        "application_plan": result[
            "application_plan"
        ],
        "bundle": result[
            "bundle"
        ]["bundle"],
        "documents": result[
            "documents"
        ],
    }


# =========================================================
# CATEGORIES
# =========================================================

@app.get("/api/categories")
def get_categories():

    return {
        "categories": sorted(
            list(
                {
                    s["category"]
                    for s in SCHEMES
                }
            )
        )
    }