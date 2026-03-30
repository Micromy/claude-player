import Database from 'better-sqlite3'
import { app } from 'electron'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.')
  }
  return db
}

export function initDb(): void {
  const dbPath = join(app.getPath('userData'), 'claudeplayer.db')
  db = new Database(dbPath)

  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  runMigrations(db)
}

function runMigrations(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      name    TEXT NOT NULL UNIQUE,
      applied INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `)

  const migrationsDir = join(__dirname, 'migrations')
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  const applied = new Set(
    database.prepare('SELECT name FROM _migrations').all().map((r: unknown) => (r as { name: string }).name)
  )

  for (const file of files) {
    if (applied.has(file)) continue

    const sql = readFileSync(join(migrationsDir, file), 'utf-8')
    database.exec(sql)
    database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file)
  }
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
