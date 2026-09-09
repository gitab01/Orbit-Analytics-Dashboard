import type { Metadata } from "next";
import "./globals.css";
import { DashboardProvider } from "@/lib/DashboardContext";
import { ToastProvider } from "@/components/Toast";
import { ThemeProvider } from "@/lib/ThemeContext";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export const metadata: Metadata = {
  title: "Orbit Analytics — KPI Dashboard",
  description: "Interactive analytics dashboard with real-time data visualization, custom charts, and advanced filtering. Built for SaaS teams to monitor KPIs at a glance.",
};

// Inline script injected before paint to avoid flash-of-wrong-theme
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('orbit-theme') || 'dark';
    var r = t === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : t;
    document.documentElement.classList.add(r);
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* No-flash theme script — runs synchronously before first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-200">
        <ThemeProvider>
          <LanguageProvider>
            <DashboardProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </DashboardProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
