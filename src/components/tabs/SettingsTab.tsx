"use client";
import { useState, useEffect, useRef } from "react";
import {
  User, Bell, Lock, CreditCard, Users, Link, Palette,
  Save, Eye, EyeOff, Check, Trash2, Plus, RefreshCw, Camera, Upload,
} from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Profile, Notifications, TeamMember, MemberRole, Integration } from "@/lib/store";

// ── Language groups ───────────────────────────────────────────
const LANGUAGE_GROUPS: { group: string; langs: string[] }[] = [
  { group: "🇪🇹 Ethiopian Languages", langs: ["Amharic (አማርኛ)","Tigrigna (ትግርኛ)","Oromiffa (Afaan Oromoo)","Somali (Soomaali)","Sidamegna (Sidaamu Afoo)","Afar (Qafaraf)","Hadiyya","Wolaytta","Gurage"] },
  { group: "🌍 European Languages",   langs: ["English (US)","English (UK)","French (Français)","Spanish (Español)","Portuguese (Português)","German (Deutsch)","Italian (Italiano)","Russian (Русский)","Dutch (Nederlands)","Polish (Polski)","Swedish (Svenska)","Norwegian (Norsk)","Danish (Dansk)","Finnish (Suomi)","Greek (Ελληνικά)","Ukrainian (Українська)","Romanian (Română)","Hungarian (Magyar)","Czech (Čeština)","Slovak (Slovenčina)","Bulgarian (Български)","Croatian (Hrvatski)","Serbian (Српски)"] },
  { group: "🕌 Middle East",          langs: ["Arabic (العربية)","Hebrew (עברית)","Persian (فارسی)","Turkish (Türkçe)","Urdu (اردو)"] },
  { group: "🌏 Asia Pacific",         langs: ["Chinese Simplified (中文简体)","Chinese Traditional (中文繁體)","Japanese (日本語)","Korean (한국어)","Hindi (हिन्दी)","Bengali (বাংলা)","Indonesian (Bahasa Indonesia)","Malay (Bahasa Melayu)","Thai (ภาษาไทย)","Vietnamese (Tiếng Việt)"] },
  { group: "🌍 Africa",               langs: ["Swahili (Kiswahili)","Hausa","Yoruba","Igbo","Zulu (isiZulu)","Afrikaans"] },
];
const ALL_LANGUAGES = LANGUAGE_GROUPS.flatMap(g => g.langs);
const resolveLanguage = (lang: string) => {
  if (!lang) return "English (US)";
  if (ALL_LANGUAGES.includes(lang)) return lang;
  const fb: Record<string,string> = { "en-US":"English (US)","en-GB":"English (UK)","am":"Amharic (አማርኛ)","ti":"Tigrigna (ትግርኛ)","om":"Oromiffa (Afaan Oromoo)","so":"Somali (Soomaali)","sid":"Sidamegna (Sidaamu Afoo)","fr":"French (Français)","es":"Spanish (Español)","de":"German (Deutsch)","ar":"Arabic (العربية)","zh-CN":"Chinese Simplified (中文简体)","ja":"Japanese (日本語)" };
  return fb[lang] ?? "English (US)";
};

const FIELD = "px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-all";
const CARD  = "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl";

