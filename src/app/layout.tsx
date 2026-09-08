import type { Metadata } from "next";
import "./globals.css";
import { DashboardProvider } from "@/lib/DashboardContext";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Orbit Analytics — KPI Dashboard",
  description: "Interactive analytics dashboard with real-time data visualization, custom charts, and advanced filtering. Built for SaaS teams to monitor KPIs at a glance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className="bg-gray-950 text-gray-100 antialiased">
        <DashboardProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </DashboardProvider>
      </body>
    </html>
  );
}
