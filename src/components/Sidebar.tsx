"use client";
import { useState, useEffect } from "react";
import { LayoutDashboard, BarChart3, Users, TrendingUp, Settings, Bell, HelpCircle, ChevronLeft, ChevronRight, Orbit, Activity, FileText } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { icon: LayoutDashboard, label: "Overview",  id: "overview"  },
  { icon: TrendingUp,      label: "Revenue",   id: "revenue"   },
  { icon: Users,           label: "Users",     id: "users"     },
  { icon: Activity,        label: "Sessions",  id: "sessions"  },
  { icon: BarChart3,       label: "Analytics", id: "analytics" },
  { icon: FileText,        label: "Reports",   id: "reports"   },
];
const BOTTOM = [
  { icon: Bell,        label: "Alerts",   id: "alerts"   },
  { icon: HelpCircle,  label: "Help",     id: "help"     },
  { icon: Settings,    label: "Settings", id: "settings" },
];

interface Props { activeTab: string; onTabChange: (t: string) => void; alertCount?: number }

export default function Sidebar({ activeTab, onTabChange, alertCount = 0 }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => setProfile(d.profile)).catch(() => {});
  }, []);

  const initials = profile ? `${profile.firstName[0]}${profile.lastName[0]}` : "AK";
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "Alex Kim";
  const email    = profile?.email ?? "alex@orbit.io";

  return (
    <aside className={clsx(
      "relative flex flex-col h-screen bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out flex-shrink-0",
      collapsed ? "w-[68px]" : "w-[240px]"
    )}>
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

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Main</p>}
        {NAV.map(({ icon: Icon, label, id }) => (
          <button key={id} onClick={() => onTabChange(id)}
            className={clsx(
              "flex items-center gap-3 w-full px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              activeTab === id
                ? "bg-brand-500/15 text-brand-400 border border-brand-500/20"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )} title={collapsed ? label : undefined}>
            <Icon size={18} className={clsx("flex-shrink-0", activeTab === id ? "text-brand-400" : "text-gray-500")} />
            {!collapsed && <span>{label}</span>}
            {!collapsed && activeTab === id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />}
          </button>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        {BOTTOM.map(({ icon: Icon, label, id }) => (
          <button key={id} onClick={() => onTabChange(id)}
            className={clsx(
              "relative flex items-center gap-3 w-full px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              activeTab === id
                ? "bg-brand-500/15 text-brand-400 border border-brand-500/20"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )} title={collapsed ? label : undefined}>
            <Icon size={18} className={clsx("flex-shrink-0", activeTab === id ? "text-brand-400" : "text-gray-500")} />
            {!collapsed && <span>{label}</span>}
            {/* Alert badge */}
            {id === "alerts" && alertCount > 0 && (
              <span className={clsx(
                "flex-shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold bg-red-500 text-white",
                collapsed ? "absolute top-1 right-1 w-4 h-4" : "ml-auto w-5 h-5"
              )}>{alertCount > 9 ? "9+" : alertCount}</span>
            )}
          </button>
        ))}

        {/* User avatar */}
        {!collapsed && (
          <div className="flex items-center gap-3 mt-3 p-2 rounded-lg bg-gray-800/50 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => onTabChange("settings")}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-white truncate">{fullName}</span>
              <span className="text-[10px] text-gray-500 truncate">{email}</span>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 border border-gray-600 hover:bg-gray-600 transition-colors">
        {collapsed ? <ChevronRight size={12} className="text-gray-300" /> : <ChevronLeft size={12} className="text-gray-300" />}
      </button>
    </aside>
  );
}