export default function SettingsTab() {
  const { toast }             = useToast();
  const { t, setLanguage }    = useLanguage();
  const fileInputRef          = useRef<HTMLInputElement>(null);

  const [section,      setSection]      = useState("profile");
  const [profile,      setProfile]      = useState<Profile & { avatarUrl?: string } | null>(null);
  const [notifs,       setNotifs]       = useState<Notifications | null>(null);
  const [saving,       setSaving]       = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [showPw,  setShowPw]  = useState(false);
  const [pw,      setPw]      = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);

  const [team,       setTeam]       = useState<TeamMember[]>([]);
  const [invite,     setInvite]     = useState({ name: "", email: "", role: "Viewer" as MemberRole });
  const [showInvite, setShowInvite] = useState(false);

  const [integrations, setIntegrations] = useState<Integration[]>([]);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => { setProfile(d.profile); setNotifs(d.notifications); });
    fetch("/api/team").then(r => r.json()).then(d => setTeam(d.team));
    fetch("/api/integrations").then(r => r.json()).then(d => setIntegrations(d.integrations));
  }, []);

  // ── Photo upload ─────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast("error", "File too large. Max 2MB."); return; }

    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/profile/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { toast("error", data.error ?? "Upload failed"); return; }
      setProfile(p => p ? { ...p, avatarUrl: data.avatarUrl } : p);
      toast("success", "Photo updated");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Profile save ─────────────────────────────────────────────
  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
      const data = await res.json();
      if (res.ok) toast("success", t("settings.profileSaved"));
      else toast("error", data.error ?? t("settings.profileFailed"));
    } finally { setSaving(false); }
  };

  // ── Notifications save ────────────────────────────────────────
  const saveNotifs = async () => {
    if (!notifs) return;
    setSaving(true);
    try {
      await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "notifications", data: notifs }) });
      toast("success", t("settings.notifSaved"));
    } finally { setSaving(false); }
  };

  // ── Preferences save — also updates language context live ────
  const savePrefs = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
      if (res.ok) {
        setLanguage(profile.language); // apply language system-wide immediately
        toast("success", t("settings.prefsSaved"));
      } else toast("error", t("settings.prefsFailed"));
    } finally { setSaving(false); }
  };

  // ── Password change (real API) ────────────────────────────────
  const changePassword = async () => {
    if (!pw.current) { toast("error", t("settings.enterCurrentPw")); return; }
    if (pw.next.length < 8) { toast("error", t("settings.pwMin8")); return; }
    if (pw.next !== pw.confirm) { toast("error", t("settings.pwNoMatch")); return; }
    setPwSaving(true);
    try {
      const res  = await fetch("/api/profile/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }) });
      const data = await res.json();
      if (res.ok) { toast("success", t("settings.pwUpdated")); setPw({ current: "", next: "", confirm: "" }); }
      else toast("error", data.error ?? "Failed to update password");
    } finally { setPwSaving(false); }
  };

  // ── Team ──────────────────────────────────────────────────────
  const inviteMember = async () => {
    if (!invite.name || !invite.email) { toast("error", t("settings.nameEmailRequired")); return; }
    const res  = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(invite) });
    const data = await res.json();
    if (!res.ok) { toast("error", data.error ?? "Failed to invite"); return; }
    setTeam(prev => [...prev, data]);
    setInvite({ name: "", email: "", role: "Viewer" });
    setShowInvite(false);
    toast("success", t("settings.invitedAs", { name: data.name, role: data.role }));
  };

  const changeRole = async (id: string, role: MemberRole) => {
    const res = await fetch("/api/team", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, role }) });
    if (res.ok) { setTeam(prev => prev.map(m => m.id === id ? { ...m, role } : m)); toast("success", t("settings.roleUpdated")); }
  };

  const removeMember = async (id: string, name: string) => {
    const res = await fetch("/api/team", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) { setTeam(prev => prev.filter(m => m.id !== id)); toast("success", t("settings.removed", { name })); }
  };

  // ── Integrations ──────────────────────────────────────────────
  const toggleIntegration = async (id: string) => {
    const res  = await fetch("/api/integrations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await res.json();
    setIntegrations(prev => prev.map(i => i.id === id ? data : i));
    toast("success", data.connected ? t("settings.connectedToast", { name: data.name }) : t("settings.disconnectedToast", { name: data.name }));
  };

  const SECTIONS = [
    { id:"profile",       label: t("settings.profile"),       icon: User       },
    { id:"notifications", label: t("settings.notifications"), icon: Bell       },
    { id:"preferences",   label: t("settings.preferences"),   icon: Palette    },
    { id:"security",      label: t("settings.security"),      icon: Lock       },
    { id:"billing",       label: t("settings.billing"),       icon: CreditCard },
    { id:"team",          label: t("settings.team"),          icon: Users      },
    { id:"integrations",  label: t("settings.integrations"),  icon: Link       },
  ];

  // Avatar display
  const initials  = `${profile?.firstName?.[0] ?? ""}${profile?.lastName?.[0] ?? ""}`.toUpperCase() || "AK";
  const avatarUrl = (profile as any)?.avatarUrl;

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 animate-fade-in">

      {/* Sidebar nav */}
      <aside className="md:w-52 md:flex-shrink-0">
        <nav className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0 md:sticky md:top-24 scrollbar-none">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setSection(id)}
              className={clsx("flex items-center gap-2 md:gap-3 w-auto md:w-full px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 md:flex-shrink border",
                section === id
                  ? "bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/20"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white border-transparent"
              )}>
              <Icon size={14} />{label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 space-y-5">

        {/* ── PROFILE ── */}
        {section === "profile" && profile && (
          <div className={clsx(CARD, "p-6 space-y-5")}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("settings.profileTitle")}</h3>

            {/* Avatar upload */}
            <div className="flex items-center gap-5">
              <div className="relative group">
                {avatarUrl
                  ? <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-200 dark:border-brand-700" />
                  : <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-xl font-bold text-white">{initials}</div>
                }
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title={t("settings.uploadPhoto")}>
                  {avatarUploading
                    ? <RefreshCw size={18} className="text-white animate-spin" />
                    : <Camera size={18} className="text-white" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div>
                <button onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                  <Upload size={14} />{avatarUploading ? "Uploading…" : t("settings.uploadPhoto")}
                </button>
                <p className="text-xs text-gray-400 mt-1.5">{t("settings.photoHint")}</p>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                { key:"firstName", label: t("settings.firstName") },
                { key:"lastName",  label: t("settings.lastName")  },
                { key:"email",     label: t("settings.email")     },
                { key:"jobTitle",  label: t("settings.jobTitle")  },
                { key:"company",   label: t("settings.company")   },
                { key:"timezone",  label: t("settings.timezone")  },
              ] as { key: keyof Profile; label: string }[]).map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
                  <input value={(profile as any)[key] ?? ""}
                    onChange={e => setProfile(p => p ? { ...p, [key]: e.target.value } : p)}
                    className={clsx(FIELD, "w-full")} />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t("settings.bio")}</label>
              <textarea rows={3} value={profile.bio ?? ""}
                onChange={e => setProfile(p => p ? { ...p, bio: e.target.value } : p)}
                className={clsx(FIELD, "w-full resize-none")} />
            </div>
            <button onClick={saveProfile} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-60 transition-colors">
              {saving ? <><RefreshCw size={14} className="animate-spin" />{t("settings.saving")}</> : <><Save size={14} />{t("settings.saveChanges")}</>}
            </button>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {section === "notifications" && notifs && (
          <div className={clsx(CARD, "p-6 space-y-4")}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("settings.notifTitle")}</h3>
            {(Object.keys(notifs) as (keyof Notifications)[]).map(k => (
              <div key={k} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t(`settings.${k}Notif` as any)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t(`settings.${k}NotifDesc` as any)}</p>
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
              <Save size={14} />{t("settings.savePrefs")}
            </button>
          </div>
        )}

        {/* ── PREFERENCES ── */}
        {section === "preferences" && profile && (
          <div className={clsx(CARD, "p-6 space-y-5")}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("settings.prefsTitle")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Currency */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t("settings.currency")}</label>
                <select value={profile.currency ?? "USD"} onChange={e => setProfile(p => p ? { ...p, currency: e.target.value } : p)} className={clsx(FIELD,"w-full cursor-pointer")}>
                  {["ETB","USD","EUR","GBP","KES","JPY","CNY","INR","AUD","CAD","CHF","BRL","MXN","NGN","ZAR","EGP","SAR","AED","TRY","SGD"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Language — changes UI live on save */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t("settings.language")}</label>
                <select value={resolveLanguage(profile.language)} onChange={e => setProfile(p => p ? { ...p, language: e.target.value } : p)} className={clsx(FIELD,"w-full cursor-pointer")}>
                  {LANGUAGE_GROUPS.map(({ group, langs }) => (
                    <optgroup key={group} label={group}>
                      {langs.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </optgroup>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">{t("settings.currently")} <span className="font-medium text-gray-600 dark:text-gray-300">{resolveLanguage(profile.language)}</span></p>
              </div>

              {/* Date Format */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t("settings.dateFormat")}</label>
                <select value={profile.dateFormat ?? "MMM DD, YYYY"} onChange={e => setProfile(p => p ? { ...p, dateFormat: e.target.value } : p)} className={clsx(FIELD,"w-full cursor-pointer")}>
                  {["MMM DD, YYYY","DD/MM/YYYY","YYYY-MM-DD","MM-DD-YYYY"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Fiscal Year */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t("settings.fiscalYear")}</label>
                <select value={profile.fiscalYear ?? "January"} onChange={e => setProfile(p => p ? { ...p, fiscalYear: e.target.value } : p)} className={clsx(FIELD,"w-full cursor-pointer")}>
                  {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              {/* Default View */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t("settings.defaultView")}</label>
                <select value={profile.defaultView ?? "Overview"} onChange={e => setProfile(p => p ? { ...p, defaultView: e.target.value } : p)} className={clsx(FIELD,"w-full cursor-pointer")}>
                  {["Overview","Revenue","Users","Sessions","Analytics","Reports"].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>

              {/* Refresh Rate */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t("settings.refreshRate")}</label>
                <select value={profile.refreshRate ?? "60"} onChange={e => setProfile(p => p ? { ...p, refreshRate: e.target.value } : p)} className={clsx(FIELD,"w-full cursor-pointer")}>
                  <option value="30">{t("settings.every30s")}</option>
                  <option value="60">{t("settings.every60s")}</option>
                  <option value="120">{t("settings.every2m")}</option>
                  <option value="300">{t("settings.every5m")}</option>
                  <option value="0">{t("settings.manualOnly")}</option>
                </select>
              </div>
            </div>

            {/* Theme */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{t("settings.theme")}</p>
              <div className="flex gap-3">
                {(["Dark","Light","System"] as const).map(thm => (
                  <button key={thm} onClick={() => setProfile(p => p ? { ...p, theme: thm } : p)}
                    className={clsx("px-4 py-2 rounded-lg text-sm border transition-all",
                      profile.theme === thm
                        ? "bg-brand-50 dark:bg-brand-500/15 border-brand-300 dark:border-brand-500/30 text-brand-700 dark:text-brand-400"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    )}>
                    {thm === "Dark" ? t("settings.dark") : thm === "Light" ? t("settings.light") : t("settings.system")}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={savePrefs} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-60 transition-colors">
              {saving ? <><RefreshCw size={14} className="animate-spin" />{t("settings.saving")}</> : <><Save size={14} />{t("settings.savePrefs")}</>}
            </button>
          </div>
        )}

        {/* ── SECURITY ── */}
        {section === "security" && (
          <div className={clsx(CARD, "p-6 space-y-5")}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("settings.securityTitle")}</h3>
            <div className="space-y-4">
              {([
                { label: t("settings.currentPassword"), key: "current" as const, ph: "••••••••"                     },
                { label: t("settings.newPassword"),     key: "next"    as const, ph: t("settings.pwMin8")           },
                { label: t("settings.confirmPassword"), key: "confirm" as const, ph: t("settings.confirmPassword")  },
              ]).map(({ label, key, ph }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} placeholder={ph} value={pw[key]}
                      onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                      className={clsx(FIELD, "w-full pr-10")} />
                    {key === "current" && (
                      <button onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={changePassword} disabled={pwSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-60 transition-colors">
              {pwSaving ? <><RefreshCw size={14} className="animate-spin" />{t("settings.saving")}</> : <><Save size={14} />{t("settings.updatePassword")}</>}
            </button>

            {/* 2FA */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t("settings.twoFA")}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t("settings.twoFADesc")}</p>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-medium rounded-full">{t("settings.twoFANotEnabled")}</span>
              </div>
              <button onClick={() => toast("info", "2FA setup: check your email for a verification code")}
                className="mt-3 w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-white rounded-lg transition-colors">
                {t("settings.enable2FA")}
              </button>
            </div>
          </div>
        )}

        {/* ── BILLING ── */}
        {section === "billing" && profile && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name:"Starter",    price:"Free",                              features:["3 dashboards","7-day history","Email alerts"],              current:false },
                { name:"Pro",        price:`${profile.currency ?? "USD"} 999/mo`, features:["Unlimited dashboards","90-day history","All channels"],  current:true  },
                { name:"Enterprise", price:"Custom",                             features:["Custom SLA","1yr history","Dedicated support"],           current:false },
              ].map(plan => (
                <div key={plan.name} className={clsx(CARD,"p-5 transition-all", plan.current && "ring-1 ring-brand-500/30 border-brand-300 dark:border-brand-500/40")}>
                  {plan.current && <span className="inline-block mb-3 px-2.5 py-0.5 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 text-xs font-medium rounded-full">{t("settings.currentPlan")}</span>}
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
                    className={clsx("w-full py-2 text-sm rounded-lg font-medium transition-colors", plan.current ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed" : "bg-brand-500 text-white hover:bg-brand-600")}>
                    {plan.current ? t("settings.currentPlan") : plan.name === "Enterprise" ? t("settings.contactSales") : t("settings.upgrade")}
                  </button>
                </div>
              ))}
            </div>
            <div className={clsx(CARD,"p-5")}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t("settings.billingHistory")}</h3>
              {["Sep 1, 2026","Aug 1, 2026","Jul 1, 2026","Jun 1, 2026"].map(date => (
                <div key={date} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-2 border border-gray-100 dark:border-transparent">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">Pro Plan — Monthly</p>
                    <p className="text-xs text-gray-500">{date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{profile.currency ?? "USD"} 999</span>
                    <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 text-xs rounded-full">{t("settings.paid")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TEAM ── */}
        {section === "team" && (
          <div className={CARD}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("settings.teamMembers")}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{t("settings.nMembers", { n: team.length })}</p>
              </div>
              <button onClick={() => setShowInvite(!showInvite)}
                className="flex items-center gap-1.5 px-3 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">
                <Plus size={13} />{t("settings.invite")}
              </button>
            </div>
            {showInvite && (
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input placeholder={t("settings.fullName")} value={invite.name} onChange={e => setInvite(p => ({ ...p, name: e.target.value }))} className={clsx(FIELD,"w-full")} />
                  <input placeholder={t("settings.emailAddress")} type="email" value={invite.email} onChange={e => setInvite(p => ({ ...p, email: e.target.value }))} className={clsx(FIELD,"w-full")} />
                  <select value={invite.role} onChange={e => setInvite(p => ({ ...p, role: e.target.value as MemberRole }))} className={clsx(FIELD,"w-full cursor-pointer")}>
                    {["Admin","Editor","Viewer"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={inviteMember} className="px-5 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">{t("settings.sendInvite")}</button>
                  <button onClick={() => setShowInvite(false)} className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">{t("settings.cancel")}</button>
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

        {/* ── INTEGRATIONS ── */}
        {section === "integrations" && (
          <div className={clsx(CARD,"p-5")}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t("settings.integrations")}</h3>
            <p className="text-xs text-gray-500 mb-5">{t("settings.connected", { n: integrations.filter(i => i.connected).length, total: integrations.length })}</p>
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
                    {intg.connected ? t("settings.connectedBtn") : t("settings.connect")}
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
