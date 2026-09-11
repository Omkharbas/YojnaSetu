import React from "react";
import { AlertTriangle, CheckCircle2, HelpCircle, XCircle, Info } from "lucide-react";

const STATUS_CONFIG = {
  ELIGIBLE: { label: "Eligible", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2, dot: "🟢" },
  POTENTIALLY_ELIGIBLE: { label: "Potentially Eligible", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2, dot: "🟢" },
  NEEDS_VERIFICATION: { label: "Needs Verification", color: "bg-orange-50 text-orange-700 border-orange-200", icon: HelpCircle, dot: "🟠" },
  NOT_ELIGIBLE: { label: "Not Eligible", color: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle, dot: "🔴" },
};

export function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NEEDS_VERIFICATION;
  const Icon = cfg.icon;
  return (
    <span className={`badge border ${cfg.color}`}>
      <Icon size={13} />
      {cfg.label}
    </span>
  );
}

export function ConfidenceMeter({ value }) {
  const color = value >= 70 ? "bg-emerald-500" : value >= 40 ? "bg-orange-400" : "bg-rose-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-500">{value}%</span>
    </div>
  );
}

export function Disclaimer({ text }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
      <Info size={15} className="mt-0.5 shrink-0" />
      <p>{text}</p>
    </div>
  );
}

export function TagBadge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    brand: "bg-brand-50 text-brand-700",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    red: "bg-rose-50 text-rose-700",
  };
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}

export function ConflictWarningIcon() {
  return <AlertTriangle size={16} className="text-rose-500" />;
}

export const SAMPLE_DATA_NOTICE =
  "Prototype knowledge base — sample data for demo purposes only. Verify actual eligibility from official government portals.";
