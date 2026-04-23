import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

function readEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return {};

  return Object.fromEntries(
    readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const [key, ...valueParts] = line.split("=");
        return [key, valueParts.join("=").replace(/^"|"$/g, "")];
      }),
  );
}

function resolveSqlitePath() {
  const env = readEnvFile();
  const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL ?? "file:./dev.db";

  if (!databaseUrl.startsWith("file:")) {
    throw new Error(`Only SQLite file: URLs are supported by this local migration script. Received: ${databaseUrl}`);
  }

  const rawPath = databaseUrl.slice("file:".length);
  if (path.isAbsolute(rawPath)) return rawPath;

  return path.resolve(process.cwd(), "prisma", rawPath);
}

const databasePath = resolveSqlitePath();
mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);
db.exec(`
  CREATE TABLE IF NOT EXISTS "_LocalMigration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const migrationsPath = path.join(process.cwd(), "prisma", "migrations");
const migrationDirs = (await readdir(migrationsPath, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const applied = db.prepare('SELECT "id" FROM "_LocalMigration"').all().map((row) => row.id);
const appliedSet = new Set(applied);

for (const migrationId of migrationDirs) {
  if (appliedSet.has(migrationId)) continue;

  const sqlPath = path.join(migrationsPath, migrationId, "migration.sql");
  const sql = readFileSync(sqlPath, "utf8");

  db.exec("BEGIN");
  try {
    db.exec(sql);
    db.prepare('INSERT INTO "_LocalMigration" ("id") VALUES (?)').run(migrationId);
    db.exec("COMMIT");
    console.log(`Applied migration ${migrationId}`);
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

db.close();
console.log(`SQLite database ready at ${databasePath}`);
