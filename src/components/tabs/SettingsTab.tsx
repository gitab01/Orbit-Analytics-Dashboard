"use client";
import { useState, useEffect } from "react";
import { User, Bell, Globe, Lock, CreditCard, Users, Link, Palette, Save, Eye, EyeOff, Check, Trash2, Plus, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";
import type { Profile, Notifications, TeamMember, MemberRole, Integration } from "@/lib/store";

const SECTIONS = [
  { id:"profile",       label:"Profile",        icon:User     },
  { id:"notifications", label:"Notifications",  icon:Bell     },
  { id:"preferences",   label:"Preferences",    icon:Palette  },
  { id:"security",      label:"Security",       icon:Lock     },
  { id:"billing",       label:"Billing",        icon:CreditCard},
  { id:"team",          label:"Team",           icon:Users    },
  { id:"integrations",  label:"Integrations",   icon:Link     },
];

const FIELD = "px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-all";
const CARD  = "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl";

export default function SettingsTab() {
  const { toast } = useToast();
  const [section, setSection]   = useState("profile");

  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [notifs,   setNotifs]   = useState<Notifications | null>(null);
  const [saving,   setSaving]   = useState(false);

  const [showPw,   setShowPw]   = useState(false);
  const [pw,       setPw]       = useState({ current:"", next:"", confirm:"" });

  const [team,     setTeam]     = useState<TeamMember[]>([]);
  const [invite,   setInvite]   = useState({ name:"", email:"", role:"Viewer" as MemberRole });
  const [showInvite, setShowInvite] = useState(false);

  const [integrations, setIntegrations] = useState<Integration[]>([]);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => { setProfile(d.profile); setNotifs(d.notifications); });
    fetch("/api/team").then(r => r.json()).then(d => setTeam(d.team));
    fetch("/api/integrations").then(r => r.json()).then(d => setIntegrations(d.integrations));
  }, []);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await fetch("/api/profile", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(profile) });
      toast("success", "Profile saved successfully");
    } finally { setSaving(false); }
  };

  const saveNotifs = async () => {
    if (!notifs) return;
    setSaving(true);
    try {
      await fetch("/api/profile", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ type:"notifications", data: notifs }) });
      toast("success", "Notification preferences saved");
    } finally { setSaving(false); }
  };

  const savePrefs = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await fetch("/api/profile", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(profile) });
      toast("success", "Preferences saved");
    } finally { setSaving(false); }
  };

  const changePassword = () => {
    if (!pw.current) { toast("error", "Enter current password"); return; }
    if (pw.next.length < 8) { toast("error", "New password must be at least 8 characters"); return; }
    if (pw.next !== pw.confirm) { toast("error", "Passwords do not match"); return; }
    toast("success", "Password updated successfully");
    setPw({ current:"", next:"", confirm:"" });
  };

  const inviteMember = async () => {
    if (!invite.name || !invite.email) { toast("error", "Name and email are required"); return; }
    const res  = await fetch("/api/team", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(invite) });
    const data = await res.json();
    setTeam(prev => [...prev, data]);
    setInvite({ name:"", email:"", role:"Viewer" });
    setShowInvite(false);
    toast("success", `${data.name} invited as ${data.role}`);
  };

  const changeRole = async (id: string, role: MemberRole) => {
    await fetch("/api/team", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id, role }) });
    setTeam(prev => prev.map(m => m.id === id ? { ...m, role } : m));
    toast("success", "Role updated");
  };

  const removeMember = async (id: string, name: string) => {
    await fetch("/api/team", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
    setTeam(prev => prev.filter(m => m.id !== id));
    toast("success", `${name} removed`);
  };

  const toggleIntegration = async (id: string) => {
    const res  = await fetch("/api/integrations", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
    const data = await res.json();
    setIntegrations(prev => prev.map(i => i.id === id ? data : i));
    toast("success", data.connected ? `${data.name} connected` : `${data.name} disconnected`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 animate-fade-in">

      {/* Nav */}
      <aside className="md:w-52 md:flex-shrink-0">
        <nav className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0 md:sticky md:top-24 scrollbar-none">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setSection(id)}
              className={clsx(
                "flex items-center gap-2 md:gap-3 w-auto md:w-full px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 md:flex-shrink border",
                section === id
                  ? "bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/20"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white border-transparent"
              )}>
              <Icon size={14} className="md:w-[15px] md:h-[15px]" />{label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* PROFILE */}
        {section === "profile" && profile && (
          <div className={clsx(CARD, "p-6 space-y-5")}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Profile Settings</h3>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
              <div>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Upload Photo</button>
                <p className="text-xs text-gray-400 mt-1.5">JPG, PNG · Max 2MB</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["firstName","lastName","email","jobTitle","company","timezone"] as (keyof Profile)[]).map(k => (
                <div key={k}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 capitalize">{k.replace(/([A-Z])/g," $1")}</label>
                  <input value={(profile as any)[k]} onChange={e => setProfile(p => p ? { ...p, [k]: e.target.value } : p)}
                    className={clsx(FIELD, "w-full")} />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Bio</label>
              <textarea rows={3} value={profile.bio} onChange={e => setProfile(p => p ? { ...p, bio: e.target.value } : p)}
                className={clsx(FIELD, "w-full resize-none")} />
            </div>
            <button onClick={saveProfile} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-60 transition-colors">
              {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {section === "notifications" && notifs && (
          <div className={clsx(CARD, "p-6 space-y-4")}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
            {(Object.keys(notifs) as (keyof Notifications)[]).map(k => (
              <div key={k} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{k.replace(/([A-Z])/g," $1")} Notifications</p>
                  <p className="text-xs text-gray-500 mt-0.5">{
                    { email:"Receive alerts and reports via email", slack:"Send alerts to your Slack workspace", browser:"Desktop push notifications",
                      weekly:"Summary every Monday", monthly:"Report on the 1st of each month", alerts:"Notify on metric thresholds" }[k]
                  }</p>
                </div>
                <button onClick={() => setNotifs(n => n ? { ...n, [k]: !n[k] } : n)}
                  className={clsx("relative rounded-full transition-colors flex-shrink-0", notifs[k] ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700")}
                  style={{ height:22, width:40 }}>
                  <span className={clsx("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", notifs[k] ? "left-5" : "left-0.5")} />
                </button>
              </div>
            ))}
            <button onClick={saveNotifs} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-60 transition-colors">
              <Save size={14} /> Save Preferences
            </button>
          </div>
        )}

        {/* PREFERENCES */}
        {section === "preferences" && profile && (
          <div className={clsx(CARD, "p-6 space-y-5")}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Display &amp; Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Currency */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Currency</label>
                <select value={profile.currency} onChange={e => setProfile(p => p ? { ...p, currency: e.target.value } : p)}
                  className={clsx(FIELD, "w-full cursor-pointer")}>
                  {["ETB","USD","EUR","GBP","KES","JPY","CNY","INR","AUD","CAD","CHF","BRL","MXN","NGN","ZAR","EGP","SAR","AED","TRY","SGD"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Language — grouped optgroup */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Language</label>
                <select value={profile.language} onChange={e => setProfile(p => p ? { ...p, language: e.target.value } : p)}
                  className={clsx(FIELD, "w-full cursor-pointer")}>
                  <optgroup label="── Ethiopian Languages ──">
                    <option>Amharic (አማርኛ)</option>
                    <option>Tigrigna (ትግርኛ)</option>
                    <option>Oromiffa (Afaan Oromoo)</option>
                    <option>Somali (Soomaali)</option>
                    <option>Sidamegna (Sidaamu Afoo)</option>
                    <option>Afar (Qafaraf)</option>
                    <option>Hadiyya</option>
                    <option>Wolaytta</option>
                    <option>Gurage</option>
                  </optgroup>
                  <optgroup label="── European Languages ──">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>French (Français)</option>
                    <option>Spanish (Español)</option>
                    <option>Portuguese (Português)</option>
                    <option>German (Deutsch)</option>
                    <option>Italian (Italiano)</option>
                    <option>Russian (Русский)</option>
                    <option>Dutch (Nederlands)</option>
                    <option>Polish (Polski)</option>
                    <option>Swedish (Svenska)</option>
                    <option>Norwegian (Norsk)</option>
                    <option>Danish (Dansk)</option>
                    <option>Finnish (Suomi)</option>
                    <option>Greek (Ελληνικά)</option>
                    <option>Ukrainian (Українська)</option>
                    <option>Romanian (Română)</option>
                    <option>Hungarian (Magyar)</option>
                    <option>Czech (Čeština)</option>
                    <option>Slovak (Slovenčina)</option>
                    <option>Bulgarian (Български)</option>
                    <option>Croatian (Hrvatski)</option>
                    <option>Serbian (Српски)</option>
                  </optgroup>
                  <optgroup label="── Middle East & Central Asia ──">
                    <option>Arabic (العربية)</option>
                    <option>Hebrew (עברית)</option>
                    <option>Persian (فارسی)</option>
                    <option>Turkish (Türkçe)</option>
                    <option>Urdu (اردو)</option>
                  </optgroup>
                  <optgroup label="── Asia Pacific ──">
                    <option>Chinese Simplified (中文简体)</option>
                    <option>Chinese Traditional (中文繁體)</option>
                    <option>Japanese (日本語)</option>
                    <option>Korean (한국어)</option>
                    <option>Hindi (हिन्दी)</option>
                    <option>Bengali (বাংলা)</option>
                    <option>Indonesian (Bahasa Indonesia)</option>
                    <option>Malay (Bahasa Melayu)</option>
                    <option>Thai (ภาษาไทย)</option>
                    <option>Vietnamese (Tiếng Việt)</option>
                  </optgroup>
                  <optgroup label="── Africa ──">
                    <option>Swahili (Kiswahili)</option>
                    <option>Hausa</option>
                    <option>Yoruba</option>
                    <option>Igbo</option>
                    <option>Zulu (isiZulu)</option>
                    <option>Afrikaans</option>
                  </optgroup>
                </select>
              </div>

              {/* Remaining preferences */}
              {([
                { key:"dateFormat",  label:"Date Format",  opts:["MMM DD, YYYY","DD/MM/YYYY","YYYY-MM-DD"] },
                { key:"fiscalYear",  label:"Fiscal Year",  opts:["January","July","April","October"] },
                { key:"defaultView", label:"Default View", opts:["Overview","Revenue","Users","Analytics"] },
                { key:"refreshRate", label:"Refresh Rate (seconds)", opts:["30","60","120","300"] },
              ] as { key: keyof Profile; label: string; opts: string[] }[]).map(({ key, label, opts }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
                  <select value={(profile as any)[key]} onChange={e => setProfile(p => p ? { ...p, [key]: e.target.value } : p)}
                    className={clsx(FIELD, "w-full cursor-pointer")}>
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Theme</p>
              <div className="flex gap-3">
                {["Dark","Light","System"].map(t => (
                  <button key={t} onClick={() => setProfile(p => p ? { ...p, theme: t } : p)}
                    className={clsx("px-4 py-2 rounded-lg text-sm border transition-all",
                      profile.theme === t
                        ? "bg-brand-50 dark:bg-brand-500/15 border-brand-300 dark:border-brand-500/30 text-brand-700 dark:text-brand-400"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    )}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={savePrefs} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-60 transition-colors">
              <Save size={14} /> Save Preferences
            </button>
          </div>
        )}

        {/* SECURITY */}
        {section === "security" && (
          <div className={clsx(CARD, "p-6 space-y-5")}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Security Settings</h3>
            <div className="space-y-4">
              {([
                { label:"Current Password", key:"current" as const, ph:"••••••••" },
                { label:"New Password",     key:"next"    as const, ph:"Min. 8 characters" },
                { label:"Confirm Password", key:"confirm" as const, ph:"Repeat new password" },
              ]).map(({ label, key, ph }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} placeholder={ph} value={pw[key]}
                      onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                      className={clsx(FIELD, "w-full pr-10")} />
                    {key === "current" && (
                      <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={changePassword}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">
              <Save size={14} /> Update Password
            </button>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security to your account</p>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-medium rounded-full">Not enabled</span>
              </div>
              <button onClick={() => toast("info", "2FA setup: check your email for a verification code")}
                className="mt-3 w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-white rounded-lg transition-colors">Enable 2FA</button>
            </div>
          </div>
        )}

        {/* BILLING */}
        {section === "billing" && profile && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name:"Starter",    price:"Free",            features:["3 dashboards","7-day history","Email alerts"],              current:false },
                { name:"Pro",        price:`${profile.currency} 999/mo`, features:["Unlimited dashboards","90-day history","All channels"], current:true  },
                { name:"Enterprise", price:"Custom",           features:["Custom SLA","1yr history","Dedicated support"],            current:false },
              ].map(plan => (
                <div key={plan.name} className={clsx(CARD, "p-5 transition-all", plan.current && "ring-1 ring-brand-500/30 border-brand-300 dark:border-brand-500/40")}>
                  {plan.current && <span className="inline-block mb-3 px-2.5 py-0.5 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 text-xs font-medium rounded-full">Current Plan</span>}
                  <p className="text-base font-bold text-gray-900 dark:text-white">{plan.name}</p>
                  <p className="text-xl font-extrabold text-brand-600 dark:text-brand-400 mt-1 mb-4">{plan.price}</p>
                  <ul className="space-y-2 mb-5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                        <Check size={12} className="text-brand-500 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => plan.current ? null : toast("info", plan.name === "Enterprise" ? "Sales team will contact you shortly" : `Upgrading to ${plan.name}…`)}
                    className={clsx("w-full py-2 text-sm rounded-lg font-medium transition-colors",
                      plan.current
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                        : "bg-brand-500 text-white hover:bg-brand-600"
                    )}>
                    {plan.current ? "Current Plan" : plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
                  </button>
                </div>
              ))}
            </div>
            <div className={clsx(CARD, "p-5")}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Billing History</h3>
              {[
                { date:"Sep 1, 2026", desc:"Pro Plan — Monthly" },
                { date:"Aug 1, 2026", desc:"Pro Plan — Monthly" },
                { date:"Jul 1, 2026", desc:"Pro Plan — Monthly" },
                { date:"Jun 1, 2026", desc:"Pro Plan — Monthly" },
              ].map(inv => (
                <div key={inv.date} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-2 border border-gray-100 dark:border-transparent">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{inv.desc}</p>
                    <p className="text-xs text-gray-500">{inv.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{profile.currency} 999</span>
                    <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 text-xs rounded-full">Paid</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEAM */}
        {section === "team" && (
          <div className={CARD}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Team Members</h3>
                <p className="text-xs text-gray-500 mt-0.5">{team.length} members</p>
              </div>
              <button onClick={() => setShowInvite(!showInvite)}
                className="flex items-center gap-1.5 px-3 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">
                <Plus size={13} /> Invite
              </button>
            </div>

            {showInvite && (
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input placeholder="Full name" value={invite.name} onChange={e => setInvite(p => ({ ...p, name: e.target.value }))}
                    className={clsx(FIELD, "w-full")} />
                  <input placeholder="Email address" type="email" value={invite.email} onChange={e => setInvite(p => ({ ...p, email: e.target.value }))}
                    className={clsx(FIELD, "w-full")} />
                  <select value={invite.role} onChange={e => setInvite(p => ({ ...p, role: e.target.value as MemberRole }))}
                    className={clsx(FIELD, "w-full cursor-pointer")}>
                    {["Admin","Editor","Viewer"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={inviteMember} className="px-5 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">Send Invite</button>
                  <button onClick={() => setShowInvite(false)} className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                </div>
              </div>
            )}

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {team.map(m => (
                <div key={m.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">{m.avatar}</div>
                      {m.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-400 border-2 border-white dark:border-gray-900 rounded-full" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={m.role} onChange={e => changeRole(m.id, e.target.value as MemberRole)}
                      className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-300 focus:outline-none focus:border-brand-500 cursor-pointer">
                      {["Admin","Editor","Viewer"].map(r => <option key={r}>{r}</option>)}
                    </select>
                    <button onClick={() => removeMember(m.id, m.name)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INTEGRATIONS */}
        {section === "integrations" && (
          <div className={clsx(CARD, "p-5")}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Integrations</h3>
            <p className="text-xs text-gray-500 mb-5">{integrations.filter(i => i.connected).length} of {integrations.length} connected</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {integrations.map(intg => (
                <div key={intg.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{intg.logo}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{intg.name}</p>
                      <p className="text-xs text-gray-500">{intg.desc}</p>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">{intg.category}</span>
                    </div>
                  </div>
                  <button onClick={() => toggleIntegration(intg.id)}
                    className={clsx("flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                      intg.connected
                        ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/20"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-700 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-brand-500/20"
                    )}>
                    {intg.connected ? "Connected ✓" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
