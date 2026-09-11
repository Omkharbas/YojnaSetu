import React from "react";

export default function SummaryCard({ icon: Icon, label, value, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-600/10 text-brand-600",
    green: "bg-emerald-500/10 text-emerald-600",
    red: "bg-rose-500/10 text-rose-600",
    orange: "bg-orange-500/10 text-orange-600",
    slate: "bg-slate-500/10 text-slate-600",
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}
