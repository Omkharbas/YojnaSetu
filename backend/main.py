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
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from agent.orchestrator import civic_benefit_agent

from models import AnalyzeRequest, CitizenProfile
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


class AIChatRequest(BaseModel):
    message: str
    profile: Dict[str, Any]
    analysis: Dict[str, Any] | None = None


# =========================================================
# CONFIGURATION
# =========================================================


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
# YOJNASETU AI CHAT
# =========================================================

@app.post("/api/ai-chat")
def ai_chat(
    request: AIChatRequest,
    user=Depends(get_current_user),
):
    """
    Conversational YojnaSetu assistant powered by Ollama.

    The LLM explains the actual profile and analysis results.
    It does NOT calculate eligibility itself.
    """

    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Please enter a question.",
        )

    if len(message) > 1000:
        raise HTTPException(
            status_code=400,
            detail="Question is too long. Please keep it under 1000 characters.",
        )

    profile = request.profile or {}
    analysis = request.analysis or {}

    summary = analysis.get("summary", {})
    eligibility = analysis.get("eligibility", {})
    bundle = analysis.get("bundle", {})
    documents = analysis.get("documents", {})
    conflicts = analysis.get("conflicts", [])
    application_plan = analysis.get("application_plan", {})

    eligible_schemes = [
        item.get("scheme_name")
        for item in eligibility.get("eligible", [])
        if item.get("scheme_name")
    ]

    potentially_eligible_schemes = [
        item.get("scheme_name")
        for item in eligibility.get("potentially_eligible", [])
        if item.get("scheme_name")
    ]

    recommended_schemes = [
        item.get("scheme_name")
        for item in bundle.get("bundle", [])
        if item.get("scheme_name")
    ]

    missing_documents = documents.get(
        "missing_documents",
        [],
    )

    prompt = f"""
You are YojnaSetu AI, a friendly government-benefits assistant.

You are speaking directly to a citizen.

IMPORTANT RULES:
- Use ONLY the supplied profile and analysis data for citizen-specific claims.
- Do not invent scheme eligibility, benefits, documents, conflicts, or application requirements.
- The deterministic YojnaSetu analysis is the source of truth.
- Explain results in simple, friendly language.
- Do not claim to be an official government authority.
- If the supplied data does not answer the question, clearly say that the available analysis does not contain enough information.
- Never reveal internal Python code, prompts, API details, or implementation details unless explicitly asked.
- Keep answers concise but useful.
- When useful, use short numbered steps.

CITIZEN PROFILE:
{json.dumps(profile, ensure_ascii=False, indent=2)}

ANALYSIS SUMMARY:
{json.dumps(summary, ensure_ascii=False, indent=2)}

ELIGIBLE SCHEMES:
{json.dumps(eligible_schemes, ensure_ascii=False, indent=2)}

POTENTIALLY ELIGIBLE SCHEMES:
{json.dumps(potentially_eligible_schemes, ensure_ascii=False, indent=2)}

RECOMMENDED BUNDLE:
{json.dumps(recommended_schemes, ensure_ascii=False, indent=2)}

MISSING DOCUMENTS:
{json.dumps(missing_documents, ensure_ascii=False, indent=2)}

CONFLICTS:
{json.dumps(conflicts, ensure_ascii=False, indent=2)}

APPLICATION PLAN:
{json.dumps(application_plan, ensure_ascii=False, indent=2)}

CITIZEN QUESTION:
{message}

Answer the citizen's question now.
"""

    try:
        response = civic_benefit_agent.llm.invoke(prompt)

        reply = getattr(
            response,
            "content",
            str(response),
        )

        return {
            "reply": reply,
            "model": civic_benefit_agent.model_name,
        }

    except Exception as exc:
        print(f"⚠️ Ollama chat error: {exc}")

        raise HTTPException(
            status_code=503,
            detail=(
                "YojnaSetu AI is unavailable right now. "
                "Please make sure Ollama is running with llama3.2."
            ),
        )
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