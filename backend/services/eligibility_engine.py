"""
Eligibility Reasoning Engine
----------------------------
Evaluates a citizen profile against each scheme's rule-set and produces a
transparent, rule-by-rule explanation (explainable AI / agentic reasoning).

Status values:
  ELIGIBLE            - all rules pass, no verification-only conditions
  POTENTIALLY_ELIGIBLE - all hard rules pass but verification-required fields
                         are still unconfirmed (e.g. land record, certificates)
  NEEDS_VERIFICATION   - some rules pass, some are uncertain because required
                         data/documents are missing, but nothing has clearly failed
  NOT_ELIGIBLE         - one or more rules clearly fail
"""
from typing import Any, Dict, List


def _get_profile_value(profile: Dict[str, Any], field: str) -> Any:
    """Fetch a field from the profile dict, with a couple of derived fields."""
    if field == "bank_account":
        val = profile.get("bank_account")
        if val is None:
            return "Bank Account" in profile.get("documents", [])
        return val
    return profile.get(field)


def _evaluate_rule(rule: Dict[str, Any], profile: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate a single rule. Returns dict with passed (True/False/None) and label."""
    field = rule["field"]
    op = rule["op"]
    expected = rule["value"]
    label = rule.get("label", f"{field} {op} {expected}")
    actual = _get_profile_value(profile, field)

    passed = None
    try:
        if actual is None or actual == "":
            passed = None  # unknown -> needs verification
        elif op == "eq":
            passed = actual == expected
        elif op == "neq":
            passed = actual != expected
        elif op == "in":
            passed = actual in expected
        elif op == "gte":
            passed = float(actual) >= float(expected)
        elif op == "lte":
            passed = float(actual) <= float(expected)
        elif op == "gt":
            passed = float(actual) > float(expected)
        elif op == "lt":
            passed = float(actual) < float(expected)
        elif op == "between":
            passed = float(expected[0]) <= float(actual) <= float(expected[1])
        else:
            passed = None
    except (TypeError, ValueError):
        passed = None

    return {"label": label, "passed": passed, "field": field}


DOC_MAP = {
    "land_record": "Land Records",
    "income_certificate": "Income Certificate",
    "caste_certificate": "Caste Certificate",
    "ration_card": "Ration Card",
    "disability_certificate": "Disability Certificate",
}


def evaluate_scheme(scheme: Dict[str, Any], profile: Dict[str, Any]) -> Dict[str, Any]:
    """Run full explainable evaluation of one scheme against the citizen profile."""
    rule_results = [_evaluate_rule(r, profile) for r in scheme.get("eligibility_rules", [])]

    passed = [r for r in rule_results if r["passed"] is True]
    failed = [r for r in rule_results if r["passed"] is False]
    unknown = [r for r in rule_results if r["passed"] is None]

    # Verification checks (documents that must be confirmed even if rules pass)
    verification_items = []
    for v in scheme.get("verification_required", []):
        doc_name = DOC_MAP.get(v, v)
        has_doc = doc_name in profile.get("documents", [])
        verification_items.append({"item": v, "document": doc_name, "available": has_doc})

    missing_verification_docs = [v for v in verification_items if not v["available"]]

    if failed:
        status = "NOT_ELIGIBLE"
        explanation = "Does not currently meet one or more core eligibility conditions."
    elif unknown:
        status = "NEEDS_VERIFICATION"
        explanation = "Some profile information required to confirm eligibility is missing or unclear."
    elif missing_verification_docs:
        status = "POTENTIALLY_ELIGIBLE"
        doc_list = ", ".join(v["document"] for v in missing_verification_docs)
        explanation = f"Core conditions match. Verify: {doc_list} before applying."
    else:
        status = "ELIGIBLE"
        explanation = "All prototype rule conditions and document checks are satisfied."

    # Simple confidence score for explainability
    total_checks = max(len(rule_results) + len(verification_items), 1)
    satisfied_checks = len(passed) + (len(verification_items) - len(missing_verification_docs))
    confidence = round((satisfied_checks / total_checks) * 100)
    if status == "NOT_ELIGIBLE":
        confidence = min(confidence, 20)

    return {
        "scheme_id": scheme["id"],
        "scheme_name": scheme["name"],
        "category": scheme["category"],
        "status": status,
        "confidence": confidence,
        "explanation": explanation,
        "rules_passed": [r["label"] for r in passed],
        "rules_failed": [r["label"] for r in failed],
        "rules_needs_verification": [r["label"] for r in unknown],
        "verification_items": verification_items,
        "estimated_value": scheme.get("estimated_value", 0),
        "priority": scheme.get("priority", 1),
        "required_documents": scheme.get("required_documents", []),
        "conflicts": scheme.get("conflicts", []),
        "level": scheme.get("level"),
        "state": scheme.get("state"),
        "benefit": scheme.get("benefit"),
        "description": scheme.get("description"),
        "target_group": scheme.get("target_group"),
    }


def evaluate_all_schemes(schemes: List[Dict[str, Any]], profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    return [evaluate_scheme(s, profile) for s in schemes]
