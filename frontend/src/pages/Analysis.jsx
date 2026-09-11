import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScanSearch,
  Brain,
  ShieldAlert,
  Layers,
  FileWarning,
  ListChecks,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { analyzeProfile } from "../services/api";

const STAGES = [
  {
    key: "profile",
    icon: ScanSearch,
    title: "Profile Analyzer",
    message: "Analyzing citizen profile...",
  },
  {
    key: "eligibility",
    icon: Brain,
    title: "Eligibility Reasoner",
    message: "Evaluating schemes against eligibility rules...",
  },
  {
    key: "conflict",
    icon: ShieldAlert,
    title: "Conflict Detector",
    message: "Detecting scheme conflicts...",
  },
  {
    key: "optimizer",
    icon: Layers,
    title: "Benefit Optimizer",
    message: "Optimizing benefit bundle...",
  },
  {
    key: "documents",
    icon: FileWarning,
    title: "Document Checker",
    message: "Checking required documents...",
  },
  {
    key: "planner",
    icon: ListChecks,
    title: "Application Planner",
    message: "Generating personalized application plan...",
  },
];

export default function Analysis() {
  const { profile, setAnalysis } = useApp();
  const navigate = useNavigate();

  const [activeStage, setActiveStage] = useState(0);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let interval;

    const runAnalysis = async () => {
      try {
        console.log("🚀 Starting analysis...");
        console.log("Profile:", profile);

        // Visual stage animation
        let stage = 0;

        interval = setInterval(() => {
          if (cancelled) return;

          stage++;

          if (stage < STAGES.length) {
            setActiveStage(stage);
          }
        }, 900);

        // Call backend
        const result = await analyzeProfile(profile);

        console.log("✅ Analysis response received:", result);

        if (cancelled) return;

        clearInterval(interval);

        // Validate response
        if (!result || typeof result !== "object") {
          throw new Error("Invalid response received from backend.");
        }

        // Mark all stages completed
        setActiveStage(STAGES.length);
        setCompleted(true);

        // Store analysis result
        setAnalysis(result);

        console.log("✅ Analysis saved successfully");

        // Give the UI time to show completion
        setTimeout(() => {
          if (!cancelled) {
            navigate("/dashboard", { replace: true });
          }
        }, 800);

      } catch (err) {
        console.error("❌ Analysis error:", err);

        if (cancelled) return;

        clearInterval(interval);

        setError(
          err?.message ||
            "Analysis failed. Please check that the backend is running."
        );
      }
    };

    runAnalysis();

    return () => {
      cancelled = true;

      if (interval) {
        clearInterval(interval);
      }
    };
  }, [profile, setAnalysis, navigate]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 sm:px-6">

      <h1 className="mb-1 text-2xl font-bold text-slate-900">
        AI Benefit Planning Agent
      </h1>

      <p className="mb-10 text-sm text-slate-500">
        Running the agentic reasoning pipeline for{" "}
        {profile?.name || "your"} profile...
      </p>

      {/* ERROR */}
      {error && (
        <div className="mb-8 w-full rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">

          <div className="flex items-start gap-3">

            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-bold">
                Analysis failed
              </p>

              <p className="mt-1">
                {error}
              </p>

              <p className="mt-3 text-xs">
                Backend should be running at:
              </p>

              <code className="mt-1 block rounded bg-rose-100 px-2 py-1 text-xs">
                http://localhost:8000
              </code>
            </div>

          </div>

          <div className="mt-4 flex gap-3">

            <button
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>

            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
              onClick={() => navigate("/profile")}
            >
              Back to Profile
            </button>

          </div>

        </div>
      )}

      {/* ANALYSIS PIPELINE */}
      <div className="w-full space-y-3">

        {STAGES.map((stage, idx) => {

          const Icon = stage.icon;

          const isDone =
            completed || idx < activeStage;

          const isActive =
            !completed &&
            !error &&
            idx === activeStage;

          const isPending =
            !completed &&
            idx > activeStage;

          return (
            <div
              key={stage.key}
              className={`flex items-center gap-4 rounded-2xl border p-4 transition-all duration-500 ${
                isActive
                  ? "border-brand-300 bg-brand-50 shadow-soft"
                  : isDone
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-100 bg-white opacity-60"
              }`}
            >

              {/* ICON */}
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >

                {isDone ? (
                  <CheckCircle2 size={20} />
                ) : isActive ? (
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                ) : (
                  <Icon size={20} />
                )}

              </div>

              {/* TEXT */}
              <div className="flex-1">

                <p className="text-sm font-bold text-slate-800">
                  {stage.title}
                </p>

                <p className="text-xs text-slate-500">

                  {isDone
                    ? "Completed"
                    : isActive
                    ? stage.message
                    : isPending
                    ? "Waiting..."
                    : ""}

                </p>

              </div>

            </div>
          );
        })}

      </div>

      {/* SUCCESS */}
      {completed && (
        <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-emerald-600">

          <CheckCircle2 size={18} />

          Analysis complete! Opening your dashboard...

        </div>
      )}

    </div>
  );
}