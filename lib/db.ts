import { neon } from "@neondatabase/serverless";

// One place that knows how to reach the database, used by both endpoints.
//
// This is a function, not a constant, so that a missing DATABASE_URL fails when
// somebody requests a page - with a clear message - rather than breaking the
// build. That difference matters on Vercel later.
export function getDb() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return neon(url);
}
