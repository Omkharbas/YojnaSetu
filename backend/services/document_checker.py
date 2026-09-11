"""
Document Intelligence / Missing-Document Detector
--------------------------------------------------
Compares documents the citizen already has against documents required by
the recommended (bundled) schemes, and reports gaps grouped by document.
"""
from typing import Any, Dict, List


def check_documents(bundle: List[Dict[str, Any]], available_documents: List[str]) -> Dict[str, Any]:
    required_map: Dict[str, List[str]] = {}
    for scheme in bundle:
        for doc in scheme.get("required_documents", []):
            required_map.setdefault(doc, []).append(scheme["scheme_name"])

    missing = []
    available = []
    for doc, needed_by in required_map.items():
        if doc in available_documents:
            available.append({"document": doc, "required_for": needed_by})
        else:
            # severity: RED if needed by 2+ schemes, ORANGE otherwise
            severity = "high" if len(needed_by) >= 2 else "medium"
            missing.append({"document": doc, "required_for": needed_by, "severity": severity})

    missing.sort(key=lambda x: (0 if x["severity"] == "high" else 1))

    return {
        "missing_documents": missing,
        "available_documents_used": available,
        "total_required_unique_documents": len(required_map),
        "total_missing": len(missing),
    }
