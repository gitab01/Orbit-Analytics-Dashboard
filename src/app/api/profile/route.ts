import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/lib/db";
import { store, userProfiles, userNotifications, defaultProfile, defaultNotifications } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { isValidEmail } from "@/lib/validate";

// ── GET /api/profile ──────────────────────────────────────────
export async function GET() {
  try {
    const session = await getSession();

    if (hasDB) {
      if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      try { await db()`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT`; } catch {}

      const rows = await db()`
        SELECT u.name, u.email,
          p.first_name AS "firstName", p.last_name AS "lastName",
          p.job_title  AS "jobTitle",  p.company,  p.timezone, p.bio,
          p.currency,   p.language,   p.date_format AS "dateFormat",
          p.fiscal_year AS "fiscalYear", p.default_view AS "defaultView",
          p.refresh_rate AS "refreshRate", p.theme,
          p.notifications, p.avatar_url AS "avatarUrl"
        FROM users u JOIN profiles p ON p.user_id = u.id
        WHERE u.id = ${session.id} LIMIT 1
      `;

      if (!rows.length) {
        // Profile row missing — create it now from session data
        const parts = (session.name ?? "").split(" ");
        await db()`
          INSERT INTO profiles (user_id, first_name, last_name, currency, language,
            date_format, fiscal_year, default_view, refresh_rate, theme, timezone)
          VALUES (${session.id}, ${parts[0] ?? ""}, ${parts.slice(1).join(" ") ?? ""},
            'ETB', 'English (US)', 'MMM DD, YYYY', 'January', 'Overview', '60', 'Dark',
            'Africa/Addis_Ababa')
          ON CONFLICT (user_id) DO NOTHING
        `;
        return NextResponse.json({
          profile: defaultProfile(session.id, session.name, session.email),
          notifications: defaultNotifications(),
        });
      }

      const { notifications, ...profileFields } = rows[0];
      const notifs = notifications ?? defaultNotifications();
      return NextResponse.json({ profile: profileFields, notifications: notifs });
    }

    // ── In-memory path ────────────────────────────────────────
    const userId = session?.id ?? "u1";
    const name   = session?.name  ?? store.team.find(m => m.id === userId)?.name ?? "User";
    const email  = session?.email ?? store.team.find(m => m.id === userId)?.email ?? "";

    if (!userProfiles.has(userId)) {
      userProfiles.set(userId, defaultProfile(userId, name, email));
    }
    if (!userNotifications.has(userId)) {
      userNotifications.set(userId, defaultNotifications());
    }

    return NextResponse.json({
      profile:       userProfiles.get(userId),
      notifications: userNotifications.get(userId),
    });
  } catch (err) {
    console.error("[profile GET]", err);
    // Safe fallback
    const session = await getSession().catch(() => null);
    const userId  = session?.id ?? "u1";
    return NextResponse.json({
      profile:       userProfiles.get(userId) ?? defaultProfile(userId, session?.name ?? "User", session?.email ?? ""),
      notifications: userNotifications.get(userId) ?? defaultNotifications(),
    });
  }
}

// ── PUT /api/profile ──────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    const body    = await req.json();

    if (hasDB) {
      if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      if (body.type === "notifications") {
        await db()`UPDATE profiles SET notifications = ${JSON.stringify(body.data)}::jsonb WHERE user_id = ${session.id}`;
        return NextResponse.json({ notifications: body.data });
      }

      if (body.email && !isValidEmail(body.email)) {
        return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
      }

      const { firstName, lastName, jobTitle, company, timezone, bio, currency,
              language, dateFormat, fiscalYear, defaultView, refreshRate, theme } = body;

      await db()`UPDATE profiles SET
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
        WHERE user_id = ${session.id}
      `;
      if (firstName || lastName) {
        await db()`UPDATE users SET name = ${`${firstName ?? ""} ${lastName ?? ""}`.trim()} WHERE id = ${session.id}`;
      }
      return NextResponse.json({ ok: true });
    }

    // ── In-memory path ────────────────────────────────────────
    const userId = session?.id ?? "u1";

    if (body.type === "notifications") {
      const existing = userNotifications.get(userId) ?? defaultNotifications();
      userNotifications.set(userId, { ...existing, ...body.data });
      return NextResponse.json({ notifications: userNotifications.get(userId) });
    }

    const existing = userProfiles.get(userId) ?? defaultProfile(userId, session?.name ?? "User", session?.email ?? "");
    const { type: _, ...fields } = body;
    userProfiles.set(userId, { ...existing, ...fields });
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[profile PUT]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
