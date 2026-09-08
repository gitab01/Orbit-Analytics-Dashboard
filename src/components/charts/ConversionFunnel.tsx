"use client";

import type { conversionFunnelData } from "@/lib/mockData";
import clsx from "clsx";

type FunnelStage = { stage: string; value: number; pct: number };

interface ConversionFunnelProps {
  data: FunnelStage[];
}

const stageColors = [
  "bg-brand-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-red-400",
];

export default function ConversionFunnel({ data }: ConversionFunnelProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-white">Conversion Funnel</h3>
        <p className="text-xs text-gray-500 mt-0.5">Visitor-to-paid pipeline</p>
      </div>

      <div className="space-y-3">
        {data.map((stage, i) => (
          <div key={stage.stage}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={clsx("w-2 h-2 rounded-full flex-shrink-0", stageColors[i])}
                />
                <span className="text-xs text-gray-400">{stage.stage}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{stage.value.toLocaleString()}</span>
                <span className="text-xs font-semibold text-white w-12 text-right">
                  {stage.pct.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={clsx("h-full rounded-full transition-all duration-700", stageColors[i])}
                style={{ width: `${stage.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-5 p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Overall Conversion</span>
          <span className="text-sm font-bold text-brand-400">
            {data[data.length - 1]?.pct.toFixed(1)}%
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-0.5">
          {data[data.length - 1]?.value.toLocaleString()} paying out of{" "}
          {data[0]?.value.toLocaleString()} visitors
        </p>
      </div>
    </div>
  );
}
