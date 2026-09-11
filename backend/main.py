"""
CivicBenefit AI — Backend
==========================
Autonomous Scheme-Bundle Optimizer for Citizens (PS16 Hackathon Prototype)

Runs the full agentic pipeline:
Profile Analyzer -> Eligibility Reasoner -> Conflict Detector ->
Benefit Optimizer -> Document Checker -> Application Planner
"""
import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import AnalyzeRequest, CitizenProfile
from services import eligibility_engine, conflict_detector, optimizer, document_checker, recommendation_engine
from auth.auth import (
    SignupRequest, OTPRequest, VerifyOTPRequest, USERS, OTPS, normalize_email,
    create_otp, create_token, hash_otp, get_current_user,
)
from auth.email_service import send_otp_email

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCHEMES_PATH = os.path.join(BASE_DIR, "schemes.json")

app = FastAPI(
    title="CivicBenefit AI API",
    description=(
        "Prototype API for the Autonomous Scheme-Bundle Optimizer. "
        "Scheme data is sample/demo data for hackathon purposes only — "
        "always verify eligibility with official government sources."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_schemes() -> List[Dict[str, Any]]:
    with open(SCHEMES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


SCHEMES = load_schemes()

DISCLAIMER = (
    "Government scheme eligibility rules and benefits can change. This tool provides "
    "preliminary guidance based on its prototype knowledge base and does not constitute "
    "an official eligibility determination. Citizens should verify eligibility and "
    "application requirements through official government sources."
)

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
    "documents": ["Aadhaar", "Caste Certificate", "Bank Account", "Ration Card"],
    "bank_account": True,
}


def _run_pipeline(profile: Dict[str, Any]) -> Dict[str, Any]:
    """Runs the full agentic reasoning pipeline and returns a structured result
    together with an agent activity log for the UI to display."""
    activity_log: List[str] = []

    activity_log.append("Profile analyzed")
    evaluations = eligibility_engine.evaluate_all_schemes(SCHEMES, profile)

    eligible = [e for e in evaluations if e["status"] == "ELIGIBLE"]
    potentially_eligible = [e for e in evaluations if e["status"] == "POTENTIALLY_ELIGIBLE"]
    needs_verification = [e for e in evaluations if e["status"] == "NEEDS_VERIFICATION"]
    not_eligible = [e for e in evaluations if e["status"] == "NOT_ELIGIBLE"]

    activity_log.append(f"{len(SCHEMES)} schemes shortlisted for evaluation")
    activity_log.append(
        f"{len(eligible) + len(potentially_eligible)} schemes passed eligibility checks "
        f"({len(eligible)} eligible, {len(potentially_eligible)} potentially eligible)"
    )

    conflicts = conflict_detector.detect_conflicts(evaluations)
    activity_log.append(f"{len(conflicts)} potential conflict(s) detected")

    bundle_result = optimizer.optimize_bundle(evaluations, profile)
    activity_log.append(
        f"{len(bundle_result['excluded_due_to_conflict'])} incompatible combination(s) removed from bundle"
    )
    activity_log.append("Optimal bundle calculated")

    doc_check = document_checker.check_documents(bundle_result["bundle"], profile.get("documents", []))
    activity_log.append(f"{doc_check['total_missing']} missing document(s) identified")

    explanations = recommendation_engine.build_explanations(bundle_result["bundle"], profile)

    plan = recommendation_engine.generate_application_plan(
        bundle_result["bundle"], doc_check["missing_documents"], profile
    )
    activity_log.append("Application plan generated")

    return {
        "disclaimer": DISCLAIMER,
        "summary": {
            "schemes_analyzed": len(SCHEMES),
            "potentially_eligible": len(eligible) + len(potentially_eligible),
            "conflicts_detected": len(conflicts),
            "recommended_schemes": len(bundle_result["bundle"]),
            "documents_missing": doc_check["total_missing"],
        },
        "eligibility": {
            "eligible": eligible,
            "potentially_eligible": potentially_eligible,
            "needs_verification": needs_verification,
            "not_eligible": not_eligible,
        },
        "conflicts": conflicts,
        "bundle": bundle_result,
        "documents": doc_check,
        "explanations": explanations,
        "application_plan": plan,
        "agent_activity_log": activity_log,
    }


@app.post("/api/auth/signup")
def signup(request: SignupRequest):
    email = normalize_email(str(request.email))
    name = request.name.strip()
    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Please enter your full name")
    USERS[email] = {"email": email, "name": name}
    otp = create_otp(email)
    try:
        send_otp_email(email, otp)
    except Exception as exc:
        OTPS.pop(email, None)
        raise HTTPException(status_code=500, detail=f"Could not send OTP: {exc}")
    return {"message": "OTP sent to your email", "email": email}


@app.post("/api/auth/send-otp")
def send_login_otp(request: OTPRequest):
    email = normalize_email(str(request.email))
    if email not in USERS:
        raise HTTPException(status_code=404, detail="No account found. Please sign up first.")
    otp = create_otp(email)
    try:
        send_otp_email(email, otp)
    except Exception as exc:
        OTPS.pop(email, None)
        raise HTTPException(status_code=500, detail=f"Could not send OTP: {exc}")
    return {"message": "OTP sent to your email", "email": email}


@app.post("/api/auth/verify-otp")
def verify_otp(request: VerifyOTPRequest):
    email = normalize_email(str(request.email))
    record = OTPS.get(email)
    if not record:
        raise HTTPException(status_code=400, detail="OTP not found. Please request a new OTP.")
    if datetime.now(timezone.utc) > record["expires_at"]:
        OTPS.pop(email, None)
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")
    record["attempts"] += 1
    if record["attempts"] > 5:
        OTPS.pop(email, None)
        raise HTTPException(status_code=429, detail="Too many attempts. Please request a new OTP.")
    if hash_otp(request.otp.strip()) != record["otp_hash"]:
        raise HTTPException(status_code=400, detail="Incorrect OTP")
    OTPS.pop(email, None)
    token = create_token(email)
    return {"access_token": token, "token_type": "bearer", "user": USERS[email]}


@app.get("/api/auth/me")
def me(user=Depends(get_current_user)):
    return user


@app.get("/")
def root():
    return {"message": "CivicBenefit AI API is running", "docs": "/docs"}


@app.get("/api/demo-profile")
def get_demo_profile():
    return DEMO_PROFILE


@app.get("/api/schemes")
def get_schemes(category: str = None, level: str = None, q: str = None):
    results = SCHEMES
    if category:
        results = [s for s in results if s["category"].lower() == category.lower()]
    if level:
        results = [s for s in results if level.lower() in s["level"].lower()]
    if q:
        ql = q.lower()
        results = [
            s for s in results
            if ql in s["name"].lower() or ql in s["description"].lower() or ql in s["category"].lower()
        ]
    return {"count": len(results), "schemes": results}


@app.get("/api/schemes/{scheme_id}")
def get_scheme(scheme_id: str):
    for s in SCHEMES:
        if s["id"] == scheme_id:
            return s
    raise HTTPException(status_code=404, detail="Scheme not found")


@app.post("/api/analyze-profile")
def analyze_profile(request: AnalyzeRequest, user=Depends(get_current_user)):
    profile = request.profile.model_dump()
    return _run_pipeline(profile)


@app.post("/api/eligibility")
def check_eligibility(request: AnalyzeRequest, user=Depends(get_current_user)):
    profile = request.profile.model_dump()
    evaluations = eligibility_engine.evaluate_all_schemes(SCHEMES, profile)
    return {"evaluations": evaluations}


@app.post("/api/optimize-bundle")
def optimize_bundle_endpoint(request: AnalyzeRequest, user=Depends(get_current_user)):
    profile = request.profile.model_dump()
    evaluations = eligibility_engine.evaluate_all_schemes(SCHEMES, profile)
    return optimizer.optimize_bundle(evaluations, profile)


@app.post("/api/check-documents")
def check_documents_endpoint(request: AnalyzeRequest, user=Depends(get_current_user)):
    profile = request.profile.model_dump()
    evaluations = eligibility_engine.evaluate_all_schemes(SCHEMES, profile)
    bundle_result = optimizer.optimize_bundle(evaluations, profile)
    return document_checker.check_documents(bundle_result["bundle"], profile.get("documents", []))


@app.post("/api/application-plan")
def application_plan_endpoint(request: AnalyzeRequest, user=Depends(get_current_user)):
    result = _run_pipeline(request.profile.model_dump())
    return {
        "application_plan": result["application_plan"],
        "bundle": result["bundle"]["bundle"],
        "documents": result["documents"],
    }


@app.get("/api/categories")
def get_categories():
    return {"categories": sorted(list({s["category"] for s in SCHEMES}))}
