import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const [kpi, timeSeries, traffic, pages, funnel, events] = await Promise.all([
      sql`SELECT id, label, value, change, trend, icon, color FROM kpi_metrics ORDER BY id`,
      sql`SELECT date, revenue, users, sessions, conversions FROM time_series ORDER BY id`,
      sql`SELECT name, value, color FROM traffic_sources ORDER BY value DESC`,
      sql`SELECT id, page, views, unique_visitors AS "uniqueVisitors", bounce_rate AS "bounceRate", avg_time AS "avgTime", status FROM top_pages ORDER BY views DESC`,
      sql`SELECT stage, value, pct FROM funnel_stages ORDER BY sort_order`,
      sql`
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
  } catch (err) {
    console.error("[dashboard]", err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
