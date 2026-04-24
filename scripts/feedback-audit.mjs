#!/usr/bin/env node
/**
 * Audit every feedback row against the PII heuristic (ADR-0004 §3.2).
 *
 *   node scripts/feedback-audit.mjs
 *
 * Prints a table: id | role | findings. Exits 0 even with findings — this is
 * informational, for periodic Foundation review.
 *
 * The regexes here duplicate server/pii-heuristic.ts. This script cannot
 * import TS directly; keep the two in sync when changing either one.
 */

import Database from 'better-sqlite3';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dbPath = process.env.DB_PATH
  ? resolve(process.env.DB_PATH)
  : resolve(process.cwd(), 'data', 'feedback.db');

if (!existsSync(dbPath)) {
  console.error(`No database at ${dbPath}.`);
  process.exit(1);
}

const BODY_FIELDS = [
  'name',
  'organization',
  'hyperscaler_monopolies',
  'layer8_certification',
  'legacy_vendor_mapping',
  'foundation_funding',
  'regulatory_alignment',
  'shape_response',
  'reopen_decisions',
  'reopen_reasons',
  'open_questions_contrib',
  'additional_deferrals',
  'prematurely_deferred',
  'missing_concerns',
  'missing_tech',
  'missing_spans',
  'vertical_extension',
  'improvements',
  'general_feedback',
];

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?|\d{2,4}[\s.-])\d{2,4}[\s.-]?\d{2,4}(?:[\s.-]?\d{2,4})?/g;
const TOKEN_RE = /[A-Za-z0-9/+=_-]{40,}/g;

function detectPii(row) {
  const findings = [];
  const ownEmail = typeof row.email === 'string' ? row.email.trim().toLowerCase() : '';

  for (const field of BODY_FIELDS) {
    const raw = row[field];
    if (typeof raw !== 'string' || raw.length === 0) continue;

    const emails = raw.match(EMAIL_RE) ?? [];
    for (const e of emails) {
      if (e.toLowerCase() !== ownEmail) findings.push(`email(${e}) in ${field}`);
    }

    const phones = raw.match(PHONE_RE) ?? [];
    for (const p of phones) {
      const digitCount = (p.match(/\d/g) ?? []).length;
      if (digitCount >= 7) findings.push(`phone(${p.trim()}) in ${field}`);
    }

    const tokens = raw.match(TOKEN_RE) ?? [];
    for (const t of tokens) {
      if (/[A-Za-z]/.test(t) && /\d/.test(t)) {
        findings.push(`token-like in ${field}`);
      }
    }
  }
  return findings;
}

const db = new Database(dbPath, { readonly: true });
const rows = db.prepare('SELECT * FROM feedback ORDER BY id ASC').all();

if (rows.length === 0) {
  console.log('(no submissions yet)');
  process.exit(0);
}

const idW = Math.max(2, String(rows[rows.length - 1].id).length);
const roleW = Math.max(4, ...rows.map((r) => (r.role ?? '—').length));

console.log(
  `${'id'.padEnd(idW)}  ${'role'.padEnd(roleW)}  findings`,
);
console.log('-'.repeat(idW + 2 + roleW + 2 + 8));

let flagged = 0;
for (const r of rows) {
  const findings = detectPii(r);
  const role = (r.role ?? '—').padEnd(roleW);
  const id = String(r.id).padEnd(idW);
  if (findings.length === 0) {
    console.log(`${id}  ${role}  (clean)`);
  } else {
    flagged += 1;
    console.log(`${id}  ${role}  ${findings.join('; ')}`);
  }
}

console.log('');
console.log(`${rows.length} row(s) scanned; ${flagged} flagged.`);
process.exit(0);
