"use client";
import { UserPlus, TrendingUp, AlertTriangle, TrendingDown } from "lucide-react";
import { useDashboard } from "@/lib/DashboardContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import clsx from "clsx";

const cfg = {
  signup:  { icon: UserPlus,      color: "text-brand-600 dark:text-brand-400",  bg: "bg-brand-50  dark:bg-brand-500/10",  border: "border-brand-200 dark:border-brand-500/20"  },
  upgrade: { icon: TrendingUp,    color: "text-blue-600  dark:text-blue-400",   bg: "bg-blue-50   dark:bg-blue-500/10",   border: "border-blue-200  dark:border-blue-500/20"   },
  churn:   { icon: TrendingDown,  color: "text-red-600   dark:text-red-400",    bg: "bg-red-50    dark:bg-red-500/10",    border: "border-red-200   dark:border-red-500/20"    },
  alert:   { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50  dark:bg-amber-500/10",  border: "border-amber-200 dark:border-amber-500/20"  },
};

export default function ActivityFeed() {
  const { data, loading } = useDashboard();
  const { t } = useLanguage();
  const events = data?.events ?? [];

  return (
    <div className="rounded-xl p-4 sm:p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("feed.activityFeed")}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{t("feed.realtime")}</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          {t("feed.live")}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg animate-pulse bg-gray-100 dark:bg-gray-800/50" />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.map(e => {
            const c = cfg[e.type];
            const Icon = c.icon;
            return (
              <div key={e.id} className={clsx("flex items-start gap-3 p-3 rounded-lg border", c.bg, c.border)}>
                <div className={clsx("flex-shrink-0 mt-0.5", c.color)}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{e.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{e.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
