import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    // Fall back to Alex Kim's profile for demo if no session
    const userId = session?.id ?? "u1";

    const rows = await sql`
      SELECT
        u.name,
        u.email,
        p.first_name    AS "firstName",
        p.last_name     AS "lastName",
        p.job_title     AS "jobTitle",
        p.company,
        p.timezone,
        p.bio,
        p.currency,
        p.language,
        p.date_format   AS "dateFormat",
        p.fiscal_year   AS "fiscalYear",
        p.default_view  AS "defaultView",
        p.refresh_rate  AS "refreshRate",
        p.theme,
        p.notifications
      FROM users u
      JOIN profiles p ON p.user_id = u.id
      WHERE u.id = ${userId}
      LIMIT 1
    `;

    if (!rows.length) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const row = rows[0];
    const { notifications, ...profileFields } = row;

    return NextResponse.json({ profile: profileFields, notifications });
  } catch (err) {
    console.error("[profile GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.id ?? "u1";
    const body = await req.json();

    if (body.type === "notifications") {
      await sql`
        UPDATE profiles SET notifications = ${JSON.stringify(body.data)}::jsonb
        WHERE user_id = ${userId}
      `;
      return NextResponse.json({ notifications: body.data });
    }

    // Update profile fields
    const {
      firstName, lastName, jobTitle, company, timezone, bio,
      currency, language, dateFormat, fiscalYear, defaultView, refreshRate, theme,
    } = body;

    await sql`
      UPDATE profiles SET
        first_name   = COALESCE(${firstName   ?? null}, first_name),
        last_name    = COALESCE(${lastName    ?? null}, last_name),
        job_title    = COALESCE(${jobTitle    ?? null}, job_title),
        company      = COALESCE(${company     ?? null}, company),
        timezone     = COALESCE(${timezone    ?? null}, timezone),
        bio          = COALESCE(${bio         ?? null}, bio),
        currency     = COALESCE(${currency    ?? null}, currency),
        language     = COALESCE(${language    ?? null}, language),
        date_format  = COALESCE(${dateFormat  ?? null}, date_format),
        fiscal_year  = COALESCE(${fiscalYear  ?? null}, fiscal_year),
        default_view = COALESCE(${defaultView ?? null}, default_view),
        refresh_rate = COALESCE(${refreshRate ?? null}, refresh_rate),
        theme        = COALESCE(${theme       ?? null}, theme)
      WHERE user_id = ${userId}
    `;

    // Also update name/email in users table if provided
    if (firstName || lastName) {
      const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
      await sql`UPDATE users SET name = ${fullName} WHERE id = ${userId}`;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[profile PUT]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
