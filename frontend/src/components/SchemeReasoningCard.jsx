import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { StatusPill, ConfidenceMeter, TagBadge } from "./UI";

export default function SchemeReasoningCard({ evaluation }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{evaluation.scheme_name}</h3>
            <TagBadge tone="brand">{evaluation.category}</TagBadge>
            <TagBadge>{evaluation.level}</TagBadge>
          </div>
          <p className="mt-1 text-xs text-slate-500">{evaluation.benefit}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusPill status={evaluation.status} />
          <ConfidenceMeter value={evaluation.confidence} />
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-600">{evaluation.explanation}</p>

      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
      >
        {open ? "Hide reasoning" : "Show reasoning"}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 text-xs fade-in">
          {evaluation.rules_passed.map((r, i) => (
            <div key={`p${i}`} className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={14} /> {r} — PASS
            </div>
          ))}
          {evaluation.rules_needs_verification.map((r, i) => (
            <div key={`v${i}`} className="flex items-center gap-2 text-orange-600">
              <HelpCircle size={14} /> {r} — VERIFY
            </div>
          ))}
          {evaluation.rules_failed.map((r, i) => (
            <div key={`f${i}`} className="flex items-center gap-2 text-rose-600">
              <XCircle size={14} /> {r} — FAIL
            </div>
          ))}
          {evaluation.verification_items?.filter((v) => !v.available).map((v, i) => (
            <div key={`dv${i}`} className="flex items-center gap-2 text-orange-600">
              <HelpCircle size={14} /> Document verification needed: {v.document}
            </div>
          ))}
          <div className="pt-1 font-semibold text-slate-700">
            Final: {evaluation.status.replaceAll("_", " ")}
          </div>
        </div>
      )}
    </div>
  );
}
