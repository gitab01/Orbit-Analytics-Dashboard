import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Neon serverless driver — works in both Node.js and Edge Runtime
export const sql = neon(process.env.DATABASE_URL);
