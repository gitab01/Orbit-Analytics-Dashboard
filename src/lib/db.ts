import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export const hasDB = !!process.env.DATABASE_URL;

// sql is null when DATABASE_URL is not set.
// Routes must check hasDB before calling sql, or use the db() helper.
const _sql: NeonQueryFunction<false, false> | null =
  process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export { _sql as sql };

/**
 * Convenience: returns the sql client, throwing if DATABASE_URL is not set.
 * Use this in routes that already guard with hasDB.
 */
export function db(): NeonQueryFunction<false, false> {
  if (!_sql) throw new Error("DATABASE_URL is not configured");
  return _sql;
}
