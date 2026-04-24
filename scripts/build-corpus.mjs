#!/usr/bin/env node
/**
 * build-corpus.mjs
 *
 * Compiles the two OIA Model digests into `server/corpus.ts` (ADR-0003 §3.2).
 *
 * Inputs:
 *   - /docs/OIA-Model-v0.1-Digest.md              (Reader's Digest)
 *   - /docs/OIA-Model-v0.1-Decision-Log-Digest.md (Decision Log Digest)
 *   - /src/content/digest.ts                      (typed, for anchor alignment)
 *   - /src/content/decision-log.ts                (typed, for anchor alignment)
 *   - /src/content/layers.ts                      (layer ids: layer-0 .. layer-9)
 *   - /src/content/spans.ts                       (span ids and SPAN-SEC..SPAN-PRV codes)
 *
 * Output:
 *   - /server/corpus.ts — a generated TypeScript module exporting:
 *         DIGEST_TEXT       : string   — concatenated Markdown
 *         DIGEST_HASH       : string   — sha256 of DIGEST_TEXT, truncated to 12
 *         CITATION_ID_MAP   : Record<string,{ kind, deeplink }>
 *         validateCitation  : runtime helper (returns {ok, kind?, deeplink?})
 *
 * Citation IDs are aligned with the deep-link anchors the reader uses
 * (e.g. `#decision-04`, `#layer-8`, `#span-sovereignty`, `#cross-layer-spans`)
 * so that clicking a citation in the chat takes the visitor INTO the digest.
 *
 * FEEDBACK citations are not listed in CITATION_ID_MAP — they are validated
 * at runtime via a regex in validateCitation() that accepts any id greater
 * than the three grandfathered rows (1, 2, 3) per ADR-0004 §2.2.
 */

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const DIGEST_PATHS = [
  resolve(ROOT, 'docs/OIA-Model-v0.1-Digest.md'),
  resolve(ROOT, 'docs/OIA-Model-v0.1-Decision-Log-Digest.md'),
];
const OUT_PATH = resolve(ROOT, 'server/corpus.ts');

/* ------------------------------------------------------------------ *
 * 1. Read and concatenate the two digests.
 * ------------------------------------------------------------------ */

const parts = [];
for (const p of DIGEST_PATHS) {
  const text = readFileSync(p, 'utf8');
  const name = p.split('/').pop();
  parts.push(`<!-- SOURCE: ${name} -->\n\n${text.trim()}\n`);
}
const DIGEST_TEXT = parts.join('\n\n---\n\n');

/* ------------------------------------------------------------------ *
 * 2. SHA-256 hash (12-char prefix) of the concatenated digest.
 * ------------------------------------------------------------------ */

const DIGEST_HASH = createHash('sha256').update(DIGEST_TEXT).digest('hex').slice(0, 12);

/* ------------------------------------------------------------------ *
 * 3. Build the citation-ID map.
 *
 * The reader's deep-link anchors live on <section id="...">
 * rendered by React from the content modules. Enumerate them explicitly
 * here so the map is self-documenting, and cross-check that the count
 * matches the typed content modules.
 *
 * Structure of CITATION_ID_MAP: every known id (§N.M, DEC-NN, L-N,
 * SPAN-XXX, plus section shortcuts the model is likely to emit) maps
 * to its kind and deep-link.
 * ------------------------------------------------------------------ */

