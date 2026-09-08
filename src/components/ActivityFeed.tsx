"use client";

import { UserPlus, TrendingUp, AlertTriangle, TrendingDown } from "lucide-react";
import type { Event } from "@/lib/mockData";
import clsx from "clsx";

const eventConfig = {
  signup:  { icon: UserPlus,     color: "text-brand-400",  bg: "bg-brand-500/10",  border: "border-brand-500/20" },
  upgrade: { icon: TrendingUp,   color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  churn:   { icon: TrendingDown, color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20" },
  alert:   { icon: AlertTriangle,color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
};

interface ActivityFeedProps {
  events: Event[];
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Activity Feed</h3>
          <p className="text-xs text-gray-500 mt-0.5">Real-time events</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-brand-400">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          Live
        </span>
      </div>

      <div className="space-y-3">
        {events.map((event) => {
          const cfg = eventConfig[event.type];
          const Icon = cfg.icon;
          return (
            <div
              key={event.id}
              className={clsx(
                "flex items-start gap-3 p-3 rounded-lg border transition-all hover:bg-gray-800/50",
                cfg.bg, cfg.border
              )}
            >
              <div className={clsx("flex-shrink-0 mt-0.5", cfg.color)}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 leading-relaxed">{event.message}</p>
                <p className="text-xs text-gray-600 mt-1">{event.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
