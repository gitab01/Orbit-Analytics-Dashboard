"use client";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import clsx from "clsx";
import type { DataPoint } from "@/lib/store";

const METRICS = [
  { key: "revenue",     label: "Revenue",     color: "#15b382" },
  { key: "users",       label: "Users",       color: "#3b82f6" },
  { key: "sessions",    label: "Sessions",    color: "#a855f7" },
  { key: "conversions", label: "Conversions", color: "#f59e0b" },
];

const fmt = (key: string, v: number) =>
  key === "revenue" ? `ETB ${(v / 1000).toFixed(1)}k` : v.toLocaleString();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((e: any) => (
        <div key={e.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
          <span className="text-gray-400 capitalize">{e.dataKey}:</span>
          <span className="text-white font-medium">{fmt(e.dataKey, e.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function RevenueChart({ data }: { data: DataPoint[] }) {
  const [active, setActive] = useState<string[]>(["revenue"]);
  const toggle = (k: string) => setActive(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Performance Over Time</h3>
          <p className="text-xs text-gray-500 mt-0.5">{data.length} data points</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {METRICS.map(m => (
            <button key={m.key} onClick={() => toggle(m.key)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                active.includes(m.key) ? "bg-gray-800 border-gray-600 text-white" : "border-gray-800 text-gray-600 hover:text-gray-400"
              )}>
              <span className="w-2 h-2 rounded-full" style={{ background: active.includes(m.key) ? m.color : "#4b5563" }} />
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <defs>
            {METRICS.map(m => (
              <linearGradient key={m.key} id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={m.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={m.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.floor(data.length / 6)} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          {METRICS.map(m => active.includes(m.key) ? (
            <Area key={m.key} type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2}
              fill={`url(#grad-${m.key})`} dot={false} activeDot={{ r: 4, fill: m.color, stroke: "#111827", strokeWidth: 2 }} />
          ) : null)}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
