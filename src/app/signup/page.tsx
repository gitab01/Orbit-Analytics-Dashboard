"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Eye, EyeOff, Orbit, ArrowRight, ArrowLeft,
  Loader2, Check, AlertCircle, X, KeyRound, Mail, CheckCircle, User, Lock,
} from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "@/components/ThemeToggle";
import { isValidGmailEmail, isValidName } from "@/lib/validate";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Step = "register" | "verify";

export default function SignupPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("register");

  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched,     setTouched]     = useState<Record<string, boolean>>({});

  const [code,      setCode]      = useState("");
  const [codeErr,   setCodeErr]   = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [devCode,   setDevCode]   = useState("");

  const PW_RULES = [
    { id:"len",   label: t("signup.rule8chars"),   test: (p: string) => p.length >= 8   },
    { id:"upper", label: t("signup.ruleUppercase"), test: (p: string) => /[A-Z]/.test(p) },
    { id:"num",   label: t("signup.ruleNumber"),   test: (p: string) => /[0-9]/.test(p) },
  ];

  const strength = (() => {
    const n = PW_RULES.filter(r => r.test(password)).length;
    if (!password) return "none";
    return n === 3 ? "strong" : n === 2 ? "medium" : "weak";
  })();

  const strCfg = {
    none:   { w:"w-0",    c:"bg-gray-200 dark:bg-gray-700", label:"",                text:"" },
    weak:   { w:"w-1/3",  c:"bg-red-500",                   label:t("signup.weak"),  text:"text-red-500 dark:text-red-400" },
    medium: { w:"w-2/3",  c:"bg-amber-400",                 label:t("signup.medium"),text:"text-amber-500 dark:text-amber-400" },
    strong: { w:"w-full", c:"bg-brand-500",                 label:t("signup.strong"),text:"text-brand-600 dark:text-brand-400" },
  }[strength];

  const validators: Record<string, (v: string) => string> = {
    name:     (v) => isValidName(v) ?? "",
    email:    (v) => {
      if (!v.trim()) return t("login.emailRequired");
      if (!v.includes("@")) return "Please include '@' in the email address";
      if (!isValidGmailEmail(v)) return "Please enter a valid Gmail address (e.g. name@gmail.com)";
      return "";
    },
    password: (v) => {
      if (!v) return t("login.passwordRequired");
      if (v.length < 8) return t("signup.rule8chars");
      if (!/[A-Z]/.test(v)) return t("signup.ruleUppercase");
      if (!/[0-9]/.test(v)) return t("signup.ruleNumber");
      return "";
    },
    confirm:  (v) => {
      if (!v) return t("signup.confirmPassword");
      if (v !== password) return t("settings.pwNoMatch");
      return "";
    },
  };

  const touch    = (f: string) => setTouched(p => ({ ...p, [f]: true }));
  const validate = (f: string, v: string) => {
    const e = validators[f]?.(v) ?? "";
    setFieldErrors(p => ({ ...p, [f]: e }));
    return e;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const errs = {
      name:     validate("name",     name),
      email:    validate("email",    email),
      password: validate("password", password),
      confirm:  validate("confirm",  confirm),
    };
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (Object.values(errs).some(Boolean)) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t("signup.failed")); return; }
      if (data.devCode) setDevCode(data.devCode);
      setStep("verify");
    } catch { setError(t("signup.networkError")); }
    finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) { setCodeErr(t("signup.invalidCode")); return; }
    setCodeErr(""); setError(""); setVerifying(true);
    try {
      const res  = await fetch("/api/auth/verify-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setCodeErr(data.error ?? t("signup.invalidCode")); return; }
      window.location.href = "/";
    } catch { setError(t("signup.networkError")); }
    finally { setVerifying(false); }
  };

  const handleResend = async () => {
    setResending(true); setResendMsg(""); setCodeErr("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      });
      const d = await res.json();
      if (res.ok) { setCode(""); if (d.devCode) setDevCode(d.devCode); setResendMsg(t("signup.resendSuccess")); }
      else setResendMsg(t("signup.resendFailed"));
    } catch { setResendMsg(t("signup.resendFailed")); }
    finally { setResending(false); }
  };

  const base = "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-150 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2";
  const ok   = "border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/20";
  const bad  = "border-red-400 dark:border-red-500/60 focus:border-red-500 focus:ring-red-500/20";
  const good = "border-brand-400 dark:border-brand-500/50 focus:border-brand-500 focus:ring-brand-500/20";

  const cls = (field: string, val: string) => {
    if (!touched[field]) return clsx(base, ok);
    if (fieldErrors[field]) return clsx(base, bad);
    if (val) return clsx(base, good);
    return clsx(base, ok);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-colors">
      <div className="fixed top-4 right-4 z-10"><ThemeToggle /></div>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-60 w-[500px] h-[500px] rounded-full blur-3xl opacity-25 bg-brand-500/20" />
        <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] rounded-full blur-3xl opacity-15 bg-blue-500/20" />
      </div>

      <div className="w-full max-w-[400px] relative">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 mb-5 shadow-xl shadow-brand-500/25">
            <Orbit size={28} className="text-white" />
          </div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-gray-900 dark:text-white">
            {step === "register" ? t("signup.createAccount") : t("signup.verifyTitle")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 text-center">
            {step === "register" ? t("signup.subtitle") : t("signup.verifySubtitle", { email })}
          </p>
        </div>

        <div className="rounded-2xl p-7 shadow-2xl shadow-gray-200/60 dark:shadow-black/40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">

          {/* ── STEP 1 ── */}
          {step === "register" && (
            <>
              {/* Benefits row */}
              <div className="flex flex-wrap gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-gray-800">
                {[t("signup.freePlan"), t("signup.realtimeCharts"), t("signup.teamCollab")].map(b => (
                  <span key={b} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <Check size={11} className="text-brand-500 flex-shrink-0" />{b}
                  </span>
                ))}
              </div>

              <form onSubmit={handleRegister} noValidate className="space-y-4">

                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="su-name" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t("signup.fullName")}
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input id="su-name" type="text" value={name}
                      onChange={e => { setName(e.target.value); if (touched.name) validate("name", e.target.value); }}
                      onBlur={() => { touch("name"); validate("name", name); }}
                      placeholder="Your full name"
                      autoComplete="name"
                      className={clsx(cls("name", name), "pl-10")} />
                  </div>
                  {touched.name && fieldErrors.name && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                      <AlertCircle size={11} className="flex-shrink-0" />{fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="su-email" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t("signup.emailAddress")}
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input id="su-email" type="email" value={email}
                      onChange={e => { setEmail(e.target.value); if (touched.email) validate("email", e.target.value); }}
                      onBlur={() => { touch("email"); validate("email", email); }}
                      placeholder="you@gmail.com"
                      autoComplete="email" autoCapitalize="off" spellCheck={false}
                      className={clsx(cls("email", email), "pl-10")} />
                  </div>
                  {touched.email && fieldErrors.email && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                      <AlertCircle size={11} className="flex-shrink-0" />{fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="su-pw" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t("signup.password")}
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input id="su-pw" type={showPw ? "text" : "password"} value={password}
                      onChange={e => { setPassword(e.target.value); if (touched.password) validate("password", e.target.value); }}
                      onBlur={() => { touch("password"); validate("password", password); }}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      className={clsx(cls("password", password), "pl-10 pr-11")} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-0.5">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password && (
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                          <div className={clsx("h-full rounded-full transition-all duration-300", strCfg.w, strCfg.c)} />
                        </div>
                        <span className={clsx("text-xs font-semibold w-14 text-right", strCfg.text)}>{strCfg.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        {PW_RULES.map(rule => {
                          const ok = rule.test(password);
                          return (
                            <span key={rule.id} className={clsx("flex items-center gap-1 text-xs transition-colors", ok ? "text-brand-600 dark:text-brand-400" : "text-gray-400 dark:text-gray-500")}>
                              {ok ? <Check size={10} className="flex-shrink-0" /> : <X size={10} className="flex-shrink-0" />}
                              {rule.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {touched.password && fieldErrors.password && !password && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                      <AlertCircle size={11} className="flex-shrink-0" />{fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm */}
                <div className="space-y-1.5">
                  <label htmlFor="su-confirm" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t("signup.confirmPassword")}
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input id="su-confirm" type={showPw ? "text" : "password"} value={confirm}
                      onChange={e => { setConfirm(e.target.value); if (touched.confirm) validate("confirm", e.target.value); }}
                      onBlur={() => { touch("confirm"); validate("confirm", confirm); }}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      className={clsx(cls("confirm", confirm), "pl-10 pr-10")} />
                    {touched.confirm && !fieldErrors.confirm && confirm && (
                      <CheckCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500" />
                    )}
                  </div>
                  {touched.confirm && fieldErrors.confirm && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                      <AlertCircle size={11} className="flex-shrink-0" />{fieldErrors.confirm}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl border bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20">
                    <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className={clsx("w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-150 mt-1",
                    loading ? "bg-brand-400 text-white/70 cursor-not-allowed" : "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30"
                  )}>
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> {t("signup.creating")}</>
                    : <>{t("signup.createBtn")} <ArrowRight size={15} /></>}
                </button>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                  {t("signup.termsText")}{" "}
                  <span className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer underline underline-offset-2">
                    {t("signup.terms")}
                  </span>
                </p>
              </form>
            </>
          )}

          {/* ── STEP 2: Verify ── */}
          {step === "verify" && (
            <form onSubmit={handleVerify} noValidate className="space-y-5">

              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/15 mx-auto">
                <Mail size={28} className="text-brand-500" />
              </div>

              {/* Dev mode banner */}
              {devCode && (
                <div className="px-4 py-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-center space-y-1">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Your verification code</p>
                  <p className="text-3xl font-mono font-bold tracking-[0.35em] text-amber-800 dark:text-amber-300">{devCode}</p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-500/70">No email provider configured</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="v-code" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t("signup.codeLabel")}
                </label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input id="v-code" type="text" inputMode="numeric" pattern="\d{6}" maxLength={6}
                    value={code}
                    onChange={e => { const v = e.target.value.replace(/\D/g,""); setCode(v); if (codeErr) setCodeErr(""); }}
                    placeholder="• • • • • •"
                    autoComplete="one-time-code"
                    className={clsx(base, "pl-10 tracking-[0.5em] text-center font-mono text-xl font-bold", codeErr ? bad : ok)} />
                </div>
                {codeErr && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                    <AlertCircle size={11} className="flex-shrink-0" />{codeErr}
                  </p>
                )}
                <div className="flex items-center justify-between pt-0.5">
                  <p className="text-xs text-gray-400 dark:text-gray-500">{t("signup.codeExpiry")}</p>
                  <button type="button" disabled={resending} onClick={handleResend}
                    className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50 transition-opacity">
                    {resending ? t("signup.resending") : t("signup.resendCode")}
                  </button>
                </div>
                {resendMsg && <p className="text-xs text-brand-600 dark:text-brand-400">{resendMsg}</p>}
              </div>

              {error && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl border bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button type="submit" disabled={verifying || code.length !== 6}
                className={clsx("w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-150",
                  verifying || code.length !== 6
                    ? "bg-brand-400 text-white/70 cursor-not-allowed"
                    : "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30"
                )}>
                {verifying
                  ? <><Loader2 size={15} className="animate-spin" /> {t("signup.verifying")}</>
                  : <>{t("signup.verifyBtn")} <ArrowRight size={15} /></>}
              </button>

              <button type="button"
                onClick={() => { setStep("register"); setCode(""); setCodeErr(""); setError(""); setDevCode(""); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1">
                <ArrowLeft size={12} /> {t("signup.useDifferentEmail")}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          {t("signup.alreadyHave")}{" "}
          <Link href="/login" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold transition-colors">
            {t("signup.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
