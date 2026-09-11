import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Circle, Printer } from "lucide-react";
import { useApp } from "../context/AppContext";
import { TagBadge } from "../components/UI";

export default function ApplicationPlanner() {
  const { analysis, completedSteps, setCompletedSteps } = useApp();
  const navigate = useNavigate();

  if (!analysis) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-xl font-bold text-slate-900">No application plan yet</h1>
        <p className="mt-2 text-sm text-slate-500">Run an analysis from your citizen profile first.</p>
        <button className="btn-primary mt-6" onClick={() => navigate("/profile")}>
          Go to Citizen Profile <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const { application_plan, documents, bundle } = analysis;
  const steps = application_plan.steps;

  const isChecked = (step) =>
    step.status === "done" || !!completedSteps[step.step];

  const toggleStep = (step) => {
    if (step.status === "done") return;
    setCompletedSteps((prev) => ({ ...prev, [step.step]: !prev[step.step] }));
  };

  const completedCount = steps.filter(isChecked).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Application Planner</h1>
          <p className="text-sm text-slate-500">Your personalized application checklist and missing-document report.</p>
        </div>
        <button onClick={() => window.print()} className="btn-secondary">
          <Printer size={16} /> Print / Download Checklist
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Your Application Plan</h2>
              <span className="text-xs font-semibold text-brand-700">{completedCount} / {steps.length} completed</span>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-brand-600 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="space-y-2">
              {steps.map((step) => (
                <label
                  key={step.step}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                    isChecked(step) ? "border-emerald-100 bg-emerald-50/60" : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <button type="button" onClick={() => toggleStep(step)} className="mt-0.5 shrink-0">
                    {isChecked(step) ? (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    ) : (
                      <Circle size={18} className="text-slate-300" />
                    )}
                  </button>
                  <div>
                    <p className={`font-medium ${isChecked(step) ? "text-slate-500 line-through" : "text-slate-800"}`}>
                      Step {step.step}: {step.title}
                    </p>
                    {step.required_for && (
                      <p className="mt-0.5 text-xs text-slate-400">Required for: {step.required_for.join(", ")}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="mb-3 text-sm font-bold text-slate-900">Missing Documents</h2>
            {documents.missing_documents.length === 0 && (
              <p className="text-sm text-emerald-600">All required documents are available. 🎉</p>
            )}
            <div className="space-y-3">
              {documents.missing_documents.map((d, i) => (
                <div key={i} className="rounded-xl border border-orange-100 bg-orange-50 p-3 text-xs">
                  <p className="font-semibold text-orange-700">
                    {d.severity === "high" ? "🔴" : "🟠"} {d.document}
                  </p>
                  <p className="mt-1 text-orange-600">Required for: {d.required_for.join(", ")}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="mb-3 text-sm font-bold text-slate-900">Documents Already Available</h2>
            <div className="flex flex-wrap gap-1.5">
              {documents.available_documents_used.map((d, i) => (
                <TagBadge key={i} tone="green">✓ {d.document}</TagBadge>
              ))}
              {documents.available_documents_used.length === 0 && (
                <p className="text-xs text-slate-400">None of the required documents are on file yet.</p>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="mb-3 text-sm font-bold text-slate-900">Recommended Schemes</h2>
            <ul className="space-y-1.5 text-sm text-slate-600">
              {bundle.bundle.map((s) => (
                <li key={s.scheme_id} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> {s.scheme_name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
