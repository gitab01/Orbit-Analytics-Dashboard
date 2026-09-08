"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  kpiMetrics,
  timeSeriesData,
  trafficSourceData,
  topPages,
  recentEvents,
  conversionFunnelData,
} from "@/lib/mockData";

const tabTitles: Record<string, string> = {
  overview:  "Overview",
  revenue:   "Revenue Analytics",
  users:     "User Analytics",
  sessions:  "Session Analytics",
  analytics: "Advanced Analytics",
  reports:   "Reports",
  alerts:    "Alerts",
  help:      "Help & Support",
  settings:  "Settings",
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshKey((k) => k + 1);
    }, 1200);
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const id = setInterval(handleRefresh, 60_000);
    return () => clearInterval(id);
  }, [handleRefresh]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={tabTitles[activeTab] ?? "Dashboard"}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <div className="flex-1 overflow-y-auto bg-gray-950 p-6">
          {activeTab === "overview" && (
            <OverviewTab key={refreshKey} />
          )}
          {activeTab === "revenue" && (
            <RevenueTab key={refreshKey} />
          )}
          {activeTab === "users" && (
            <UsersTab key={refreshKey} />
          )}
          {(activeTab === "sessions" || activeTab === "analytics") && (
            <AnalyticsTab key={refreshKey} />
          )}
          {(activeTab === "reports") && (
            <ReportsTab key={refreshKey} />
          )}
          {(activeTab === "alerts") && (
            <AlertsTab key={refreshKey} />
          )}
          {(activeTab === "help") && (
            <HelpTab />
          )}
          {(activeTab === "settings") && (
            <SettingsTab />
          )}
        </div>
      </main>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiMetrics.map((metric, i) => (
          <KPICard key={metric.id} metric={metric} index={i} />
        ))}
      </div>

      {/* Main Chart + Pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart data={timeSeriesData} />
        </div>
        <TrafficPieChart data={trafficSourceData} />
      </div>

      {/* Funnel + Bar + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ConversionFunnel data={conversionFunnelData} />
        <BarMetricChart data={timeSeriesData} />
        <ActivityFeed events={recentEvents} />
      </div>

      {/* Top Pages */}
      <TopPagesTable data={topPages} />
    </div>
  );
}

function RevenueTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiMetrics.slice(0, 4).map((metric, i) => (
          <KPICard key={metric.id} metric={metric} index={i} />
        ))}
      </div>
      <RevenueChart data={timeSeriesData} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarMetricChart data={timeSeriesData} />
        <ConversionFunnel data={conversionFunnelData} />
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[kpiMetrics[1], kpiMetrics[2], kpiMetrics[3]].map((metric, i) => (
          <KPICard key={metric.id} metric={metric} index={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart data={timeSeriesData} />
        </div>
        <ActivityFeed events={recentEvents} />
      </div>
      <TopPagesTable data={topPages} />
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueChart data={timeSeriesData} />
        <div className="space-y-6">
          <TrafficPieChart data={trafficSourceData} />
          <BarMetricChart data={timeSeriesData} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConversionFunnel data={conversionFunnelData} />
        <ActivityFeed events={recentEvents} />
      </div>
    </div>
  );
}
