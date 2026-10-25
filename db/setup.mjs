// Applies db/schema.sql, then db/seed.sql, then shows what is in the tables.
// Run it with: npm run db:setup
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("\nDATABASE_URL is missing.");
  console.error("Run this through npm (npm run db:setup) so .env.local is loaded.\n");
  process.exit(1);
}

const sql = neon(connectionString);
const read = (file) => readFile(new URL(file, import.meta.url), "utf8");

// The Neon HTTP driver sends ONE prepared statement per query, and Postgres
// refuses "CREATE ...; CREATE ..." inside a prepared statement. So we cut each
// file into statements. This is safe for our files: no semicolons inside strings.
const statements = (source) =>
  source
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

try {
  const schema = statements(await read("./schema.sql"));
  await sql.transaction(schema.map((statement) => sql.query(statement)));
  console.log("1. Schema applied — tables restaurants and reviews created.");
} catch (error) {
  if (error.code === "42P07") {
    console.error("\nThe tables already exist, so nothing was changed.");
    console.error("To start over, run this in the Neon SQL editor:");
    console.error("  DROP TABLE reviews, restaurants;\n");
    process.exit(1);
  }
  throw error;
}

try {
  const seed = statements(await read("./seed.sql"));
  await sql.transaction(seed.map((statement) => sql.query(statement)));
  console.log("2. Seed applied — 1 restaurant and 3 reviews inserted.");
} catch (error) {
  console.error("\nThe seed failed:", error.message);
  process.exit(1);
}

console.log("\nrestaurants");
console.table(
  await sql.query("SELECT id, name, cuisine, area FROM restaurants ORDER BY id")
);

console.log("reviews");
console.table(
  await sql.query(
    `SELECT id, restaurant_id, rating, comment,
            to_char(created_at, 'DD Mon, HH12:MIam') AS created_at
     FROM reviews ORDER BY created_at`
  )
);
