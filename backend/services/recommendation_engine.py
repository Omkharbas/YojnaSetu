"""
Recommendation Explanation + Application Planner
-------------------------------------------------
Builds a human-readable "why was this recommended" explanation for each
bundled scheme, and generates a personalized, checkable application
checklist covering document acquisition + application + tracking steps.
"""
from typing import Any, Dict, List


def _profile_traits(profile: Dict[str, Any]) -> List[str]:
    traits = []
    if profile.get("occupation"):
        traits.append(f"{profile['occupation']}")
    if profile.get("bpl_status"):
        traits.append("Low-income (BPL) household")
    if profile.get("state"):
        traits.append(f"{profile['state']} resident")
    if "Aadhaar" in profile.get("documents", []):
        traits.append("Have Aadhaar")
    if "Bank Account" in profile.get("documents", []) or profile.get("bank_account"):
        traits.append("Have a bank account")
    if profile.get("category") and profile["category"] != "General":
        traits.append(f"{profile['category']} category")
    if profile.get("girl_children", 0) > 0:
        traits.append(f"{profile['girl_children']} girl child(ren)")
    if profile.get("pregnant_or_lactating"):
        traits.append("Pregnant/lactating")
    if profile.get("owns_land"):
        traits.append("Own agricultural land")
    if profile.get("disability_status"):
        traits.append("Person with disability")
    return traits


def build_explanations(bundle: List[Dict[str, Any]], profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    traits = _profile_traits(profile)
    explanations = []
    for scheme in bundle:
        matched = scheme.get("rules_passed", [])
        explanations.append({
            "scheme_id": scheme["scheme_id"],
            "scheme_name": scheme["scheme_name"],
            "because_you_are": traits,
            "matches": matched,
            "confidence": scheme["confidence"],
            "note": "Confidence is based on prototype rules and is not an official eligibility decision.",
        })
    return explanations


def generate_application_plan(bundle: List[Dict[str, Any]], missing_docs: List[Dict[str, Any]],
                               profile: Dict[str, Any]) -> Dict[str, Any]:
    steps = []
    step_num = 1

    available_docs = set(profile.get("documents", []))
    all_needed_docs = set()
    for s in bundle:
        all_needed_docs.update(s.get("required_documents", []))

    # Steps for documents already available
    for doc in sorted(all_needed_docs & available_docs):
        steps.append({
            "step": step_num,
            "title": f"{doc} ready",
            "status": "done",
            "type": "document_ready",
        })
        step_num += 1

    # Steps for missing documents that must be obtained
    for md in missing_docs:
        steps.append({
            "step": step_num,
            "title": f"Obtain {md['document']}",
            "status": "pending",
            "type": "document_needed",
            "required_for": md["required_for"],
        })
        step_num += 1

    # Bank account verification step (common requirement)
    if "Bank Account" in available_docs:
        steps.append({
            "step": step_num,
            "title": "Link/verify bank account for direct benefit transfer",
            "status": "done",
            "type": "verification",
        })
    else:
        steps.append({
            "step": step_num,
            "title": "Open/link a bank account for direct benefit transfer",
            "status": "pending",
            "type": "verification",
        })
    step_num += 1

    # Apply for each selected scheme
    for s in bundle:
        steps.append({
            "step": step_num,
            "title": f"Apply for {s['scheme_name']}",
            "status": "pending",
            "type": "apply",
        })
        step_num += 1

    # Track status
    steps.append({
        "step": step_num,
        "title": "Track application status on respective scheme portals",
        "status": "pending",
        "type": "track",
    })

    completed = sum(1 for s in steps if s["status"] == "done")
    return {
        "steps": steps,
        "total_steps": len(steps),
        "completed_steps": completed,
    }
