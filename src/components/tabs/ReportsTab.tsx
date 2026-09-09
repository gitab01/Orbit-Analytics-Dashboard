"use client";
import { useState, useEffect } from "react";
import { Download, FileText, TrendingUp, Users, Activity, Calendar, BarChart2, Filter, Plus, Trash2, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import clsx from "clsx";
import { useDashboard } from "@/lib/DashboardContext";
import { useToast } from "@/components/Toast";
import type { ScheduledReport } from "@/lib/store";

const TYPES = [
  { id:"revenue",  label:"Revenue Report",     icon:TrendingUp, color:"brand",  desc:"Monthly & quarterly revenue breakdown" },
  { id:"users",    label:"User Growth Report",  icon:Users,      color:"blue",   desc:"Signups, churn and retention analysis" },
  { id:"sessions", label:"Traffic Report",      icon:Activity,   color:"purple", desc:"Sessions, bounce rates and engagement" },
  { id:"kpi",      label:"KPI Summary",         icon:BarChart2,  color:"amber",  desc:"All key performance indicators at once" },
];

const ICON_BG: Record<string,string> = {
  brand:"bg-brand-500/15 text-brand-400", blue:"bg-blue-500/15 text-blue-400",
  purple:"bg-purple-500/15 text-purple-400", amber:"bg-amber-500/15 text-amber-400",
};
const CARD_ACTIVE: Record<string,string> = {
  brand:"border-brand-500/30 bg-gray-800", blue:"border-blue-500/30 bg-gray-800",
  purple:"border-purple-500/30 bg-gray-800", amber:"border-amber-500/30 bg-gray-800",
};

const FREQS = ["Every day","Every Monday","Every Sunday","Every Wednesday","1st of month","1st of quarter"];

export default function ReportsTab() {
  const { toast }         = useToast();
  const { filteredSeries, data } = useDashboard();
  const [activeType,  setActiveType]  = useState("revenue");
  const [reports,     setReports]     = useState<ScheduledReport[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [newReport,   setNewReport]   = useState({ name:"", freq: FREQS[1], type:"kpi" });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const d = await fetch("/api/reports").then(r => r.json());
      setReports(d.reports ?? []);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchReports(); }, []);

  const createReport = async () => {
    if (!newReport.name) { toast("error", "Enter a report name"); return; }
    const res  = await fetch("/api/reports", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(newReport) });
    const data = await res.json();
    setReports(p => [...p, data]);
    setNewReport({ name:"", freq: FREQS[1], type:"kpi" });
    setShowForm(false);
    toast("success", "Scheduled report created");
  };

  const toggleReport = async (id: string, status: string) => {
    const next = status === "active" ? "paused" : "active";
    await fetch("/api/reports", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id, status: next }) });
    setReports(p => p.map(r => r.id === id ? { ...r, status: next as "active"|"paused" } : r));
    toast("success", next === "active" ? "Report resumed" : "Report paused");
  };

  const deleteReport = async (id: string) => {
    await fetch("/api/reports", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
    setReports(p => p.filter(r => r.id !== id));
    toast("success", "Report deleted");
  };

  // Client-side CSV export from filtered series
  const exportCSV = (type: string) => {
    if (!filteredSeries.length) { toast("error", "No data to export"); return; }
    let header: string, rows: string[];
    if (type === "revenue") {
      header = "Date,Revenue (ETB)";
      rows   = filteredSeries.map(r => `${r.date},${r.revenue}`);
    } else if (type === "users") {
      header = "Date,Active Users";
      rows   = filteredSeries.map(r => `${r.date},${r.users}`);
    } else if (type === "sessions") {
      header = "Date,Sessions,Conversions";
      rows   = filteredSeries.map(r => `${r.date},${r.sessions},${r.conversions}`);
    } else {
      header = "Date,Revenue,Users,Sessions,Conversions";
      rows   = filteredSeries.map(r => `${r.date},${r.revenue},${r.users},${r.sessions},${r.conversions}`);
    }
    const blob = new Blob([[header,...rows].join("\n")], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = `orbit-${type}-report.csv`; a.click();
    URL.revokeObjectURL(url);
    toast("success", `${TYPES.find(t => t.id === type)?.label} exported`);
  };

  const chartData = filteredSeries.slice(-14);
  const active    = TYPES.find(t => t.id === activeType)!;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Type selector */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {TYPES.map(({ id, label, icon:Icon, color, desc }) => (
          <button key={id} onClick={() => setActiveType(id)}
            className={clsx("text-left p-3 sm:p-4 rounded-xl border transition-all",
              activeType === id ? CARD_ACTIVE[color] : "bg-gray-900 border-gray-800 hover:border-gray-700"
            )}>
            <div className={clsx("w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-2 sm:mb-3", ICON_BG[color])}>
              <Icon size={16} />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white mb-0.5 sm:mb-1">{label}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">{desc}</p>
          </button>
        ))}
      </div>

      {/* Preview + archive */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">{active.label} — Preview</h3>
              <p className="text-xs text-gray-500 mt-0.5">{chartData.length} days · Live data</p>
            </div>
            <button onClick={() => exportCSV(activeType)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 rounded-lg text-xs text-white font-medium hover:bg-brand-600 transition-colors">
              <Download size={12} /> Export CSV
            </button>
          </div>

          {(activeType === "revenue" || activeType === "kpi") && (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top:5, right:5, bottom:0, left:0 }}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#15b382" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#15b382" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" tick={{ fill:"#6b7280", fontSize:11 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill:"#6b7280", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `ETB ${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background:"#1f2937", border:"1px solid #374151", borderRadius:8 }}
                  labelStyle={{ color:"#9ca3af", fontSize:11 }} itemStyle={{ color:"#fff", fontSize:12 }}
                  formatter={(v: number) => [`ETB ${v.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#15b382" strokeWidth={2} fill="url(#rg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {activeType === "users" && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={14} margin={{ top:5, right:5, bottom:0, left:-20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" tick={{ fill:"#6b7280", fontSize:11 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill:"#6b7280", fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:"#1f2937", border:"1px solid #374151", borderRadius:8 }} />
                <Bar dataKey="users" radius={[4,4,0,0]}>
                  {chartData.map((_,i) => <Cell key={i} fill={i === chartData.length-1 ? "#3b82f6" : "#1e3a5f"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {activeType === "sessions" && (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top:5, right:5, bottom:0, left:0 }}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" tick={{ fill:"#6b7280", fontSize:11 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill:"#6b7280", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background:"#1f2937", border:"1px solid #374151", borderRadius:8 }} />
                <Area type="monotone" dataKey="sessions" stroke="#a855f7" strokeWidth={2} fill="url(#sg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* KPI summary row */}
          {data && (
            <div className="grid grid-cols-3 gap-3 mt-5">
              {data.kpi.slice(0,3).map(m => (
                <div key={m.id} className="bg-gray-800/60 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                  <p className="text-sm font-bold text-white">{m.value}</p>
                  <p className="text-xs text-brand-400 mt-0.5">{m.change}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Archive */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Exports</h3>
          <div className="space-y-2">
            {TYPES.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group cursor-pointer" onClick={() => exportCSV(t.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{t.label}</p>
                    <p className="text-xs text-gray-500">CSV · Live data</p>
                  </div>
                </div>
                <Download size={13} className="text-gray-600 group-hover:text-brand-400 transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scheduled reports */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Scheduled Reports</h3>
            <p className="text-xs text-gray-500 mt-0.5">Auto-delivered to your inbox</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchReports} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
              <RefreshCw size={13} className={clsx(loading && "animate-spin")} />
            </button>
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 rounded-lg text-xs text-white font-medium hover:bg-brand-600 transition-colors">
              <Plus size={12} /> New Schedule
            </button>
          </div>
        </div>

        {showForm && (
          <div className="p-5 border-b border-gray-800 bg-gray-800/30 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input placeholder="Report name" value={newReport.name} onChange={e => setNewReport(p => ({ ...p, name: e.target.value }))}
                className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500" />
              <select value={newReport.freq} onChange={e => setNewReport(p => ({ ...p, freq: e.target.value }))}
                className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500">
                {FREQS.map(f => <option key={f}>{f}</option>)}
              </select>
              <select value={newReport.type} onChange={e => setNewReport(p => ({ ...p, type: e.target.value }))}
                className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500">
                {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={createReport} className="px-5 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">Create</button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                <th className="hidden sm:table-cell text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="hidden md:table-cell text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="hidden md:table-cell text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sent</th>
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 sm:px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-gray-500 flex-shrink-0" />
                      <span className="text-white font-medium text-xs sm:text-sm">{r.name}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 sm:px-5 py-3.5 text-gray-400 capitalize text-xs sm:text-sm">{r.type}</td>
                  <td className="hidden md:table-cell px-4 sm:px-5 py-3.5 text-gray-400 text-xs sm:text-sm">{r.freq}</td>
                  <td className="hidden md:table-cell px-4 sm:px-5 py-3.5 text-gray-400 text-xs sm:text-sm">{r.last}</td>
                  <td className="px-4 sm:px-5 py-3.5">
                    <button onClick={() => toggleReport(r.id, r.status)}
                      className={clsx("px-2 py-0.5 rounded-full text-xs font-medium border transition-all",
                        r.status === "active"
                          ? "bg-brand-500/10 text-brand-400 border-brand-500/20 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20"
                          : "bg-gray-700/50 text-gray-500 border-gray-700 hover:bg-brand-500/10 hover:text-brand-400 hover:border-brand-500/20"
                      )}>
                      {r.status === "active" ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-4 sm:px-5 py-3.5 text-right">
                    <button onClick={() => deleteReport(r.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && !loading && (
                <tr><td colSpan={6} className="text-center text-gray-500 text-sm py-8">No scheduled reports. Create one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
