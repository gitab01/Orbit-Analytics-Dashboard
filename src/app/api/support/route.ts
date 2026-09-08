import { NextRequest, NextResponse } from "next/server";

// POST — contact support message   body: { message, email? }
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  // In production this would send an email / create a ticket.
  // For now we log and return a ticket ID.
  const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
  console.log(`[Support] New ticket ${ticketId}: ${body.message}`);
  return NextResponse.json({ ok: true, ticketId }, { status: 201 });
}
