#!/usr/bin/env node
/**
 * Run an arbitrary SELECT against the feedback DB.
 *   npm run feedback:query -- "SELECT id, role, name FROM feedback ORDER BY id DESC"
 * Refuses to run non-SELECT statements so the DB can't be mutated from the CLI.
 */

import Database from 'better-sqlite3';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const sql = process.argv.slice(2).join(' ').trim();
if (!sql) {
  console.error('Usage: npm run feedback:query -- "SELECT …"');
  process.exit(1);
}
if (!/^select\b/i.test(sql)) {
  console.error('Only SELECT statements are permitted from this script.');
  process.exit(1);
}

const path = resolve(process.cwd(), 'data', 'feedback.db');
if (!existsSync(path)) {
  console.error(`No database yet at ${path}.`);
  process.exit(1);
}

const db = new Database(path, { readonly: true });
try {
  const rows = db.prepare(sql).all();
  console.log(JSON.stringify(rows, null, 2));
} catch (e) {
  console.error('Query error:', e.message);
  process.exit(1);
}