/** Build section-id entries for the digest's numbered sections. */
const SECTION_MAP = {
  '§1': { kind: 'section', deeplink: '#introduction' },
  '§2': { kind: 'section', deeplink: '#foundations' },
  '§2.1': { kind: 'section', deeplink: '#foundations' },
  '§2.2': { kind: 'section', deeplink: '#foundations' },
  '§2.3': { kind: 'section', deeplink: '#foundations' },
  '§3': { kind: 'section', deeplink: '#nine-layers-overview' },
  '§4': { kind: 'section', deeplink: '#layer-definitions' },
  '§4.0': { kind: 'layer', deeplink: '#layer-0' },
  '§4.1': { kind: 'layer', deeplink: '#layer-1' },
  '§4.2': { kind: 'layer', deeplink: '#layer-2' },
  '§4.3': { kind: 'layer', deeplink: '#layer-3' },
  '§4.4': { kind: 'layer', deeplink: '#layer-4' },
  '§4.5': { kind: 'layer', deeplink: '#layer-5' },
  '§4.6': { kind: 'layer', deeplink: '#layer-6' },
  '§4.7': { kind: 'layer', deeplink: '#layer-7' },
  '§4.8': { kind: 'layer', deeplink: '#layer-8' },
  '§4.9': { kind: 'layer', deeplink: '#layer-9' },
  '§5': { kind: 'section', deeplink: '#cross-layer-spans' },
  '§6': { kind: 'section', deeplink: '#relationships' },
  '§7': { kind: 'section', deeplink: '#adoption' },
  '§8': { kind: 'section', deeplink: '#deferrals' },
  '§Foreword': { kind: 'section', deeplink: '#foreword' },
  '§Closing': { kind: 'section', deeplink: '#closing' },
};

/** Layer shorthand: L-0 .. L-9. */
const LAYER_MAP = {};
for (let n = 0; n <= 9; n++) {
  LAYER_MAP[`L-${n}`] = { kind: 'layer', deeplink: `#layer-${n}` };
  LAYER_MAP[`LAYER-${n}`] = { kind: 'layer', deeplink: `#layer-${n}` };
}

/** Decisions: DEC-01 .. DEC-11 (ADR-0003 §4.1 R2). */
const DECISION_MAP = {};
for (let n = 1; n <= 11; n++) {
  const padded = String(n).padStart(2, '0');
  DECISION_MAP[`DEC-${padded}`] = { kind: 'decision', deeplink: `#decision-${padded}` };
  // also accept non-padded forms: "DEC-4" -> #decision-04
  DECISION_MAP[`DEC-${n}`] = { kind: 'decision', deeplink: `#decision-${padded}` };
}

/** Cross-layer spans. IDs match the SPAN-XXX shorthand in ADR-0003 §4.1 R2. */
const SPAN_MAP = {
  'SPAN-SEC': { kind: 'span', deeplink: '#span-security' },
  'SPAN-SOV': { kind: 'span', deeplink: '#span-sovereignty' },
  'SPAN-AUD': { kind: 'span', deeplink: '#span-auditability' },
  'SPAN-IDN': { kind: 'span', deeplink: '#span-identity' },
  'SPAN-ENG': { kind: 'span', deeplink: '#span-energy' },
  'SPAN-PRV': { kind: 'span', deeplink: '#span-provenance' },
};

/** Named digest sections (shorthand IDs the model may emit — ADR-0003 §4.1 R2). */
const DIGEST_ALIAS_MAP = {
  DIGEST: { kind: 'digest', deeplink: '#digest' },
  FOREWORD: { kind: 'section', deeplink: '#foreword' },
  'ON-READING': { kind: 'section', deeplink: '#on-reading' },
  CLOSING: { kind: 'section', deeplink: '#closing' },
};

const CITATION_ID_MAP = {
  ...SECTION_MAP,
  ...LAYER_MAP,
  ...DECISION_MAP,
  ...SPAN_MAP,
  ...DIGEST_ALIAS_MAP,
};

/* ------------------------------------------------------------------ *
 * 4. Cross-check the typed content modules. If a layer or decision id
 *    disappears from /src/content, surface a loud build warning — the
 *    CITATION_ID_MAP is assuming they still exist.
 * ------------------------------------------------------------------ */

