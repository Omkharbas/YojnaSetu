import AIChatbot from "../components/AIChatbot";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Layers,
  ShieldAlert,
  ListChecks,
  FileWarning,
  CheckCircle2,
  ArrowRight,
  Terminal,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { useApp } from "../context/AppContext";

import SummaryCard from "../components/SummaryCard";
import SchemeReasoningCard from "../components/SchemeReasoningCard";

import {
  Disclaimer,
  TagBadge,
  ConflictWarningIcon,
} from "../components/UI";

const TABS = [
  "Overview",
  "Eligible Schemes",
  "Conflicts",
  "Recommended Bundle",
];

export default function Dashboard() {
  const { analysis, profile } = useApp();

  const navigate = useNavigate();

  const [tab, setTab] = useState("Overview");

  /*
   * =====================================================
   * CHECK WHETHER ANALYSIS EXISTS
   * =====================================================
   */

  const hasAnalysis = Boolean(analysis);

  /*
   * =====================================================
   * SAFE DEFAULT VALUES
   *
   * These prevent the dashboard from crashing when
   * analysis has not been generated yet.
   * =====================================================
   */

  const summary = analysis?.summary || {
    schemes_analyzed: 0,
    potentially_eligible: 0,
    conflicts_detected: 0,
    recommended_schemes: 0,
    documents_missing: 0,
  };

  const eligibility = analysis?.eligibility || {
    eligible: [],
    potentially_eligible: [],
    needs_verification: [],
    not_eligible: [],
  };

  const conflicts = analysis?.conflicts || [];

  const bundle = analysis?.bundle || {
    bundle: [],
    estimated_combined_value: 0,
    bundle_optimization_score: 0,
    excluded_due_to_conflict: [],
  };

  const explanations = analysis?.explanations || [];

  const agent_activity_log =
    analysis?.agent_activity_log || [];

  /*
   * =====================================================
   * CHART DATA
   * =====================================================
   */

  const chartData = bundle.bundle.map((scheme) => ({
    name:
      scheme.scheme_name?.length > 18
        ? scheme.scheme_name.slice(0, 18) + "…"
        : scheme.scheme_name || "Scheme",

    value: Number(scheme.estimated_value || 0),
  }));

  /*
   * =====================================================
   * DASHBOARD
   * =====================================================
   */

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Citizen Benefits Dashboard
          </h1>

          <p className="text-sm text-slate-500">
            Results for{" "}
            <span className="font-medium text-slate-700">
              {profile?.name || "citizen"}
            </span>

            {profile?.district
              ? ` — ${profile.district}`
              : ""}

            {profile?.state
              ? `, ${profile.state}`
              : ""}
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate("/planner")}
        >
          Go to Application Planner
          <ArrowRight size={16} />
        </button>

      </div>


      {/* =================================================
          WELCOME / NO ANALYSIS MESSAGE
          
          IMPORTANT:
          We DO NOT redirect to Profile.
          Dashboard remains visible.
      ================================================= */}

      {!hasAnalysis && (
        <div className="mb-6 rounded-2xl border border-brand-100 bg-brand-50 p-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-base font-bold text-slate-900">
                Welcome
                {profile?.name
                  ? `, ${profile.name}`
                  : ""}
                ! 👋
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                Your citizen dashboard is ready.
                Run an eligibility analysis to discover
                government schemes and your optimized
                benefits bundle.
              </p>

            </div>

            <button
              className="btn-primary shrink-0"
              onClick={() => navigate("/analysis")}
            >
              Check My Eligibility
              <ArrowRight size={16} />
            </button>

          </div>

        </div>
      )}


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">

        <SummaryCard
          icon={ListChecks}
          label="Schemes Analyzed"
          value={summary.schemes_analyzed}
          tone="slate"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Potentially Eligible"
          value={summary.potentially_eligible}
          tone="green"
        />

        <SummaryCard
          icon={ShieldAlert}
          label="Conflicts Detected"
          value={summary.conflicts_detected}
          tone="red"
        />

        <SummaryCard
          icon={Layers}
          label="Recommended Schemes"
          value={summary.recommended_schemes}
          tone="brand"
        />

        <SummaryCard
          icon={FileWarning}
          label="Documents Missing"
          value={summary.documents_missing}
          tone="orange"
        />

      </div>


      {/* =================================================
          TABS
      ================================================= */}

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-200">

        {TABS.map((t) => (

          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition ${
              tab === t
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {t}
          </button>

        ))}

      </div>


      {/* =================================================
          OVERVIEW TAB
      ================================================= */}

      {tab === "Overview" && (

        <div className="grid gap-5 lg:grid-cols-2">

          {/* ---------------------------------------------
              AGENT ACTIVITY LOG
          --------------------------------------------- */}

          <div className="card">

            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">

              <Terminal
                size={16}
                className="text-brand-600"
              />

              Agent Activity Log

            </h2>

            {agent_activity_log.length > 0 ? (

              <div className="space-y-1.5 rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-300">

                {agent_activity_log.map((line, i) => (

                  <div key={i}>
                    ✓ {line}
                  </div>

                ))}

              </div>

            ) : (

              <div className="rounded-xl bg-slate-900 p-6 text-center font-mono text-xs text-slate-400">

                Waiting for eligibility analysis...

              </div>

            )}

          </div>


          {/* ---------------------------------------------
              CHART
          --------------------------------------------- */}

          <div className="card">

            <h2 className="mb-3 text-sm font-bold text-slate-900">
              Estimated Value by Recommended Scheme
            </h2>

            {chartData.length > 0 ? (

              <div className="h-64 w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 10,
                      left: -20,
                      bottom: 30,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      fontSize={10}
                    />

                    <YAxis fontSize={11} />

                    <Tooltip
                      formatter={(value) => [
                        `₹${Number(
                          value || 0
                        ).toLocaleString()}`,
                        "Estimated value",
                      ]}
                    />

                    <Bar
                      dataKey="value"
                      fill="#4f46e5"
                      radius={[6, 6, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            ) : (

              <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 text-center">

                <div>

                  <p className="text-sm font-semibold text-slate-500">
                    No scheme data yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Run an eligibility analysis to see
                    your estimated benefits.
                  </p>

                </div>

              </div>

            )}

            <p className="mt-2 text-xs text-slate-400">
              Estimated values are indicative, not guaranteed.
            </p>

          </div>


          {/* ---------------------------------------------
              DISCLAIMER
          --------------------------------------------- */}

          {hasAnalysis && analysis?.disclaimer && (

            <div className="lg:col-span-2">

              <Disclaimer
                text={analysis.disclaimer}
              />

            </div>

          )}

        </div>

      )}


      {/* =================================================
          ELIGIBLE SCHEMES TAB
      ================================================= */}

      {tab === "Eligible Schemes" && (

        <div className="space-y-6">

          {[
            "eligible",
            "potentially_eligible",
            "needs_verification",
            "not_eligible",
          ].map((key) => {

            const list = eligibility[key] || [];

            if (!list.length) {
              return null;
            }

            const titles = {
              eligible: "Eligible",

              potentially_eligible:
                "Potentially Eligible",

              needs_verification:
                "Needs Verification",

              not_eligible:
                "Not Eligible",
            };

            return (

              <div key={key}>

                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">

                  {titles[key]} ({list.length})

                </h3>

                <div className="grid gap-4 md:grid-cols-2">

                  {list.map((evaluation) => (

                    <SchemeReasoningCard
                      key={evaluation.scheme_id}
                      evaluation={evaluation}
                    />

                  ))}

                </div>

              </div>

            );

          })}


          {!Object.values(eligibility).some(
            (list) => list?.length > 0
          ) && (

            <div className="card text-center">

              <p className="text-sm font-semibold text-slate-600">
                No eligibility results yet.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Run your eligibility analysis to see
                recommended government schemes.
              </p>

              <button
                className="btn-primary mt-4"
                onClick={() => navigate("/analysis")}
              >
                Run Analysis
                <ArrowRight size={16} />
              </button>

            </div>

          )}

        </div>

      )}


      {/* =================================================
          CONFLICTS TAB
      ================================================= */}

      {tab === "Conflicts" && (

        <div className="space-y-4">

          {conflicts.length === 0 && (

            <div className="card text-center text-sm text-slate-500">

              {hasAnalysis
                ? "No conflicts detected among your eligible schemes. 🎉"
                : "No conflict analysis available yet. Run an eligibility analysis first."}

            </div>

          )}

          {conflicts.map((conflict, i) => (

            <div
              key={i}
              className="card border-rose-100"
            >

              <div className="mb-2 flex items-center gap-2">

                <ConflictWarningIcon />

                <h3 className="text-sm font-bold text-slate-900">

                  {conflict.scheme_a?.name ||
                    "Scheme A"}

                  <span className="text-slate-400">
                    {" "}↔{" "}
                  </span>

                  {conflict.scheme_b?.name ||
                    "Scheme B"}

                </h3>

              </div>

              <p className="text-sm text-slate-600">

                <span className="font-semibold">
                  Reason:
                </span>{" "}

                {conflict.reason ||
                  "No reason provided."}

              </p>

              <p className="mt-1 text-sm text-slate-600">

                <span className="font-semibold">
                  Recommended action:
                </span>{" "}

                {conflict.recommended_action ||
                  "Please verify the scheme requirements."}

              </p>

              {conflict.disclaimer && (

                <p className="mt-2 text-xs text-rose-500">
                  {conflict.disclaimer}
                </p>

              )}

            </div>

          ))}

        </div>

      )}


      {/* =================================================
          RECOMMENDED BUNDLE TAB
      ================================================= */}

      {tab === "Recommended Bundle" && (

        <div className="space-y-6">

          {/* ---------------------------------------------
              BUNDLE SUMMARY
          --------------------------------------------- */}

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="card text-center">

              <p className="text-xs font-semibold uppercase text-slate-400">
                Estimated Combined Value
              </p>

              <p className="mt-1 text-2xl font-extrabold text-brand-700">

                ₹
                {Number(
                  bundle.estimated_combined_value || 0
                ).toLocaleString()}

              </p>

            </div>


            <div className="card text-center">

              <p className="text-xs font-semibold uppercase text-slate-400">
                Bundle Optimization Score
              </p>

              <p className="mt-1 text-2xl font-extrabold text-emerald-600">

                {bundle.bundle_optimization_score || 0}
                /100

              </p>

            </div>


            <div className="card text-center">

              <p className="text-xs font-semibold uppercase text-slate-400">
                Schemes in Bundle
              </p>

              <p className="mt-1 text-2xl font-extrabold text-slate-800">

                {bundle.bundle.length}

              </p>

            </div>

          </div>


          {/* ---------------------------------------------
              BUNDLE SCHEMES
          --------------------------------------------- */}

          {bundle.bundle.length > 0 ? (

            <div className="grid gap-4 md:grid-cols-2">

              {bundle.bundle.map((scheme, idx) => {

                const explanation =
                  explanations.find(
                    (item) =>
                      item.scheme_id ===
                      scheme.scheme_id
                  );

                return (

                  <div
                    key={scheme.scheme_id}
                    className="card"
                  >

                    <div className="mb-2 flex items-start justify-between gap-3">

                      <h3 className="text-sm font-bold text-slate-900">

                        {idx + 1}.{" "}

                        {scheme.scheme_name}

                      </h3>

                      <TagBadge tone="brand">
                        Score{" "}
                        {scheme.optimization_score}
                      </TagBadge>

                    </div>


                    <p className="text-xs text-slate-500">
                      {scheme.benefit}
                    </p>


                    <p className="mt-2 text-sm text-slate-600">

                      <span className="font-semibold">
                        Reason:
                      </span>{" "}

                      {scheme.explanation}

                    </p>


                    {explanation && (

                      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">

                        <p className="mb-1 font-semibold text-slate-600">
                          Because you are:
                        </p>

                        <div className="mb-2 flex flex-wrap gap-1">

                          {(
                            explanation.because_you_are ||
                            []
                          ).map((text, i) => (

                            <TagBadge key={i}>
                              {text}
                            </TagBadge>

                          ))}

                        </div>


                        <p className="text-slate-500">

                          Confidence:{" "}

                          <span className="font-semibold text-slate-700">
                            {explanation.confidence || 0}%
                          </span>

                        </p>


                        {explanation.note && (

                          <p className="mt-1 text-[11px] text-slate-400">
                            {explanation.note}
                          </p>

                        )}

                      </div>

                    )}

                  </div>

                );

              })}

            </div>

          ) : (

            <div className="card text-center">

              <p className="text-sm font-semibold text-slate-600">
                No recommended bundle yet.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Run your eligibility analysis first.
              </p>

              <button
                className="btn-primary mt-4"
                onClick={() => navigate("/analysis")}
              >
                Run Analysis
                <ArrowRight size={16} />
              </button>

            </div>

          )}


          {/* ---------------------------------------------
              EXCLUDED SCHEMES
          --------------------------------------------- */}

          {bundle.excluded_due_to_conflict?.length > 0 && (

            <div>

              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">

                Excluded From Bundle (Conflict)

              </h3>

              <div className="grid gap-3 md:grid-cols-2">

                {bundle.excluded_due_to_conflict.map(
                  (scheme) => (

                    <div
                      key={scheme.scheme_id}
                      className="card border-slate-100 opacity-80"
                    >

                      <p className="text-sm font-semibold text-slate-700">
                        {scheme.scheme_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {scheme.excluded_reason}
                      </p>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

        </div>

      )}

      {/* =================================================
          YOJNASETU AI CHATBOT
      ================================================= */}

      <AIChatbot
        profile={profile}
        analysis={analysis}
      />

    </div>
  );
}