"""
YojnaSetu / CivicBenefit AI — LangChain Agent Orchestrator
==========================================================
The LLM is used only as an orchestrator.

Government-scheme truth remains deterministic:
    eligibility_engine
    conflict_detector
    optimizer
    document_checker
    recommendation_engine

The LangChain agent decides the tool sequence. If the local LLM fails to
complete the required tool sequence, we run the same deterministic tools as a
safe fallback so the API never depends on LLM output for eligibility.
"""

import json
from typing import Any, Dict, List

from langchain.agents import create_agent
from langchain_core.tools import tool
from langchain_ollama import ChatOllama

from services import (
    eligibility_engine,
    conflict_detector,
    optimizer,
    document_checker,
    recommendation_engine,
)


SYSTEM_PROMPT = """
You are YojnaSetu Agent, an autonomous citizen-benefits orchestration agent.

Your job is to coordinate a fixed, explainable workflow for a citizen:

1. Analyze the citizen profile.
2. Evaluate all government schemes using the eligibility tool.
3. Detect conflicts between eligible/potentially eligible schemes.
4. Optimize the compatible scheme bundle.
5. Check missing/available documents for the selected bundle.
6. Build personalized explanations and an application plan.

IMPORTANT:
- You MUST use the provided tools for eligibility, conflicts, optimization,
  documents, explanations and application planning.
- Never invent eligibility rules, scheme benefits, conflicts, documents, or
  application requirements.
- The deterministic tools are the source of truth.
- Do not replace a tool result with your own guess.
- Complete the workflow in the order above.
- After the tools finish, briefly report that the analysis is complete.
"""


