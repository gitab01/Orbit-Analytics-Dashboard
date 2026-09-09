"use client";
import { useState } from "react";
import Link from "next/link";
import { Orbit, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Mail, KeyRound, Lock } from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "@/components/ThemeToggle";
import { validateEmailField, isValidPassword } from "@/lib/validate";

type Step = "email" | "code" | "newPassword" | "done";

// ── Password rule checker ─────────────────────────────────────
const PW_RULES = [
  { id:"len",   label:"At least 8 characters",      test: (p: string) => p.length >= 8          },
  { id:"upper", label:"One uppercase letter (A–Z)",  test: (p: string) => /[A-Z]/.test(p)        },
  { id:"num",   label:"One number (0–9)",            test: (p: string) => /[0-9]/.test(p)        },
];

function strength(pw: string): "none"|"weak"|"medium"|"strong" {
  if (!pw) return "none";
  const n = PW_RULES.filter(r => r.test(pw)).length;
  return n === 3 ? "strong" : n === 2 ? "medium" : "weak";
}

const strCfg = {
  none:   { w:"w-0",    c:"bg-gray-300 dark:bg-gray-700", label:"",       t:"" },
  weak:   { w:"w-1/3",  c:"bg-red-500",                   label:"Weak",   t:"text-red-500 dark:text-red-400" },
  medium: { w:"w-2/3",  c:"bg-amber-500",                 label:"Medium", t:"text-amber-500 dark:text-amber-400" },
  strong: { w:"w-full", c:"bg-brand-500",                 label:"Strong", t:"text-brand-600 dark:text-brand-400" },
};

const inputBase = "w-full px-4 py-3 text-sm rounded-xl border transition-all bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1";
const inputOk   = "border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/30";
const inputErr  = "border-red-400 dark:border-red-500/60 focus:border-red-500 focus:ring-red-500/20";
const inputGood = "border-brand-400 dark:border-brand-500/60 focus:border-brand-500 focus:ring-brand-500/20";

