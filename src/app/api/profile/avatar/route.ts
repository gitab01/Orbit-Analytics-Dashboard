import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Store avatar as base64 data URL in the profiles table
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const userId  = session?.id ?? "u1";

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 });
    if (!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WEBP or GIF allowed" }, { status: 400 });
    }

    const buffer   = await file.arrayBuffer();
    const base64   = Buffer.from(buffer).toString("base64");
    const dataUrl  = `data:${file.type};base64,${base64}`;

    if (hasDB) {
      try { await db()`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT`; } catch {}
      await db()`UPDATE profiles SET avatar_url = ${dataUrl} WHERE user_id = ${userId}`;
    }
    // In-memory: just return the data URL — client will display it

    return NextResponse.json({ ok: true, avatarUrl: dataUrl });
  } catch (err) {
    console.error("[avatar POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    const userId  = session?.id ?? "u1";

    if (hasDB) {
      try { await db()`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT`; } catch {}
      const rows = await db()`SELECT avatar_url FROM profiles WHERE user_id = ${userId}`;
      return NextResponse.json({ avatarUrl: rows[0]?.avatar_url ?? null });
    }
    return NextResponse.json({ avatarUrl: null });
  } catch (err) {
    console.error("[avatar GET]", err);
    return NextResponse.json({ avatarUrl: null });
  }
}
