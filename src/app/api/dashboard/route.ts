import { NextResponse } from "next/server";
import { db, hasDB } from "@/lib/db";
import { store } from "@/lib/store";

export async function GET() {
  try {
    if (hasDB) {
      const [kpi, timeSeries, traffic, pages, funnel, events] = await Promise.all([
        db()`SELECT id, label, value, change, trend, icon, color FROM kpi_metrics ORDER BY id`,
        db()`SELECT date, revenue, users, sessions, conversions FROM time_series ORDER BY id`,
        db()`SELECT name, value, color FROM traffic_sources ORDER BY value DESC`,
        db()`SELECT id, page, views, unique_visitors AS "uniqueVisitors", bounce_rate AS "bounceRate", avg_time AS "avgTime", status FROM top_pages ORDER BY views DESC`,
        db()`SELECT stage, value, pct FROM funnel_stages ORDER BY sort_order`,
        db()`
          SELECT id, type, message,
            CASE
              WHEN created_at > NOW() - INTERVAL '1 minute'  THEN 'just now'
              WHEN created_at > NOW() - INTERVAL '1 hour'    THEN EXTRACT(MINUTE FROM NOW() - created_at)::int || ' min ago'
              WHEN created_at > NOW() - INTERVAL '24 hours'  THEN EXTRACT(HOUR   FROM NOW() - created_at)::int || ' hr ago'
              ELSE EXTRACT(DAY FROM NOW() - created_at)::int || ' days ago'
            END AS time
          FROM events ORDER BY created_at DESC LIMIT 10
        `,
      ]);
      return NextResponse.json({ kpi, timeSeries, traffic, pages, funnel, events });
    }

    // ── In-memory fallback ──────────────────────────────────
    return NextResponse.json({
      kpi:        store.kpi,
      timeSeries: store.timeSeries,
      traffic:    store.traffic,
      pages:      store.pages,
      funnel:     store.funnel,
      events:     store.events,
    });
  } catch (err) {
    console.error("[dashboard]", err);
    // Always fall back to store on DB error
    return NextResponse.json({
      kpi: store.kpi, timeSeries: store.timeSeries, traffic: store.traffic,
      pages: store.pages, funnel: store.funnel, events: store.events,
    });
  }
}
