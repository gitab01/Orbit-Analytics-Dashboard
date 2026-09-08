"use client";

import { useState } from "react";
import { Search, Bell, RefreshCw, Download, Calendar } from "lucide-react";
import clsx from "clsx";

const dateRanges = ["Last 7 days", "Last 30 days", "Last 90 days", "This year"];

interface HeaderProps {
  title: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function Header({ title, onRefresh, isRefreshing }: HeaderProps) {
  const [selectedRange, setSelectedRange] = useState("Last 30 days");
  const [showRangeMenu, setShowRangeMenu] = useState(false);
  const [hasNotification] = useState(true);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-20">
      {/* Left */}
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Last updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search metrics..."
            className="pl-8 pr-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 w-48 transition-all"
          />
        </div>

        {/* Date range picker */}
        <div className="relative">
          <button
            onClick={() => setShowRangeMenu(!showRangeMenu)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <Calendar size={14} className="text-gray-400" />
            <span className="hidden sm:inline">{selectedRange}</span>
          </button>
          {showRangeMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-30 py-1">
              {dateRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => { setSelectedRange(range); setShowRangeMenu(false); }}
                  className={clsx(
                    "w-full text-left px-4 py-2 text-sm transition-colors",
                    selectedRange === range
                      ? "text-brand-400 bg-brand-500/10"
                      : "text-gray-300 hover:bg-gray-700"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="flex items-center justify-center w-9 h-9 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          title="Refresh data"
        >
          <RefreshCw size={15} className={clsx(isRefreshing && "animate-spin")} />
        </button>

        {/* Export */}
        <button
          className="flex items-center gap-2 px-3 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
        >
          <Download size={14} />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-9 h-9 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
          <Bell size={15} />
          {hasNotification && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-400 rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
}
