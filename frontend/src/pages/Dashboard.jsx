import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers, ShieldAlert, ListChecks, FileWarning, CheckCircle2, ArrowRight, Terminal,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useApp } from "../context/AppContext";
import SummaryCard from "../components/SummaryCard";
import SchemeReasoningCard from "../components/SchemeReasoningCard";
import { Disclaimer, TagBadge, ConflictWarningIcon } from "../components/UI";

const TABS = ["Overview", "Eligible Schemes", "Conflicts", "Recommended Bundle"];

export default function Dashboard() {
  const { analysis, profile } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Overview");

  if (!analysis) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-xl font-bold text-slate-900">No analysis yet</h1>
        <p className="mt-2 text-sm text-slate-500">Run an analysis from your citizen profile first.</p>
        <button className="btn-primary mt-6" onClick={() => navigate("/profile")}>
          Go to Citizen Profile <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const { summary, eligibility, conflicts, bundle, explanations, agent_activity_log } = analysis;

  const chartData = bundle.bundle.map((s) => ({
    name: s.scheme_name.length > 18 ? s.scheme_name.slice(0, 18) + "…" : s.scheme_name,
    value: s.estimated_value,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Citizen Benefits Dashboard</h1>
          <p className="text-sm text-slate-500">Results for {profile.name || "citizen"} — {profile.district ? `${profile.district}, ` : ""}{profile.state}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/planner")}>
          Go to Application Planner <ArrowRight size={16} />
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <SummaryCard icon={ListChecks} label="Schemes Analyzed" value={summary.schemes_analyzed} tone="slate" />
        <SummaryCard icon={CheckCircle2} label="Potentially Eligible" value={summary.potentially_eligible} tone="green" />
        <SummaryCard icon={ShieldAlert} label="Conflicts Detected" value={summary.conflicts_detected} tone="red" />
        <SummaryCard icon={Layers} label="Recommended Schemes" value={summary.recommended_schemes} tone="brand" />
        <SummaryCard icon={FileWarning} label="Documents Missing" value={summary.documents_missing} tone="orange" />
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition ${
              tab === t ? "border-brand-600 text-brand-700" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
              <Terminal size={16} className="text-brand-600" /> Agent Activity Log
            </h2>
            <div className="space-y-1.5 rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-300">
              {agent_activity_log.map((line, i) => (
                <div key={i}>✓ {line}</div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 className="mb-3 text-sm font-bold text-slate-900">Estimated Value by Recommended Scheme</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} fontSize={10} />
                  <YAxis fontSize={11} />
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Estimated value"]} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-slate-400">Estimated values are indicative, not guaranteed.</p>
          </div>
          <div className="lg:col-span-2">
            <Disclaimer text={analysis.disclaimer} />
          </div>
        </div>
      )}

      {tab === "Eligible Schemes" && (
        <div className="space-y-6">
          {["eligible", "potentially_eligible", "needs_verification", "not_eligible"].map((key) => {
            const list = eligibility[key];
            if (!list.length) return null;
            const titles = {
              eligible: "Eligible", potentially_eligible: "Potentially Eligible",
              needs_verification: "Needs Verification", not_eligible: "Not Eligible",
            };
            return (
              <div key={key}>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{titles[key]} ({list.length})</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {list.map((e) => <SchemeReasoningCard key={e.scheme_id} evaluation={e} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "Conflicts" && (
        <div className="space-y-4">
          {conflicts.length === 0 && (
            <div className="card text-center text-sm text-slate-500">No conflicts detected among your eligible schemes. 🎉</div>
          )}
          {conflicts.map((c, i) => (
            <div key={i} className="card border-rose-100">
              <div className="mb-2 flex items-center gap-2">
                <ConflictWarningIcon />
                <h3 className="text-sm font-bold text-slate-900">
                  {c.scheme_a.name} <span className="text-slate-400">↔</span> {c.scheme_b.name}
                </h3>
              </div>
              <p className="text-sm text-slate-600"><span className="font-semibold">Reason: </span>{c.reason}</p>
              <p className="mt-1 text-sm text-slate-600"><span className="font-semibold">Recommended action: </span>{c.recommended_action}</p>
              <p className="mt-2 text-xs text-rose-500">{c.disclaimer}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "Recommended Bundle" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card text-center">
              <p className="text-xs font-semibold uppercase text-slate-400">Estimated Combined Value</p>
              <p className="mt-1 text-2xl font-extrabold text-brand-700">₹{bundle.estimated_combined_value.toLocaleString()}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs font-semibold uppercase text-slate-400">Bundle Optimization Score</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-600">{bundle.bundle_optimization_score}/100</p>
            </div>
            <div className="card text-center">
              <p className="text-xs font-semibold uppercase text-slate-400">Schemes in Bundle</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-800">{bundle.bundle.length}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {bundle.bundle.map((s, idx) => {
              const explanation = explanations.find((e) => e.scheme_id === s.scheme_id);
              return (
                <div key={s.scheme_id} className="card">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{idx + 1}. {s.scheme_name}</h3>
                    <TagBadge tone="brand">Score {s.optimization_score}</TagBadge>
                  </div>
                  <p className="text-xs text-slate-500">{s.benefit}</p>
                  <p className="mt-2 text-sm text-slate-600">Reason: {s.explanation}</p>
                  {explanation && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">
                      <p className="mb-1 font-semibold text-slate-600">Because you are:</p>
                      <div className="mb-2 flex flex-wrap gap-1">
                        {explanation.because_you_are.map((t, i) => <TagBadge key={i}>{t}</TagBadge>)}
                      </div>
                      <p className="text-slate-500">Confidence: <span className="font-semibold text-slate-700">{explanation.confidence}%</span></p>
                      <p className="mt-1 text-[11px] text-slate-400">{explanation.note}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {bundle.excluded_due_to_conflict.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Excluded From Bundle (Conflict)</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {bundle.excluded_due_to_conflict.map((s) => (
                  <div key={s.scheme_id} className="card border-slate-100 opacity-80">
                    <p className="text-sm font-semibold text-slate-700">{s.scheme_name}</p>
                    <p className="mt-1 text-xs text-slate-500">{s.excluded_reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
