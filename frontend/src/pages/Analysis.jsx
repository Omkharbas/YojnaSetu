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
  Cpu,
  Sparkles,
  Wrench,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { analyzeProfile } from "../services/api";

const STAGES = [
  {
    key: "profile",
    icon: ScanSearch,
    title: "Profile Analyzer",
    tool: "analyze_citizen_profile()",
    message: "Analyzing citizen profile...",
  },
  {
    key: "eligibility",
    icon: Brain,
    title: "Eligibility Reasoner",
    tool: "evaluate_scheme_eligibility()",
    message: "Evaluating schemes against eligibility rules...",
  },
  {
    key: "conflict",
    icon: ShieldAlert,
    title: "Conflict Detector",
    tool: "detect_scheme_conflicts()",
    message: "Detecting scheme conflicts...",
  },
  {
    key: "optimizer",
    icon: Layers,
    title: "Benefit Optimizer",
    tool: "optimize_scheme_bundle()",
    message: "Optimizing benefit bundle...",
  },
  {
    key: "documents",
    icon: FileWarning,
    title: "Document Checker",
    tool: "check_required_documents()",
    message: "Checking required documents...",
  },
  {
    key: "planner",
    icon: ListChecks,
    title: "Application Planner",
    tool: "generate_recommendations_and_application_plan()",
    message: "Generating personalized application plan...",
  },
];

const ACTIVITY_LOGS = [
  "Initializing YojnaSetu benefit agent...",
  "Reading citizen profile parameters...",
  "Normalizing income and household data...",
  "Evaluating scheme eligibility rules...",
  "Checking for scheme conflicts...",
  "Optimizing available benefit combinations...",
  "Checking required documents...",
  "Generating personalized application plan...",
];

