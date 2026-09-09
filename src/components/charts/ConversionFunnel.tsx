"use client";

import { useDashboard } from "@/lib/DashboardContext";
import clsx from "clsx";

const colors = ["bg-brand-500","bg-blue-500","bg-purple-500","bg-amber-500","bg-red-400"];

export default function ConversionFunnel() {
  const { data, loading } = useDashboard();
  const funnel = data?.funnel ?? [];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
      <div className="mb-4 sm:mb-5">
        <h3 className="text-sm font-semibold text-white">Conversion Funnel</h3>
        <p className="text-xs text-gray-500 mt-0.5">Visitor-to-paid pipeline</p>
      </div>
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => (
          <div key={i} className="h-7 bg-gray-800 rounded animate-pulse" />
        ))}</div>
      ) : (
        <div className="space-y-3">
          {funnel.map((s, i) => (
            <div key={s.stage}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={clsx("w-2 h-2 rounded-full flex-shrink-0", colors[i])} />
                  <span className="text-xs text-gray-400">{s.stage}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{s.value.toLocaleString()}</span>
                  <span className="text-xs font-semibold text-white w-12 text-right">{s.pct.toFixed(1)}%</span>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className={clsx("h-full rounded-full transition-all duration-700", colors[i])} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {funnel.length > 0 && (
        <div className="mt-5 p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Overall Conversion</span>
            <span className="text-sm font-bold text-brand-400">{funnel[funnel.length-1]?.pct.toFixed(1)}%</span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            {funnel[funnel.length-1]?.value.toLocaleString()} paying out of {funnel[0]?.value.toLocaleString()} visitors
          </p>
        </div>
      )}
    </div>
  );
}
