"use client";

import { useState } from "react";
import {
  AlertTriangle, Bell, CheckCircle, XCircle,
  Activity, TrendingDown, Zap, Settings, Trash2, Plus,
} from "lucide-react";
import clsx from "clsx";

type AlertSeverity = "critical" | "warning" | "info" | "resolved";
type AlertStatus = "active" | "resolved" | "snoozed";

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  time: string;
  metric: string;
  value: string;
  threshold: string;
}

const alerts: Alert[] = [
  {
    id: "1", title: "API Latency Spike", severity: "critical", status: "active",
    description: "p99 latency exceeded 800ms for 3 consecutive minutes.",
    time: "31 min ago", metric: "p99 Latency", value: "843ms", threshold: "> 800ms",
  },
  {
    id: "2", title: "Churn Rate Elevated", severity: "warning", status: "active",
    description: "7-day churn rate is trending above baseline by 0.8%.",
    time: "2 hr ago", metric: "Churn Rate", value: "3.2%", threshold: "> 2.5%",
  },
  {
    id: "3", title: "Conversion Drop", severity: "warning", status: "active",
    description: "Daily conversions fell 12% below the 7-day moving average.",
    time: "4 hr ago", metric: "Conversions", value: "287", threshold: "< 300",
  },
  {
    id: "4", title: "New High — Daily Revenue", severity: "info", status: "active",
    description: "Today's revenue hit an all-time high of ETB 56,956.",
    time: "6 hr ago", metric: "Daily Revenue", value: "ETB 56,956", threshold: "Record",
  },
  {
    id: "5", title: "Disk Usage Warning", severity: "warning", status: "snoozed",
    description: "Database disk usage reached 78%. Consider scaling storage.",
    time: "1 day ago", metric: "Disk Usage", value: "78%", threshold: "> 75%",
  },
  {
    id: "6", title: "Error Rate Spike Resolved", severity: "resolved", status: "resolved",
    description: "Error rate returned to normal levels after deploy rollback.",
    time: "2 days ago", metric: "Error Rate", value: "0.2%", threshold: "Resolved",
  },
  {
    id: "7", title: "New User Milestone", severity: "info", status: "resolved",
    description: "Active user count crossed 24,000 — up 8.2% this month.",
    time: "3 days ago", metric: "Active Users", value: "24,091", threshold: "Milestone",
  },
];

const severityConfig: Record<AlertSeverity, { icon: React.ElementType; color: string; bg: string; border: string; dot: string }> = {
  critical: { icon: XCircle,       color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30",    dot: "bg-red-400" },
  warning:  { icon: AlertTriangle, color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/30",  dot: "bg-amber-400" },
  info:     { icon: Zap,           color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/30",   dot: "bg-blue-400" },
  resolved: { icon: CheckCircle,   color: "text-brand-400",  bg: "bg-brand-500/10",  border: "border-brand-500/20",  dot: "bg-brand-400" },
};

const rules = [
  { name: "Latency Alert",      trigger: "p99 > 800ms",    channel: "Slack + Email", enabled: true },
  { name: "Churn Threshold",    trigger: "Churn > 2.5%",   channel: "Email",         enabled: true },
  { name: "Revenue Milestone",  trigger: "Daily > record", channel: "Slack",         enabled: true },
  { name: "Error Rate Spike",   trigger: "Errors > 1%",    channel: "PagerDuty",     enabled: false },
  { name: "Low Conversion",     trigger: "Conv < 300/day", channel: "Email",         enabled: true },
];

const stats = [
  { label: "Active Alerts",   value: "3",  icon: Bell,         color: "text-red-400",   bg: "bg-red-500/10" },
  { label: "Resolved Today",  value: "8",  icon: CheckCircle,  color: "text-brand-400", bg: "bg-brand-500/10" },
  { label: "Snoozed",         value: "2",  icon: Activity,     color: "text-amber-400", bg: "bg-amber-500/10" },
  { label: "Alert Rules",     value: "12", icon: Settings,     color: "text-blue-400",  bg: "bg-blue-500/10" },
];

export default function AlertsTab() {
  const [filter, setFilter] = useState<"all" | AlertSeverity | AlertStatus>("all");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const dismiss = (id: string) => setDismissed((prev) => new Set([...prev, id]));

  const visible = alerts.filter((a) => {
    if (dismissed.has(a.id)) return false;
    if (filter === "all") return true;
    return a.severity === filter || a.status === filter;
  });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
            <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", bg)}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Alert feed */}
        <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Alert Feed</h3>
              <p className="text-xs text-gray-500 mt-0.5">{visible.length} alerts showing</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "critical", "warning", "info", "resolved"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize",
                    filter === f
                      ? "bg-brand-500/15 text-brand-400 border-brand-500/30"
                      : "text-gray-500 border-gray-700 hover:text-gray-300"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-800/70">
            {visible.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle size={32} className="text-brand-500 mb-3" />
                <p className="text-sm font-medium text-white">All clear!</p>
                <p className="text-xs text-gray-500 mt-1">No alerts match this filter.</p>
              </div>
            )}
            {visible.map((alert) => {
              const cfg = severityConfig[alert.severity];
              const Icon = cfg.icon;
              return (
                <div key={alert.id} className={clsx("flex gap-4 p-5 hover:bg-gray-800/30 transition-colors", alert.status === "resolved" && "opacity-60")}>
                  <div className={clsx("flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center", cfg.bg)}>
                    <Icon size={15} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{alert.title}</span>
                        <span className={clsx("w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse-slow", cfg.dot, alert.status === "resolved" && "hidden")} />
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{alert.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mb-2">{alert.description}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={clsx("px-2 py-0.5 rounded-full text-xs font-medium border", cfg.bg, cfg.color, cfg.border)}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-600">{alert.metric}: <span className="text-gray-400 font-medium">{alert.value}</span></span>
                      <span className="text-xs text-gray-600">Threshold: <span className="text-gray-400">{alert.threshold}</span></span>
                    </div>
                  </div>
                  {alert.status !== "resolved" && (
                    <button
                      onClick={() => dismiss(alert.id)}
                      className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-700 text-gray-600 hover:text-gray-300 transition-colors self-start"
                      title="Dismiss"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Alert rules */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Alert Rules</h3>
              <p className="text-xs text-gray-500 mt-0.5">Notification triggers</p>
            </div>
            <button className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-500 rounded-lg text-xs text-white font-medium hover:bg-brand-600 transition-colors">
              <Plus size={12} /> Add
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.name} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{rule.name}</span>
                  {/* Toggle */}
                  <div className={clsx(
                    "relative w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0",
                    rule.enabled ? "bg-brand-500" : "bg-gray-700"
                  )}>
                    <span className={clsx(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                      rule.enabled ? "left-4" : "left-0.5"
                    )} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">Trigger: <span className="text-gray-400">{rule.trigger}</span></p>
                <p className="text-xs text-gray-500">Notify via: <span className="text-gray-400">{rule.channel}</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
