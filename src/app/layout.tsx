import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit Analytics Dashboard",
  description:
    "Interactive analytics dashboard with real-time data visualization, custom charts, and advanced filtering. Built for SaaS teams to monitor KPIs at a glance.",
  keywords: ["analytics", "dashboard", "KPI", "SaaS", "real-time"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
