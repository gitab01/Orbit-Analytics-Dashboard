"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  TrendingUp,
  Settings,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Orbit,
  Activity,
  FileText,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview", active: true },
  { icon: TrendingUp, label: "Revenue", id: "revenue" },
  { icon: Users, label: "Users", id: "users" },
  { icon: Activity, label: "Sessions", id: "sessions" },
  { icon: BarChart3, label: "Analytics", id: "analytics" },
  { icon: FileText, label: "Reports", id: "reports" },
];

const bottomItems = [
  { icon: Bell, label: "Alerts", id: "alerts" },
  { icon: HelpCircle, label: "Help", id: "help" },
  { icon: Settings, label: "Settings", id: "settings" },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        "relative flex flex-col h-screen bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out flex-shrink-0",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800 min-h-[72px]">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 flex-shrink-0">
          <Orbit className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-white tracking-wide">Orbit</span>
            <span className="text-xs text-gray-400">Analytics</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Main
          </p>
        )}
        {navItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={clsx(
              "flex items-center gap-3 w-full px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              activeTab === id
                ? "bg-brand-500/15 text-brand-400 border border-brand-500/20"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
            title={collapsed ? label : undefined}
          >
            <Icon
              className={clsx(
                "w-4.5 h-4.5 flex-shrink-0",
                activeTab === id ? "text-brand-400" : "text-gray-500"
              )}
              size={18}
            />
            {!collapsed && <span>{label}</span>}
            {!collapsed && activeTab === id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        {bottomItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex items-center gap-3 w-full px-2 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-150"
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0 text-gray-500" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}

        {/* Avatar */}
        {!collapsed && (
          <div className="flex items-center gap-3 mt-3 p-2 rounded-lg bg-gray-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              AK
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-white truncate">Alex Kim</span>
              <span className="text-[10px] text-gray-500 truncate">admin@orbit.io</span>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 border border-gray-600 hover:bg-gray-600 transition-colors"
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-gray-300" />
        ) : (
          <ChevronLeft size={12} className="text-gray-300" />
        )}
      </button>
    </aside>
  );
}
