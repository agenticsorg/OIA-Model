/**
 * Lightweight PII heuristic for feedback body fields (ADR-0004 §3.2).
 *
 * This is a best-effort scan — false-positives are acceptable. The result is
 * surfaced as an advisory to the submitter; it never blocks or auto-redacts.
 *
 * Patterns checked in the 22 body fields (NOT in the `email` identity field,
 * which is collected deliberately):
 *   - Extra email addresses in any body field
 *   - Phone numbers (E.164, US-style, or loose international)
 *   - Long base64-ish bearer-token-looking strings
 */

import type { FeedbackRow } from './db';

/** 22 body fields that may carry PII. The `email` column is deliberately excluded. */
const BODY_FIELDS: (keyof FeedbackRow)[] = [
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
// E.164 (+1234567890), US-style (415) 555-1212 or 415-555-1212, or loose intl 10+ digits with separators.
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?|\d{2,4}[\s.-])\d{2,4}[\s.-]?\d{2,4}(?:[\s.-]?\d{2,4})?/g;
// ≥40 chars, mostly alphanumeric + /+=_- (bearer-token-ish).
const TOKEN_RE = /[A-Za-z0-9/+=_-]{40,}/g;

export function detectPii(row: FeedbackRow): string[] {
  const findings: string[] = [];
  const ownEmail = typeof row.email === 'string' ? row.email.trim().toLowerCase() : '';

  for (const field of BODY_FIELDS) {
    const raw = row[field];
    if (typeof raw !== 'string' || raw.length === 0) continue;

    // Extra emails — skip the submitter's own `email` field value.
    const emails = raw.match(EMAIL_RE) ?? [];
    for (const e of emails) {
      if (e.toLowerCase() !== ownEmail) {
        findings.push(`email address (${e}) in ${field}`);
      }
    }

    // Phone numbers — require the match to contain at least 7 digits overall,
    // to cut down on date/version false-positives.
    const phones = raw.match(PHONE_RE) ?? [];
    for (const p of phones) {
      const digitCount = (p.match(/\d/g) ?? []).length;
      if (digitCount >= 7) {
        findings.push(`phone number (${p.trim()}) in ${field}`);
      }
    }

    // Bearer-token-ish. Require mix of letters + digits to avoid flagging
    // pure-text hashes-of-spaces or URLs with lots of slashes only.
    const tokens = raw.match(TOKEN_RE) ?? [];
    for (const t of tokens) {
      const hasLetter = /[A-Za-z]/.test(t);
      const hasDigit = /\d/.test(t);
      if (hasLetter && hasDigit) {
        findings.push(`bearer-token-like string in ${field}`);
      }
    }
  }

  return findings;
}
