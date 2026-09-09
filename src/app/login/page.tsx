"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Orbit, ArrowRight, Loader2, AlertCircle, Mail, Lock } from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "@/components/ThemeToggle";
import { validateEmailField } from "@/lib/validate";

export default function LoginPage() {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // ── Validators ───────────────────────────────────────────────
  const validateEmail    = (v: string) => validateEmailField(v) ?? "";
  const validatePassword = (v: string) => (!v ? "Password is required" : "");

  const handleEmailChange = (v: string) => {
    setEmail(v);
    if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: validateEmail(v) }));
  };
  const handlePasswordChange = (v: string) => {
    setPassword(v);
    if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: validatePassword(v) }));
  };

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
      if (!res.ok) { setError(data.error ?? "Sign in failed. Please try again."); return; }
      window.location.href = "/";
    } catch { setError("Network error — please check your connection and try again."); }
    finally { setLoading(false); }
  };

  const fillDemo = () => { setEmail("alex@orbit.io"); setPassword("demo1234"); setError(""); setFieldErrors({}); };

  const inputBase = "w-full px-4 py-3 text-sm rounded-xl border transition-all bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1";
  const inputOk   = "border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/30";
  const inputErr  = "border-red-400 dark:border-red-500/60 focus:border-red-500 focus:ring-red-500/20";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="fixed top-4 right-4 z-10"><ThemeToggle /></div>

      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl bg-brand-500/10" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl bg-blue-500/6" />
      </div>

      <div className="w-full max-w-sm relative">

        {/* Logo & heading */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 mb-4 shadow-lg shadow-brand-500/30">
            <Orbit size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your Orbit dashboard</p>
        </div>

        <div className="rounded-2xl p-6 shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">

          {/* Demo shortcut */}
          <button onClick={fillDemo} type="button"
            className="w-full mb-5 flex items-center justify-between px-4 py-3 rounded-xl border transition-colors group bg-brand-50 dark:bg-brand-500/8 border-brand-200 dark:border-brand-500/20 hover:bg-brand-100 dark:hover:bg-brand-500/15">
            <div className="text-left">
              <p className="text-xs font-semibold text-brand-700 dark:text-brand-400">Try the demo</p>
              <p className="text-xs text-gray-500 mt-0.5">alex@orbit.io · demo1234</p>
            </div>
            <ArrowRight size={14} className="text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* ── Email ── */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  onBlur={() => setFieldErrors(p => ({ ...p, email: validateEmail(email) }))}
                  placeholder="name@gmail.com"
                  autoComplete="email"
                  autoCapitalize="off"
                  spellCheck={false}
                  className={clsx(inputBase, "pl-10", fieldErrors.email ? inputErr : inputOk)}
                />
              </div>
              {fieldErrors.email && (
                <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
                  <AlertCircle size={11} className="flex-shrink-0" />{fieldErrors.email}
                </p>
              )}
            </div>

            {/* ── Password ── */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => handlePasswordChange(e.target.value)}
                  onBlur={() => setFieldErrors(p => ({ ...p, password: validatePassword(password) }))}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={clsx(inputBase, "pl-10 pr-11", fieldErrors.password ? inputErr : inputOk)}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
                  <AlertCircle size={11} className="flex-shrink-0" />{fieldErrors.password}
                </p>
              )}
              {/* ── Forgot password — below the input ── */}
              <div className="flex justify-end mt-1.5">
                <Link href="/forgot-password"
                  className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Server error */}
            {error && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg border bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className={clsx("w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                loading ? "bg-brand-400 text-white/70 cursor-not-allowed" : "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/20"
              )}>
              {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : <>Sign in <ArrowRight size={15} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
