"use client";

import { DollarSign, Users, Activity, TrendingDown, BarChart2, Star, TrendingUp } from "lucide-react";
import clsx from "clsx";
import type { KPIMetric } from "@/lib/store";

const iconMap: Record<string, React.ElementType> = {
  DollarSign, Users, Activity, TrendingDown, BarChart2, Star, TrendingUp,
};

const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
  brand:  { bg:"bg-brand-500/10",  text:"text-brand-400",  badge:"bg-brand-500/10 text-brand-400"  },
  blue:   { bg:"bg-blue-500/10",   text:"text-blue-400",   badge:"bg-blue-500/10 text-blue-400"    },
  purple: { bg:"bg-purple-500/10", text:"text-purple-400", badge:"bg-purple-500/10 text-purple-400"},
  red:    { bg:"bg-red-500/10",    text:"text-red-400",    badge:"bg-red-500/10 text-red-400"      },
  amber:  { bg:"bg-amber-500/10",  text:"text-amber-400",  badge:"bg-amber-500/10 text-amber-400"  },
  teal:   { bg:"bg-teal-500/10",   text:"text-teal-400",   badge:"bg-teal-500/10 text-teal-400"    },
};

export default function KPICard({ metric, index }: { metric: KPIMetric; index: number }) {
  const Icon = iconMap[metric.icon] ?? TrendingUp;
  const c = colorMap[metric.color] ?? colorMap.brand;
  const isPositive = metric.trend === "up";

  // parse change percent for trend bar (handles "pts" and "%" suffixes)
  const numChange = Math.abs(parseFloat(metric.change.replace(/[^0-9.-]/g, ""))) || 0;
  const barWidth = Math.min(numChange * 8, 100);

  return (
    <div
      className="relative rounded-xl p-5 bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-300 cursor-default group overflow-hidden animate-slide-up"
      style={{ animationDelay:`${index * 60}ms`, animationFillMode:"backwards" }}
    >
      {/* Hover glow */}
      <div className={clsx("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl", c.bg)} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={clsx("flex items-center justify-center w-10 h-10 rounded-lg", c.bg)}>
            <Icon size={18} className={c.text} />
          </div>
          <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-full", isPositive ? "bg-brand-500/10 text-brand-400" : "bg-red-500/10 text-red-400")}>
            {metric.change}
          </span>
        </div>
        <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{metric.label}</p>
        <div className="mt-3 h-0.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={clsx("h-full rounded-full transition-all duration-1000", isPositive ? "bg-brand-500" : "bg-red-500")}
            style={{ width:`${barWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}
