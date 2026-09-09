"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Eye, EyeOff, Orbit, ArrowRight, ArrowLeft,
  Loader2, Check, AlertCircle, X, KeyRound, Mail, CheckCircle,
} from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "@/components/ThemeToggle";
import { isValidGmailEmail, isValidName } from "@/lib/validate";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Step = "register" | "verify";

export default function SignupPage() {
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>("register");

  // Step 1
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched,     setTouched]     = useState<Record<string, boolean>>({});

  // Step 2
  const [code,      setCode]      = useState("");
  const [codeErr,   setCodeErr]   = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  // ── Password strength ─────────────────────────────────────────
  const PW_RULES = [
    { id: "len",   label: t("signup.rule8chars"),   test: (p: string) => p.length >= 8   },
    { id: "upper", label: t("signup.ruleUppercase"), test: (p: string) => /[A-Z]/.test(p) },
    { id: "num",   label: t("signup.ruleNumber"),   test: (p: string) => /[0-9]/.test(p) },
  ];

  function strengthLevel(pw: string): "none"|"weak"|"medium"|"strong" {
    if (!pw) return "none";
    const n = PW_RULES.filter(r => r.test(pw)).length;
    return n === 3 ? "strong" : n === 2 ? "medium" : "weak";
  }

  const strengthCfg = {
    none:   { width:"w-0",    color:"bg-gray-300 dark:bg-gray-700", label:"",                text:"" },
    weak:   { width:"w-1/3",  color:"bg-red-500",                   label:t("signup.weak"),  text:"text-red-500 dark:text-red-400" },
    medium: { width:"w-2/3",  color:"bg-amber-500",                 label:t("signup.medium"),text:"text-amber-500 dark:text-amber-400" },
    strong: { width:"w-full", color:"bg-brand-500",                 label:t("signup.strong"),text:"text-brand-600 dark:text-brand-400" },
  }[strengthLevel(password)];

  // ── Validators ────────────────────────────────────────────────
  const validators: Record<string, (v: string) => string> = {
    name: (v) => isValidName(v) ?? "",
    email: (v) => {
      if (!v.trim()) return t("login.emailRequired");
      if (!v.includes("@")) return "Please include '@' in the email address";
      const [, domain] = v.trim().split("@");
      if (domain?.toLowerCase() !== "gmail.com")
        return "Only Gmail addresses are accepted (e.g. name@gmail.com)";
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
    confirm: (v) => {
      if (!v) return t("signup.confirmPassword");
      if (v !== password) return t("settings.pwNoMatch");
      return "";
    },
  };

  const touch    = (f: string) => setTouched(p => ({ ...p, [f]: true }));
  const validate = (f: string, v: string) => {
    const err = validators[f]?.(v) ?? "";
    setFieldErrors(p => ({ ...p, [f]: err }));
    return err;
  };

  // ── Step 1: register & send code ─────────────────────────────
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
      setStep("verify");
    } catch { setError(t("signup.networkError")); }
    finally { setLoading(false); }
  };

  // ── Step 2: verify code ───────────────────────────────────────
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

  // ── Resend code ───────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true); setResendMsg(""); setCodeErr("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      });
      if (res.ok) { setCode(""); setResendMsg(t("signup.resendSuccess")); }
      else setResendMsg(t("signup.resendFailed"));
    } catch { setResendMsg(t("signup.resendFailed")); }
    finally { setResending(false); }
  };

  // ── Styles ────────────────────────────────────────────────────
  const inputBase = "w-full px-4 py-3 text-sm rounded-xl border transition-all bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1";
  const inputOk   = "border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/30";
  const inputErr  = "border-red-400 dark:border-red-500/60 focus:border-red-500 focus:ring-red-500/20";
  const inputGood = "border-brand-400 dark:border-brand-500/60 focus:border-brand-500 focus:ring-brand-500/20";

  const fieldCls = (field: string, value: string) => {
    if (!touched[field]) return clsx(inputBase, inputOk);
    if (fieldErrors[field]) return clsx(inputBase, inputErr);
    if (value) return clsx(inputBase, inputGood);
    return clsx(inputBase, inputOk);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="fixed top-4 right-4 z-10"><ThemeToggle /></div>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl bg-brand-500/8" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl bg-blue-500/6" />
      </div>

      <div className="w-full max-w-sm relative">

        {/* Logo & heading */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 mb-4 shadow-lg shadow-brand-500/30">
            <Orbit size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {step === "register" ? t("signup.createAccount") : t("signup.verifyTitle")}
          </h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            {step === "register"
              ? t("signup.subtitle")
              : t("signup.verifySubtitle", { email })}
          </p>
        </div>

        <div className="rounded-2xl p-6 shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">

          {/* ── STEP 1: Registration ── */}
          {step === "register" && (
            <>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-5">
                {[t("signup.freePlan"), t("signup.realtimeCharts"), t("signup.teamCollab")].map(b => (
                  <div key={b} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Check size={11} className="text-brand-500 flex-shrink-0" />{b}
                  </div>
                ))}
              </div>

              <form onSubmit={handleRegister} noValidate className="space-y-4">

                {/* Full name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                    {t("signup.fullName")}
                  </label>
                  <input id="name" type="text" value={name}
                    onChange={e => { setName(e.target.value); if (touched.name) validate("name", e.target.value); }}
                    onBlur={() => { touch("name"); validate("name", name); }}
                    placeholder="Alex Kim" autoComplete="name"
                    className={fieldCls("name", name)} />
                  {touched.name && fieldErrors.name && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
                      <AlertCircle size={11} className="flex-shrink-0" />{fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                    {t("signup.emailAddress")}
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input id="email" type="email" value={email}
                      onChange={e => { setEmail(e.target.value); if (touched.email) validate("email", e.target.value); }}
                      onBlur={() => { touch("email"); validate("email", email); }}
                      placeholder="name@gmail.com" autoComplete="email" autoCapitalize="off" spellCheck={false}
                      className={clsx(fieldCls("email", email), "pl-10")} />
                  </div>
                  {touched.email && fieldErrors.email && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
                      <AlertCircle size={11} className="flex-shrink-0" />{fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                    {t("signup.password")}
                  </label>
                  <div className="relative">
                    <input id="password" type={showPw ? "text" : "password"} value={password}
                      onChange={e => { setPassword(e.target.value); if (touched.password) validate("password", e.target.value); }}
                      onBlur={() => { touch("password"); validate("password", password); }}
                      placeholder={t("signup.passwordMin")} autoComplete="new-password"
                      className={clsx(fieldCls("password", password), "pr-11")} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div className={clsx("h-full rounded-full transition-all duration-300", strengthCfg.width, strengthCfg.color)} />
                        </div>
                        <span className={clsx("text-xs font-medium w-12 text-right", strengthCfg.text)}>{strengthCfg.label}</span>
                      </div>
                      <div className="space-y-0.5">
                        {PW_RULES.map(rule => {
                          const ok = rule.test(password);
                          return (
                            <p key={rule.id} className={clsx("flex items-center gap-1.5 text-xs transition-colors", ok ? "text-brand-600 dark:text-brand-400" : "text-gray-400 dark:text-gray-500")}>
                              {ok ? <Check size={11} className="flex-shrink-0" /> : <X size={11} className="flex-shrink-0" />}
                              {rule.label}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {touched.password && fieldErrors.password && !password && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
                      <AlertCircle size={11} className="flex-shrink-0" />{fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="confirm" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                    {t("signup.confirmPassword")}
                  </label>
                  <div className="relative">
                    <input id="confirm" type={showPw ? "text" : "password"} value={confirm}
                      onChange={e => { setConfirm(e.target.value); if (touched.confirm) validate("confirm", e.target.value); }}
                      onBlur={() => { touch("confirm"); validate("confirm", confirm); }}
                      placeholder={t("signup.repeatPassword")} autoComplete="new-password"
                      className={fieldCls("confirm", confirm)} />
                    {touched.confirm && !fieldErrors.confirm && confirm && (
                      <CheckCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500" />
                    )}
                  </div>
                  {touched.confirm && fieldErrors.confirm && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
                      <AlertCircle size={11} className="flex-shrink-0" />{fieldErrors.confirm}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg border bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20">
                    <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className={clsx("w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all mt-1",
                    loading ? "bg-brand-400 text-white/70 cursor-not-allowed" : "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/20"
                  )}>
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> {t("signup.creating")}</>
                    : <>{t("signup.createBtn")} <ArrowRight size={15} /></>}
                </button>

                <p className="text-center text-xs text-gray-400">
                  {t("signup.termsText")}{" "}
                  <span className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer underline-offset-2 hover:underline">
                    {t("signup.terms")}
                  </span>
                </p>
              </form>
            </>
          )}

          {/* ── STEP 2: Verify ── */}
          {step === "verify" && (
            <form onSubmit={handleVerify} noValidate className="space-y-4">

              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/15 mx-auto mb-2">
                <Mail size={26} className="text-brand-500" />
              </div>

              <div>
                <label htmlFor="v-code" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                  {t("signup.codeLabel")}
                </label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input id="v-code" type="text" inputMode="numeric" pattern="\d{6}" maxLength={6}
                    value={code}
                    onChange={e => { const v = e.target.value.replace(/\D/g, ""); setCode(v); if (codeErr) setCodeErr(""); }}
                    placeholder="_ _ _ _ _ _" autoComplete="one-time-code"
                    className={clsx(inputBase, "pl-10 tracking-[0.4em] text-center font-mono text-lg", codeErr ? inputErr : inputOk)} />
                </div>
                {codeErr && (
                  <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
                    <AlertCircle size={11} className="flex-shrink-0" />{codeErr}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">{t("signup.codeExpiry")}</p>
                  <button type="button" disabled={resending} onClick={handleResend}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50 transition-opacity">
                    {resending ? t("signup.resending") : t("signup.resendCode")}
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

              <button type="submit" disabled={verifying || code.length !== 6}
                className={clsx("w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                  verifying || code.length !== 6
                    ? "bg-brand-400 text-white/70 cursor-not-allowed"
                    : "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/20"
                )}>
                {verifying
                  ? <><Loader2 size={15} className="animate-spin" /> {t("signup.verifying")}</>
                  : <>{t("signup.verifyBtn")} <ArrowRight size={15} /></>}
              </button>

              <button type="button"
                onClick={() => { setStep("register"); setCode(""); setCodeErr(""); setError(""); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-1">
                <ArrowLeft size={12} /> {t("signup.useDifferentEmail")}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          {t("signup.alreadyHave")}{" "}
          <Link href="/login" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
            {t("signup.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
