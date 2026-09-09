"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Bell, RefreshCw, Download, Calendar, X, Menu } from "lucide-react";
import clsx from "clsx";
import { useDashboard, type DateRange } from "@/lib/DashboardContext";
import ThemeToggle from "@/components/ThemeToggle";
import type { Alert } from "@/lib/store";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const DATE_RANGES_STATIC: { value: DateRange }[] = [
  { value: "7d"  },
  { value: "30d" },
  { value: "90d" },
  { value: "1y"  },
];

interface Props {
  title: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onTabChange: (tab: string) => void;
  onMobileMenuOpen?: () => void;
}

export default function Header({ title, isRefreshing, onRefresh, onTabChange, onMobileMenuOpen }: Props) {
  const { dateRange, setDateRange, filteredSeries, searchQuery, setSearchQuery } = useDashboard();
  const { t } = useLanguage();
  const [showRange, setShowRange] = useState(false);
  const [showBell,  setShowBell]  = useState(false);
  const [alerts,    setAlerts]    = useState<Alert[]>([]);
  const bellRef = useRef<HTMLDivElement>(null);

  const DATE_RANGES = DATE_RANGES_STATIC.map(r => ({
    value: r.value,
    label: t(`header.${r.value === "7d" ? "last7" : r.value === "30d" ? "last30" : r.value === "90d" ? "last90" : "thisYear"}` as any),
  }));

  useEffect(() => {
    fetch("/api/alerts").then(r => r.json()).then(d => {
      setAlerts((d.alerts ?? []).filter((a: Alert) => a.status === "active"));
    }).catch(() => {});
  }, [isRefreshing]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setShowBell(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = () => {
    if (!filteredSeries.length) return;
    const header = "Date,Revenue,Users,Sessions,Conversions";
    const rows   = filteredSeries.map(r => `${r.date},${r.revenue},${r.users},${r.sessions},${r.conversions}`);
    const blob   = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href = url; a.download = `orbit-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const activeLabel = DATE_RANGES.find(r => r.value === dateRange)?.label ?? t("header.last30");
  const badgeCount  = alerts.length;

  return (
    <header className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 gap-2
      border-b border-gray-200 dark:border-gray-800
      bg-white/90 dark:bg-gray-950/90
      backdrop-blur-sm sticky top-0 z-20">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMobileMenuOpen}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border transition-colors
            bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700
            text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white
            hover:bg-gray-200 dark:hover:bg-gray-700">
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white leading-tight">{title}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-500 hidden sm:block">
            {t("header.lastUpdated")} {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder={t("header.search")}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-8 py-2 text-sm rounded-lg border w-52 transition-all
              bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700
              text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5">
              <X size={12} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>

        {/* Date range */}
        <div className="relative">
          <button onClick={() => setShowRange(!showRange)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors
              bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700
              text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
            <Calendar size={14} className="text-gray-400 dark:text-gray-400" />
            <span className="hidden sm:inline">{activeLabel}</span>
          </button>
          {showRange && (
            <div className="absolute right-0 mt-1 w-44 rounded-xl border shadow-2xl z-30 py-1
              bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {DATE_RANGES.map(r => (
                <button key={r.value} onClick={() => { setDateRange(r.value); setShowRange(false); }}
                  className={clsx(
                    "w-full text-left px-4 py-2 text-sm transition-colors",
                    dateRange === r.value
                      ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}>
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Refresh */}
        <button onClick={onRefresh} title={t("header.refresh")}
          className="flex items-center justify-center w-9 h-9 rounded-lg border transition-colors
            bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700
            text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white
            hover:bg-gray-200 dark:hover:bg-gray-700">
          <RefreshCw size={15} className={clsx(isRefreshing && "animate-spin")} />
        </button>

        {/* Export CSV */}
        <button onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors
            bg-brand-500 hover:bg-brand-600 text-white">
          <Download size={14} />
          <span className="hidden sm:inline">{t("header.export")}</span>
        </button>

        {/* Notifications bell */}
        <div className="relative" ref={bellRef}>
          <button onClick={() => setShowBell(!showBell)}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg border transition-colors
              bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700
              text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white
              hover:bg-gray-200 dark:hover:bg-gray-700">
            <Bell size={15} />
            {badgeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </button>
          {showBell && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-xl border shadow-2xl z-30 overflow-hidden
              bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{t("header.notifications")}</p>
                <span className="text-xs text-gray-500">{badgeCount} {t("header.active")}</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
                {alerts.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-6">{t("header.noAlerts")}</p>
                )}
                {alerts.map(a => (
                  <div key={a.id}
                    className="px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => { onTabChange("alerts"); setShowBell(false); }}>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{a.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{a.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => { onTabChange("alerts"); setShowBell(false); }}
                  className="w-full text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors">
                  {t("header.viewAllAlerts")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
