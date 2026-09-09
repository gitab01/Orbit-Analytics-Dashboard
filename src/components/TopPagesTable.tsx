"use client";
import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { useDashboard } from "@/lib/DashboardContext";
import type { PageRow } from "@/lib/store";
import clsx from "clsx";

type SortKey = "views" | "uniqueVisitors" | "bounceRate";
type SortDir = "asc" | "desc";

const statusCfg = {
  growing:   { label: "Growing",   cls: "bg-brand-50  dark:bg-brand-500/10 text-brand-700  dark:text-brand-400 border-brand-200  dark:border-brand-500/20"  },
  stable:    { label: "Stable",    cls: "bg-blue-50   dark:bg-blue-500/10  text-blue-700   dark:text-blue-400  border-blue-200   dark:border-blue-500/20"   },
  declining: { label: "Declining", cls: "bg-red-50    dark:bg-red-500/10   text-red-700    dark:text-red-400   border-red-200    dark:border-red-500/20"    },
};

export default function TopPagesTable() {
  const { data, loading } = useDashboard();
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter,  setFilter]  = useState("");

  const pages = data?.pages ?? [];

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="text-gray-400" />;
    return sortDir === "asc"
      ? <ArrowUp   size={12} className="text-brand-500" />
      : <ArrowDown size={12} className="text-brand-500" />;
  };

  const filtered = pages.filter(r => r.page.toLowerCase().includes(filter.toLowerCase()));
  const sorted   = [...filtered].sort((a, b) => {
    const av = a[sortKey] as number, bv = b[sortKey] as number;
    return sortDir === "asc" ? av - bv : bv - av;
  });

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top Pages</h3>
          <p className="text-xs text-gray-500 mt-0.5">{sorted.length} pages tracked</p>
        </div>
        <input type="text" placeholder="Filter pages…" value={filter} onChange={e => setFilter(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border w-full sm:w-44
            bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
            text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600
            focus:outline-none focus:border-brand-500" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left px-3 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
              <th onClick={() => handleSort("views")}
                className="text-right px-3 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none">
                <div className="flex items-center justify-end gap-1">Views <SortIcon col="views" /></div>
              </th>
              <th onClick={() => handleSort("uniqueVisitors")}
                className="hidden sm:table-cell text-right px-3 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none">
                <div className="flex items-center justify-end gap-1">Unique <SortIcon col="uniqueVisitors" /></div>
              </th>
              <th onClick={() => handleSort("bounceRate")}
                className="hidden md:table-cell text-right px-3 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none">
                <div className="flex items-center justify-end gap-1">Bounce % <SortIcon col="bounceRate" /></div>
              </th>
              <th className="hidden md:table-cell text-right px-3 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
              <th className="text-center px-3 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-800/50">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-3 sm:px-4 py-4">
                      <div className="h-3 rounded animate-pulse bg-gray-100 dark:bg-gray-800" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.map((row, i) => (
              <tr key={row.id} className={clsx(
                "border-b border-gray-100 dark:border-gray-800/50 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40",
                i === sorted.length - 1 && "border-b-0"
              )}>
                <td className="px-3 sm:px-5 py-3.5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-gray-400 font-mono text-xs">#{i + 1}</span>
                    <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{row.page}</span>
                    <ExternalLink size={11} className="hidden sm:block text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer flex-shrink-0" />
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-3.5 text-right font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300">{row.views.toLocaleString()}</td>
                <td className="hidden sm:table-cell px-3 sm:px-4 py-3.5 text-right text-xs sm:text-sm text-gray-500">{row.uniqueVisitors.toLocaleString()}</td>
                <td className="hidden md:table-cell px-3 sm:px-4 py-3.5 text-right text-xs sm:text-sm text-gray-500">{row.bounceRate}%</td>
                <td className="hidden md:table-cell px-3 sm:px-4 py-3.5 text-right text-xs sm:text-sm text-gray-500">{row.avgTime}</td>
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
