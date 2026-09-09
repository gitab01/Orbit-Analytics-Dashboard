"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { useDashboard } from "@/lib/DashboardContext";

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#fff" fontSize={20} fontWeight={700}>{value}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#9ca3af" fontSize={11}>{payload.name}</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 14} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

export default function TrafficPieChart() {
  const { data, loading } = useDashboard();
  const [activeIndex, setActiveIndex] = useState(0);
  const traffic = data?.traffic ?? [];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Traffic Sources</h3>
        <p className="text-xs text-gray-500 mt-0.5">Distribution by channel</p>
      </div>
      {loading ? (
        <div className="h-[200px] flex items-center justify-center">
          <span className="text-xs text-gray-500 animate-pulse">Loading…</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie activeIndex={activeIndex} activeShape={renderActiveShape} data={traffic}
              cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value"
              onMouseEnter={(_, i) => setActiveIndex(i)}>
              {traffic.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
      <div className="mt-2 space-y-1.5">
        {traffic.map(e => (
          <div key={e.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: e.color }} />
              <span className="text-xs text-gray-400">{e.name}</span>
            </div>
            <span className="text-xs font-semibold text-white">{e.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
