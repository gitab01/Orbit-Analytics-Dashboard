# 🚀 Orbit Analytics Dashboard

> Interactive analytics dashboard with real-time data visualization, custom charts, and advanced filtering. Built for SaaS teams to monitor KPIs at a glance.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)
![Recharts](https://img.shields.io/badge/Recharts-2-ff6b6b?style=flat-square)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?style=flat-square&logo=vercel)

**Live:** https://orbit-analytics-dashboard-nu.vercel.app  
**Repo:** https://github.com/gitab01/Orbit-Analytics-Dashboard

---

## 📁 Project Structure

```
Orbit-Analytics-Dashboard/
├── public/
│   └── favicon.svg               # Custom SVG favicon (orbital ring icon)
│
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── layout.tsx            # Root layout — wraps DashboardProvider + ToastProvider
│   │   ├── page.tsx              # Main dashboard shell (tab routing)
│   │   ├── globals.css           # Global styles, Tailwind, custom scrollbar
│   │   │
│   │   └── api/                  # ── BACKEND: REST API Routes ──
│   │       ├── dashboard/
│   │       │   └── route.ts      # GET  — KPIs, time series, traffic, pages, funnel, events
│   │       ├── alerts/
│   │       │   └── route.ts      # GET/POST/PATCH/DELETE — alerts + alert rules
│   │       ├── reports/
│   │       │   └── route.ts      # GET/POST/PATCH/DELETE — scheduled reports
│   │       ├── profile/
│   │       │   └── route.ts      # GET/PUT — user profile + notification preferences
│   │       ├── team/
│   │       │   └── route.ts      # GET/POST/PUT/DELETE — team members
│   │       ├── integrations/
│   │       │   └── route.ts      # GET/PATCH — toggle integration connections
│   │       └── support/
│   │           └── route.ts      # POST — contact form → creates support ticket
│   │
│   ├── components/               # ── FRONTEND: UI Components ──
│   │   │
│   │   ├── Sidebar.tsx           # Collapsible nav — reads live profile from API
│   │   ├── Header.tsx            # Sticky header — search, date range, bell, export
│   │   ├── KPICard.tsx           # Individual KPI metric card with trend bar
│   │   ├── TopPagesTable.tsx     # Sortable + filterable page analytics table
│   │   ├── ActivityFeed.tsx      # Real-time event stream
│   │   ├── Toast.tsx             # Global toast notification system (context)
│   │   │
│   │   ├── charts/               # Recharts-based visualization components
│   │   │   ├── RevenueChart.tsx  # Area chart — multi-metric with toggle buttons
│   │   │   ├── TrafficPieChart.tsx # Donut chart — traffic sources breakdown
│   │   │   ├── ConversionFunnel.tsx # Horizontal funnel — visitor-to-paid pipeline
│   │   │   └── BarMetricChart.tsx  # Bar chart — daily conversions, peak highlight
│   │   │
│   │   └── tabs/                 # Full tab page components
│   │       ├── ReportsTab.tsx    # Chart preview, CSV export, scheduled reports CRUD
│   │       ├── AlertsTab.tsx     # Alert feed, resolve/snooze, rule management
│   │       ├── HelpTab.tsx       # FAQ accordion, contact form → /api/support
│   │       └── SettingsTab.tsx   # 7-section settings (Profile/Team/Integrations/etc.)
│   │
│   └── lib/                      # ── SHARED LOGIC ──
│       ├── store.ts              # In-memory database — all types + seeded data
│       └── DashboardContext.tsx  # React context — fetches API, shares data app-wide
│
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config — brand colors, animations
├── tsconfig.json                 # TypeScript config
├── postcss.config.js             # PostCSS config
├── vercel.json                   # Vercel deployment config
└── package.json                  # Dependencies and scripts
```

---

## 🗄️ Database Layer

This project uses an **in-memory store** (`src/lib/store.ts`) as its database. It is a plain TypeScript module that:

- **Acts as the single source of truth** for all 7 API routes
- **Seeds realistic data** on server startup (30 days of time series, team, integrations, etc.)
- **Persists mutations in-memory** for the lifetime of the server process (resets on restart)

### Why in-memory?

The current architecture is intentionally lightweight for a demo/portfolio project. Swapping it for a real database requires only changing `store.ts` — all API routes are already structured with proper CRUD patterns.

### Upgrading to a real database

| Option | When to use |
|---|---|
| **PostgreSQL + Prisma** | Production SaaS — full persistence, migrations, relations |
| **MongoDB + Mongoose** | Flexible schema — good for analytics events |
| **Supabase** | Managed Postgres with built-in auth + realtime |
| **PlanetScale** | Serverless MySQL — ideal for Vercel deployments |

To migrate: replace each `store.*` read/write in the API routes with the equivalent Prisma/Mongo query. The route handler signatures stay identical.

### Data entities in the store

| Entity | Fields | Used by |
|---|---|---|
| `kpi[]` | id, label, value, change, trend, icon, color | `/api/dashboard` → KPI cards |
| `timeSeries[]` | date, revenue, users, sessions, conversions | `/api/dashboard` → charts |
| `traffic[]` | name, value, color | `/api/dashboard` → donut chart |
| `pages[]` | page, views, uniqueVisitors, bounceRate, avgTime, status | `/api/dashboard` → table |
| `funnel[]` | stage, value, pct | `/api/dashboard` → funnel |
| `events[]` | type, message, time | `/api/dashboard` → activity feed |
| `alerts[]` | title, severity, status, metric, value, threshold | `/api/alerts` → alerts tab |
| `alertRules[]` | name, trigger, channel, enabled | `/api/alerts` → rules panel |
| `scheduledReports[]` | name, freq, type, status, last | `/api/reports` → reports tab |
| `profile` | name, email, company, currency, theme, etc. | `/api/profile` → settings |
| `notifications` | email, slack, browser, weekly, monthly, alerts | `/api/profile` → settings |
| `team[]` | name, email, role, avatar, online | `/api/team` → settings |
| `integrations[]` | name, desc, logo, connected, category | `/api/integrations` → settings |

---

## 🏗️ Architecture

```
Browser
   │
   ├── DashboardContext  (auto-fetches /api/dashboard every 60s)
   │       │
   │       └── Provides: data, filteredSeries, dateRange, searchQuery, refresh()
   │
   ├── ToastContext  (global success/error/warning notifications)
   │
   └── Components
         │
         ├── Sidebar ─────────────── GET /api/profile  (live avatar/name)
         ├── Header ──────────────── GET /api/alerts   (bell badge count)
         │                           CSV export from filteredSeries
         │
         ├── Overview Tab ────────── DashboardContext (KPIs, charts, table)
         ├── Revenue Tab ─────────── DashboardContext
         ├── Users Tab ───────────── DashboardContext
         ├── Sessions Tab ────────── DashboardContext
         ├── Analytics Tab ───────── DashboardContext
         │
         ├── Reports Tab ─────────── GET/POST/PATCH/DELETE /api/reports
         │                           CSV export (client-side from context data)
         │
         ├── Alerts Tab ──────────── GET/POST/PATCH/DELETE /api/alerts
         │
         ├── Help Tab ────────────── POST /api/support
         │
         └── Settings Tab ────────── GET/PUT  /api/profile
                                     GET/POST/PUT/DELETE /api/team
                                     GET/PATCH /api/integrations

Server (Next.js API Routes)
   │
   └── All routes read/write from src/lib/store.ts (in-memory database)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Full-stack React framework |
| **Language** | TypeScript 5 | Type safety throughout |
| **Styling** | Tailwind CSS 3 | Utility-first dark-mode UI |
| **Charts** | Recharts 2 | Area, Bar, Pie, Funnel charts |
| **Icons** | Lucide React | Consistent icon set |
| **Date utils** | date-fns 4 | Time series generation |
| **State** | React Context | Dashboard data + Toasts |
| **Backend** | Next.js Route Handlers | REST API (no separate server) |
| **Database** | In-memory store (TypeScript) | Zero-config data layer |
| **Deployment** | Vercel | Auto-deploy on git push |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📡 API Reference

All endpoints are under `/api/`.

### `GET /api/dashboard`
Returns all dashboard data in one call.
```json
{
  "kpi": [...],
  "timeSeries": [...],
  "traffic": [...],
  "pages": [...],
  "funnel": [...],
  "events": [...]
}
```

### `GET /api/alerts`
Returns all alerts and alert rules.

### `POST /api/alerts`
Create a new alert rule. Body: `{ name, trigger, channel }`

### `PATCH /api/alerts`
Resolve/snooze an alert or toggle a rule.  
Body: `{ type: "alert"|"rule", id, status? | enabled? }`

### `DELETE /api/alerts`
Delete an alert rule. Body: `{ id }`

### `GET/POST/PATCH/DELETE /api/reports`
Full CRUD for scheduled reports.

### `GET /api/profile`
Returns user profile + notification preferences.

### `PUT /api/profile`
Update profile. Body: `{ ...profileFields }` or `{ type: "notifications", data: {...} }`

### `GET/POST/PUT/DELETE /api/team`
Full CRUD for team members.

### `GET /api/integrations`
Returns all integration connections.

### `PATCH /api/integrations`
Toggle connect/disconnect. Body: `{ id }`

### `POST /api/support`
Submit a support message. Body: `{ message }` → Returns `{ ticketId }`

---

## 🎨 Features

- **9 navigation sections** — Overview, Revenue, Users, Sessions, Analytics, Reports, Alerts, Help, Settings
- **6 KPI cards** — MRR, Active Users, Sessions, Churn Rate, ARPU, NPS with trend indicators
- **4 chart types** — Area (multi-metric), Donut (traffic), Bar (conversions), Funnel (pipeline)
- **Live alert bell** — badge count from `/api/alerts`, click → Alerts tab
- **CSV export** — downloads filtered time series as a `.csv` file
- **Date range filter** — 7d / 30d / 90d / Year
- **Search** — filters pages table in real time
- **Auto-refresh** — every 60 seconds + manual trigger
- **Toast notifications** — on every user action (success/error/warning)
- **Loading skeletons** — while data fetches
- **Collapsible sidebar** — with live user avatar from profile API
- **Full Settings** — Profile, Notifications, Preferences, Security, Billing, Team, Integrations
- **Dark mode** — full dark-first design with ETB currency

---

## 📄 License

MIT — free to use for personal and commercial projects.