class CivicBenefitAgent:
    """LangChain orchestrator around the deterministic scheme engines."""

    def __init__(self, model_name: str = "llama3.2"):
        self.model_name = model_name
        self.llm = ChatOllama(
            model=model_name,
            temperature=0,
        )

    @staticmethod
    def _build_result(
        profile: Dict[str, Any],
        schemes: List[Dict[str, Any]],
        context: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Convert tool state into the response shape expected by the frontend."""

        evaluations = context.get("evaluations", [])
        eligible = [e for e in evaluations if e["status"] == "ELIGIBLE"]
        potentially_eligible = [
            e for e in evaluations
            if e["status"] == "POTENTIALLY_ELIGIBLE"
        ]
        needs_verification = [
            e for e in evaluations
            if e["status"] == "NEEDS_VERIFICATION"
        ]
        not_eligible = [
            e for e in evaluations
            if e["status"] == "NOT_ELIGIBLE"
        ]

        conflicts = context.get("conflicts", [])

        bundle_result = context.get(
            "bundle_result",
            {
                "bundle": [],
                "excluded_due_to_conflict": [],
                "estimated_combined_value": 0,
                "bundle_optimization_score": 0,
                "total_candidates_considered": 0,
            },
        )

        documents = context.get(
            "documents",
            {
                "missing_documents": [],
                "available_documents_used": [],
                "total_required_unique_documents": 0,
                "total_missing": 0,
            },
        )

        explanations = context.get("explanations", [])
        application_plan = context.get(
            "application_plan",
            {
                "steps": [],
                "total_steps": 0,
                "completed_steps": 0,
            },
        )

        return {
            "disclaimer": (
                "Government scheme eligibility rules and benefits can change. "
                "This tool provides preliminary guidance based on its prototype "
                "knowledge base and does not constitute an official eligibility "
                "determination. Citizens should verify eligibility and application "
                "requirements through official government sources."
            ),
            "summary": {
                "schemes_analyzed": len(schemes),
                "potentially_eligible": (
                    len(eligible) + len(potentially_eligible)
                ),
                "conflicts_detected": len(conflicts),
                "recommended_schemes": len(bundle_result.get("bundle", [])),
                "documents_missing": documents.get("total_missing", 0),
            },
            "eligibility": {
                "eligible": eligible,
                "potentially_eligible": potentially_eligible,
                "needs_verification": needs_verification,
                "not_eligible": not_eligible,
            },
            "conflicts": conflicts,
            "bundle": bundle_result,
            "documents": documents,
            "explanations": explanations,
            "application_plan": application_plan,
            "agent_activity_log": context.get("activity_log", []),
            "agent": {
                "name": "YojnaSetu Agent",
                "framework": "LangChain",
                "model": self.model_name,
                "mode": context.get("mode", "deterministic-fallback"),
            },
        }

    @staticmethod
    def _deterministic_run(
        profile: Dict[str, Any],
        schemes: List[Dict[str, Any]],
        context: Dict[str, Any],
    ) -> None:
        """Safe fallback using the exact existing service interfaces."""

        activity = context["activity_log"]

        if "evaluations" not in context:
            context["evaluations"] = eligibility_engine.evaluate_all_schemes(
                schemes,
                profile,
            )
            activity.append("Eligibility Reasoner completed")

        if "conflicts" not in context:
            context["conflicts"] = conflict_detector.detect_conflicts(
                context["evaluations"]
            )
            activity.append(
                f"{len(context['conflicts'])} potential conflict(s) detected"
            )

        if "bundle_result" not in context:
            context["bundle_result"] = optimizer.optimize_bundle(
                context["evaluations"],
                profile,
            )
            activity.append("Benefit Optimizer selected the best compatible bundle")

        if "documents" not in context:
            context["documents"] = document_checker.check_documents(
                context["bundle_result"]["bundle"],
                profile.get("documents", []),
            )
            activity.append(
                f"{context['documents']['total_missing']} missing document(s) identified"
            )

        if "explanations" not in context:
            context["explanations"] = recommendation_engine.build_explanations(
                context["bundle_result"]["bundle"],
                profile,
            )

        if "application_plan" not in context:
            context["application_plan"] = (
                recommendation_engine.generate_application_plan(
                    context["bundle_result"]["bundle"],
                    context["documents"]["missing_documents"],
                    profile,
                )
            )
            activity.append("Application plan generated")

    def run(
        self,
        profile: Dict[str, Any],
        schemes: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Run the LangChain agent first. Tool state is kept per request, so
        different citizens cannot share analysis state.
        """

        context: Dict[str, Any] = {
            "evaluations": None,
            "conflicts": None,
            "bundle_result": None,
            "documents": None,
            "explanations": None,
            "application_plan": None,
            "activity_log": ["Profile Analyzer started"],
            "mode": "langchain-agent",
        }

        @tool
        def analyze_citizen_profile() -> str:
            """Analyze and validate the citizen profile before scheme evaluation."""
            required = [
                "name",
                "age",
                "gender",
                "state",
                "district",
                "annual_income",
                "category",
                "occupation",
            ]

            missing = [
                field for field in required
                if profile.get(field) is None
                or profile.get(field) == ""
            ]

            if missing:
                context["activity_log"].append(
                    "Profile Analyzer found missing profile fields"
                )
                return json.dumps(
                    {
                        "status": "needs_more_profile_data",
                        "missing_fields": missing,
                    }
                )

            context["activity_log"].append("Profile analyzed")
            return json.dumps(
                {
                    "status": "profile_ready",
                    "state": profile.get("state"),
                    "district": profile.get("district"),
                    "occupation": profile.get("occupation"),
                }
            )

        @tool
        def evaluate_scheme_eligibility() -> str:
            """Evaluate the citizen against every scheme using deterministic rules."""
            evaluations = eligibility_engine.evaluate_all_schemes(
                schemes,
                profile,
            )
            context["evaluations"] = evaluations

            eligible_count = sum(
                1 for e in evaluations if e["status"] == "ELIGIBLE"
            )
            potential_count = sum(
                1
                for e in evaluations
                if e["status"] == "POTENTIALLY_ELIGIBLE"
            )

            context["activity_log"].append(
                f"{len(schemes)} schemes evaluated: "
                f"{eligible_count} eligible, "
                f"{potential_count} potentially eligible"
            )

            return json.dumps(
                {
                    "schemes_evaluated": len(evaluations),
                    "eligible": eligible_count,
                    "potentially_eligible": potential_count,
                }
            )

        @tool
        def detect_scheme_conflicts() -> str:
            """Detect conflicts among eligible and potentially eligible schemes."""
            if context["evaluations"] is None:
                context["evaluations"] = (
                    eligibility_engine.evaluate_all_schemes(
                        schemes,
                        profile,
                    )
                )

            conflicts = conflict_detector.detect_conflicts(
                context["evaluations"]
            )
            context["conflicts"] = conflicts

            context["activity_log"].append(
                f"{len(conflicts)} potential conflict(s) detected"
            )

            return json.dumps(
                {
                    "conflicts_detected": len(conflicts),
                    "conflicts": conflicts,
                }
            )

        @tool
        def optimize_scheme_bundle() -> str:
            """Select the best compatible scheme bundle using the deterministic optimizer."""
            if context["evaluations"] is None:
                context["evaluations"] = (
                    eligibility_engine.evaluate_all_schemes(
                        schemes,
                        profile,
                    )
                )

            bundle_result = optimizer.optimize_bundle(
                context["evaluations"],
                profile,
            )
            context["bundle_result"] = bundle_result

            context["activity_log"].append(
                "Benefit Optimizer selected the best compatible bundle"
            )

            return json.dumps(
                {
                    "selected_schemes": [
                        s["scheme_name"]
                        for s in bundle_result["bundle"]
                    ],
                    "estimated_combined_value": bundle_result[
                        "estimated_combined_value"
                    ],
                    "bundle_optimization_score": bundle_result[
                        "bundle_optimization_score"
                    ],
                    "excluded_due_to_conflict": len(
                        bundle_result["excluded_due_to_conflict"]
                    ),
                }
            )

        @tool
        def check_required_documents() -> str:
            """Check available citizen documents against bundle requirements."""
            if context["bundle_result"] is None:
                if context["evaluations"] is None:
                    context["evaluations"] = (
                        eligibility_engine.evaluate_all_schemes(
                            schemes,
                            profile,
                        )
                    )
                context["bundle_result"] = optimizer.optimize_bundle(
                    context["evaluations"],
                    profile,
                )

            documents = document_checker.check_documents(
                context["bundle_result"]["bundle"],
                profile.get("documents", []),
            )
            context["documents"] = documents

            context["activity_log"].append(
                f"{documents['total_missing']} missing document(s) identified"
            )

            return json.dumps(documents)

        @tool
        def generate_recommendations_and_application_plan() -> str:
            """Build personalized explanations and the application checklist."""
            if context["bundle_result"] is None:
                self._deterministic_run(profile, schemes, context)

            bundle = context["bundle_result"]["bundle"]

            context["explanations"] = (
                recommendation_engine.build_explanations(
                    bundle,
                    profile,
                )
            )

            context["application_plan"] = (
                recommendation_engine.generate_application_plan(
                    bundle,
                    context["documents"]["missing_documents"],
                    profile,
                )
            )

            context["activity_log"].append(
                "Recommendations and application plan generated"
            )

            return json.dumps(
                {
                    "explanations_created": len(context["explanations"]),
                    "application_steps": context["application_plan"][
                        "total_steps"
                    ],
                }
            )

        tools = [
            analyze_citizen_profile,
            evaluate_scheme_eligibility,
            detect_scheme_conflicts,
            optimize_scheme_bundle,
            check_required_documents,
            generate_recommendations_and_application_plan,
        ]

        try:
            agent = create_agent(
                model=self.llm,
                tools=tools,
                system_prompt=SYSTEM_PROMPT,
                name="yojanasetu_agent",
            )

            prompt = f"""
Run the complete YojnaSetu analysis for this citizen profile.

Citizen profile:
{json.dumps(profile, ensure_ascii=False)}

There are {len(schemes)} schemes in the knowledge base.

Use the tools in the required order and complete the full workflow.
"""

            agent.invoke(
                {
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ]
                }
            )

            required_context = [
                "evaluations",
                "conflicts",
                "bundle_result",
                "documents",
                "explanations",
                "application_plan",
            ]

            completed = all(
                context.get(key) is not None
                for key in required_context
            )

            if not completed:
                context["mode"] = "deterministic-fallback"
                context["activity_log"].append(
                    "Agent did not complete every tool step; deterministic "
                    "pipeline completed the remaining steps"
                )
                self._deterministic_run(profile, schemes, context)
            else:
                context["mode"] = "langchain-agent"

        except Exception as exc:
            context["mode"] = "deterministic-fallback"
            context["activity_log"].append(
                f"Local agent unavailable; deterministic tools completed the analysis"
            )
            self._deterministic_run(profile, schemes, context)

        return self._build_result(profile, schemes, context)


# Singleton used by FastAPI.
civic_benefit_agent = CivicBenefitAgent()
