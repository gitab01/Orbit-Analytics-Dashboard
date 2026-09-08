"use client";

import { useState } from "react";
import {
  Download, FileText, TrendingUp, Users, Activity,
  Calendar, ChevronRight, BarChart2, Filter,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { timeSeriesData, kpiMetrics, topPages } from "@/lib/mockData";
import clsx from "clsx";

const reportTypes = [
  { id: "revenue",   label: "Revenue Report",    icon: TrendingUp, color: "brand",  desc: "Monthly & quarterly revenue breakdown" },
  { id: "users",     label: "User Growth Report", icon: Users,      color: "blue",   desc: "Signups, churn and retention analysis" },
  { id: "sessions",  label: "Traffic Report",     icon: Activity,   color: "purple", desc: "Sessions, bounce rates and engagement" },
  { id: "kpi",       label: "KPI Summary",        icon: BarChart2,  color: "amber",  desc: "All key performance indicators at once" },
];

const colorMap: Record<string, string> = {
  brand:  "bg-brand-500/10 text-brand-400 border-brand-500/20",
  blue:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  amber:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const iconBgMap: Record<string, string> = {
  brand:  "bg-brand-500/15 text-brand-400",
  blue:   "bg-blue-500/15 text-blue-400",
  purple: "bg-purple-500/15 text-purple-400",
  amber:  "bg-amber-500/15 text-amber-400",
};

const scheduled = [
  { name: "Weekly KPI Digest",     freq: "Every Monday",    last: "Sep 2, 2026",   status: "active" },
  { name: "Monthly Revenue Report",freq: "1st of month",    last: "Sep 1, 2026",   status: "active" },
  { name: "User Churn Analysis",   freq: "Every Sunday",    last: "Sep 7, 2026",   status: "active" },
  { name: "Traffic Summary",       freq: "Every Wednesday", last: "Sep 4, 2026",   status: "paused" },
];

export default function ReportsTab() {
  const [activeReport, setActiveReport] = useState("revenue");
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const handleDownload = (id: string) => {
    setDownloaded(id);
    setTimeout(() => setDownloaded(null), 2000);
  };

  const chartData = timeSeriesData.slice(-14);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Report type selector */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {reportTypes.map(({ id, label, icon: Icon, color, desc }) => (
          <button
            key={id}
            onClick={() => setActiveReport(id)}
            className={clsx(
              "text-left p-4 rounded-xl border transition-all",
              activeReport === id
                ? clsx("bg-gray-800 border-gray-600", colorMap[color])
                : "bg-gray-900 border-gray-800 hover:border-gray-700 text-gray-400"
            )}
          >
            <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center mb-3", iconBgMap[color])}>
              <Icon size={17} />
            </div>
            <p className={clsx("text-sm font-semibold mb-1", activeReport === id ? "" : "text-white")}>{label}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          </button>
        ))}
      </div>

      {/* Report preview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart preview */}
        <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">
                {reportTypes.find(r => r.id === activeReport)?.label} — Preview
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 14 days · Updated Sep 8, 2026</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:bg-gray-700 transition-colors">
                <Filter size={12} /> Filter
              </button>
              <button
                onClick={() => handleDownload(activeReport)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 rounded-lg text-xs text-white font-medium hover:bg-brand-600 transition-colors"
              >
                <Download size={12} />
                {downloaded === activeReport ? "Downloading…" : "Export CSV"}
              </button>
            </div>
          </div>

          {(activeReport === "revenue" || activeReport === "kpi") && (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15b382" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#15b382" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `ETB ${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                  labelStyle={{ color: "#9ca3af", fontSize: 11 }}
                  itemStyle={{ color: "#fff", fontSize: 12 }}
                  formatter={(v: number) => [`ETB ${v.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#15b382" strokeWidth={2} fill="url(#rg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {(activeReport === "users" || activeReport === "sessions") && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={14} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                  labelStyle={{ color: "#9ca3af", fontSize: 11 }}
                  itemStyle={{ color: "#fff", fontSize: 12 }}
                />
                <Bar dataKey={activeReport === "users" ? "users" : "sessions"} radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === chartData.length - 1 ? "#3b82f6" : "#1e3a5f"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {kpiMetrics.slice(0, 3).map((m) => (
              <div key={m.id} className="bg-gray-800/60 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                <p className="text-sm font-bold text-white">{m.value}</p>
                <p className="text-xs text-brand-400 mt-0.5">{m.change}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Available reports list */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">All Reports</h3>
          <div className="space-y-2">
            {[
              { name: "Q3 2026 Revenue",   size: "142 KB", date: "Sep 1" },
              { name: "August User Report", size: "98 KB",  date: "Sep 1" },
              { name: "Traffic Analysis",   size: "76 KB",  date: "Aug 28" },
              { name: "Churn Deep Dive",    size: "54 KB",  date: "Aug 25" },
              { name: "NPS Summary",        size: "32 KB",  date: "Aug 20" },
              { name: "Conversion Audit",   size: "88 KB",  date: "Aug 15" },
            ].map((r) => (
              <div key={r.name} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.size} · {r.date}</p>
                  </div>
                </div>
                <Download size={13} className="text-gray-600 group-hover:text-brand-400 transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scheduled reports */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Scheduled Reports</h3>
            <p className="text-xs text-gray-500 mt-0.5">Automated delivery to your inbox</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 rounded-lg text-xs text-white font-medium hover:bg-brand-600 transition-colors">
            + New Schedule
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {["Report Name", "Frequency", "Last Sent", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scheduled.map((s) => (
                <tr key={s.name} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-gray-500 flex-shrink-0" />
                      <span className="text-white text-sm font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{s.freq}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{s.last}</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      "px-2 py-0.5 rounded-full text-xs font-medium border",
                      s.status === "active"
                        ? "bg-brand-500/10 text-brand-400 border-brand-500/20"
                        : "bg-gray-700/50 text-gray-500 border-gray-700"
                    )}>
                      {s.status === "active" ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight size={14} className="text-gray-600 hover:text-gray-300 cursor-pointer ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
