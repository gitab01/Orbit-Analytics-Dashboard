"use client";

import {
  DollarSign,
  Users,
  Activity,
  TrendingDown,
  BarChart2,
  Star,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";
import type { KPIMetric } from "@/lib/mockData";

const iconMap: Record<string, React.ElementType> = {
  DollarSign,
  Users,
  Activity,
  TrendingDown,
  BarChart2,
  Star,
  TrendingUp,
};

const colorMap: Record<string, string> = {
  brand: "from-brand-500/20 to-brand-600/5 border-brand-500/20 text-brand-400 bg-brand-500/10",
  blue:  "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400 bg-blue-500/10",
  purple:"from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400 bg-purple-500/10",
  red:   "from-red-500/20 to-red-600/5 border-red-500/20 text-red-400 bg-red-500/10",
  amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400 bg-amber-500/10",
  teal:  "from-teal-500/20 to-teal-600/5 border-teal-500/20 text-teal-400 bg-teal-500/10",
};

interface KPICardProps {
  metric: KPIMetric;
  index: number;
}

export default function KPICard({ metric, index }: KPICardProps) {
  const Icon = iconMap[metric.icon] ?? TrendingUp;
  const colors = colorMap[metric.color] ?? colorMap.brand;
  const [iconBg, ...rest] = colors.split(" ");
  const iconClass = rest.join(" ");

  const isPositive = metric.trend === "up";
  const trendColor = metric.id === "churn"
    ? (isPositive ? "text-brand-400" : "text-red-400")
    : (isPositive ? "text-brand-400" : "text-red-400");

  return (
    <div
      className={clsx(
        "relative rounded-xl p-5 bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-300 cursor-default group overflow-hidden animate-slide-up"
      )}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "backwards" }}
    >
      {/* Background glow */}
      <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl", iconBg)} />

      <div className="relative z-10">
        {/* Icon + label */}
        <div className="flex items-center justify-between mb-4">
          <div className={clsx("flex items-center justify-center w-10 h-10 rounded-lg", iconClass.split("border")[0].trim())}>
            <Icon size={18} className={iconClass.split(" ").find(c => c.startsWith("text-")) ?? "text-white"} />
          </div>
          <span
            className={clsx(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              isPositive
                ? "bg-brand-500/10 text-brand-400"
                : "bg-red-500/10 text-red-400"
            )}
          >
            {metric.change}
          </span>
        </div>

        {/* Value */}
        <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{metric.label}</p>

        {/* Trend bar */}
        <div className="mt-3 h-0.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={clsx("h-full rounded-full transition-all duration-1000", isPositive ? "bg-brand-500" : "bg-red-500")}
            style={{ width: `${Math.min(Math.abs(parseFloat(metric.change)) * 8, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
