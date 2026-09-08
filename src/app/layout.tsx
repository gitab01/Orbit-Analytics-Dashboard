import type { Metadata } from "next";
import "./globals.css";
import { DashboardProvider } from "@/lib/DashboardContext";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Orbit Analytics — KPI Dashboard",
  description: "Interactive analytics dashboard with real-time data visualization, custom charts, and advanced filtering. Built for SaaS teams to monitor KPIs at a glance.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
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
