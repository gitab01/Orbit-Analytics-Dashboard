"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Orbit, ArrowRight, ArrowLeft, Loader2, AlertCircle,
  CheckCircle, Eye, EyeOff, Mail, KeyRound, Lock,
} from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "@/components/ThemeToggle";
import { validateLoginEmail, isValidPassword } from "@/lib/validate";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Step = "email" | "code" | "newPassword" | "done";

const inputBase = "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-150 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2";
const inputOk   = "border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/20";
const inputErr  = "border-red-400 dark:border-red-500/60 focus:border-red-500 focus:ring-red-500/20";
const inputGood = "border-brand-400 dark:border-brand-500/50 focus:border-brand-500 focus:ring-brand-500/20";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();

  const [step,       setStep]       = useState<Step>("email");
  const [email,      setEmail]      = useState("");
  const [code,       setCode]       = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [emailErr,   setEmailErr]   = useState("");
  const [codeErr,    setCodeErr]    = useState("");
  const [pwErr,      setPwErr]      = useState("");
  const [confirmErr, setConfirmErr] = useState("");
  const [resending,  setResending]  = useState(false);
  const [resendMsg,  setResendMsg]  = useState("");
  const [devCode,    setDevCode]    = useState("");

  // ── Password strength ─────────────────────────────────────────
  const PW_RULES = [
    { id:"len",   label: t("signup.rule8chars"),   test: (p: string) => p.length >= 8   },
    { id:"upper", label: t("signup.ruleUppercase"), test: (p: string) => /[A-Z]/.test(p) },
    { id:"num",   label: t("signup.ruleNumber"),   test: (p: string) => /[0-9]/.test(p) },
  ];

  function pwStrength(pw: string): "none"|"weak"|"medium"|"strong" {
    if (!pw) return "none";
    const n = PW_RULES.filter(r => r.test(pw)).length;
    return n === 3 ? "strong" : n === 2 ? "medium" : "weak";
  }

  const sw = {
    none:   { w:"w-0",    c:"bg-gray-300 dark:bg-gray-700", label:"",                 t2:"" },
    weak:   { w:"w-1/3",  c:"bg-red-500",                   label:t("signup.weak"),   t2:"text-red-500 dark:text-red-400" },
    medium: { w:"w-2/3",  c:"bg-amber-500",                 label:t("signup.medium"), t2:"text-amber-500 dark:text-amber-400" },
    strong: { w:"w-full", c:"bg-brand-500",                 label:t("signup.strong"), t2:"text-brand-600 dark:text-brand-400" },
  }[pwStrength(newPw)];

  // ── Step 1: send code ─────────────────────────────────────────
  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const err = validateLoginEmail(email);
    if (err) { setEmailErr(err); return; }
    setEmailErr(""); setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t("forgot.failedSend")); return; }
      if (data.devCode) setDevCode(data.devCode);
      setStep("code");
    } catch { setError(t("forgot.networkError")); }
    finally { setLoading(false); }
  };

  // ── Resend code ───────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true); setResendMsg(""); setCodeErr(""); setError("");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setCode("");
      setResendMsg(t("forgot.resendSuccess"));
    } catch { setResendMsg(t("forgot.resendFailed")); }
    finally { setResending(false); }
  };

  // ── Step 2: verify code ───────────────────────────────────────
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) { setCodeErr(t("signup.invalidCode")); return; }
    setCodeErr(""); setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/verify-reset-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setCodeErr(data.error ?? t("signup.invalidCode")); return; }
      setStep("newPassword");
    } catch { setError(t("forgot.networkError")); }
    finally { setLoading(false); }
  };

  // ── Step 3: set new password ──────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = isValidPassword(newPw);
    if (err) { setPwErr(err); return; }
    if (newPw !== confirmPw) { setConfirmErr(t("forgot.pwNoMatch")); return; }
    setPwErr(""); setConfirmErr(""); setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t("forgot.failedReset")); return; }
      setStep("done");
    } catch { setError(t("forgot.networkError")); }
    finally { setLoading(false); }
  };

  const stepTitle = {
    email:       t("forgot.title.email"),
    code:        t("forgot.title.code"),
    newPassword: t("forgot.title.newPassword"),
    done:        t("forgot.title.done"),
  }[step];

  const stepSubtitle = {
    email:       t("forgot.sub.email"),
    code:        t("forgot.sub.code", { email }),
    newPassword: t("forgot.sub.newPassword"),
    done:        t("forgot.sub.done"),
  }[step];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-colors">
      <div className="fixed top-4 right-4 z-10"><ThemeToggle /></div>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[500px] h-[500px] rounded-full blur-3xl opacity-30 bg-brand-500/20" />
        <div className="absolute -bottom-60 -right-60 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 bg-blue-500/20" />
      </div>

      <div className="w-full max-w-[400px] relative">

        {/* Logo & heading */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 mb-5 shadow-xl shadow-brand-500/25">
            <Orbit size={28} className="text-white" />
          </div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-gray-900 dark:text-white">{stepTitle}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 text-center">{stepSubtitle}</p>
        </div>

        <div className="rounded-2xl p-7 shadow-2xl shadow-gray-200/60 dark:shadow-black/40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">

          {/* ── STEP 1: Email ── */}
          {step === "email" && (
            <form onSubmit={handleSendCode} noValidate className="space-y-4">
              <div>
                <label htmlFor="fp-email" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t("forgot.emailLabel")}
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input id="fp-email" type="email" value={email}
                    onChange={e => { setEmail(e.target.value); if (emailErr) setEmailErr(validateLoginEmail(e.target.value) ?? ""); }}
                    onBlur={() => setEmailErr(validateLoginEmail(email) ?? "")}
                    placeholder="you@example.com" autoComplete="email" autoCapitalize="off" spellCheck={false}
                    className={clsx(inputBase, "pl-10", emailErr ? inputErr : inputOk)} />
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
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> {t("forgot.sending")}</>
                  : <>{t("forgot.sendCode")} <ArrowRight size={15} /></>}
              </button>
            </form>
          )}

          {/* ── STEP 2: Code ── */}
          {step === "code" && (
            <form onSubmit={handleVerifyCode} noValidate className="space-y-4">
              <div>
                <label htmlFor="fp-code" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                  {t("forgot.codeLabel")}
                </label>

                {/* Dev mode: show code directly when no email provider */}
                {devCode && (
                  <div className="mb-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-center">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">No email provider — your code is:</p>
                    <p className="text-2xl font-mono font-bold tracking-[0.3em] text-amber-800 dark:text-amber-300">{devCode}</p>
                  </div>
                )}
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input id="fp-code" type="text" inputMode="numeric" pattern="\d{6}" maxLength={6}
                    value={code}
                    onChange={e => { const v = e.target.value.replace(/\D/g,""); setCode(v); if (codeErr) setCodeErr(""); }}
                    placeholder="_ _ _ _ _ _" autoComplete="one-time-code"
                    className={clsx(inputBase, "pl-10 tracking-[0.4em] text-center font-mono text-lg", codeErr ? inputErr : inputOk)} />
                </div>
                {codeErr && (
                  <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
                    <AlertCircle size={11} className="flex-shrink-0" />{codeErr}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">{t("forgot.codeExpiry")}</p>
                  <button type="button" disabled={resending} onClick={handleResend}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50 transition-opacity">
                    {resending ? t("forgot.resending") : t("forgot.resendCode")}
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
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> {t("forgot.verifying")}</>
                  : <>{t("forgot.verifyCode")} <ArrowRight size={15} /></>}
              </button>

              <button type="button" onClick={() => { setStep("email"); setCode(""); setCodeErr(""); setError(""); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-1">
                <ArrowLeft size={12} /> {t("forgot.useDifferentEmail")}
              </button>
            </form>
          )}

          {/* ── STEP 3: New password ── */}
          {step === "newPassword" && (
            <form onSubmit={handleResetPassword} noValidate className="space-y-4">
              <div>
                <label htmlFor="fp-newpw" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                  {t("forgot.newPwLabel")}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input id="fp-newpw" type={showPw ? "text" : "password"} value={newPw}
                    onChange={e => { setNewPw(e.target.value); if (pwErr) setPwErr(isValidPassword(e.target.value) ?? ""); }}
                    placeholder={t("signup.passwordMin")} autoComplete="new-password"
                    className={clsx(inputBase, "pl-10 pr-11", pwErr ? inputErr : newPw && !isValidPassword(newPw) ? inputGood : inputOk)} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {newPw && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div className={clsx("h-full rounded-full transition-all duration-300", sw.w, sw.c)} />
                      </div>
                      <span className={clsx("text-xs font-medium w-12 text-right", sw.t2)}>{sw.label}</span>
                    </div>
                    <div className="space-y-0.5">
                      {PW_RULES.map(rule => {
                        const ok = rule.test(newPw);
                        return (
                          <p key={rule.id} className={clsx("flex items-center gap-1.5 text-xs", ok ? "text-brand-600 dark:text-brand-400" : "text-gray-400")}>
                            <CheckCircle size={10} className={clsx("flex-shrink-0", ok ? "opacity-100" : "opacity-30")} />
                            {rule.label}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
                {pwErr && (
                  <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
                    <AlertCircle size={11} className="flex-shrink-0" />{pwErr}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="fp-confirmpw" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                  {t("forgot.confirmPwLabel")}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input id="fp-confirmpw" type={showPw ? "text" : "password"} value={confirmPw}
                    onChange={e => { setConfirmPw(e.target.value); if (confirmErr) setConfirmErr(e.target.value !== newPw ? t("forgot.pwNoMatch") : ""); }}
                    placeholder={t("signup.repeatPassword")} autoComplete="new-password"
                    className={clsx(inputBase, "pl-10 pr-11", confirmErr ? inputErr : confirmPw && confirmPw === newPw ? inputGood : inputOk)} />
                  {confirmPw && confirmPw === newPw && (
                    <CheckCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500" />
                  )}
                </div>
                {confirmErr && (
                  <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
                    <AlertCircle size={11} className="flex-shrink-0" />{confirmErr}
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
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> {t("forgot.updating")}</>
                  : <>{t("forgot.resetBtn")} <ArrowRight size={15} /></>}
              </button>
            </form>
          )}

          {/* ── STEP 4: Done ── */}
          {step === "done" && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-500/15 mx-auto">
                <CheckCircle size={32} className="text-brand-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("forgot.doneMsg")}</p>
              <a href="/login"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/20 transition-all">
                {t("forgot.goToSignIn")} <ArrowRight size={15} />
              </a>
            </div>
          )}
        </div>

        {step !== "done" && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {t("forgot.rememberPw")}{" "}
            <Link href="/login" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold transition-colors">
              {t("forgot.signIn")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
