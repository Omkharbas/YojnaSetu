import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Auth({ mode = "login" }) {
  const [isSignup, setIsSignup] = useState(mode === "signup");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState("email");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [accountNotFound, setAccountNotFound] =
    useState(false);

  const {
    signup,
    sendLoginOtp,
    verifyOtp,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // SWITCH LOGIN / SIGNUP
  // =====================================================

  const switchToSignup = () => {
    setIsSignup(true);
    setStep("email");
    setError("");
    setOtp("");
    setAccountNotFound(false);
  };

  const switchToLogin = () => {
    setIsSignup(false);
    setStep("email");
    setError("");
    setOtp("");
    setAccountNotFound(false);
  };

  // =====================================================
  // SEND OTP
  // =====================================================

  const send = async (e) => {
    e.preventDefault();

    setError("");
    setAccountNotFound(false);

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    if (!normalizedEmail) {
      return setError(
        "Please enter your email address."
      );
    }

    if (isSignup && !name.trim()) {
      return setError(
        "Please enter your full name."
      );
    }

    setLoading(true);

    try {
      if (isSignup) {
        // -----------------------------------------------
        // CREATE ACCOUNT
        // -----------------------------------------------

        await signup(
          name.trim(),
          normalizedEmail
        );

      } else {
        // -----------------------------------------------
        // LOGIN
        // -----------------------------------------------

        await sendLoginOtp(normalizedEmail);
      }

      setEmail(normalizedEmail);
      setStep("otp");

    } catch (err) {

      const message =
        err?.message ||
        "Unable to send OTP.";

      // -----------------------------------------------
      // NEW EMAIL DURING LOGIN
      // -----------------------------------------------

      if (
        !isSignup &&
        (
          message
            .toLowerCase()
            .includes("no account") ||
          message
            .toLowerCase()
            .includes("sign up first") ||
          message
            .toLowerCase()
            .includes("not found")
        )
      ) {
        setAccountNotFound(true);

        setError(
          "We couldn't find an account with this email."
        );

      } else {

        setError(message);

      }

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const verify = async (e) => {
    e.preventDefault();

    setError("");

    if (!/^\d{6}$/.test(otp)) {
      return setError(
        "Enter the 6-digit OTP."
      );
    }

    setLoading(true);

    try {
      await verifyOtp(
        email.toLowerCase().trim(),
        otp
      );

      const normalizedEmail =
        email.toLowerCase().trim();

      // -----------------------------------------------
      // NEW ACCOUNT
      // -----------------------------------------------

      if (isSignup) {

        localStorage.setItem(
          `civicbenefit_setup_required_${normalizedEmail}`,
          "true"
        );

        navigate(
          "/profile/setup",
          {
            replace: true,
          }
        );

      } else {

        // ---------------------------------------------
        // EXISTING ACCOUNT
        // ---------------------------------------------

        navigate(
          location.state?.from ||
            "/dashboard",
          {
            replace: true,
          }
        );
      }

    } catch (err) {

      setError(
        err?.message ||
          "Invalid OTP."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-brand-50 via-white to-slate-50 px-4 py-12">

      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl md:grid-cols-2">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <section className="hidden bg-brand-700 p-10 text-white md:block">

          <div className="flex items-center gap-2">

            <ShieldCheck size={30} />

            <span className="text-xl font-bold">
              CivicBenefit AI
            </span>

          </div>

          <h1 className="mt-20 text-4xl font-bold leading-tight">

            Government benefits,
            <br />
            made simpler.

          </h1>

          <p className="mt-5 text-brand-100">

            Securely access your personalized
            citizen benefits assistant and discover
            schemes you may qualify for.

          </p>

          <div className="mt-10 space-y-4 text-sm text-brand-50">

            {[
              "Personalized scheme recommendations",
              "Conflict-aware benefit bundles",
              "Document & application planning",
            ].map((item) => (

              <div
                key={item}
                className="flex items-center gap-3"
              >

                <CheckCircle2 size={18} />

                {item}

              </div>

            ))}

          </div>

        </section>


        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <section className="p-7 sm:p-10">

          <div className="mx-auto max-w-md">

            {/* Mobile logo */}

            <div className="mb-8 flex items-center gap-2 text-brand-700 md:hidden">

              <ShieldCheck />

              <span className="font-bold">
                CivicBenefit AI
              </span>

            </div>


            {/* Header */}

            <p className="text-sm font-semibold text-brand-600">

              {isSignup
                ? "CREATE ACCOUNT"
                : "WELCOME BACK"}

            </p>


            <h2 className="mt-2 text-3xl font-bold text-slate-900">

              {step === "email"
                ? (
                    isSignup
                      ? "Create your account"
                      : "Sign in to continue"
                  )
                : "Check your email ✉️"}

            </h2>


            <p className="mt-2 text-sm text-slate-500">

              {step === "email"
                ? "We'll send a secure one-time password to verify your email."
                : (
                  <>
                    We sent a 6-digit code to{" "}
                    <b>{email}</b>.
                  </>
                )}

            </p>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">

                {error}

              </div>

            )}


            {/* =================================================
                ACCOUNT NOT FOUND
            ================================================= */}

            {accountNotFound && !isSignup && (

              <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-4">

                <div className="flex gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm">

                    <UserPlus size={20} />

                  </div>


                  <div>

                    <p className="font-semibold text-slate-900">

                      No account found

                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">

                      This email isn't registered
                      with CivicBenefit AI.

                    </p>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={switchToSignup}
                  className="btn-primary mt-4 w-full"
                >

                  <UserPlus size={17} />

                  Create Account

                </button>

              </div>

            )}


            {/* =================================================
                EMAIL STEP
            ================================================= */}

            {step === "email" ? (

              <form
                onSubmit={send}
                className="mt-7 space-y-5"
              >

                {/* FULL NAME */}

                {isSignup && (

                  <div>

                    <label className="label-field">
                      Full Name
                    </label>

                    <input
                      className="input-field"
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />

                  </div>

                )}


                {/* EMAIL */}

                <div>

                  <label className="label-field">
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail
                      size={20}
                      className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(
                          e.target.value
                        );

                        setError("");
                        setAccountNotFound(false);
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="input-field"
                      style={{
                        paddingLeft: "52px",
                      }}
                    />

                  </div>

                </div>


                {/* SEND OTP */}

                <button
                  type="submit"
                  className="btn-primary w-full py-3"
                  disabled={loading}
                >

                  {loading
                    ? "Sending OTP…"
                    : isSignup
                      ? "Create Account"
                      : "Send OTP"}

                  <ArrowRight size={18} />

                </button>

              </form>

            ) : (

              /* =================================================
                 OTP STEP
              ================================================= */

              <form
                onSubmit={verify}
                className="mt-7 space-y-5"
              >

                <div>

                  <label className="label-field">
                    6-Digit OTP
                  </label>

                  <input
                    className="input-field text-center text-2xl font-bold tracking-[0.5em]"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="000000"
                    autoFocus
                  />

                </div>


                <button
                  type="submit"
                  className="btn-primary w-full py-3"
                  disabled={loading}
                >

                  {loading
                    ? "Verifying…"
                    : "Verify & Continue"}

                  <ArrowRight size={18} />

                </button>


                <button
                  type="button"
                  className="w-full text-sm font-semibold text-brand-700"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError("");
                  }}
                >

                  Change email

                </button>

              </form>

            )}


            {/* =================================================
                LOGIN / SIGNUP SWITCH
            ================================================= */}

            <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">

              {isSignup ? (

                <>
                  Already have an account?{" "}

                  <button
                    type="button"
                    className="font-bold text-brand-700"
                    onClick={switchToLogin}
                  >
                    Log in
                  </button>
                </>

              ) : (

                <>
                  New to CivicBenefit AI?{" "}

                  <button
                    type="button"
                    className="font-bold text-brand-700"
                    onClick={switchToSignup}
                  >
                    Create account
                  </button>
                </>

              )}

            </div>


            {/* BACK HOME */}

            <p className="mt-5 text-center text-xs text-slate-400">

              <Link
                to="/"
                className="hover:text-brand-600"
              >
                ← Back to home
              </Link>

            </p>

          </div>

        </section>

      </div>

    </main>
  );
}