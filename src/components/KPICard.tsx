"use client";
import { DollarSign, Users, Activity, TrendingDown, BarChart2, Star, TrendingUp } from "lucide-react";
import clsx from "clsx";
import type { KPIMetric } from "@/lib/store";

const iconMap: Record<string, React.ElementType> = {
  DollarSign, Users, Activity, TrendingDown, BarChart2, Star, TrendingUp,
};

const colorMap: Record<string, { bg: string; text: string }> = {
  brand:  { bg: "bg-brand-50  dark:bg-brand-500/10",  text: "text-brand-600  dark:text-brand-400"  },
  blue:   { bg: "bg-blue-50   dark:bg-blue-500/10",   text: "text-blue-600   dark:text-blue-400"   },
  purple: { bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
  red:    { bg: "bg-red-50    dark:bg-red-500/10",    text: "text-red-600    dark:text-red-400"    },
  amber:  { bg: "bg-amber-50  dark:bg-amber-500/10",  text: "text-amber-600  dark:text-amber-400"  },
  teal:   { bg: "bg-teal-50   dark:bg-teal-500/10",   text: "text-teal-600   dark:text-teal-400"   },
};

export default function KPICard({ metric, index }: { metric: KPIMetric; index: number }) {
  const Icon = iconMap[metric.icon] ?? TrendingUp;
  const c = colorMap[metric.color] ?? colorMap.brand;
  const isPositive = metric.trend === "up";
  const numChange = Math.abs(parseFloat(metric.change.replace(/[^0-9.-]/g, ""))) || 0;
  const barWidth  = Math.min(numChange * 8, 100);

  return (
    <div
      className="relative rounded-xl p-3 sm:p-5 cursor-default group overflow-hidden animate-slide-up
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        hover:border-gray-300 dark:hover:border-gray-700
        shadow-sm hover:shadow-md dark:shadow-none
        transition-all duration-300"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "backwards" }}
    >
      {/* Hover glow */}
      <div className={clsx("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl", c.bg)} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className={clsx("flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg", c.bg)}>
            <Icon size={16} className={c.text} />
          </div>
          <span className={clsx(
            "text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full",
            isPositive
              ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400"
              : "bg-red-50  dark:bg-red-500/10  text-red-600   dark:text-red-400"
          )}>
            {metric.change}
          </span>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1 truncate">
          {metric.value}
        </p>
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 font-medium uppercase tracking-wider leading-tight">
          {metric.label}
        </p>
        <div className="mt-2 sm:mt-3 h-0.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <div
            className={clsx("h-full rounded-full transition-all duration-1000",
              isPositive ? "bg-brand-500" : "bg-red-500"
            )}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}
