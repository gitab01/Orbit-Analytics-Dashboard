"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Orbit, ArrowRight, Loader2 } from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => { setEmail("alex@orbit.io"); setPassword("demo1234"); setError(""); };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 transition-colors">

      {/* Theme toggle — top right */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl bg-brand-500/10 dark:bg-brand-500/10" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl bg-blue-500/5 dark:bg-blue-500/8" />
      </div>

      <div className="w-full max-w-sm relative">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 mb-4 shadow-lg shadow-brand-500/30">
            <Orbit size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your Orbit dashboard</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 shadow-xl
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-800">

          {/* Demo hint */}
          <button onClick={fillDemo} type="button"
            className="w-full mb-5 flex items-center justify-between px-4 py-3 rounded-xl border transition-colors group
              bg-brand-50 dark:bg-brand-500/8 border-brand-200 dark:border-brand-500/20
              hover:bg-brand-100 dark:hover:bg-brand-500/12">
            <div className="text-left">
              <p className="text-xs font-semibold text-brand-700 dark:text-brand-400">Try the demo</p>
              <p className="text-xs text-gray-500 mt-0.5">alex@orbit.io · demo1234</p>
            </div>
            <ArrowRight size={14} className="text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                Email address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required autoComplete="email"
                className="w-full px-4 py-3 text-sm rounded-xl border transition-all
                  bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                  text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
                  focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30" />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Password</label>
                <Link href="/login" className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 text-sm rounded-xl border transition-all
                    bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
                    focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className={clsx(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                loading
                  ? "bg-brand-400 text-white/70 cursor-not-allowed"
                  : "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/20"
              )}>
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Signing in…</>
                : <>Sign in <ArrowRight size={15} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