export default function ForgotPasswordPage() {
  const [step,      setStep]      = useState<Step>("email");
  const [email,     setEmail]     = useState("");
  const [code,      setCode]      = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [emailErr,  setEmailErr]  = useState("");
  const [codeErr,   setCodeErr]   = useState("");
  const [pwErr,     setPwErr]     = useState("");
  const [confirmErr,setConfirmErr]= useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const sw = strCfg[strength(newPw)];

  // ── Step 1: send code ─────────────────────────────────────
  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const err = validateEmailField(email);
    if (err) { setEmailErr(err); return; }
    setEmailErr(""); setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to send code"); return; }
      setStep("code");
    } catch { setError("Network error — please try again"); }
    finally { setLoading(false); }
  };

  // ── Resend code ───────────────────────────────────────────
  const handleResend = async () => {
    setResending(true); setResendMsg(""); setCodeErr(""); setError("");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setCode("");
      setResendMsg("A new code has been sent.");
    } catch { setResendMsg("Failed to resend. Try again."); }
    finally { setResending(false); }
  };

  // ── Step 2: verify code ───────────────────────────────────
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) { setCodeErr("Please enter the 6-digit code from your email"); return; }
    setCodeErr(""); setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/verify-reset-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setCodeErr(data.error ?? "Invalid code"); return; }
      setStep("newPassword");
    } catch { setError("Network error — please try again"); }
    finally { setLoading(false); }
  };

  // ── Step 3: set new password ──────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = isValidPassword(newPw);
    if (err) { setPwErr(err); return; }
    if (newPw !== confirmPw) { setConfirmErr("Passwords do not match"); return; }
    setPwErr(""); setConfirmErr(""); setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to reset password"); return; }
      setStep("done");
    } catch { setError("Network error — please try again"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="fixed top-4 right-4 z-10"><ThemeToggle /></div>

      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl bg-brand-500/10" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl bg-blue-500/6" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 mb-4 shadow-lg shadow-brand-500/30">
            <Orbit size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {step === "email"       ? "Forgot password?"   :
             step === "code"        ? "Check your email"   :
             step === "newPassword" ? "Set new password"   :
                                      "Password updated"}
          </h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            {step === "email"       ? "Enter your email and we'll send a reset code" :
             step === "code"        ? `We sent a 6-digit code to ${email}` :
             step === "newPassword" ? "Choose a strong new password" :
                                      "Your password has been reset successfully"}
          </p>
        </div>

        <div className="rounded-2xl p-6 shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">

          {/* ── STEP 1: Email ── */}
          {step === "email" && (
            <form onSubmit={handleSendCode} noValidate className="space-y-4">
              <div>
                <label htmlFor="fp-email" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="fp-email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (emailErr) setEmailErr(validateEmailField(e.target.value) ?? ""); }}
                    onBlur={() => setEmailErr(validateEmailField(email) ?? "")}
                    placeholder="name@gmail.com"
                    autoComplete="email"
                    autoCapitalize="off"
                    spellCheck={false}
                    className={clsx(inputBase, "pl-10", emailErr ? inputErr : inputOk)}
                  />
                </div>
                {emailErr && (
                  <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
                    <AlertCircle size={11} className="flex-shrink-0" />{emailErr}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className={clsx("w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                  loading ? "bg-brand-400 text-white/70 cursor-not-allowed" : "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/20"
                )}>
                {loading ? <><Loader2 size={15} className="animate-spin" /> Sending code…</> : <>Send reset code <ArrowRight size={15} /></>}
              </button>
            </form>
          )}

          {/* ── STEP 2: Code ── */}
          {step === "code" && (
            <form onSubmit={handleVerifyCode} noValidate className="space-y-4">
              <div>
                <label htmlFor="fp-code" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                  6-digit verification code
                </label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="fp-code"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={code}
                    onChange={e => { const v = e.target.value.replace(/\D/g,""); setCode(v); if (codeErr) setCodeErr(""); }}
                    placeholder="_ _ _ _ _ _"
                    autoComplete="one-time-code"
                    className={clsx(inputBase, "pl-10 tracking-[0.4em] text-center font-mono text-lg", codeErr ? inputErr : inputOk)}
                  />
                </div>
                {codeErr && (
                  <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
                    <AlertCircle size={11} className="flex-shrink-0" />{codeErr}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">Code expires in 15 minutes</p>
                  <button type="button" disabled={resending} onClick={handleResend}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50 transition-opacity">
                    {resending ? "Sending…" : "Resend code"}
                  </button>
                </div>
                {resendMsg && <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">{resendMsg}</p>}
              </div>

              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading || code.length !== 6}
                className={clsx("w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                  loading || code.length !== 6 ? "bg-brand-400 text-white/70 cursor-not-allowed" : "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/20"
                )}>
                {loading ? <><Loader2 size={15} className="animate-spin" /> Verifying…</> : <>Verify code <ArrowRight size={15} /></>}
              </button>

              <button type="button" onClick={() => { setStep("email"); setCode(""); setCodeErr(""); setError(""); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-1">
                <ArrowLeft size={12} /> Use a different email
              </button>
            </form>
          )}

          {/* ── STEP 3: New password ── */}
          {step === "newPassword" && (
            <form onSubmit={handleResetPassword} noValidate className="space-y-4">
              {/* New password */}
              <div>
                <label htmlFor="fp-newpw" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                  New password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="fp-newpw"
                    type={showPw ? "text" : "password"}
                    value={newPw}
                    onChange={e => { setNewPw(e.target.value); if (pwErr) setPwErr(isValidPassword(e.target.value) ?? ""); }}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className={clsx(inputBase, "pl-10 pr-11", pwErr ? inputErr : newPw && !isValidPassword(newPw) ? inputGood : inputOk)}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Strength bar */}
                {newPw && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div className={clsx("h-full rounded-full transition-all duration-300", sw.w, sw.c)} />
                      </div>
                      <span className={clsx("text-xs font-medium w-12 text-right", sw.t)}>{sw.label}</span>
                    </div>
                    <div className="space-y-0.5">
                      {PW_RULES.map(rule => {
                        const ok = rule.test(newPw);
                        return (
                          <p key={rule.id} className={clsx("flex items-center gap-1.5 text-xs", ok ? "text-brand-600 dark:text-brand-400" : "text-gray-400")}>
                            <CheckCircle size={10} className={clsx("flex-shrink-0", ok ? "opacity-100" : "opacity-30")} />{rule.label}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
                {pwErr && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle size={11} className="flex-shrink-0" />{pwErr}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="fp-confirmpw" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="fp-confirmpw"
                    type={showPw ? "text" : "password"}
                    value={confirmPw}
                    onChange={e => { setConfirmPw(e.target.value); if (confirmErr) setConfirmErr(e.target.value !== newPw ? "Passwords do not match" : ""); }}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className={clsx(inputBase, "pl-10 pr-11",
                      confirmErr ? inputErr : confirmPw && confirmPw === newPw ? inputGood : inputOk
                    )}
                  />
                  {confirmPw && confirmPw === newPw && (
                    <CheckCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500" />
                  )}
                </div>
                {confirmErr && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle size={11} className="flex-shrink-0" />{confirmErr}</p>}
              </div>

              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className={clsx("w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                  loading ? "bg-brand-400 text-white/70 cursor-not-allowed" : "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/20"
                )}>
                {loading ? <><Loader2 size={15} className="animate-spin" /> Updating…</> : <>Reset password <ArrowRight size={15} /></>}
              </button>
            </form>
          )}

          {/* ── STEP 4: Done ── */}
          {step === "done" && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-500/15 mx-auto">
                <CheckCircle size={32} className="text-brand-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your password has been updated. You can now sign in with your new password.
                </p>
              </div>
              <a href="/login"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/20 transition-all">
                Go to Sign in <ArrowRight size={15} />
              </a>
            </div>
          )}
        </div>

        {step !== "done" && (
          <p className="text-center text-sm text-gray-500 mt-5">
            Remember your password?{" "}
            <Link href="/login" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
