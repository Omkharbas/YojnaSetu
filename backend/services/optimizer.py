"""
Bundle Optimization Engine
--------------------------
Selects the best *compatible* combination of schemes for the citizen, rather
than simply returning every eligible scheme.

Approach (explainable, deterministic, no external ML dependency):
1. Compute a composite "optimization score" for every ELIGIBLE /
   POTENTIALLY_ELIGIBLE scheme, combining:
     - normalized estimated benefit value      (40%)
     - eligibility confidence                  (25%)
     - scheme priority (citizen relevance)     (20%)
     - document/effort readiness               (15%)
2. Sort candidates by score, descending.
3. Greedily walk the sorted list, adding a scheme to the bundle only if it
   does not conflict with anything already selected. This produces a
   maximal-value, conflict-free bundle (a standard greedy approximation of
   the maximum-weight independent set problem, appropriate for a real-time,
   explainable prototype).
"""
from typing import Any, Dict, List

CONSIDER_STATUSES = {"ELIGIBLE", "POTENTIALLY_ELIGIBLE"}


def _effort_score(evaluation: Dict[str, Any], available_documents: List[str]) -> float:
    """Higher score = fewer missing documents relative to required documents."""
    required = evaluation.get("required_documents", [])
    if not required:
        return 100.0
    have = sum(1 for d in required if d in available_documents)
    return (have / len(required)) * 100.0


def compute_scores(evaluations: List[Dict[str, Any]], profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    candidates = [e for e in evaluations if e["status"] in CONSIDER_STATUSES]
    if not candidates:
        return []

    max_value = max((c["estimated_value"] for c in candidates), default=1) or 1
    max_priority = max((c["priority"] for c in candidates), default=1) or 1
    available_documents = profile.get("documents", [])

    scored = []
    for c in candidates:
        value_score = (c["estimated_value"] / max_value) * 100
        confidence_score = c["confidence"]
        priority_score = (c["priority"] / max_priority) * 100
        effort_score = _effort_score(c, available_documents)

        optimization_score = round(
            value_score * 0.40 +
            confidence_score * 0.25 +
            priority_score * 0.20 +
            effort_score * 0.15,
            1,
        )
        item = dict(c)
        item["optimization_score"] = optimization_score
        item["score_breakdown"] = {
            "value_score": round(value_score, 1),
            "confidence_score": confidence_score,
            "priority_score": round(priority_score, 1),
            "effort_score": round(effort_score, 1),
        }
        scored.append(item)

    return sorted(scored, key=lambda x: x["optimization_score"], reverse=True)


def optimize_bundle(evaluations: List[Dict[str, Any]], profile: Dict[str, Any]) -> Dict[str, Any]:
    scored = compute_scores(evaluations, profile)

    selected: List[Dict[str, Any]] = []
    excluded: List[Dict[str, Any]] = []
    selected_ids = set()

    for candidate in scored:
        conflicting_selected = [
            s for s in selected if candidate["scheme_id"] in s.get("conflicts", [])
            or s["scheme_id"] in candidate.get("conflicts", [])
        ]
        if conflicting_selected:
            excluded.append({
                **candidate,
                "excluded_reason": (
                    f"Conflicts with already-selected higher/equal scoring scheme "
                    f"'{conflicting_selected[0]['scheme_name']}' in the optimized bundle."
                ),
            })
            continue
        selected.append(candidate)
        selected_ids.add(candidate["scheme_id"])

    total_value = sum(s["estimated_value"] for s in selected)
    avg_score = round(sum(s["optimization_score"] for s in selected) / len(selected), 1) if selected else 0

    return {
        "bundle": selected,
        "excluded_due_to_conflict": excluded,
        "estimated_combined_value": total_value,
        "bundle_optimization_score": avg_score,
        "total_candidates_considered": len(scored),
    }
