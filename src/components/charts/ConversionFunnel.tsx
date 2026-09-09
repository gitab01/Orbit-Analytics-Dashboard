"use client";
import { useDashboard } from "@/lib/DashboardContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import clsx from "clsx";

const colors = ["bg-brand-500","bg-blue-500","bg-purple-500","bg-amber-500","bg-red-400"];

export default function ConversionFunnel() {
  const { data, loading } = useDashboard();
  const { t } = useLanguage();
  const funnel = data?.funnel ?? [];

  return (
    <div className="rounded-xl p-4 sm:p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
      <div className="mb-4 sm:mb-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("chart.conversionFunnel")}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{t("chart.visitorToPaid")}</p>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-7 rounded animate-pulse bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {funnel.map((s, i) => (
            <div key={s.stage}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={clsx("w-2 h-2 rounded-full flex-shrink-0", colors[i])} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{s.stage}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{s.value.toLocaleString()}</span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white w-12 text-right">{s.pct.toFixed(1)}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <div className={clsx("h-full rounded-full transition-all duration-700", colors[i])}
                  style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {funnel.length > 0 && (
        <div className="mt-5 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">{t("chart.overallConversion")}</span>
            <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
              {funnel[funnel.length - 1]?.pct.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
            {t("chart.payingOf", {
              paying:   funnel[funnel.length - 1]?.value.toLocaleString() ?? "0",
              visitors: funnel[0]?.value.toLocaleString() ?? "0",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
