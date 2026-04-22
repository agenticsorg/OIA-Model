#!/usr/bin/env node
/**
 * List all feedback submissions in a readable format.
 *   node scripts/feedback-list.mjs         — short table
 *   node scripts/feedback-list.mjs --json  — JSON dump
 *   node scripts/feedback-list.mjs --full  — include all answer text
 */

import Database from 'better-sqlite3';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.cwd(), 'data', 'feedback.db');
if (!existsSync(path)) {
  console.error(`No database yet at ${path} — submit from the UI first.`);
  process.exit(1);
}

const db = new Database(path, { readonly: true });
const mode = process.argv.includes('--json')
  ? 'json'
  : process.argv.includes('--full')
    ? 'full'
    : 'short';

const rows = db.prepare('SELECT * FROM feedback ORDER BY created_at DESC').all();
if (rows.length === 0) {
  console.log('(no submissions yet)');
  process.exit(0);
}

if (mode === 'json') {
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

if (mode === 'short') {
  console.log(`${rows.length} submission(s) — showing most recent first.`);
  console.log('');
  for (const r of rows) {
    const who = r.share_name ? (r.name || '(name not given)') : '(anonymous)';
    const org = r.share_name && r.organization ? ` · ${r.organization}` : '';
    const role = r.role ? ` · ${r.role}` : '';
    console.log(`#${r.id}  ${r.created_at}  ${who}${org}${role}`);
    const featured = {
      'Hyperscaler monopolies': r.hyperscaler_monopolies,
      'L8 certification': r.layer8_certification,
      'Legacy vendor mapping': r.legacy_vendor_mapping,
      'Foundation funding': r.foundation_funding,
      'Regulatory alignment': r.regulatory_alignment,
    };
    for (const [k, v] of Object.entries(featured)) {
      if (v) console.log(`  · ${k}: ${truncate(v)}`);
    }
    if (r.shape_response) console.log(`  · Shape: ${truncate(r.shape_response)}`);
    if (r.reopen_decisions) console.log(`  · Reopen: DEC-${r.reopen_decisions}`);
    console.log('');
  }
  process.exit(0);
}

// full
for (const r of rows) {
  console.log('=== #' + r.id + ' · ' + r.created_at + ' ===');
  for (const [k, v] of Object.entries(r)) {
    if (v === null || v === '' || k === 'id' || k === 'created_at') continue;
    console.log(`${k}: ${v}`);
  }
  console.log('');
}

function truncate(s, n = 120) {
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n) + '…' : t;
}
