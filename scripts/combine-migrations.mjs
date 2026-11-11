// Builds supabase/all-in-one.sql from the files in supabase/migrations.
// Run with: npm run db:combine
// Run it again every time a migration is added or changed.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = join(import.meta.dirname, "..", "supabase", "migrations");
const outputFile = join(import.meta.dirname, "..", "supabase", "all-in-one.sql");

const files = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

const parts = [
  "-- ReelWright: the whole database in one file.",
  "-- GENERATED from supabase/migrations by `npm run db:combine`. Do not edit by hand.",
  "--",
  "-- For a FRESH Supabase project only: paste all of this into the SQL Editor",
  "-- and run it once. It runs as one transaction, so if anything fails,",
  "-- nothing is changed.",
  "",
  "begin;",
  "",
];

for (const name of files) {
  const sql = readFileSync(join(migrationsDir, name), "utf8").trimEnd();
  parts.push(`-- ${"=".repeat(68)}`, `-- ${name}`, `-- ${"=".repeat(68)}`, "", sql, "");
}

parts.push("commit;", "");
writeFileSync(outputFile, parts.join("\n"));
console.log(`Wrote supabase/all-in-one.sql from ${files.length} migrations.`);
