/**
 * SQLite storage for Feedback submissions. Persisted at
 * data/feedback.db so Claude Code can query it directly:
 *
 *   sqlite3 data/feedback.db "SELECT * FROM feedback ORDER BY created_at DESC"
 *   npm run feedback:list
 *   npm run feedback:query -- "SELECT id, role, name FROM feedback"
 */

import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DB_PATH = process.env.DB_PATH
  ? resolve(process.env.DB_PATH)
  : resolve(process.cwd(), 'data', 'feedback.db');

let db: DatabaseType | null = null;

export function getDb(): DatabaseType {
  if (db) return db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at          TEXT NOT NULL DEFAULT (datetime('now')),

      -- identity & consent (ADR-0004 two-dimensional consent model)
      share_name          INTEGER NOT NULL DEFAULT 0,
      share_body          INTEGER NOT NULL DEFAULT 0,
      name                TEXT,
      email               TEXT,
      organization        TEXT,
      role                TEXT,

      -- five Foundation-featured questions
      hyperscaler_monopolies  TEXT, -- prevent hyperscalers collapsing L5–L8 into black boxes
      layer8_certification    TEXT, -- who governs certification of L8 verifiable memory
      legacy_vendor_mapping   TEXT, -- how incumbents map legacy products to the stack
      foundation_funding      TEXT, -- sustainable funding model for the Foundation
      regulatory_alignment    TEXT, -- driving global regulatory alignment

      -- review prompts drawn from the two digests
      shape_response             TEXT, -- "Is the shape correctly drawn? Where isn't it?"
      reopen_decisions           TEXT, -- comma-separated decision numbers (01..11)
      reopen_reasons             TEXT, -- long-form reasons
      open_questions_contrib     TEXT, -- which OQs can you speak to?
      additional_deferrals       TEXT, -- work that should be deferred
      prematurely_deferred       TEXT, -- work that should have been included
      missing_concerns           TEXT, -- concerns missing at any layer
      missing_tech               TEXT, -- reference technologies missing
      missing_spans              TEXT, -- cross-layer spans missing
      vertical_extension         TEXT, -- experience with vertical provider extension
      improvements               TEXT, -- what would most improve the next draft
      general_feedback           TEXT  -- anything else
    );
    CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);
    CREATE INDEX IF NOT EXISTS idx_feedback_role    ON feedback(role);
  `);
  /* Additive migration: if this table was created before the five
     Foundation-featured columns existed, add them now. */
  const instance = db;
  const cols = instance.prepare("PRAGMA table_info(feedback)").all() as { name: string }[];
  const have = new Set(cols.map((c) => c.name));
  const ensure = (name: string) => {
    if (!have.has(name)) instance.exec(`ALTER TABLE feedback ADD COLUMN ${name} TEXT`);
  };
  ensure('hyperscaler_monopolies');
  ensure('layer8_certification');
  ensure('legacy_vendor_mapping');
  ensure('foundation_funding');
  ensure('regulatory_alignment');
  /* ADR-0004: `share_body` is INTEGER NOT NULL DEFAULT 0, not TEXT. SQLite's
     ALTER TABLE allows adding a NOT NULL column only when a default exists,
     which DEFAULT 0 satisfies — existing rows land in the safe (non-publish)
     state automatically. */
  if (!have.has('share_body')) {
    instance.exec('ALTER TABLE feedback ADD COLUMN share_body INTEGER NOT NULL DEFAULT 0');
  }
  /* ADR-0003 §6 — daily chat spend accounting. One row per UTC date.
     `spent_microusd` is the integer micro-dollar total (1e-6 USD) so we
     don't drift with float accumulation across hundreds of turns. */
  instance.exec(`
    CREATE TABLE IF NOT EXISTS chat_usage (
      date_utc      TEXT    PRIMARY KEY,
      spent_microusd INTEGER NOT NULL DEFAULT 0,
      turn_count    INTEGER NOT NULL DEFAULT 0
    );
  `);
  return db;
}

export interface FeedbackRow {
  id?: number;
  created_at?: string;
  share_name: 0 | 1;
  share_body: 0 | 1;
  name: string | null;
  email: string | null;
  organization: string | null;
  role: string | null;
  hyperscaler_monopolies: string | null;
  layer8_certification: string | null;
  legacy_vendor_mapping: string | null;
  foundation_funding: string | null;
  regulatory_alignment: string | null;
  shape_response: string | null;
  reopen_decisions: string | null;
  reopen_reasons: string | null;
  open_questions_contrib: string | null;
  additional_deferrals: string | null;
  prematurely_deferred: string | null;
  missing_concerns: string | null;
  missing_tech: string | null;
  missing_spans: string | null;
  vertical_extension: string | null;
  improvements: string | null;
  general_feedback: string | null;
}

export function insertFeedback(row: FeedbackRow): number {
  const stmt = getDb().prepare(`
    INSERT INTO feedback (
      share_name, share_body, name, email, organization, role,
      hyperscaler_monopolies, layer8_certification, legacy_vendor_mapping,
      foundation_funding, regulatory_alignment,
      shape_response, reopen_decisions, reopen_reasons,
      open_questions_contrib, additional_deferrals, prematurely_deferred,
      missing_concerns, missing_tech, missing_spans,
      vertical_extension, improvements, general_feedback
    ) VALUES (
      @share_name, @share_body, @name, @email, @organization, @role,
      @hyperscaler_monopolies, @layer8_certification, @legacy_vendor_mapping,
      @foundation_funding, @regulatory_alignment,
      @shape_response, @reopen_decisions, @reopen_reasons,
      @open_questions_contrib, @additional_deferrals, @prematurely_deferred,
      @missing_concerns, @missing_tech, @missing_spans,
      @vertical_extension, @improvements, @general_feedback
    )
  `);
  const result = stmt.run(row);
  return Number(result.lastInsertRowid);
}

/** Public view — redacts name / email when share_name = 0. */
export function listFeedbackPublic() {
  return getDb()
    .prepare(
      `SELECT id, created_at, share_name,
              CASE WHEN share_name = 1 THEN name ELSE NULL END AS name,
              CASE WHEN share_name = 1 THEN organization ELSE NULL END AS organization,
              role
         FROM feedback
        ORDER BY created_at DESC`,
    )
    .all();
}

export function countFeedback(): number {
  const row = getDb().prepare('SELECT COUNT(*) AS n FROM feedback').get() as { n: number };
  return row.n;
}

export const FEEDBACK_DB_PATH = DB_PATH;