function tryReadText(p) {
  try {
    return readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

const layersTs = tryReadText(resolve(ROOT, 'src/content/layers.ts'));
const decisionsTs = tryReadText(resolve(ROOT, 'src/content/decision-log.ts'));
const spansTs = tryReadText(resolve(ROOT, 'src/content/spans.ts'));

for (let n = 0; n <= 9; n++) {
  if (layersTs && !layersTs.includes(`id: 'layer-${n}'`)) {
    console.warn(`build-corpus: WARNING — layer-${n} anchor not found in src/content/layers.ts`);
  }
}
for (let n = 1; n <= 11; n++) {
  const padded = String(n).padStart(2, '0');
  if (decisionsTs && !decisionsTs.includes(`id: 'decision-${padded}'`)) {
    console.warn(`build-corpus: WARNING — decision-${padded} anchor not found in src/content/decision-log.ts`);
  }
}
for (const code of Object.keys(SPAN_MAP)) {
  if (spansTs && !spansTs.includes(code)) {
    console.warn(`build-corpus: WARNING — ${code} not found in src/content/spans.ts`);
  }
}

/* ------------------------------------------------------------------ *
 * 5. Emit server/corpus.ts.
 * ------------------------------------------------------------------ */

mkdirSync(dirname(OUT_PATH), { recursive: true });

function jsonQuote(s) {
  return JSON.stringify(s);
}

function emitMap(map) {
  const entries = Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  return entries
    .map(
      ([id, v]) =>
        `  ${jsonQuote(id)}: { kind: ${jsonQuote(v.kind)}, deeplink: ${jsonQuote(v.deeplink)} },`,
    )
    .join('\n');
}

const GENERATED_HEADER = `/**
 * corpus.ts — GENERATED FILE. DO NOT EDIT BY HAND.
 *
 * Produced by \`node scripts/build-corpus.mjs\` from:
 *   - docs/OIA-Model-v0.1-Digest.md
 *   - docs/OIA-Model-v0.1-Decision-Log-Digest.md
 *
 * Re-run the script (or \`npm run build:corpus\`) after editing either
 * source document. The build pipeline depends on this file existing.
 *
 * Contents:
 *   DIGEST_TEXT       concatenated Markdown of the two digests
 *   DIGEST_HASH       sha256(DIGEST_TEXT) truncated to 12 chars
 *   CITATION_ID_MAP   static id -> { kind, deeplink } for digest anchors
 *   validateCitation  runtime validator (also admits FEEDBACK #N, N > 3)
 *
 * Per ADR-0003 §3.2 and ADR-0004 §2.2 (feedback ids 1, 2, 3 are
 * grandfathered and excluded from citation validation).
 */`;

const out = `${GENERATED_HEADER}

/* eslint-disable */

export const DIGEST_TEXT: string = ${JSON.stringify(DIGEST_TEXT)};

export const DIGEST_HASH: string = ${jsonQuote(DIGEST_HASH)};

export type CitationKind =
  | 'digest'
  | 'decision'
  | 'span'
  | 'layer'
  | 'section'
  | 'feedback';

export interface CitationEntry {
  kind: CitationKind;
  deeplink: string;
}

export const CITATION_ID_MAP: Record<string, CitationEntry> = {
${emitMap(CITATION_ID_MAP)}
};

/**
 * FEEDBACK #N pattern. N must be a positive integer greater than 3
 * (ids 1, 2, 3 are grandfathered per ADR-0004 §2.2). Whitespace
 * between the # and the number is tolerated.
 */
const FEEDBACK_RE = /^FEEDBACK\\s*#\\s*(\\d+)$/i;

/**
 * Validate a citation id. Returns { ok: true, kind, deeplink } on a
 * match, { ok: false } otherwise.
 *
 * FEEDBACK #N resolves at runtime (no entry in CITATION_ID_MAP).
 */
export function validateCitation(
  id: string,
): { ok: true; kind: CitationKind; deeplink: string } | { ok: false } {
  if (typeof id !== 'string') return { ok: false };
  const trimmed = id.trim();
  if (trimmed.length === 0) return { ok: false };

  /* Static map — digest sections, layers, spans, decisions. */
  const hit = CITATION_ID_MAP[trimmed];
  if (hit) return { ok: true, kind: hit.kind, deeplink: hit.deeplink };

  /* FEEDBACK #N — only N > 3 (ADR-0004 grandfathering). */
  const m = FEEDBACK_RE.exec(trimmed);
  if (m) {
    const n = Number.parseInt(m[1], 10);
    if (Number.isFinite(n) && n > 3) {
      return { ok: true, kind: 'feedback', deeplink: \`#feedback-\${n}\` };
    }
    return { ok: false };
  }

  return { ok: false };
}
`;

writeFileSync(OUT_PATH, out, 'utf8');

console.log(
  `build-corpus: wrote ${OUT_PATH}  (digest=${DIGEST_TEXT.length} bytes, hash=${DIGEST_HASH}, map=${Object.keys(CITATION_ID_MAP).length} entries)`,
);
