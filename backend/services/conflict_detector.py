"""
Conflict Detection Engine
-------------------------
Identifies mutually exclusive / overlapping schemes among the schemes a
citizen is ELIGIBLE or POTENTIALLY_ELIGIBLE for, using the prototype
knowledge base's declared `conflicts` lists (bidirectional check).
"""
from typing import Any, Dict, List

CONSIDER_STATUSES = {"ELIGIBLE", "POTENTIALLY_ELIGIBLE"}


def detect_conflicts(evaluations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    candidates = {e["scheme_id"]: e for e in evaluations if e["status"] in CONSIDER_STATUSES}
    seen_pairs = set()
    conflicts = []

    for sid, evalu in candidates.items():
        for other_id in evalu.get("conflicts", []):
            if other_id in candidates:
                pair = tuple(sorted([sid, other_id]))
                if pair in seen_pairs:
                    continue
                seen_pairs.add(pair)
                a = candidates[pair[0]]
                b = candidates[pair[1]]
                conflicts.append({
                    "scheme_a": {"id": a["scheme_id"], "name": a["scheme_name"], "estimated_value": a["estimated_value"]},
                    "scheme_b": {"id": b["scheme_id"], "name": b["scheme_name"], "estimated_value": b["estimated_value"]},
                    "reason": (
                        "Both schemes provide overlapping or mutually-exclusive benefits under the "
                        "prototype rule knowledge base and may not be combinable under current guidelines."
                    ),
                    "recommended_action": (
                        f"Choose the scheme with the higher estimated benefit "
                        f"({a['scheme_name'] if a['estimated_value'] >= b['estimated_value'] else b['scheme_name']})."
                    ),
                    "disclaimer": "Conflict identified from prototype rule knowledge base. Verify current scheme guidelines before application.",
                })

    return conflicts
