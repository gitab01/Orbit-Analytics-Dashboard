// ─────────────────────────────────────────────
// In-memory store — single source of truth for all API routes
// ─────────────────────────────────────────────
import { subDays, format } from "date-fns";

// ── Types ────────────────────────────────────
export type Trend = "up" | "down" | "neutral";
export type AlertSeverity = "critical" | "warning" | "info" | "resolved";
export type AlertStatus   = "active"   | "resolved" | "snoozed";
export type MemberRole    = "Admin"    | "Editor"   | "Viewer";
export type ReportStatus  = "active"   | "paused";
export type PageStatus    = "growing"  | "stable"   | "declining";

export interface KPI {
  id: string; label: string; value: string;
  change: string; trend: Trend; icon: string; color: string;
}
// Alias for components that import KPIMetric
export type KPIMetric = KPI;
export interface DataPoint {
  date: string; revenue: number; users: number;
  sessions: number; conversions: number;
}
export interface TrafficSource { name: string; value: number; color: string }
export interface TopPage {
  id: string; page: string; views: number;
  uniqueVisitors: number; bounceRate: number;
  avgTime: string; status: PageStatus;
}
// Alias
export type PageRow = TopPage;
export interface FunnelStage { stage: string; value: number; pct: number }
export interface Event {
  id: string; type: "signup"|"upgrade"|"churn"|"alert";
  message: string; time: string;
}
export interface Alert {
  id: string; title: string; description: string;
  severity: AlertSeverity; status: AlertStatus;
  time: string; metric: string; value: string; threshold: string;
}
export interface AlertRule {
  id: string; name: string; trigger: string;
  channel: string; enabled: boolean;
}
export interface TeamMember {
  id: string; name: string; email: string;
  role: MemberRole; avatar: string; online: boolean;
}
export interface Profile {
  firstName: string; lastName: string; email: string;
  jobTitle: string; company: string; timezone: string;
  bio: string; currency: string; language: string;
  dateFormat: string; fiscalYear: string; defaultView: string;
  refreshRate: string; theme: string;
}
export interface Notifications {
  email: boolean; slack: boolean; browser: boolean;
  weekly: boolean; monthly: boolean; alerts: boolean;
}
export interface ScheduledReport {
  id: string; name: string; freq: string;
  last: string; status: ReportStatus; type: string;
}
export interface Integration {
  id: string; name: string; desc: string;
  logo: string; connected: boolean; category: string;
}

// ── Seed helpers ─────────────────────────────
function makeSeries(): DataPoint[] {
  const pts: DataPoint[] = [];
  let rev = 42000, usr = 1800, ses = 5200, con = 320;
  for (let i = 30; i >= 0; i--) {
    rev = Math.max(rev + Math.floor((Math.random() - 0.35) * 3000), 20000);
    usr = Math.max(usr + Math.floor((Math.random() - 0.3) * 150), 800);
    ses = Math.max(ses + Math.floor((Math.random() - 0.3) * 400), 2000);
    con = Math.max(con + Math.floor((Math.random() - 0.35) * 30), 100);
    pts.push({ date: format(subDays(new Date(), i), "MMM dd"), revenue: rev, users: usr, sessions: ses, conversions: con });
  }
  return pts;
}

let _nextId = 100;
export const nextId = () => String(++_nextId);

