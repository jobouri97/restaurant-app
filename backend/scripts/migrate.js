import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../src/db.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.join(currentDirectory, "..", "migrations");

try {
  const migrationFiles = (await fs.readdir(migrationsDirectory))
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  for (const migrationFile of migrationFiles) {
    const sql = await fs.readFile(
      path.join(migrationsDirectory, migrationFile),
      "utf8",
    );

    await pool.query(sql);
    console.log(`Applied ${migrationFile}`);
  }
} finally {
  await pool.end();
}
