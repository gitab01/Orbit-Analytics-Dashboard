"use client";
import { useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import KPICard from "@/components/KPICard";
import RevenueChart from "@/components/charts/RevenueChart";
import TrafficPieChart from "@/components/charts/TrafficPieChart";
import ConversionFunnel from "@/components/charts/ConversionFunnel";
import BarMetricChart from "@/components/charts/BarMetricChart";
import TopPagesTable from "@/components/TopPagesTable";
import ActivityFeed from "@/components/ActivityFeed";
import ReportsTab from "@/components/tabs/ReportsTab";
import AlertsTab from "@/components/tabs/AlertsTab";
import HelpTab from "@/components/tabs/HelpTab";
import SettingsTab from "@/components/tabs/SettingsTab";
import { useDashboard } from "@/lib/DashboardContext";

const TAB_TITLES: Record<string,string> = {
  overview: "Overview",  revenue:  "Revenue Analytics",
  users:    "Users",     sessions: "Sessions & Traffic",
  analytics:"Analytics", reports:  "Reports",
  alerts:   "Alerts",    help:     "Help & Support",
  settings: "Settings",
};

export default function DashboardPage() {
  const [activeTab,      setActiveTab]      = useState("overview");
  const [isRefreshing,   setIsRefreshing]   = useState(false);
  const [mobileNavOpen,  setMobileNavOpen]  = useState(false);
  const { refresh } = useDashboard();

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refresh();
    setTimeout(() => setIsRefreshing(false), 1200);
  }, [refresh]);

  const activeAlertCount = 3; // displayed as badge; Sidebar fetches live count internally

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertCount={activeAlertCount}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          title={TAB_TITLES[activeTab] ?? "Dashboard"}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onTabChange={setActiveTab}
          onMobileMenuOpen={() => setMobileNavOpen(true)}
        />
        <div className="flex-1 overflow-y-auto bg-gray-950 p-3 sm:p-4 md:p-6">
          {activeTab === "overview"  && <OverviewTab />}
          {activeTab === "revenue"   && <RevenueTab />}
          {activeTab === "users"     && <UsersTab />}
          {activeTab === "sessions"  && <SessionsTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "reports"   && <ReportsTab />}
          {activeTab === "alerts"    && <AlertsTab />}
          {activeTab === "help"      && <HelpTab />}
          {activeTab === "settings"  && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// Shared loading skeleton
// ─────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-800 rounded-xl ${className ?? ""}`} />;
}

// ─────────────────────────────────────────────
// Overview Tab
// ─────────────────────────────────────────────
function OverviewTab() {
  const { data, loading, filteredSeries } = useDashboard();

  if (loading) return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-32 sm:h-36" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <Skeleton className="xl:col-span-2 h-72 sm:h-80" /><Skeleton className="h-72 sm:h-80" />
      </div>
    </div>
  );
  if (!data) return null;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {data.kpi.map((m,i) => <KPICard key={m.id} metric={m} index={i} />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2"><RevenueChart data={filteredSeries} /></div>
        <TrafficPieChart />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <ConversionFunnel />
        <BarMetricChart />
        <div className="sm:col-span-2 xl:col-span-1"><ActivityFeed /></div>
      </div>
      <TopPagesTable />
    </div>
  );
}

// ─────────────────────────────────────────────
// Revenue Tab
// ─────────────────────────────────────────────
function RevenueTab() {
  const { data, loading, filteredSeries } = useDashboard();
  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!data) return null;
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {data.kpi.slice(0,4).map((m,i) => <KPICard key={m.id} metric={m} index={i} />)}
      </div>
      <RevenueChart data={filteredSeries} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <ConversionFunnel />
        <BarMetricChart />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Users Tab
// ─────────────────────────────────────────────
function UsersTab() {
  const { data, loading, filteredSeries } = useDashboard();
  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!data) return null;
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[data.kpi[1], data.kpi[2], data.kpi[3], data.kpi[5]].map((m,i) => <KPICard key={m.id} metric={m} index={i} />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2"><RevenueChart data={filteredSeries} /></div>
        <ActivityFeed />
      </div>
      <TopPagesTable />
    </div>
  );
}

// ─────────────────────────────────────────────
// Sessions Tab — own content (not duplicate of Analytics)
// ─────────────────────────────────────────────
function SessionsTab() {
  const { data, loading } = useDashboard();
  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!data) return null;
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[data.kpi[2], data.kpi[1], data.kpi[3]].map((m,i) => <KPICard key={m.id} metric={m} index={i} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <BarMetricChart />
        <TrafficPieChart />
      </div>
      <TopPagesTable />
    </div>
  );
}

// ─────────────────────────────────────────────
// Analytics Tab
// ─────────────────────────────────────────────
function AnalyticsTab() {
  const { data, loading, filteredSeries } = useDashboard();
  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!data) return null;
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {data.kpi.map((m,i) => <KPICard key={m.id} metric={m} index={i} />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <RevenueChart data={filteredSeries} />
        <div className="space-y-4 sm:space-y-6">
          <TrafficPieChart />
          <BarMetricChart />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <ConversionFunnel />
        <ActivityFeed />
      </div>
    </div>
  );
}
