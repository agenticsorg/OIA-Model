#!/usr/bin/env node
/**
 * Read data/feedback.db and emit a single Markdown digest of every row.
 * Usage: node scripts/feedback-to-md.mjs > docs/feedback-submissions.md
 */
import Database from 'better-sqlite3';
import { resolve } from 'node:path';

const DB = resolve(process.cwd(), 'data', 'feedback.db');
const db = new Database(DB, { readonly: true });

const QUESTIONS = [
  ['hyperscaler_monopolies',  'Preventing hyperscalers from collapsing L5–L8 into black boxes'],
  ['layer8_certification',    'Who governs certification of L8 verifiable memory'],
  ['legacy_vendor_mapping',   'How incumbents map legacy products to the stack'],
  ['foundation_funding',      'Sustainable funding model for the Foundation'],
  ['regulatory_alignment',    'Driving global regulatory alignment'],
  ['shape_response',          'Is the shape correctly drawn? Where isn’t it?'],
  ['reopen_decisions',        'Decisions to reopen (numbers)'],
  ['reopen_reasons',          'Reasons to reopen those decisions'],
  ['open_questions_contrib',  'Open questions you can speak to'],
  ['additional_deferrals',    'Work that should be deferred'],
  ['prematurely_deferred',    'Work that should have been included'],
  ['missing_concerns',        'Concerns missing at any layer'],
  ['missing_tech',            'Reference technologies missing'],
  ['missing_spans',           'Cross-layer spans missing'],
  ['vertical_extension',      'Experience with vertical provider extension'],
  ['improvements',            'What would most improve the next draft'],
  ['general_feedback',        'Anything else'],
];

const rows = db.prepare('SELECT * FROM feedback ORDER BY created_at ASC').all();

const out = [];
out.push('# Feedback Submissions');
out.push('');
out.push(`_Pulled from \`gs://agentics-oia-model-data/feedback.db\` — ${rows.length} submission(s)._`);
out.push('');
out.push('Identity fields (name / email / organisation) are included verbatim — `share_name = 1` means the submitter agreed their name could be shown publicly, `share_name = 0` means they asked to stay anonymous in any public listing. They are reproduced here because this file is internal.');
out.push('');
out.push('---');
out.push('');

const blank = (v) => v === null || v === undefined || String(v).trim() === '';

for (const r of rows) {
  out.push(`## #${r.id} — ${r.created_at} UTC`);
  out.push('');
  const identity = [
    `- **share_name:** ${r.share_name}`,
    `- **name:** ${r.name ?? '_(not provided)_'}`,
    `- **email:** ${r.email ?? '_(not provided)_'}`,
    `- **organization:** ${r.organization ?? '_(not provided)_'}`,
    `- **role:** ${r.role ?? '_(not provided)_'}`,
  ];
  if ('share_body' in r) identity.push(`- **share_body:** ${r.share_body}`);
  out.push(...identity);
  out.push('');

  const answered = QUESTIONS.filter(([k]) => !blank(r[k]));
  if (answered.length === 0) {
    out.push('_No question fields answered._');
  } else {
    for (const [key, label] of answered) {
      out.push(`### ${label}`);
      out.push(`_(\`${key}\`)_`);
      out.push('');
      out.push(String(r[key]).trim());
      out.push('');
    }
  }
  out.push('---');
  out.push('');
}

process.stdout.write(out.join('\n'));
