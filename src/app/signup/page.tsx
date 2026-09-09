"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Orbit, ArrowRight, Loader2, Check } from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "@/components/ThemeToggle";

export default function SignupPage() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const pwStrength    = password.length >= 8 ? "strong" : password.length >= 6 ? "medium" : password.length > 0 ? "weak" : "" as const;
  const strengthColor = ({ strong: "bg-brand-500", medium: "bg-amber-500", weak: "bg-red-500" } as Record<string,string>)[pwStrength] ?? "";
  const strengthWidth = ({ strong: "w-full", medium: "w-2/3", weak: "w-1/3" } as Record<string,string>)[pwStrength] ?? "w-0";
  const strengthLabel = ({ strong: "Strong", medium: "Medium", weak: "Weak" } as Record<string,string>)[pwStrength] ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
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

  const inputCls = "w-full px-4 py-3 text-sm rounded-xl border transition-all bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 transition-colors">

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl bg-brand-500/8 dark:bg-brand-500/8" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl bg-blue-500/5 dark:bg-blue-500/8" />
      </div>

      <div className="w-full max-w-sm relative">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 mb-4 shadow-lg shadow-brand-500/30">
            <Orbit size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Start monitoring your KPIs today</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">

          {/* Benefits */}
          <div className="flex flex-wrap gap-3 mb-5">
            {["Free forever plan", "Real-time charts", "Team collaboration"].map(b => (
              <div key={b} className="flex items-center gap-1.5 text-xs text-gray-500">
                <Check size={12} className="text-brand-500 flex-shrink-0" />
                {b}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Alex Kim" required autoComplete="name" className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required autoComplete="email" className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters" required autoComplete="new-password"
                  className={clsx(inputCls, "pr-11")} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                    <div className={clsx("h-full rounded-full transition-all duration-300", strengthColor, strengthWidth)} />
                  </div>
                  <span className={clsx("text-xs font-medium", {
                    "text-brand-600 dark:text-brand-400": pwStrength === "strong",
                    "text-amber-600 dark:text-amber-400": pwStrength === "medium",
                    "text-red-600   dark:text-red-400":   pwStrength === "weak",
                  })}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">Confirm password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password" required autoComplete="new-password"
                  className={clsx(
                    "w-full px-4 py-3 pr-11 text-sm rounded-xl border transition-all focus:outline-none focus:ring-1",
                    "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600",
                    confirm && confirm !== password
                      ? "border-red-400 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : confirm && confirm === password
                      ? "border-brand-400 dark:border-brand-500/50 focus:border-brand-500 focus:ring-brand-500/20"
                      : "border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/30"
                  )} />
                {confirm && confirm === password && (
                  <Check size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500" />
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className={clsx(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                loading
                  ? "bg-brand-400 text-white/70 cursor-not-allowed"
                  : "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/20"
              )}>
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Creating account…</>
                : <>Create account <ArrowRight size={15} /></>}
            </button>

            <p className="text-center text-xs text-gray-400">
              By creating an account you agree to our{" "}
              <span className="text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Terms of Service</span>
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
