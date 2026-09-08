import { NextRequest, NextResponse } from "next/server";
import {
  kpiMetrics,
  timeSeriesData,
  trafficSourceData,
  topPages,
  recentEvents,
  conversionFunnelData,
} from "@/lib/mockData";

// Simple GraphQL-style REST endpoint returning all dashboard data
export async function GET() {
  return NextResponse.json({
    data: {
      kpiMetrics,
      timeSeriesData: timeSeriesData.slice(-30),
      trafficSources: trafficSourceData,
      topPages,
      recentEvents,
      conversionFunnel: conversionFunnelData,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { query, variables } = body as { query?: string; variables?: Record<string, unknown> };

  // Route by operation name
  if (query?.includes("KpiMetrics") || query?.includes("kpiMetrics")) {
    return NextResponse.json({ data: { kpiMetrics } });
  }
  if (query?.includes("TimeSeries") || query?.includes("timeSeriesData")) {
    const days = (variables?.days as number) ?? 30;
    return NextResponse.json({ data: { timeSeriesData: timeSeriesData.slice(-days) } });
  }
  if (query?.includes("TrafficSources") || query?.includes("trafficSources")) {
    return NextResponse.json({ data: { trafficSources: trafficSourceData } });
  }
  if (query?.includes("TopPages") || query?.includes("topPages")) {
    return NextResponse.json({ data: { topPages } });
  }
  if (query?.includes("RecentEvents") || query?.includes("recentEvents")) {
    return NextResponse.json({ data: { recentEvents } });
  }
  if (query?.includes("ConversionFunnel") || query?.includes("conversionFunnel")) {
    return NextResponse.json({ data: { conversionFunnel: conversionFunnelData } });
  }

  // Default: return everything
  return NextResponse.json({
    data: {
      kpiMetrics,
      timeSeriesData: timeSeriesData.slice(-30),
      trafficSources: trafficSourceData,
      topPages,
      recentEvents,
      conversionFunnel: conversionFunnelData,
    },
  });
}
