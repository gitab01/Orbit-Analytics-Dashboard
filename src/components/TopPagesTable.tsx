"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { useDashboard } from "@/lib/DashboardContext";
import type { PageRow } from "@/lib/store";
import clsx from "clsx";

type SortKey = "views" | "uniqueVisitors" | "bounceRate";
type SortDir = "asc" | "desc";

const statusCfg = {
  growing:   { label:"Growing",   cls:"bg-brand-500/10 text-brand-400 border-brand-500/20" },
  stable:    { label:"Stable",    cls:"bg-blue-500/10 text-blue-400 border-blue-500/20"    },
  declining: { label:"Declining", cls:"bg-red-500/10 text-red-400 border-red-500/20"       },
};

export default function TopPagesTable() {
  const { data, loading } = useDashboard();
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState("");

  const pages = data?.pages ?? [];

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="text-gray-600" />;
    return sortDir === "asc" ? <ArrowUp size={12} className="text-brand-400" /> : <ArrowDown size={12} className="text-brand-400" />;
  };

  const filtered = pages.filter(r => r.page.toLowerCase().includes(filter.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] as number, bv = b[sortKey] as number;
    return sortDir === "asc" ? av - bv : bv - av;
  });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-gray-800">
        <div>
          <h3 className="text-sm font-semibold text-white">Top Pages</h3>
          <p className="text-xs text-gray-500 mt-0.5">{sorted.length} pages tracked</p>
        </div>
        <input type="text" placeholder="Filter pages…" value={filter} onChange={e => setFilter(e.target.value)}
          className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-600 focus:outline-none focus:border-brand-500 w-full sm:w-44" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-3 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
              <th onClick={() => handleSort("views")}
                className="text-right px-3 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 select-none">
                <div className="flex items-center justify-end gap-1">Views <SortIcon col="views" /></div>
              </th>
              <th onClick={() => handleSort("uniqueVisitors")}
                className="hidden sm:table-cell text-right px-3 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 select-none">
                <div className="flex items-center justify-end gap-1">Unique <SortIcon col="uniqueVisitors" /></div>
              </th>
              <th onClick={() => handleSort("bounceRate")}
                className="hidden md:table-cell text-right px-3 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 select-none">
                <div className="flex items-center justify-end gap-1">Bounce % <SortIcon col="bounceRate" /></div>
              </th>
              <th className="hidden md:table-cell text-right px-3 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
              <th className="text-center px-3 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-3 sm:px-4 py-4"><div className="h-3 bg-gray-800 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : sorted.map((row, i) => (
              <tr key={row.id} className={clsx("border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors", i === sorted.length-1 && "border-b-0")}>
                <td className="px-3 sm:px-5 py-3.5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-gray-400 font-mono text-xs">#{i+1}</span>
                    <span className="text-white font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{row.page}</span>
                    <ExternalLink size={11} className="text-gray-600 hover:text-gray-400 cursor-pointer flex-shrink-0 hidden sm:block" />
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-3.5 text-right text-gray-300 font-medium text-xs sm:text-sm">{row.views.toLocaleString()}</td>
                <td className="hidden sm:table-cell px-3 sm:px-4 py-3.5 text-right text-gray-400 text-xs sm:text-sm">{row.uniqueVisitors.toLocaleString()}</td>
                <td className="hidden md:table-cell px-3 sm:px-4 py-3.5 text-right text-gray-400 text-xs sm:text-sm">{row.bounceRate}%</td>
                <td className="hidden md:table-cell px-3 sm:px-4 py-3.5 text-right text-gray-400 text-xs sm:text-sm">{row.avgTime}</td>
                <td className="px-3 sm:px-4 py-3.5 text-center">
                  <span className={clsx("px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border", statusCfg[row.status].cls)}>
                    {statusCfg[row.status].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
