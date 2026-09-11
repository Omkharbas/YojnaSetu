import React from "react";
import {
  Cpu,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  FileText,
  ListOrdered,
  Loader2,
} from "lucide-react";

export default function AgentWorkflow({
  currentStage = 1,
  logs = [],
}) {
  const stages = [
    {
      id: 1,
      label: "Profile Analyzer",
      icon: Cpu,
      tool: "analyze_citizen_profile()",
    },
    {
      id: 2,
      label: "Eligibility Reasoner",
      icon: CheckCircle2,
      tool: "evaluate_scheme_eligibility()",
    },
    {
      id: 3,
      label: "Conflict Detector",
      icon: ShieldAlert,
      tool: "detect_scheme_conflicts()",
    },
    {
      id: 4,
      label: "Benefit Optimizer",
      icon: Sparkles,
      tool: "optimize_scheme_bundle()",
    },
    {
      id: 5,
      label: "Document Checker",
      icon: FileText,
      tool: "check_required_documents()",
    },
    {
      id: 6,
      label: "Application Planner",
      icon: ListOrdered,
      tool: "generate_recommendations_and_application_plan()",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">

      {/* HEADER */}
      <div className="border-b border-slate-100 bg-slate-950 px-6 py-5 text-white">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold">
                YojnaSetu Agent
              </h3>

              <p className="text-xs text-slate-400">
                Autonomous Citizen Benefit Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            AGENT ACTIVE
          </div>

        </div>
      </div>

      {/* MAIN WORKFLOW */}
      <div className="p-6">

        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Agent Execution
          </p>

          <p className="mt-1 text-sm text-slate-600">
            The agent is selecting and executing tools to build your
            personalized benefit plan.
          </p>
        </div>

        <div className="space-y-3">

          {stages.map((stage) => {
            const Icon = stage.icon;

            const isDone = currentStage > stage.id;
            const isCurrent = currentStage === stage.id;
            const isPending = currentStage < stage.id;

            return (
              <div
                key={stage.id}
                className={`relative rounded-2xl border p-4 transition-all duration-500 ${
                  isCurrent
                    ? "border-blue-300 bg-blue-50 shadow-md"
                    : isDone
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >

                <div className="flex items-center gap-4">

                  {/* STATUS ICON */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isCurrent
                        ? "bg-blue-600 text-white"
                        : isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isCurrent ? (
                      <Loader2
                        size={20}
                        className="animate-spin"
                      />
                    ) : isDone ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between gap-3">

                      <p className="text-sm font-bold text-slate-800">
                        {stage.label}
                      </p>

                      <span
                        className={`shrink-0 text-[10px] font-bold uppercase tracking-wide ${
                          isCurrent
                            ? "text-blue-600"
                            : isDone
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {isCurrent
                          ? "Running"
                          : isDone
                          ? "Completed"
                          : "Waiting"}
                      </span>

                    </div>

                    {/* TOOL CALL */}
                    <p
                      className={`mt-1 font-mono text-[11px] ${
                        isCurrent
                          ? "text-blue-600"
                          : isDone
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      → {stage.tool}
                    </p>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

        {/* ACTIVITY LOG */}
        {logs.length > 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-950 p-4">

            <div className="mb-3 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-400" />

              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Agent Activity Log
              </p>
            </div>

            <div className="max-h-40 space-y-2 overflow-y-auto">

              {logs.slice(-8).map((log, index) => (
                <div
                  key={`${log}-${index}`}
                  className="flex gap-2 font-mono text-[11px]"
                >
                  <span className="text-emerald-400">
                    ✓
                  </span>

                  <span className="text-slate-300">
                    {log}
                  </span>
                </div>
              ))}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}