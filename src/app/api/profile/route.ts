import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

// GET profile + notifications
export async function GET() {
  return NextResponse.json({ profile: store.profile, notifications: store.notifications });
}

// PUT — update profile or notifications   body: { type:"profile"|"notifications", ...fields }
export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (body.type === "notifications") {
    Object.assign(store.notifications, body.data);
    return NextResponse.json({ notifications: store.notifications });
  }
  // default: profile
  const { type: _, ...fields } = body;
  Object.assign(store.profile, fields);
  return NextResponse.json({ profile: store.profile });
}
