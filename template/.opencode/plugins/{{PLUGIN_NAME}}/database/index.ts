import { mkdir } from "node:fs/promises";
import { Database } from "bun:sqlite";
import { dirname, getHomeDirectory, joinPath } from "../utils/path-utils";

export type DatabaseLevel = "project" | "global";

export interface PluginDatabaseOptions {
  directory?: string;
  filename?: string;
  level?: DatabaseLevel;
}

export interface StoredRecord<T> {
  key: string;
  value: T;
  updatedAt: string;
}

export class PluginDatabase<T = unknown> {
  private readonly db: Database;
  private readonly getStatement;
  private readonly setStatement;
  private readonly deleteStatement;
  private readonly listStatement;

  private constructor(
    private readonly pluginName: string,
    readonly path: string,
  ) {
    this.db = new Database(this.path, { create: true, strict: true });
    this.db.run("PRAGMA journal_mode = WAL;");
    this.db.run("PRAGMA synchronous = NORMAL;");
    this.db.run("PRAGMA foreign_keys = ON;");
    this.db.run("PRAGMA busy_timeout = 5000;");
    this.db.run(`
      CREATE TABLE IF NOT EXISTS plugin_kv (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    this.getStatement = this.db.query("SELECT key, value, updated_at FROM plugin_kv WHERE key = $key");
    this.setStatement = this.db.query(`
      INSERT INTO plugin_kv (key, value, updated_at)
      VALUES ($key, $value, $updatedAt)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `);
    this.deleteStatement = this.db.query("DELETE FROM plugin_kv WHERE key = $key");
    this.listStatement = this.db.query("SELECT key, value, updated_at FROM plugin_kv ORDER BY key ASC");
  }

  static async open<T = unknown>(pluginName: string, options: PluginDatabaseOptions = {}) {
    const path = getDatabasePath(pluginName, options);
    await mkdir(dirname(path), { recursive: true });
    return new PluginDatabase<T>(pluginName, path);
  }

  get(key: string): StoredRecord<T> | null {
    const row = this.getStatement.get({ key }) as
      | { key: string; value: string; updated_at: string }
      | null;

    if (!row) return null;

    return {
      key: row.key,
      value: JSON.parse(row.value) as T,
      updatedAt: row.updated_at,
    };
  }

  set(key: string, value: T) {
    const updatedAt = new Date().toISOString();
    this.setStatement.run({
      key,
      value: JSON.stringify(value),
      updatedAt,
    });
  }

  delete(key: string) {
    this.deleteStatement.run({ key });
  }

  list(): Array<StoredRecord<T>> {
    const rows = this.listStatement.all() as Array<{ key: string; value: string; updated_at: string }>;
    return rows.map((row) => ({
      key: row.key,
      value: JSON.parse(row.value) as T,
      updatedAt: row.updated_at,
    }));
  }

  close() {
    // Passing `false` keeps close() forgiving for template code. Use `true`
    // instead when you want shutdown to fail loudly if there are still pending
    // statements or the connection state is unexpected.
    this.db.close(false);
  }
}

export function getDatabasePath(pluginName: string, options: PluginDatabaseOptions = {}) {
  const filename = options.filename ?? `${pluginName}.sqlite`;
  const level = options.level ?? "project";

  if (level === "global") {
    return joinPath(getHomeDirectory(), ".config", "opencode", "state", filename);
  }

  const directory = options.directory ?? process.cwd();
  return joinPath(directory, ".opencode", "state", filename);
}
