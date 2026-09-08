import { subDays, format } from "date-fns";

export type MetricTrend = "up" | "down" | "neutral";

export interface KPIMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: MetricTrend;
  icon: string;
  color: string;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  users: number;
  sessions: number;
  conversions: number;
}

export interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface TableRow {
  id: string;
  page: string;
  views: number;
  uniqueVisitors: number;
  bounceRate: string;
  avgTime: string;
  status: "growing" | "stable" | "declining";
}

export interface Event {
  id: string;
  type: "signup" | "upgrade" | "churn" | "alert";
  message: string;
  time: string;
}

// Generate 30 days of time-series data
function generateTimeSeries(days = 30): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let revenue = 42000;
  let users = 1800;
  let sessions = 5200;
  let conversions = 320;

  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    revenue += Math.floor((Math.random() - 0.35) * 3000);
    users += Math.floor((Math.random() - 0.3) * 150);
    sessions += Math.floor((Math.random() - 0.3) * 400);
    conversions += Math.floor((Math.random() - 0.35) * 30);

    data.push({
      date: format(date, "MMM dd"),
      revenue: Math.max(revenue, 20000),
      users: Math.max(users, 800),
      sessions: Math.max(sessions, 2000),
      conversions: Math.max(conversions, 100),
    });
  }
  return data;
}

export const timeSeriesData = generateTimeSeries(30);

export const kpiMetrics: KPIMetric[] = [
  {
    id: "mrr",
    label: "Monthly Revenue",
    value: "$84,320",
    change: "+12.5%",
    trend: "up",
    icon: "DollarSign",
    color: "brand",
  },
  {
    id: "users",
    label: "Active Users",
    value: "24,091",
    change: "+8.2%",
    trend: "up",
    icon: "Users",
    color: "blue",
  },
  {
    id: "sessions",
    label: "Total Sessions",
    value: "183,421",
    change: "+3.7%",
    trend: "up",
    icon: "Activity",
    color: "purple",
  },
  {
    id: "churn",
    label: "Churn Rate",
    value: "2.4%",
    change: "-0.6%",
    trend: "up",
    icon: "TrendingDown",
    color: "red",
  },
  {
    id: "arpu",
    label: "Avg Revenue / User",
    value: "$3.50",
    change: "+4.1%",
    trend: "up",
    icon: "BarChart2",
    color: "amber",
  },
  {
    id: "nps",
    label: "NPS Score",
    value: "72",
    change: "+5 pts",
    trend: "up",
    icon: "Star",
    color: "teal",
  },
];

export const trafficSourceData: PieDataPoint[] = [
  { name: "Organic Search", value: 38, color: "#15b382" },
  { name: "Direct", value: 24, color: "#3b82f6" },
  { name: "Social Media", value: 18, color: "#a855f7" },
  { name: "Referral", value: 12, color: "#f59e0b" },
  { name: "Email", value: 8, color: "#ef4444" },
];

export const topPages: TableRow[] = [
  { id: "1", page: "/dashboard", views: 42310, uniqueVisitors: 18920, bounceRate: "18%", avgTime: "4m 22s", status: "growing" },
  { id: "2", page: "/pricing", views: 31204, uniqueVisitors: 14480, bounceRate: "34%", avgTime: "2m 45s", status: "growing" },
  { id: "3", page: "/features", views: 24891, uniqueVisitors: 11230, bounceRate: "27%", avgTime: "3m 10s", status: "stable" },
  { id: "4", page: "/blog/getting-started", views: 18340, uniqueVisitors: 16010, bounceRate: "42%", avgTime: "5m 03s", status: "growing" },
  { id: "5", page: "/docs", views: 14200, uniqueVisitors: 9840, bounceRate: "22%", avgTime: "6m 18s", status: "stable" },
  { id: "6", page: "/integrations", views: 9830, uniqueVisitors: 7210, bounceRate: "31%", avgTime: "2m 55s", status: "declining" },
  { id: "7", page: "/changelog", views: 6120, uniqueVisitors: 5440, bounceRate: "58%", avgTime: "1m 34s", status: "stable" },
];

export const recentEvents: Event[] = [
  { id: "1", type: "upgrade", message: "Acme Corp upgraded to Enterprise plan", time: "2 min ago" },
  { id: "2", type: "signup", message: "47 new signups from ProductHunt campaign", time: "14 min ago" },
  { id: "3", type: "alert", message: "API latency spike detected (p99 > 800ms)", time: "31 min ago" },
  { id: "4", type: "signup", message: "StartupXYZ completed onboarding", time: "1 hr ago" },
  { id: "5", type: "churn", message: "BuildFast downgraded to free tier", time: "2 hr ago" },
  { id: "6", type: "upgrade", message: "DataFlow Inc added 12 team seats", time: "3 hr ago" },
  { id: "7", type: "alert", message: "Daily email digest sent to 8,240 users", time: "5 hr ago" },
];

export const conversionFunnelData = [
  { stage: "Visitors", value: 183421, pct: 100 },
  { stage: "Sign-ups", value: 24091, pct: 13.1 },
  { stage: "Activated", value: 14455, pct: 7.9 },
  { stage: "Paying", value: 7632, pct: 4.2 },
  { stage: "Retained", value: 5881, pct: 3.2 },
];
