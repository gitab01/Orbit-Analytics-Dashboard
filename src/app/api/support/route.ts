import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    const session  = await getSession();
    const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;

    if (hasDB) {
      await db()`INSERT INTO support_tickets (ticket_id, message, email) VALUES (${ticketId}, ${body.message.trim()}, ${session?.email ?? body.email ?? null})`;
    } else {
      console.log(`[Support] New ticket ${ticketId} from ${session?.email ?? "anonymous"}: ${body.message}`);
    }

    return NextResponse.json({ ok: true, ticketId }, { status: 201 });
  } catch (err) {
    console.error("[support POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