export default function Analysis() {
  const { profile, setAnalysis } = useApp();
  const navigate = useNavigate();

  const [activeStage, setActiveStage] = useState(0);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);

  const [logs, setLogs] = useState([
    "Initializing YojnaSetu benefit agent...",
  ]);

  const [toolCalls, setToolCalls] = useState([]);

  useEffect(() => {
    let cancelled = false;
    let interval;
    let logInterval;

    const runAnalysis = async () => {
      try {
        console.log("🚀 Starting analysis...");
        console.log("Profile:", profile);

        let stage = 0;
        let logIndex = 0;

        // =====================================================
        // VISUAL STAGE ANIMATION
        // =====================================================

        interval = setInterval(() => {
          if (cancelled) return;

          stage++;

          if (stage < STAGES.length) {
            setActiveStage(stage);
          }
        }, 1200);

        // =====================================================
        // VISUAL ACTIVITY LOG
        // =====================================================

        logInterval = setInterval(() => {
          if (cancelled) return;

          logIndex++;

          if (logIndex < ACTIVITY_LOGS.length) {
            setLogs((prev) => [
              ...prev.slice(-7),
              ACTIVITY_LOGS[logIndex],
            ]);
          }
        }, 850);

        // =====================================================
        // CLEAN PROFILE
        // =====================================================

        const cleanProfile = {
          ...profile,

          age: Number(profile.age) || 0,

          annual_income:
            Number(profile.annual_income) || 0,

          family_members:
            Number(profile.family_members) || 1,

          children:
            Number(profile.children) || 0,

          girl_children:
            Number(profile.girl_children) || 0,
        };

        // =====================================================
        // BACKEND AGENT CALL
        // =====================================================

        const result = await analyzeProfile(cleanProfile);

        console.log("✅ Analysis response received:", result);

        if (cancelled) return;

        clearInterval(interval);
        clearInterval(logInterval);

        // =====================================================
        // VALIDATE RESPONSE
        // =====================================================

        if (!result || typeof result !== "object") {
          throw new Error(
            "Invalid response received from backend."
          );
        }

        // =====================================================
        // GET REAL TOOL CALL DATA
        // =====================================================

        const backendToolCalls =
          Array.isArray(result.agent_tool_calls)
            ? result.agent_tool_calls
            : [];

        setToolCalls(backendToolCalls);

        // =====================================================
        // COMPLETE ALL STAGES
        // =====================================================

        setActiveStage(STAGES.length);
        setCompleted(true);

        setLogs((prev) => [
          ...prev,
          "Agent analysis completed successfully.",
          "Final benefit bundle prepared.",
        ]);

        // =====================================================
        // SAVE ANALYSIS
        // =====================================================

        setAnalysis(result);

        console.log("✅ Analysis saved successfully");

        // =====================================================
        // REDIRECT
        // =====================================================

        setTimeout(() => {
          if (!cancelled) {
            navigate("/dashboard", {
              replace: true,
            });
          }
        }, 1800);
      } catch (err) {
        console.error("❌ Analysis error:", err);

        if (cancelled) return;

        clearInterval(interval);
        clearInterval(logInterval);

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

      if (logInterval) {
        clearInterval(logInterval);
      }
    };
  }, [profile, setAnalysis, navigate]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      
      {/* ================================================= */}
      {/* AGENT HEADER */}
      {/* ================================================= */}

      <div className="mb-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">

        <div className="flex items-center justify-between px-6 py-5 sm:px-8">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <Sparkles
                size={23}
                className="animate-pulse"
              />
            </div>

            <div>
              <p className="text-lg font-bold text-white">
                YojnaSetu Agent
              </p>

              <p className="text-xs text-slate-400">
                Autonomous Citizen Benefit Analysis
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">

            <span
              className={`h-2 w-2 rounded-full ${
                completed
                  ? "bg-emerald-400"
                  : "bg-blue-400 animate-pulse"
              }`}
            />

            <span className="text-[10px] font-bold tracking-wider text-emerald-400">
              {completed
                ? "COMPLETE"
                : "AGENT ACTIVE"}
            </span>

          </div>

        </div>

        <div className="border-t border-slate-800 bg-slate-900/80 px-6 py-3 sm:px-8">

          <div className="flex items-center gap-2 text-xs text-slate-400">

            <Cpu
              size={14}
              className="text-blue-400"
            />

            <span>
              Agent is selecting and executing analysis tools...
            </span>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* TITLE */}
      {/* ================================================= */}

      <div className="mb-8">

        <h1 className="text-2xl font-bold text-slate-900">
          AI Benefit Planning Agent
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Running the agentic reasoning pipeline for{" "}
          <span className="font-semibold text-slate-700">
            {profile?.name || "your"} profile
          </span>
          ...
        </p>

      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="mb-8 w-full rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">

          <div className="flex items-start gap-3">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

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

      {/* ================================================= */}
      {/* MAIN GRID */}
      {/* ================================================= */}

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">

        {/* ================================================= */}
        {/* LEFT — PIPELINE */}
        {/* ================================================= */}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Agent Execution
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Multi-stage reasoning and tool execution
              </p>

            </div>

            <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {completed
                ? "6 / 6 Complete"
                : `${Math.min(
                    activeStage + 1,
                    6
                  )} / 6 Running`}
            </div>

          </div>

          <div className="space-y-3">

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
                  className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-500 ${
                    isActive
                      ? "border-blue-300 bg-blue-50 shadow-md shadow-blue-100"
                      : isDone
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >

                  {isActive && (
                    <div className="absolute inset-y-0 left-0 w-1 animate-pulse bg-blue-500" />
                  )}

                  <div className="flex items-center gap-4">

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isActive
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-400"
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

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center justify-between gap-3">

                        <p className="text-sm font-bold text-slate-800">
                          {stage.title}
                        </p>

                        <span
                          className={`shrink-0 text-[10px] font-bold uppercase tracking-wider ${
                            isActive
                              ? "text-blue-600"
                              : isDone
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          {isActive
                            ? "Running"
                            : isDone
                            ? "Completed"
                            : "Waiting"}
                        </span>

                      </div>

                      <p
                        className={`mt-1 font-mono text-[11px] ${
                          isActive
                            ? "text-blue-600"
                            : isDone
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        → {stage.tool}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {isActive
                          ? stage.message
                          : isDone
                          ? "Tool execution completed."
                          : isPending
                          ? "Waiting for previous tool..."
                          : ""}
                      </p>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* ================================================= */}
        {/* RIGHT — REAL TOOL CALLS */}
        {/* ================================================= */}

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl">

          <div className="border-b border-slate-800 px-5 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">

                <Wrench
                  size={17}
                  className="text-blue-400"
                />

              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-widest text-slate-200">
                  Agent Tool Calls
                </p>

                <p className="mt-1 text-[10px] text-slate-500">
                  Backend execution trace
                </p>

              </div>

            </div>

          </div>

          <div className="max-h-[520px] space-y-3 overflow-y-auto p-5">

            {toolCalls.length === 0 && !completed && !error && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">

                <div className="flex items-center gap-3">

                  <Loader2
                    size={16}
                    className="animate-spin text-blue-400"
                  />

                  <div>

                    <p className="text-xs font-semibold text-slate-200">
                      Waiting for tool results...
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      The backend agent is executing tools.
                    </p>

                  </div>

                </div>

              </div>
            )}

            {toolCalls.length === 0 && completed && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">

                <p className="text-xs font-semibold text-amber-300">
                  No tool trace returned
                </p>

                <p className="mt-1 text-[10px] text-slate-500">
                  The analysis completed, but the backend did not return
                  agent_tool_calls data.
                </p>

              </div>
            )}

            {toolCalls.map((call, index) => {

              const isCompleted =
                call?.status === "completed";

              const isWarning =
                call?.status === "warning";

              return (
                <div
                  key={`${call?.tool || "tool"}-${index}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
                >

                  <div className="flex items-start gap-3">

                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isWarning
                          ? "bg-amber-500/10 text-amber-400"
                          : isCompleted
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >

                      {isCompleted ? (
                        <CheckCircle2 size={14} />
                      ) : isWarning ? (
                        <AlertCircle size={14} />
                      ) : (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      )}

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-2">

                        <p className="break-all font-mono text-[11px] font-semibold text-slate-200">
                          {call?.tool || "unknown_tool()"}
                        </p>

                        <span
                          className={`shrink-0 text-[9px] font-bold uppercase tracking-wider ${
                            isWarning
                              ? "text-amber-400"
                              : isCompleted
                              ? "text-emerald-400"
                              : "text-blue-400"
                          }`}
                        >
                          {call?.status || "running"}
                        </span>

                      </div>

                      <p className="mt-2 text-[10px] leading-5 text-slate-400">
                        {call?.message ||
                          "Tool execution in progress..."}
                      </p>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* ACTIVITY LOG */}
      {/* ================================================= */}

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl">

        <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">

            <Cpu
              size={15}
              className="text-blue-400"
            />

          </div>

          <div>

            <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Agent Activity Log
            </p>

            <p className="text-[10px] text-slate-500">
              Reasoning and execution activity
            </p>

          </div>

        </div>

        <div className="max-h-56 space-y-2 overflow-y-auto p-5">

          {logs.slice(-8).map((log, index) => (

            <div
              key={`${log}-${index}`}
              className="flex items-start gap-3 font-mono text-[11px]"
            >

              <span className="mt-0.5 text-emerald-400">
                ✓
              </span>

              <span className="text-slate-300">
                {log}
              </span>

            </div>

          ))}

          {!completed && !error && (

            <div className="flex items-center gap-3 font-mono text-[11px]">

              <Loader2
                size={12}
                className="animate-spin text-blue-400"
              />

              <span className="text-blue-300">
                Agent reasoning in progress...
              </span>

            </div>

          )}

        </div>

      </div>

      {/* ================================================= */}
      {/* SUCCESS */}
      {/* ================================================= */}

      {completed && (

        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-700">

          <CheckCircle2 size={18} />

          Analysis complete! Opening your dashboard...

        </div>

      )}

    </div>
  );
}