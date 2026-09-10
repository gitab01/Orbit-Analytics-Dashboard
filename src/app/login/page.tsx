"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Orbit, ArrowRight, Loader2, AlertCircle, Mail, Lock } from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "@/components/ThemeToggle";
import { validateLoginEmail } from "@/lib/validate";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail    = (v: string) => validateLoginEmail(v) ?? "";
  const validatePassword = (v: string) => (!v ? t("login.passwordRequired") : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const emailErr = validateEmail(email);
    const pwErr    = validatePassword(password);
    if (emailErr || pwErr) { setFieldErrors({ email: emailErr, password: pwErr }); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t("login.networkError")); return; }
      window.location.href = "/";
    } catch { setError(t("login.networkError")); }
    finally { setLoading(false); }
  };

  const base = "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-150 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2";
  const ok   = "border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/20";
  const err  = "border-red-400 dark:border-red-500/60 focus:border-red-500 focus:ring-red-500/20";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-colors">
      <div className="fixed top-4 right-4 z-10"><ThemeToggle /></div>

      {/* Subtle background accent */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[500px] h-[500px] rounded-full blur-3xl opacity-30 bg-brand-500/20" />
        <div className="absolute -bottom-60 -right-60 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 bg-blue-500/20" />
      </div>

      <div className="w-full max-w-[420px] relative">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-500 mb-4 sm:mb-5 shadow-xl shadow-brand-500/25">
            <Orbit size={24} className="text-white sm:hidden" />
            <Orbit size={28} className="text-white hidden sm:block" />
          </div>
          <h1 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight text-gray-900 dark:text-white">
            {t("login.welcomeBack")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">{t("login.subtitle")}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-5 sm:p-7 shadow-xl sm:shadow-2xl shadow-gray-200/60 dark:shadow-black/40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t("login.emailLabel")}
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="email" type="email" value={email}
                  onChange={e => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: validateEmail(e.target.value) })); }}
                  onBlur={() => setFieldErrors(p => ({ ...p, email: validateEmail(email) }))}
                  placeholder="you@example.com"
                  autoComplete="email" autoCapitalize="off" spellCheck={false}
                  className={clsx(base, "pl-10", fieldErrors.email ? err : ok)}
                />
              </div>
              {fieldErrors.email && (
                <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                  <AlertCircle size={11} className="flex-shrink-0" />{fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t("login.passwordLabel")}
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="password" type={showPw ? "text" : "password"} value={password}
                  onChange={e => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: validatePassword(e.target.value) })); }}
                  onBlur={() => setFieldErrors(p => ({ ...p, password: validatePassword(password) }))}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={clsx(base, "pl-10 pr-11", fieldErrors.password ? err : ok)}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-0.5">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                  <AlertCircle size={11} className="flex-shrink-0" />{fieldErrors.password}
                </p>
              )}
              {/* Forgot password — below the input */}
              <div className="flex justify-end pt-0.5">
                <Link href="/forgot-password"
                  className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors">
                  {t("login.forgotPassword")}
                </Link>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl border bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className={clsx(
                "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-150",
                loading
                  ? "bg-brand-400 text-white/70 cursor-not-allowed"
                  : "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30"
              )}>
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> {t("login.signingIn")}</>
                : <>{t("login.signIn")} <ArrowRight size={15} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5 sm:mt-6">
          {t("login.noAccount")}{" "}
          <Link href="/signup" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold transition-colors">
            {t("login.createFree")}
          </Link>
        </p>
      </div>
    </div>
  );
}
