# 🚀 Orbit Analytics Dashboard

> Interactive analytics dashboard with real-time data visualization, custom charts, and advanced filtering. Built for SaaS teams to monitor KPIs at a glance.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)
![Recharts](https://img.shields.io/badge/Recharts-2-ff6b6b?style=flat-square)

---

## ✨ Features

- **📊 KPI Cards** — 6 real-time metrics with trend indicators and animated progress bars
- **📈 Area Charts** — Multi-metric time-series visualization with toggleable overlays
- **🍩 Donut Chart** — Interactive traffic source breakdown with active-sector highlighting
- **📉 Bar Chart** — Daily conversion metrics with peak-day highlighting
- **🔽 Conversion Funnel** — Visitor-to-paid pipeline visualization
- **📋 Top Pages Table** — Sortable, filterable page analytics table
- **⚡ Activity Feed** — Real-time event stream (signups, upgrades, churn, alerts)
- **🌙 Dark Mode** — Full dark-first design with green accent palette
- **📱 Responsive** — Works across desktop, tablet and mobile
- **🗂️ Multi-tab Navigation** — Overview, Revenue, Users, Sessions & Analytics tabs
- **🔄 Auto-refresh** — Live data refresh with manual trigger
- **📅 Date Range Picker** — Filter by 7d / 30d / 90d / Year
- **💾 Export Button** — Ready for PDF/CSV export integration
- **🔍 Search** — Metric and page search functionality

## 🛠 Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Framework  | Next.js 14 (App Router)       |
| Language   | TypeScript 5                  |
| Styling    | Tailwind CSS 3                |
| Charts     | Recharts 2                    |
| Icons      | Lucide React                  |
| API        | Next.js Route Handlers (REST) |
| Data       | Mock data with date-fns       |

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

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/graphql/route.ts   # API endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Dashboard page
├── components/
│   ├── charts/
│   │   ├── AreaChart.tsx
│   │   ├── BarMetricChart.tsx
│   │   ├── ConversionFunnel.tsx
│   │   └── TrafficPieChart.tsx
│   ├── ActivityFeed.tsx
│   ├── Header.tsx
│   ├── KPICard.tsx
│   ├── Sidebar.tsx
│   └── TopPagesTable.tsx
└── lib/
    └── mockData.ts            # Typed mock data + generators
```

## 📸 Screenshots

> Dashboard features a dark UI with a green accent palette, collapsible sidebar, and rich chart visualizations.

## 📄 License

MIT — free to use for personal and commercial projects.
