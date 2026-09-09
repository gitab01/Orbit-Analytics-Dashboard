"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, BarChart3, Users, TrendingUp, Settings,
  Bell, HelpCircle, ChevronLeft, ChevronRight, Orbit,
  Activity, FileText, LogOut, X,
} from "lucide-react";
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

interface Props {
  activeTab: string;
  onTabChange: (t: string) => void;
  alertCount?: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ activeTab, onTabChange, alertCount = 0, mobileOpen = false, onMobileClose }: Props) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => setProfile(d.profile)).catch(() => {});
  }, []);

  const handleTabChange = (id: string) => { onTabChange(id); onMobileClose?.(); };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const initials = profile ? `${profile.firstName[0]}${profile.lastName[0]}` : "AK";
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "Alex Kim";
  const email    = profile?.email ?? "alex@orbit.io";

  const sidebarContent = (
    <aside className={clsx(
      "relative flex flex-col h-full transition-all duration-300 ease-in-out",
      "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
      "w-full md:flex-shrink-0",
      collapsed ? "md:w-[68px]" : "md:w-[240px]"
    )}>

      {/* Logo + mobile close */}
      <div className="flex items-center justify-between px-4 py-5 min-h-[72px] border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 flex-shrink-0">
            <Orbit className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">Orbit</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Analytics</span>
            </div>
          )}
        </div>
        {onMobileClose && (
          <button onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-lg transition-colors
              text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white
              hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Main
          </p>
        )}
        {NAV.map(({ icon: Icon, label, id }) => (
          <button key={id} onClick={() => handleTabChange(id)} title={collapsed ? label : undefined}
            className={clsx(
              "flex items-center gap-3 w-full px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              activeTab === id
                ? "bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white border border-transparent"
            )}>
            <Icon size={18} className={clsx("flex-shrink-0",
              activeTab === id ? "text-brand-600 dark:text-brand-400" : "text-gray-400 dark:text-gray-500"
            )} />
            {!collapsed && <span>{label}</span>}
            {!collapsed && activeTab === id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-brand-400" />}
          </button>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-800 space-y-0.5">
        {BOTTOM.map(({ icon: Icon, label, id }) => (
          <button key={id} onClick={() => handleTabChange(id)} title={collapsed ? label : undefined}
            className={clsx(
              "relative flex items-center gap-3 w-full px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              activeTab === id
                ? "bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white border border-transparent"
            )}>
            <Icon size={18} className={clsx("flex-shrink-0",
              activeTab === id ? "text-brand-600 dark:text-brand-400" : "text-gray-400 dark:text-gray-500"
            )} />
            {!collapsed && <span>{label}</span>}
            {id === "alerts" && alertCount > 0 && (
              <span className={clsx(
                "flex-shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold bg-red-500 text-white",
                collapsed ? "absolute top-1 right-1 w-4 h-4" : "ml-auto w-5 h-5"
              )}>{alertCount > 9 ? "9+" : alertCount}</span>
            )}
          </button>
        ))}

        {/* User card */}
        {!collapsed ? (
          <div className="mt-2 p-2 rounded-lg border
            bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity mb-2"
              onClick={() => handleTabChange("settings")}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {initials}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-gray-900 dark:text-white truncate">{fullName}</span>
                <span className="text-[10px] text-gray-500 truncate">{email}</span>
              </div>
            </div>
            <button onClick={handleLogout} disabled={loggingOut}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-all
                text-gray-500 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400
                hover:bg-red-50 dark:hover:bg-red-500/10">
              <LogOut size={12} />
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} disabled={loggingOut} title="Sign out"
            className="flex items-center justify-center w-full py-2.5 rounded-lg transition-all
              text-gray-500 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400
              hover:bg-red-50 dark:hover:bg-red-500/10">
            <LogOut size={17} />
          </button>
        )}
      </div>

      {/* Desktop collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute -right-3 top-20 z-10 items-center justify-center w-6 h-6 rounded-full border transition-colors
          bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600
          hover:bg-gray-100 dark:hover:bg-gray-600">
        {collapsed
          ? <ChevronRight size={12} className="text-gray-500 dark:text-gray-300" />
          : <ChevronLeft  size={12} className="text-gray-500 dark:text-gray-300" />}
      </button>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block h-screen flex-shrink-0 sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative w-72 h-full" style={{ animation: "slideInLeft 0.25s ease-out" }}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
