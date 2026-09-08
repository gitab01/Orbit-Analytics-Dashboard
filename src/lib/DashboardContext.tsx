"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { KPI, DataPoint, TrafficSource, TopPage, FunnelStage, Event } from "./store";

export type DateRange = "7d" | "30d" | "90d" | "1y";

const rangeDays: Record<DateRange, number> = { "7d": 7, "30d": 30, "90d": 30, "1y": 30 };

interface DashboardData {
  kpi:        KPI[];
  timeSeries: DataPoint[];
  traffic:    TrafficSource[];
  pages:      TopPage[];
  funnel:     FunnelStage[];
  events:     Event[];
}

interface DashboardCtx {
  data:           DashboardData | null;
  loading:        boolean;
  dateRange:      DateRange;
  setDateRange:   (r: DateRange) => void;
  filteredSeries: DataPoint[];
  refresh:        () => void;
  searchQuery:    string;
  setSearchQuery: (q: string) => void;
}

const Ctx = createContext<DashboardCtx | null>(null);

export function useDashboard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [data, setData]           = useState<DashboardData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [searchQuery, setSearchQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Dashboard fetch failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 60 s
  useEffect(() => {
    timerRef.current = setInterval(fetchData, 60_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchData]);

  const filteredSeries = data
    ? data.timeSeries.slice(-rangeDays[dateRange])
    : [];

  return (
    <Ctx.Provider value={{ data, loading, dateRange, setDateRange, filteredSeries, refresh: fetchData, searchQuery, setSearchQuery }}>
      {children}
    </Ctx.Provider>
  );
}
