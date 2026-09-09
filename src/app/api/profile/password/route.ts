import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, hasDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isValidPassword } from "@/lib/validate";

// Demo password for fallback (allows demo users to "change" password client-side)
const DEMO_PASSWORDS: Record<string, string> = {
  "alex@orbit.io":  "demo1234",
  "sara@orbit.io":  "demo1234",
  "demo@orbit.io":  "demo1234",
};

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    const pwErr = isValidPassword(newPassword);
    if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 });

    if (hasDB) {
      const rows = await db()`SELECT password_hash FROM users WHERE id = ${session.id}`;
      if (!rows.length) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

      const newHash = await bcrypt.hash(newPassword, 10);
      await db()`UPDATE users SET password_hash = ${newHash} WHERE id = ${session.id}`;
      return NextResponse.json({ ok: true });
    }

    // ── In-memory fallback ──────────────────────────────────
    const expected = DEMO_PASSWORDS[session.email];
    if (expected && currentPassword !== expected) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }
    // Update in-memory map so the session remains consistent
    DEMO_PASSWORDS[session.email] = newPassword;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[password POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
