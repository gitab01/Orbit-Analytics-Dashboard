"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Bell, RefreshCw, Download, Calendar, X } from "lucide-react";
import clsx from "clsx";
import { useDashboard, type DateRange } from "@/lib/DashboardContext";
import type { Alert } from "@/lib/store";

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: "Last 7 days",  value: "7d"  },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "This year",    value: "1y"  },
];

interface Props {
  title: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onTabChange: (tab: string) => void;
}

export default function Header({ title, isRefreshing, onRefresh, onTabChange }: Props) {
  const { dateRange, setDateRange, filteredSeries, data, searchQuery, setSearchQuery } = useDashboard();
  const [showRange,  setShowRange]  = useState(false);
  const [showBell,   setShowBell]   = useState(false);
  const [alerts,     setAlerts]     = useState<Alert[]>([]);
  const bellRef = useRef<HTMLDivElement>(null);

  // Fetch active alerts for bell
  useEffect(() => {
    fetch("/api/alerts").then(r => r.json()).then(d => {
      setAlerts((d.alerts ?? []).filter((a: Alert) => a.status === "active"));
    }).catch(() => {});
  }, [isRefreshing]);

  // Close bell dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setShowBell(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // CSV export of current filtered time series
  const handleExport = () => {
    if (!filteredSeries.length) return;
    const header = "Date,Revenue,Users,Sessions,Conversions";
    const rows   = filteredSeries.map(r => `${r.date},${r.revenue},${r.users},${r.sessions},${r.conversions}`);
    const blob   = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href       = url;
    a.download   = `orbit-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeLabel = DATE_RANGES.find(r => r.value === dateRange)?.label ?? "Last 30 days";
  const badgeCount  = alerts.length;

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm sticky top-0 z-20">
      {/* Left */}
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Last updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search metrics, pages…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-8 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 w-52 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5">
              <X size={12} className="text-gray-500 hover:text-gray-300" />
            </button>
          )}
        </div>

        {/* Date range */}
        <div className="relative">
          <button onClick={() => setShowRange(!showRange)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
            <Calendar size={14} className="text-gray-400" />
            <span className="hidden sm:inline">{activeLabel}</span>
          </button>
          {showRange && (
            <div className="absolute right-0 mt-1 w-44 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-30 py-1">
              {DATE_RANGES.map(r => (
                <button key={r.value} onClick={() => { setDateRange(r.value); setShowRange(false); }}
                  className={clsx(
                    "w-full text-left px-4 py-2 text-sm transition-colors",
                    dateRange === r.value ? "text-brand-400 bg-brand-500/10" : "text-gray-300 hover:bg-gray-700"
                  )}>
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Refresh */}
        <button onClick={onRefresh} title="Refresh data"
          className="flex items-center justify-center w-9 h-9 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
          <RefreshCw size={15} className={clsx(isRefreshing && "animate-spin")} />
        </button>

        {/* Export CSV */}
        <button onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium">
          <Download size={14} />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Notifications bell */}
        <div className="relative" ref={bellRef}>
          <button onClick={() => setShowBell(!showBell)}
            className="relative flex items-center justify-center w-9 h-9 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <Bell size={15} />
            {badgeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </button>
          {showBell && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <p className="text-sm font-semibold text-white">Notifications</p>
                <span className="text-xs text-gray-500">{badgeCount} active</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-700/50">
                {alerts.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-6">All clear 🎉</p>
                )}
                {alerts.map(a => (
                  <div key={a.id} className="px-4 py-3 hover:bg-gray-700/50 cursor-pointer transition-colors" onClick={() => { onTabChange("alerts"); setShowBell(false); }}>
                    <p className="text-sm text-white font-medium">{a.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{a.description}</p>
                    <p className="text-xs text-gray-600 mt-1">{a.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-700">
                <button onClick={() => { onTabChange("alerts"); setShowBell(false); }}
                  className="w-full text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
                  View all alerts →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
