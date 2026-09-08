"use client";

import { useState } from "react";
import {
  User, Bell, Globe, Lock, CreditCard,
  Users, Link, Palette, Save, Eye, EyeOff, Check,
} from "lucide-react";
import clsx from "clsx";

const sections = [
  { id: "profile",      label: "Profile",       icon: User },
  { id: "notifications",label: "Notifications", icon: Bell },
  { id: "preferences",  label: "Preferences",   icon: Palette },
  { id: "security",     label: "Security",       icon: Lock },
  { id: "billing",      label: "Billing",        icon: CreditCard },
  { id: "team",         label: "Team",           icon: Users },
  { id: "integrations", label: "Integrations",   icon: Link },
];

const integrations = [
  { name: "Slack",          desc: "Receive alerts in your Slack channel",    connected: true,  logo: "💬" },
  { name: "Google Analytics",desc: "Import GA4 event and traffic data",      connected: true,  logo: "📊" },
  { name: "Stripe",         desc: "Sync revenue and subscription metrics",   connected: false, logo: "💳" },
  { name: "Mixpanel",       desc: "Import product analytics events",         connected: false, logo: "🔬" },
  { name: "PagerDuty",      desc: "Route critical alerts to on-call team",   connected: false, logo: "🚨" },
  { name: "Segment",        desc: "Centralise your customer data pipeline",  connected: true,  logo: "⚡" },
];

const teamMembers = [
  { name: "Alex Kim",    email: "alex@orbit.io",    role: "Admin",  avatar: "AK", online: true },
  { name: "Sara Tadesse",email: "sara@orbit.io",    role: "Editor", avatar: "ST", online: true },
  { name: "Yonas Bekele",email: "yonas@orbit.io",   role: "Viewer", avatar: "YB", online: false },
  { name: "Liya Haile",  email: "liya@orbit.io",    role: "Editor", avatar: "LH", online: false },
];

const plans = [
  { name: "Starter",    price: "Free",    features: ["3 dashboards", "7-day history", "Email alerts"] },
  { name: "Pro",        price: "ETB 999/mo", features: ["Unlimited dashboards", "90-day history", "All channels"],   current: true },
  { name: "Enterprise", price: "Custom",  features: ["Custom SLA", "1yr history", "Dedicated support"] },
];

