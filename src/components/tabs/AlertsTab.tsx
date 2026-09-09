"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, Bell, CheckCircle, XCircle, Activity, TrendingDown, Zap, Trash2, Plus, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Alert, AlertRule, AlertSeverity, AlertStatus } from "@/lib/store";

type FilterKey = "all" | AlertSeverity | "snoozed";

const SEV_CFG: Record<AlertSeverity, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  critical: { icon: XCircle,        color: "text-red-500 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-500/10",       border: "border-red-200 dark:border-red-500/30"    },
  warning:  { icon: AlertTriangle,  color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10",  border: "border-amber-200 dark:border-amber-500/30" },
  info:     { icon: Zap,            color: "text-blue-500 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-500/10",    border: "border-blue-200 dark:border-blue-500/30"   },
  resolved: { icon: CheckCircle,    color: "text-brand-600 dark:text-brand-400", bg: "bg-brand-50 dark:bg-brand-500/10",  border: "border-brand-200 dark:border-brand-500/20" },
};

export default function AlertsTab() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [alerts,  setAlerts]  = useState<Alert[]>([]);
  const [rules,   setRules]   = useState<AlertRule[]>([]);
  const [filter,  setFilter]  = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [newRule, setNewRule] = useState({ name:"", trigger:"", channel:"Email" });
  const [showForm, setShowForm] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const d = await fetch("/api/alerts").then(r => r.json());
      setAlerts(d.alerts ?? []);
      setRules(d.rules ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const patchAlert = async (id: string, status: AlertStatus) => {
    await fetch("/api/alerts", { method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "alert", id, status }) });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    toast("success", status === "resolved" ? t("alerts.resolved") : t("alerts.snoozedToast"));
  };

  const toggleRule = async (id: string, enabled: boolean) => {
    await fetch("/api/alerts", { method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "rule", id, enabled: !enabled }) });
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !enabled } : r));
  };

  const deleteRule = async (id: string) => {
    await fetch("/api/alerts", { method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }) });
    setRules(prev => prev.filter(r => r.id !== id));
    toast("success", t("alerts.ruleDeleted"));
  };

  const addRule = async () => {
    if (!newRule.name || !newRule.trigger) { toast("error", t("alerts.fillAllFields")); return; }
    const res = await fetch("/api/alerts", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRule) });
    const rule = await res.json();
    setRules(prev => [...prev, rule]);
    setNewRule({ name:"", trigger:"", channel:"Email" });
    setShowForm(false);
    toast("success", t("alerts.ruleCreated"));
  };

  const visible = alerts.filter(a => {
    if (filter === "all") return true;
    if (filter === "snoozed") return a.status === "snoozed";
    return a.severity === filter;
  });

  const active   = alerts.filter(a => a.status === "active").length;
  const resolved = alerts.filter(a => a.status === "resolved").length;
  const snoozed  = alerts.filter(a => a.status === "snoozed").length;

  const STATS = [
    { label: t("alerts.activeAlerts"),  value: active,       icon: Bell,         color:"text-red-500 dark:text-red-400",    bg:"bg-red-50 dark:bg-red-500/10"    },
    { label: t("alerts.resolvedToday"), value: resolved,     icon: CheckCircle,  color:"text-brand-600 dark:text-brand-400",bg:"bg-brand-50 dark:bg-brand-500/10"  },
    { label: t("alerts.snoozed"),       value: snoozed,      icon: Activity,     color:"text-amber-500 dark:text-amber-400",bg:"bg-amber-50 dark:bg-amber-500/10"  },
    { label: t("alerts.alertRules"),    value: rules.length, icon: TrendingDown, color:"text-blue-500 dark:text-blue-400",  bg:"bg-blue-50 dark:bg-blue-500/10"   },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <div className={clsx("w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0", bg)}>
              <Icon size={17} className={color} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">

        {/* Alert feed */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("alerts.alertFeed")}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{t("alerts.showing", { n: visible.length })}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all","critical","warning","info","snoozed"] as FilterKey[]).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={clsx("px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize",
                    filter === f
                      ? "bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/30"
                      : "text-gray-500 border-gray-200 dark:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                  )}>{f === "all" ? t("alerts.all") : f === "snoozed" ? t("alerts.snoozed") : t(`alerts.${f}` as any)}</button>
              ))}
              <button onClick={fetchAll} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                <RefreshCw size={13} className={clsx(loading && "animate-spin")} />
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {loading && <p className="text-sm text-gray-500 text-center py-10">{t("chart.loading")}</p>}
            {!loading && visible.length === 0 && (
              <div className="flex flex-col items-center py-12 text-center">
                <CheckCircle size={32} className="text-brand-500 mb-3" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t("alerts.allClear")}</p>
                <p className="text-xs text-gray-500 mt-1">{t("alerts.noMatch")}</p>
              </div>
            )}
            {visible.map(alert => {
              const cfg = SEV_CFG[alert.severity];
              const Icon = cfg.icon;
              return (
                <div key={alert.id} className={clsx("flex gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors", alert.status === "resolved" && "opacity-50")}>
                  <div className={clsx("flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5", cfg.bg)}>
                    <Icon size={15} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{alert.title}</span>
                        {alert.status === "active" && <span className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", alert.severity === "critical" ? "bg-red-500" : "bg-amber-400")} />}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{alert.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{alert.description}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={clsx("px-2 py-0.5 rounded-full text-xs font-medium border capitalize", cfg.bg, cfg.color, cfg.border)}>{alert.severity}</span>
                      <span className="text-xs text-gray-400">{alert.metric}: <span className="text-gray-600 dark:text-gray-400 font-medium">{alert.value}</span></span>
                    </div>
                  </div>
                  {alert.status === "active" && (
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button onClick={() => patchAlert(alert.id, "resolved")} title="Resolve"
                        className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/20 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        <CheckCircle size={13} />
                      </button>
                      <button onClick={() => patchAlert(alert.id, "snoozed")} title="Snooze"
                        className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/20 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                        <Activity size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("alerts.rules")}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{t("alerts.nRules", { n: rules.length })}</p>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-500 rounded-lg text-xs text-white font-medium hover:bg-brand-600 transition-colors">
              <Plus size={12} /> {t("alerts.add")}
            </button>
          </div>

          {showForm && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
              <input placeholder={t("alerts.ruleName")} value={newRule.name} onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-500" />
              <input placeholder={t("alerts.trigger")} value={newRule.trigger} onChange={e => setNewRule(p => ({ ...p, trigger: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-500" />
              <select value={newRule.channel} onChange={e => setNewRule(p => ({ ...p, channel: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500">
                {["Email","Slack","PagerDuty","Slack + Email"].map(c => <option key={c}>{c}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={addRule} className="flex-1 py-2 bg-brand-500 text-white text-xs font-medium rounded-lg hover:bg-brand-600 transition-colors">{t("alerts.create")}</button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">{t("alerts.cancel")}</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {rules.map(rule => (
              <div key={rule.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate pr-2">{rule.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleRule(rule.id, rule.enabled)}
                      className={clsx("relative rounded-full transition-colors", rule.enabled ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700")}
                      style={{ height: 20, width: 36 }}>
                      <span className={clsx("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", rule.enabled ? "left-4" : "left-0.5")} />
                    </button>
                    <button onClick={() => deleteRule(rule.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{t("alerts.triggerLabel")} <span className="text-gray-600 dark:text-gray-400">{rule.trigger}</span></p>
                <p className="text-xs text-gray-500 mt-0.5">{t("alerts.channelLabel")} <span className="text-gray-600 dark:text-gray-400">{rule.channel}</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
