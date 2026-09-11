import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Auth({ mode = "login" }) {
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup, sendLoginOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const send = async (e) => {
    e.preventDefault(); setError("");
    if (!email.trim()) return setError("Please enter your email address.");
    if (isSignup && !name.trim()) return setError("Please enter your full name.");
    setLoading(true);
    try {
      if (isSignup) await signup(name, email);
      else await sendLoginOtp(email);
      setStep("otp");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const verify = async (e) => {
    e.preventDefault(); setError("");
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit OTP.");
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-brand-50 via-white to-slate-50 px-4 py-12">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl md:grid-cols-2">
        <section className="hidden bg-brand-700 p-10 text-white md:block">
          <div className="flex items-center gap-2"><ShieldCheck size={30}/><span className="text-xl font-bold">CivicBenefit AI</span></div>
          <h1 className="mt-20 text-4xl font-bold leading-tight">Government benefits,<br/>made simpler.</h1>
          <p className="mt-5 text-brand-100">Securely access your personalized citizen benefits assistant and discover schemes you may qualify for.</p>
          <div className="mt-10 space-y-4 text-sm text-brand-50">
            {['Personalized scheme recommendations','Conflict-aware benefit bundles','Document & application planning'].map(x => <div key={x} className="flex items-center gap-3"><CheckCircle2 size={18}/>{x}</div>)}
          </div>
        </section>
        <section className="p-7 sm:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 md:hidden flex items-center gap-2 text-brand-700"><ShieldCheck/><span className="font-bold">CivicBenefit AI</span></div>
            <p className="text-sm font-semibold text-brand-600">{isSignup ? "CREATE ACCOUNT" : "WELCOME BACK"}</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">{step === "email" ? (isSignup ? "Create your account" : "Sign in to continue") : "Check your email ✉️"}</h2>
            <p className="mt-2 text-sm text-slate-500">{step === "email" ? "We'll send a secure one-time password to verify your email." : <>We sent a 6-digit code to <b>{email}</b>.</>}</p>

            {error && <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            {step === "email" ? <form onSubmit={send} className="mt-7 space-y-5">
              {isSignup && <div><label className="label-field">Full Name</label><input className="input-field" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name" autoComplete="name"/></div>}
              <div><label className="label-field">Email Address</label><div className="relative"><Mail className="absolute left-3 top-3 text-slate-400" size={18}/><input className="input-field pl-10" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></div></div>
              <button className="btn-primary w-full py-3" disabled={loading}>{loading ? "Sending OTP…" : "Send OTP"}<ArrowRight size={18}/></button>
            </form> : <form onSubmit={verify} className="mt-7 space-y-5">
              <div><label className="label-field">6-Digit OTP</label><input className="input-field text-center text-2xl font-bold tracking-[0.5em]" inputMode="numeric" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g, ""))} placeholder="000000" autoFocus/></div>
              <button className="btn-primary w-full py-3" disabled={loading}>{loading ? "Verifying…" : "Verify & Continue"}<ArrowRight size={18}/></button>
              <button type="button" className="w-full text-sm font-semibold text-brand-700" onClick={()=>{setStep("email");setOtp("");}}>Change email</button>
            </form>}

            <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
              {isSignup ? <>Already have an account? <button className="font-bold text-brand-700" onClick={()=>{setIsSignup(false);setStep("email");setError("")}}>Log in</button></> : <>New to CivicBenefit AI? <button className="font-bold text-brand-700" onClick={()=>{setIsSignup(true);setStep("email");setError("")}}>Create account</button></>}
            </div>
            <p className="mt-5 text-center text-xs text-slate-400"><Link to="/" className="hover:text-brand-600">← Back to home</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}
