import React from "react";
import {
  ArrowRight,
  Search,
  ScanFace,
  Brain,
  Sparkles,
  ShieldAlert,
  Layers3,
  FileWarning,
  ListChecks,
} from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: ScanFace,
    title: "Profile",
  },
  {
    icon: Brain,
    title: "AI Reasoning",
  },
  {
    icon: Sparkles,
    title: "Eligibility",
  },
  {
    icon: ShieldAlert,
    title: "Conflicts",
  },
  {
    icon: Layers3,
    title: "Optimized Bundle",
  },
  {
    icon: FileWarning,
    title: "Missing Documents",
  },
  {
    icon: ListChecks,
    title: "Application Checklist",
  },
];

export default function Landing() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">

        {/* Badge */}

        <div className="flex justify-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">

            <Sparkles size={16} />

            Agentic Citizen-Benefits Assistant

          </div>

        </div>


        {/* Main Heading */}

        <div className="mx-auto mt-7 max-w-5xl text-center">

          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">

            Find the government benefits

            <br />

            you're eligible for.

          </h1>


          <p className="mx-auto mt-7 max-w-4xl text-lg leading-8 text-slate-500 sm:text-xl">

            YojnaSetu analyzes your profile, identifies eligible
            schemes, detects conflicts, and builds a personalized,
            optimized application plan.

          </p>

        </div>


        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">

          {/* CHECK ELIGIBILITY → ANALYSIS */}

          <Link
            to="/analysis"
            className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base"
          >

            Check My Eligibility

            <ArrowRight size={19} />

          </Link>


          {/* EXPLORE SCHEMES */}

          <Link
            to="/schemes"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
          >

            <Search size={19} />

            Explore Schemes

          </Link>

        </div>

      </section>


      {/* =====================================================
          AI WORKFLOW
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">

        <div className="rounded-3xl border border-slate-100 bg-white px-5 py-8 shadow-sm sm:px-8">

          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">

            {steps.map((step, index) => {

              const Icon = step.icon;

              return (
                <React.Fragment key={step.title}>

                  {/* STEP */}

                  <div className="flex min-w-[100px] flex-col items-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">

                      <Icon size={27} />

                    </div>

                    <p className="mt-3 text-sm font-semibold leading-5 text-slate-700">

                      {step.title}

                    </p>

                  </div>


                  {/* CONNECTOR */}

                  {index < steps.length - 1 && (

                    <div className="hidden h-px flex-1 bg-slate-200 lg:block" />

                  )}

                </React.Fragment>
              );

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURE CARDS
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">

        <div className="grid gap-5 md:grid-cols-3">

          {/* CARD 1 */}

          <div className="card">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">

              <Brain size={22} />

            </div>

            <h2 className="text-lg font-bold text-slate-900">
              AI-Powered Reasoning
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
  Instead of simply listing schemes, YojnaSetu
  creates a practical combination of benefits.
</p>

          </div>


          {/* CARD 2 */}

          <div className="card">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">

              <ShieldAlert size={22} />

            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Conflict Detection
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Detect incompatible or overlapping schemes before
              recommending a final benefit combination.
            </p>

          </div>


          {/* CARD 3 */}

          <div className="card">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">

              <Layers3 size={22} />

            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Optimized Benefits
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Instead of simply listing schemes, YojnaSetu
              creates a practical combination of benefits.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="border-t border-slate-100 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-semibold text-brand-600">
              HOW IT WORKS
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              From citizen profile to action plan
            </h2>

            <p className="mt-3 text-slate-500">
              YojnaSetu takes you through the complete
              benefits-discovery process.
            </p>

          </div>


          <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-4">

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

              <span className="text-sm font-bold text-brand-600">
                01
              </span>

              <h3 className="mt-3 font-bold text-slate-900">
                Build Profile
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your personal, financial, family and
                social information.
              </p>

            </div>


            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

              <span className="text-sm font-bold text-brand-600">
                02
              </span>

              <h3 className="mt-3 font-bold text-slate-900">
                Analyze Eligibility
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                The AI evaluates available government schemes
                against your profile.
              </p>

            </div>


            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

              <span className="text-sm font-bold text-brand-600">
                03
              </span>

              <h3 className="mt-3 font-bold text-slate-900">
                Optimize Bundle
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Conflicts and overlaps are detected before
                selecting the best combination.
              </p>

            </div>


            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

              <span className="text-sm font-bold text-brand-600">
                04
              </span>

              <h3 className="mt-3 font-bold text-slate-900">
                Take Action
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Get missing-document information and a clear
                application checklist.
              </p>

            </div>

          </div>


          {/* Bottom CTA */}

          <div className="mt-12 flex justify-center">

            <Link
              to="/analysis"
              className="btn-primary inline-flex items-center gap-2 px-7 py-3"
            >

              Start My Eligibility Analysis

              <ArrowRight size={18} />

            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}