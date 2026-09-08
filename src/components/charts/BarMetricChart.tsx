"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useDashboard } from "@/lib/DashboardContext";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">{payload[0].value.toLocaleString()} conversions</p>
    </div>
  );
};

export default function BarMetricChart() {
  const { filteredSeries, loading } = useDashboard();
  const data = filteredSeries.slice(-14);
  const max = Math.max(...data.map(d => d.conversions));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-white">Daily Conversions</h3>
        <p className="text-xs text-gray-500 mt-0.5">Last 14 days</p>
      </div>
      {loading ? (
        <div className="h-[180px] flex items-center justify-center">
          <span className="text-xs text-gray-500 animate-pulse">Loading…</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barSize={16} margin={{ top:0, right:0, bottom:0, left:-20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="date" tick={{ fill:"#6b7280", fontSize:10 }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fill:"#6b7280", fontSize:10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill:"#ffffff08" }} />
            <Bar dataKey="conversions" radius={[4,4,0,0]}>
              {data.map((e, i) => <Cell key={i} fill={e.conversions === max ? "#15b382" : "#1e3a2f"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
