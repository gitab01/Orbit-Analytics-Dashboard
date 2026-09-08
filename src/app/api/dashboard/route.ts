import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json({
    kpi:        store.kpi,
    timeSeries: store.timeSeries,
    traffic:    store.traffic,
    pages:      store.pages,
    funnel:     store.funnel,
    events:     store.events,
  });
}
