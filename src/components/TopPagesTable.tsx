"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import type { TableRow } from "@/lib/mockData";
import clsx from "clsx";

type SortKey = keyof Pick<TableRow, "views" | "uniqueVisitors" | "bounceRate" | "avgTime">;
type SortDir = "asc" | "desc";

interface TopPagesTableProps {
  data: TableRow[];
}

const statusConfig = {
  growing:   { label: "Growing",   class: "bg-brand-500/10 text-brand-400 border-brand-500/20" },
  stable:    { label: "Stable",    class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  declining: { label: "Declining", class: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function TopPagesTable({ data }: TopPagesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState("");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="text-gray-600" />;
    return sortDir === "asc"
      ? <ArrowUp size={12} className="text-brand-400" />
      : <ArrowDown size={12} className="text-brand-400" />;
  };

  const filtered = data.filter((r) =>
    r.page.toLowerCase().includes(filter.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = typeof a[sortKey] === "number" ? (a[sortKey] as number) : 0;
    const bv = typeof b[sortKey] === "number" ? (b[sortKey] as number) : 0;
    return sortDir === "asc" ? av - bv : bv - av;
  });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-800">
        <div>
          <h3 className="text-sm font-semibold text-white">Top Pages</h3>
          <p className="text-xs text-gray-500 mt-0.5">{sorted.length} pages tracked</p>
        </div>
        <input
          type="text"
          placeholder="Filter pages..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-600 focus:outline-none focus:border-brand-500 w-44"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
              {(["views", "uniqueVisitors", "bounceRate", "avgTime"] as SortKey[]).map((col) => (
                <th
                  key={col}
                  className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 transition-colors select-none"
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center justify-end gap-1">
                    {col === "views" ? "Views" : col === "uniqueVisitors" ? "Unique" : col === "bounceRate" ? "Bounce" : "Avg Time"}
                    <SortIcon col={col} />
                  </div>
                </th>
              ))}
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.id}
                className={clsx(
                  "border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors",
                  i === sorted.length - 1 && "border-b-0"
                )}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-mono text-xs">#{i + 1}</span>
                    <span className="text-white font-medium text-sm">{row.page}</span>
                    <ExternalLink size={11} className="text-gray-600 hover:text-gray-400 cursor-pointer flex-shrink-0" />
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right text-gray-300 font-medium">
                  {row.views.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-right text-gray-400">
                  {row.uniqueVisitors.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-right text-gray-400">{row.bounceRate}</td>
                <td className="px-4 py-3.5 text-right text-gray-400">{row.avgTime}</td>
                <td className="px-4 py-3.5 text-center">
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded-full text-xs font-medium border",
                      statusConfig[row.status].class
                    )}
                  >
                    {statusConfig[row.status].label}
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
