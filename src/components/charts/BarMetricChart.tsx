"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useDashboard } from "@/lib/DashboardContext";
import { useTheme } from "@/lib/ThemeContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function BarMetricChart() {
  const { filteredSeries, loading } = useDashboard();
  const { resolved } = useTheme();
  const { t } = useLanguage();
  const isDark = resolved === "dark";
  const data = filteredSeries.slice(-14);
  const max  = Math.max(...data.map(d => d.conversions));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-xl">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {payload[0].value.toLocaleString()} {t("chart.conversions").toLowerCase()}
        </p>
      </div>
    );
  };

  return (
    <div className="rounded-xl p-4 sm:p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
      <div className="mb-4 sm:mb-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("chart.dailyConversions")}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{t("chart.last14Days")}</p>
      </div>
      {loading ? (
        <div className="h-[180px] flex items-center justify-center">
          <span className="text-xs text-gray-500 animate-pulse">{t("chart.loading")}</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barSize={16} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1f2937" : "#e5e7eb"} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="conversions" radius={[4, 4, 0, 0]}>
              {data.map((e, i) => (
                <Cell key={i} fill={e.conversions === max ? "#15b382" : isDark ? "#1e3a2f" : "#d1fae5"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
