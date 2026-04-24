#!/usr/bin/env node
/**
 * Hard-kill a feedback row from public surfaces (ADR-0004 §3.3).
 *
 *   node scripts/feedback-redact.mjs <id>
 *
 * Sets share_body=0 and share_name=0 on the row, which excludes it from:
 *   - the chat retrieval corpus (ADR-0003 §3.3: WHERE share_body = 1)
 *   - the public listing's name/org projection (redacted when share_name=0)
 *
 * Exits non-zero if the id is not found. Prints a before/after summary.
 */

import Database from 'better-sqlite3';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const idArg = process.argv[2];
if (!idArg || !/^\d+$/.test(idArg)) {
  console.error('Usage: node scripts/feedback-redact.mjs <id>');
  process.exit(2);
}
const id = Number(idArg);

const dbPath = process.env.DB_PATH
  ? resolve(process.env.DB_PATH)
  : resolve(process.cwd(), 'data', 'feedback.db');

if (!existsSync(dbPath)) {
  console.error(`No database at ${dbPath}.`);
  process.exit(1);
}

const db = new Database(dbPath);
const before = db
  .prepare('SELECT id, created_at, role, share_name, share_body FROM feedback WHERE id = ?')
  .get(id);

if (!before) {
  console.error(`id ${id} not found`);
  process.exit(1);
}

console.log('Before:');
console.log(`  #${before.id}  ${before.created_at}  role=${before.role ?? '—'}  share_name=${before.share_name}  share_body=${before.share_body}`);

const result = db
  .prepare('UPDATE feedback SET share_name = 0, share_body = 0 WHERE id = ?')
  .run(id);

if (result.changes !== 1) {
  console.error(`Unexpected: update affected ${result.changes} rows.`);
  process.exit(1);
}

const after = db
  .prepare('SELECT id, created_at, role, share_name, share_body FROM feedback WHERE id = ?')
  .get(id);

console.log('After:');
console.log(`  #${after.id}  ${after.created_at}  role=${after.role ?? '—'}  share_name=${after.share_name}  share_body=${after.share_body}`);
console.log('');
console.log(`Row #${id} redacted. It is now excluded from the chat corpus and any public listing.`);
