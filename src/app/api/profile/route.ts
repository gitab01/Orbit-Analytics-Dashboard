import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/lib/db";
import { store } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { isValidEmail } from "@/lib/validate";

export async function GET() {
  try {
    if (hasDB) {
      const session = await getSession();
      const userId  = session?.id ?? "u1";

      // Ensure avatar_url column exists
      try { await db()`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT`; } catch {}

      const rows = await db()`
        SELECT u.name, u.email, p.first_name AS "firstName", p.last_name AS "lastName",
          p.job_title AS "jobTitle", p.company, p.timezone, p.bio, p.currency, p.language,
          p.date_format AS "dateFormat", p.fiscal_year AS "fiscalYear",
          p.default_view AS "defaultView", p.refresh_rate AS "refreshRate",
          p.theme, p.notifications, p.avatar_url AS "avatarUrl"
        FROM users u JOIN profiles p ON p.user_id = u.id
        WHERE u.id = ${userId} LIMIT 1
      `;
      if (!rows.length) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      const { notifications, ...profileFields } = rows[0];
      return NextResponse.json({ profile: profileFields, notifications });
    }

    // ── In-memory fallback ──────────────────────────────────
    return NextResponse.json({ profile: store.profile, notifications: store.notifications });
  } catch (err) {
    console.error("[profile GET]", err);
    return NextResponse.json({ profile: store.profile, notifications: store.notifications });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (hasDB) {
      const session = await getSession();
      const userId  = session?.id ?? "u1";

      if (body.type === "notifications") {
        await db()`UPDATE profiles SET notifications = ${JSON.stringify(body.data)}::jsonb WHERE user_id = ${userId}`;
        return NextResponse.json({ notifications: body.data });
      }

      if (body.email && !isValidEmail(body.email)) {
        return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
      }

      const { firstName, lastName, jobTitle, company, timezone, bio, currency, language, dateFormat, fiscalYear, defaultView, refreshRate, theme } = body;
      await db()`UPDATE profiles SET
        first_name=COALESCE(${firstName??null},first_name), last_name=COALESCE(${lastName??null},last_name),
        job_title=COALESCE(${jobTitle??null},job_title), company=COALESCE(${company??null},company),
        timezone=COALESCE(${timezone??null},timezone), bio=COALESCE(${bio??null},bio),
        currency=COALESCE(${currency??null},currency), language=COALESCE(${language??null},language),
        date_format=COALESCE(${dateFormat??null},date_format), fiscal_year=COALESCE(${fiscalYear??null},fiscal_year),
        default_view=COALESCE(${defaultView??null},default_view), refresh_rate=COALESCE(${refreshRate??null},refresh_rate),
        theme=COALESCE(${theme??null},theme)
        WHERE user_id = ${userId}`;
      if (firstName || lastName) {
        await db()`UPDATE users SET name = ${`${firstName??""} ${lastName??""}`.trim()} WHERE id = ${userId}`;
      }
      return NextResponse.json({ ok: true });
    }

    // ── In-memory fallback ──────────────────────────────────
    if (body.type === "notifications") {
      Object.assign(store.notifications, body.data);
      return NextResponse.json({ notifications: store.notifications });
    }
    const { type: _, ...fields } = body;
    Object.assign(store.profile, fields);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[profile PUT]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
