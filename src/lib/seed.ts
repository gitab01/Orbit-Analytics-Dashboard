/**
 * Run once: npx tsx src/lib/seed.ts
 * Seeds the time_series table with 31 days of realistic data.
 * Requires DATABASE_URL in environment.
 */
import { neon } from "@neondatabase/serverless";
import { subDays, format } from "date-fns";

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  console.log("Seeding time_series…");
  // Clear existing
  await sql`DELETE FROM time_series`;

  let rev = 42000, usr = 1800, ses = 5200, con = 320;
  for (let i = 30; i >= 0; i--) {
    rev = Math.max(rev + Math.floor((Math.random() - 0.35) * 3000), 20000);
    usr = Math.max(usr + Math.floor((Math.random() - 0.3)  * 150),  800);
    ses = Math.max(ses + Math.floor((Math.random() - 0.3)  * 400),  2000);
    con = Math.max(con + Math.floor((Math.random() - 0.35) * 30),   100);
    const date = format(subDays(new Date(), i), "MMM dd");
    await sql`INSERT INTO time_series (date, revenue, users, sessions, conversions) VALUES (${date}, ${rev}, ${usr}, ${ses}, ${con})`;
  }
  console.log("✓ time_series seeded (31 rows)");
}

seed().catch(console.error);