// ── Store ─────────────────────────────────────
export const store: {
  kpi: KPI[];
  timeSeries: DataPoint[];
  traffic: TrafficSource[];
  pages: TopPage[];
  funnel: FunnelStage[];
  events: Event[];
  alerts: Alert[];
  alertRules: AlertRule[];
  team: TeamMember[];
  profile: Profile;
  notifications: Notifications;
  scheduledReports: ScheduledReport[];
  integrations: Integration[];
} = {
  kpi: [
    { id:"mrr",     label:"Monthly Revenue",    value:"ETB 84,320", change:"+12.5%", trend:"up",   icon:"DollarSign",  color:"brand"  },
    { id:"users",   label:"Active Users",        value:"24,091",     change:"+8.2%",  trend:"up",   icon:"Users",       color:"blue"   },
    { id:"sessions",label:"Total Sessions",      value:"183,421",    change:"+3.7%",  trend:"up",   icon:"Activity",    color:"purple" },
    { id:"churn",   label:"Churn Rate",          value:"2.4%",       change:"-0.6%",  trend:"up",   icon:"TrendingDown",color:"red"    },
    { id:"arpu",    label:"Avg Revenue / User",  value:"ETB 3.50",   change:"+4.1%",  trend:"up",   icon:"BarChart2",   color:"amber"  },
    { id:"nps",     label:"NPS Score",           value:"72",         change:"+5 pts", trend:"up",   icon:"Star",        color:"teal"   },
  ],

  timeSeries: makeSeries(),

  traffic: [
    { name:"Organic Search", value:38, color:"#15b382" },
    { name:"Direct",         value:24, color:"#3b82f6" },
    { name:"Social Media",   value:18, color:"#a855f7" },
    { name:"Referral",       value:12, color:"#f59e0b" },
    { name:"Email",          value:8,  color:"#ef4444" },
  ],

  pages: [
    { id:"1", page:"/dashboard",           views:42310, uniqueVisitors:18920, bounceRate:18, avgTime:"4m 22s", status:"growing"  },
    { id:"2", page:"/pricing",             views:31204, uniqueVisitors:14480, bounceRate:34, avgTime:"2m 45s", status:"growing"  },
    { id:"3", page:"/features",            views:24891, uniqueVisitors:11230, bounceRate:27, avgTime:"3m 10s", status:"stable"   },
    { id:"4", page:"/blog/getting-started",views:18340, uniqueVisitors:16010, bounceRate:42, avgTime:"5m 03s", status:"growing"  },
    { id:"5", page:"/docs",                views:14200, uniqueVisitors:9840,  bounceRate:22, avgTime:"6m 18s", status:"stable"   },
    { id:"6", page:"/integrations",        views:9830,  uniqueVisitors:7210,  bounceRate:31, avgTime:"2m 55s", status:"declining"},
    { id:"7", page:"/changelog",           views:6120,  uniqueVisitors:5440,  bounceRate:58, avgTime:"1m 34s", status:"stable"   },
  ],

  funnel: [
    { stage:"Visitors",  value:183421, pct:100  },
    { stage:"Sign-ups",  value:24091,  pct:13.1 },
    { stage:"Activated", value:14455,  pct:7.9  },
    { stage:"Paying",    value:7632,   pct:4.2  },
    { stage:"Retained",  value:5881,   pct:3.2  },
  ],

  events: [
    { id:"e1", type:"upgrade", message:"Acme Corp upgraded to Enterprise plan",      time:"2 min ago"  },
    { id:"e2", type:"signup",  message:"47 new signups from ProductHunt campaign",   time:"14 min ago" },
    { id:"e3", type:"alert",   message:"API latency spike detected (p99 > 800ms)",   time:"31 min ago" },
    { id:"e4", type:"signup",  message:"StartupXYZ completed onboarding",            time:"1 hr ago"   },
    { id:"e5", type:"churn",   message:"BuildFast downgraded to free tier",          time:"2 hr ago"   },
    { id:"e6", type:"upgrade", message:"DataFlow Inc added 12 team seats",           time:"3 hr ago"   },
    { id:"e7", type:"alert",   message:"Daily email digest sent to 8,240 users",     time:"5 hr ago"   },
  ],

  alerts: [
    { id:"a1", title:"API Latency Spike",       severity:"critical", status:"active",   description:"p99 latency exceeded 800ms for 3 consecutive minutes.", time:"31 min ago", metric:"p99 Latency",   value:"843ms",        threshold:"> 800ms"  },
    { id:"a2", title:"Churn Rate Elevated",     severity:"warning",  status:"active",   description:"7-day churn rate is trending above baseline by 0.8%.",  time:"2 hr ago",   metric:"Churn Rate",    value:"3.2%",         threshold:"> 2.5%"   },
    { id:"a3", title:"Conversion Drop",         severity:"warning",  status:"active",   description:"Daily conversions fell 12% below the 7-day moving avg.", time:"4 hr ago",   metric:"Conversions",   value:"287",          threshold:"< 300"    },
    { id:"a4", title:"New High — Daily Revenue",severity:"info",     status:"active",   description:"Today's revenue hit an all-time high of ETB 56,956.",    time:"6 hr ago",   metric:"Daily Revenue", value:"ETB 56,956",   threshold:"Record"   },
    { id:"a5", title:"Disk Usage Warning",      severity:"warning",  status:"snoozed",  description:"Database disk usage reached 78%. Consider scaling.",    time:"1 day ago",  metric:"Disk Usage",    value:"78%",          threshold:"> 75%"    },
    { id:"a6", title:"Error Rate Spike Resolved",severity:"resolved",status:"resolved", description:"Error rate returned to normal after deploy rollback.",   time:"2 days ago", metric:"Error Rate",    value:"0.2%",         threshold:"Resolved" },
    { id:"a7", title:"New User Milestone",      severity:"info",     status:"resolved", description:"Active user count crossed 24,000 — up 8.2% this month.", time:"3 days ago", metric:"Active Users",  value:"24,091",       threshold:"Milestone"},
  ],

  alertRules: [
    { id:"r1", name:"Latency Alert",     trigger:"p99 > 800ms",    channel:"Slack + Email", enabled:true  },
    { id:"r2", name:"Churn Threshold",   trigger:"Churn > 2.5%",   channel:"Email",         enabled:true  },
    { id:"r3", name:"Revenue Milestone", trigger:"Daily > record", channel:"Slack",         enabled:true  },
    { id:"r4", name:"Error Rate Spike",  trigger:"Errors > 1%",    channel:"PagerDuty",     enabled:false },
    { id:"r5", name:"Low Conversion",   trigger:"Conv < 300/day",  channel:"Email",         enabled:true  },
  ],

  team: [
    { id:"t1", name:"Alex Kim",     email:"alex@orbit.io",  role:"Admin",  avatar:"AK", online:true  },
    { id:"t2", name:"Sara Tadesse", email:"sara@orbit.io",  role:"Editor", avatar:"ST", online:true  },
    { id:"t3", name:"Yonas Bekele", email:"yonas@orbit.io", role:"Viewer", avatar:"YB", online:false },
    { id:"t4", name:"Liya Haile",   email:"liya@orbit.io",  role:"Editor", avatar:"LH", online:false },
  ],

  profile: {
    firstName:"Alex", lastName:"Kim", email:"alex@orbit.io",
    jobTitle:"Head of Growth", company:"Orbit Inc.",
    timezone:"Africa/Addis_Ababa", bio:"SaaS growth lead tracking KPIs and conversion metrics.",
    currency:"ETB", language:"English (US)", dateFormat:"MMM DD, YYYY",
    fiscalYear:"January", defaultView:"Overview", refreshRate:"60",
    theme:"Dark",
  },

  notifications: {
    email:true, slack:true, browser:false, weekly:true, monthly:true, alerts:true,
  },

  scheduledReports: [
    { id:"sr1", name:"Weekly KPI Digest",      freq:"Every Monday",    last:"Sep 2, 2026",  status:"active", type:"kpi"      },
    { id:"sr2", name:"Monthly Revenue Report", freq:"1st of month",    last:"Sep 1, 2026",  status:"active", type:"revenue"  },
    { id:"sr3", name:"User Churn Analysis",    freq:"Every Sunday",    last:"Sep 7, 2026",  status:"active", type:"users"    },
    { id:"sr4", name:"Traffic Summary",        freq:"Every Wednesday", last:"Sep 4, 2026",  status:"paused", type:"sessions" },
  ],

  integrations: [
    { id:"i1", name:"Slack",           desc:"Receive alerts in your Slack channel",  logo:"💬", connected:true,  category:"Communication" },
    { id:"i2", name:"Google Analytics",desc:"Import GA4 event and traffic data",     logo:"📊", connected:true,  category:"Analytics"     },
    { id:"i3", name:"Stripe",          desc:"Sync revenue and subscription metrics", logo:"💳", connected:false, category:"Payments"      },
    { id:"i4", name:"Mixpanel",        desc:"Import product analytics events",       logo:"🔬", connected:false, category:"Analytics"     },
    { id:"i5", name:"PagerDuty",       desc:"Route critical alerts to on-call team", logo:"🚨", connected:false, category:"Alerts"        },
    { id:"i6", name:"Segment",         desc:"Centralise your customer data pipeline",logo:"⚡", connected:true,  category:"Data"          },
  ],
};