export default function SettingsTab() {
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true, slack: true, browser: false, weekly: true, monthly: true, alerts: true,
  });
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(
    new Set(integrations.filter((i) => i.connected).map((i) => i.name))
  );

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleIntegration = (name: string) => {
    setConnectedIntegrations((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  return (
    <div className="flex gap-6 animate-fade-in">

      {/* Sidebar nav */}
      <aside className="w-52 flex-shrink-0">
        <nav className="space-y-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={clsx(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                activeSection === id
                  ? "bg-brand-500/15 text-brand-400 border border-brand-500/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">

        {/* ── PROFILE ── */}
        {activeSection === "profile" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
            <h3 className="text-sm font-semibold text-white">Profile Settings</h3>

            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                AK
              </div>
              <div>
                <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white hover:bg-gray-700 transition-colors">
                  Upload Photo
                </button>
                <p className="text-xs text-gray-500 mt-1.5">JPG, PNG or GIF · Max 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "First Name",    value: "Alex" },
                { label: "Last Name",     value: "Kim" },
                { label: "Email Address", value: "alex@orbit.io" },
                { label: "Job Title",     value: "Head of Growth" },
                { label: "Company",       value: "Orbit Inc." },
                { label: "Time Zone",     value: "Africa/Addis_Ababa" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
                  <input
                    defaultValue={value}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Bio</label>
              <textarea
                rows={3}
                defaultValue="SaaS growth lead tracking KPIs and conversion metrics."
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 resize-none transition-all"
              />
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
            >
              {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {activeSection === "notifications" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
            <h3 className="text-sm font-semibold text-white">Notification Preferences</h3>

            {[
              { key: "email",   label: "Email Notifications",    desc: "Receive alerts and reports via email" },
              { key: "slack",   label: "Slack Notifications",     desc: "Send alerts to your Slack workspace" },
              { key: "browser", label: "Browser Push",            desc: "Desktop push notifications in-browser" },
              { key: "weekly",  label: "Weekly Digest",           desc: "Summary of key metrics every Monday" },
              { key: "monthly", label: "Monthly Report",          desc: "Detailed report on the 1st of each month" },
              { key: "alerts",  label: "Threshold Alerts",        desc: "Notify when a metric crosses a threshold" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                  className={clsx(
                    "relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0",
                    notifications[key as keyof typeof notifications] ? "bg-brand-500" : "bg-gray-700"
                  )}
                  style={{ height: 22, width: 40 }}
                >
                  <span className={clsx(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                    notifications[key as keyof typeof notifications] ? "left-5" : "left-0.5"
                  )} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── PREFERENCES ── */}
        {activeSection === "preferences" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
            <h3 className="text-sm font-semibold text-white">Display & Preferences</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Currency",       value: "ETB — Ethiopian Birr" },
                { label: "Date Format",    value: "MMM DD, YYYY" },
                { label: "Language",       value: "English (US)" },
                { label: "Fiscal Year",    value: "Starts January" },
                { label: "Default View",   value: "Overview" },
                { label: "Refresh Rate",   value: "Every 60 seconds" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
                  <select className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 appearance-none cursor-pointer">
                    <option>{value}</option>
                  </select>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 mb-3">Theme</p>
              <div className="flex gap-3">
                {["Dark", "Light", "System"].map((t) => (
                  <button
                    key={t}
                    className={clsx(
                      "px-4 py-2 rounded-lg text-sm border transition-all",
                      t === "Dark"
                        ? "bg-brand-500/15 border-brand-500/30 text-brand-400"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">
              {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Preferences</>}
            </button>
          </div>
        )}

        {/* ── SECURITY ── */}
        {activeSection === "security" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
            <h3 className="text-sm font-semibold text-white">Security Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 pr-10"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">New Password</label>
                <input type="password" placeholder="Min. 8 characters" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm New Password</label>
                <input type="password" placeholder="Repeat password" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500" />
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security</p>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium rounded-full">Not enabled</span>
              </div>
              <button className="mt-3 w-full py-2 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded-lg transition-colors">
                Enable 2FA
              </button>
            </div>

            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">
              {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Update Password</>}
            </button>
          </div>
        )}

        {/* ── BILLING ── */}
        {activeSection === "billing" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={clsx(
                    "bg-gray-900 border rounded-xl p-5 transition-all",
                    plan.current ? "border-brand-500/40 ring-1 ring-brand-500/20" : "border-gray-800"
                  )}
                >
                  {plan.current && (
                    <span className="inline-block mb-3 px-2.5 py-0.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-medium rounded-full">
                      Current Plan
                    </span>
                  )}
                  <p className="text-base font-bold text-white">{plan.name}</p>
                  <p className="text-xl font-extrabold text-brand-400 mt-1 mb-4">{plan.price}</p>
                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                        <Check size={12} className="text-brand-400 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button className={clsx(
                    "w-full py-2 text-sm rounded-lg font-medium transition-colors",
                    plan.current
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-brand-500 text-white hover:bg-brand-600"
                  )}>
                    {plan.current ? "Current" : plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Billing History</h3>
              <div className="space-y-2">
                {[
                  { date: "Sep 1, 2026",  desc: "Pro Plan — Monthly",  amount: "ETB 999" },
                  { date: "Aug 1, 2026",  desc: "Pro Plan — Monthly",  amount: "ETB 999" },
                  { date: "Jul 1, 2026",  desc: "Pro Plan — Monthly",  amount: "ETB 999" },
                  { date: "Jun 1, 2026",  desc: "Pro Plan — Monthly",  amount: "ETB 999" },
                ].map((inv) => (
                  <div key={inv.date} className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800 transition-colors">
                    <div>
                      <p className="text-sm text-white font-medium">{inv.desc}</p>
                      <p className="text-xs text-gray-500">{inv.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">{inv.amount}</span>
                      <span className="px-2 py-0.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs rounded-full">Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TEAM ── */}
        {activeSection === "team" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div>
                <h3 className="text-sm font-semibold text-white">Team Members</h3>
                <p className="text-xs text-gray-500 mt-0.5">{teamMembers.length} members · Pro plan allows unlimited</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">
                <Users size={13} /> Invite
              </button>
            </div>
            <div className="divide-y divide-gray-800">
              {teamMembers.map((m) => (
                <div key={m.email} className="flex items-center justify-between px-5 py-4 hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                        {m.avatar}
                      </div>
                      {m.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-400 border-2 border-gray-900 rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select className="px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-brand-500 cursor-pointer">
                      <option>{m.role}</option>
                      <option>Admin</option>
                      <option>Editor</option>
                      <option>Viewer</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INTEGRATIONS ── */}
        {activeSection === "integrations" && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Connected Integrations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {integrations.map((intg) => {
                  const isConnected = connectedIntegrations.has(intg.name);
                  return (
                    <div key={intg.name} className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{intg.logo}</span>
                        <div>
                          <p className="text-sm font-semibold text-white">{intg.name}</p>
                          <p className="text-xs text-gray-500">{intg.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleIntegration(intg.name)}
                        className={clsx(
                          "flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                          isConnected
                            ? "bg-brand-500/10 text-brand-400 border-brand-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                            : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-brand-500/10 hover:text-brand-400 hover:border-brand-500/20"
                        )}
                      >
                        {isConnected ? "Connected" : "Connect"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
