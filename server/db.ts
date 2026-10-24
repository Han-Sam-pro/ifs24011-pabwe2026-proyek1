import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Lokasi file database SQLite. Bisa diubah lewat env SQLITE_PATH.
const DB_PATH =
  process.env.SQLITE_PATH || path.resolve(process.cwd(), 'data', 'roamplan.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    photo         TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trips (
    id               TEXT NOT NULL,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title            TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    data             TEXT NOT NULL,            -- seluruh TripPlan dalam JSON
    updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, id)
  );

  CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
`);
