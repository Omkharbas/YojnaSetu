import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, ScanSearch, ShieldAlert, Layers, ListChecks,
  Sparkles, FileWarning, Brain, Search,
} from "lucide-react";
import { Disclaimer, SAMPLE_DATA_NOTICE } from "../components/UI";

const workflow = [
  { icon: ScanSearch, label: "Profile" },
  { icon: Brain, label: "AI Reasoning" },
  { icon: Sparkles, label: "Eligibility" },
  { icon: ShieldAlert, label: "Conflicts" },
  { icon: Layers, label: "Optimized Bundle" },
  { icon: FileWarning, label: "Missing Documents" },
  { icon: ListChecks, label: "Application Checklist" },
];

const features = [
  { icon: Brain, title: "Agentic AI Reasoning", desc: "A multi-stage reasoning agent evaluates every scheme, not a simple keyword filter." },
  { icon: ShieldAlert, title: "Conflict Detection", desc: "Flags mutually-exclusive or overlapping schemes before you waste effort applying." },
  { icon: Layers, title: "Bundle Optimization", desc: "Finds the highest-value, conflict-free combination of schemes — not just a long list." },
  { icon: FileWarning, title: "Document Intelligence", desc: "Compares what you have vs. what's required, and tells you exactly what's missing." },
];

export default function Landing() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <span className="badge border border-brand-100 bg-brand-50 text-brand-700 mb-4">
          <Sparkles size={13} /> Agentic Citizen-Benefits Assistant
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Find the government benefits you're eligible for.
        </h1>
        <p className="mt-4 text-lg text-slate-500">
          CivicBenefit AI analyzes your profile, identifies eligible schemes, detects conflicts,
          and builds a personalized, optimized application plan.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/profile" className="btn-primary text-base px-6 py-3">
            Check My Eligibility <ArrowRight size={18} />
          </Link>
          <Link to="/schemes" className="btn-secondary text-base px-6 py-3">
            <Search size={18} /> Explore Schemes
          </Link>
        </div>
      </div>

      <div className="mt-14 overflow-x-auto">
        <div className="mx-auto flex min-w-[720px] max-w-5xl items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          {workflow.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon size={20} />
                  </div>
                  <span className="w-24 text-xs font-semibold text-slate-600">{step.label}</span>
                </div>
                {idx < workflow.length - 1 && (
                  <div className="mx-1 h-px flex-1 bg-slate-200" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600/10 text-brand-600">
                <Icon size={20} />
              </div>
              <h3 className="mb-1 text-sm font-bold text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-14 rounded-2xl border border-slate-100 bg-white p-8 shadow-soft">
        <h2 className="text-xl font-bold text-slate-900">Don't just search schemes. Optimize them.</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Most portals just list every scheme you might qualify for. CivicBenefit AI goes further —
          it reasons through eligibility rules, detects incompatible combinations, and recommends the
          best-performing bundle of schemes for your specific situation, along with exactly which
          documents you still need and what to do next.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Agentic AI", "Rule Reasoning", "Personalization", "Optimization", "Conflict Detection", "Explainable Recommendations", "Document Intelligence", "Citizen-Centric Automation"].map((tag) => (
            <span key={tag} className="badge bg-slate-100 text-slate-600">{tag}</span>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <Disclaimer text={SAMPLE_DATA_NOTICE} />
      </div>
    </div>
  );
}
