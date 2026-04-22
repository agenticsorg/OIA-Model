/**
 * Workspace aggregation — reads every `oia:*` key in localStorage
 * and produces (a) live KPIs for the Workspace dashboard, (b) a
 * single Markdown review package, and (c) a JSON bundle for team
 * sharing.
 */

import { layers } from '../content/layers';
import { spans } from '../content/spans';
import { decisions } from '../content/decision-log';

export interface WorkspaceSnapshot {
  // aggregated KPIs
  assessmentPct: number;       // % of in-scope layers rated Coherent
  assessmentRated: number;     // layers the user has marked
  implementationPct: number;   // % of all impl tasks done
  implementationDone: number;
  implementationTotal: number;
  votesRated: number;
  votesReopen: number;
  feedbackFields: number;      // count of non-empty feedback fields
  microToolsUsed: number;      // count of operator-tool drafts with data

  // raw data (for export)
  project: { name: string; context: string };
  all: Record<string, unknown>;
}

const MICRO_TOOL_KEYS = [
  'oia:op:reading-role',
  'oia:op:reading-depth',
  'oia:op:era-from',
  'oia:op:era-to',
  'oia:op:era-org',
  'oia:op:scope-props',
  'oia:op:scope-name',
  'oia:op:scope-context',
  'oia:op:frameworks',
  'oia:op:urgency',
  'oia:op:intensity',
  'oia:op:scope-layers',
  'oia:op:span-posture',
  'oia:op:composition',
  'oia:op:scale',
  'oia:op:starting-point',
  'oia:op:deferral-priority',
  'oia:op:deferral-notes',
  'oia:op:deferral-submitter',
  'oia:op:stance',
];

const WORKSPACE_NAME_KEY = 'oia:workspace:project-name';
const WORKSPACE_CONTEXT_KEY = 'oia:workspace:context';

function read<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export function snapshot(): WorkspaceSnapshot {
  // Assessment
  type Status = 'coherent' | 'gap' | 'notyet' | 'na';
  const assessment = read<Partial<Record<string, Status>>>('oia:assessment:v1', {});
  let coherent = 0, gap = 0, notyet = 0, na = 0, rated = 0;
  for (const l of layers) {
    const s = assessment[l.id];
    if (!s) continue;
    rated += 1;
    if (s === 'coherent') coherent += 1;
    if (s === 'gap') gap += 1;
    if (s === 'notyet') notyet += 1;
    if (s === 'na') na += 1;
  }
  const inScope = 10 - na;
  const assessmentPct = inScope > 0 ? Math.round((coherent / inScope) * 100) : 0;

  // Implementation
  type ImplState = Partial<Record<string, Record<string, boolean>>>;
  const impl = read<ImplState>('oia:implementation:v1', {});
  let implDone = 0, implTotal = 0;
  for (const l of layers) {
    const taskCount = l.concerns.length + l.openQuestions.length;
    implTotal += taskCount;
    const row = impl[l.id] ?? {};
    implDone += Object.values(row).filter(Boolean).length;
  }
  const implementationPct = implTotal > 0 ? Math.round((implDone / implTotal) * 100) : 0;

  // Decisions
  type Vote = 'reopen' | 'hold' | 'confirm';
  const votes = read<Partial<Record<string, Vote>>>('oia:decision-votes:v1', {});
  const votesRated = decisions.filter((d) => votes[d.number]).length;
  const votesReopen = decisions.filter((d) => votes[d.number] === 'reopen').length;

  // Feedback draft
  const feedback = read<Record<string, unknown>>('oia:feedback:draft:v2', {});
  let feedbackFields = 0;
  for (const [k, v] of Object.entries(feedback)) {
    if (k === 'share_name') continue;
    if (Array.isArray(v)) { if (v.length) feedbackFields += 1; continue; }
    if (typeof v === 'string' && v.trim()) feedbackFields += 1;
  }

  // Micro-tool usage
  let microToolsUsed = 0;
  for (const k of MICRO_TOOL_KEYS) {
    const v = read<unknown>(k, null);
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === 'object' && v !== null && Object.keys(v as object).length === 0) continue;
    microToolsUsed += 1;
  }

  // All keys
  const all: Record<string, unknown> = {};
  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith('oia:')) continue;
      all[k] = read<unknown>(k, null);
    }
  }

  return {
    assessmentPct,
    assessmentRated: rated,
    implementationPct,
    implementationDone: implDone,
    implementationTotal: implTotal,
    votesRated,
    votesReopen,
    feedbackFields,
    microToolsUsed,
    project: {
      name: read<string>(WORKSPACE_NAME_KEY, ''),
      context: read<string>(WORKSPACE_CONTEXT_KEY, ''),
    },
    all,
  };
}

/** Compute priority next-steps list. */
export function nextSteps(s: WorkspaceSnapshot): { step: string; cta: { href: string; label: string } }[] {
  const out: { step: string; cta: { href: string; label: string } }[] = [];
  if (s.assessmentRated < 10) {
    out.push({
      step: `Rate ${10 - s.assessmentRated} remaining layer${10 - s.assessmentRated === 1 ? '' : 's'} in the Architecture Assessment.`,
      cta: { href: '#assessment', label: 'Open Assessment' },
    });
  }
  // weakest span
  type Status = 'coherent' | 'gap' | 'notyet' | 'na';
  const assessment = read<Partial<Record<string, Status>>>('oia:assessment:v1', {});
  let weakest: { span: string; pct: number } | null = null;
  for (const sp of spans) {
    const rel = sp.layerRange.map((n) => {
      const l = layers.find((x) => x.number === n);
      return l ? assessment[l.id] : undefined;
    });
    const effective = rel.filter((x) => x && x !== 'na').length;
    const coh = rel.filter((x) => x === 'coherent').length;
    if (effective === 0) continue;
    const pct = Math.round((coh / effective) * 100);
    if (!weakest || pct < weakest.pct) weakest = { span: sp.name, pct };
  }
  if (weakest && weakest.pct < 100) {
    out.push({
      step: `Weakest span: ${weakest.span} (${weakest.pct}% coherent). Run the span gap memo to hand the gap list to security / audit.`,
      cta: { href: '#cross-layer-spans', label: 'Open §5 Spans' },
    });
  }
  if (s.implementationPct < 100) {
    const remaining = s.implementationTotal - s.implementationDone;
    out.push({
      step: `${remaining} implementation task${remaining === 1 ? '' : 's'} remaining. The Roadmap has a per-layer checklist.`,
      cta: { href: '#implementation', label: 'Open Roadmap' },
    });
  }
  if (s.votesRated < 11) {
    out.push({
      step: `Decision review: ${11 - s.votesRated} of 11 decisions still unrated — vote Reopen / Hold / Confirm on each.`,
      cta: { href: '#decision-log', label: 'Open Decision Log' },
    });
  }
  if (s.feedbackFields === 0) {
    out.push({
      step: 'You have not drafted feedback yet. The Feedback channel lets you submit to the Agentics Foundation.',
      cta: { href: '#feedback', label: 'Open Feedback' },
    });
  }
  return out;
}

/* ---------------- Markdown master export ---------------- */

export function generateReviewPackage(s: WorkspaceSnapshot): string {
  const lines: string[] = [];
  const title = s.project.name.trim() || 'Our organisation';
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  lines.push(`# OIA Model v0.1 — Review Package`);
  lines.push(`**Prepared by:** ${title}`);
  if (s.project.context.trim()) lines.push(`**Context:** ${s.project.context.trim()}`);
  lines.push(`**Generated:** ${dateStr}`);
  lines.push('');
  lines.push('This document aggregates every output of our OIA Reader tools session. Paste or import it into a wiki, ticket, or reviewer submission.');
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## 1 · Executive summary');
  lines.push(`- Architecture Assessment · ${s.assessmentPct}% of in-scope layers rated coherent (${s.assessmentRated}/10 layers rated)`);
  lines.push(`- Implementation Roadmap · ${s.implementationPct}% complete (${s.implementationDone} / ${s.implementationTotal} tasks)`);
  lines.push(`- Decision review · ${s.votesRated}/11 decisions rated (${s.votesReopen} to reopen)`);
  lines.push(`- Feedback draft · ${s.feedbackFields} fields filled`);
  lines.push(`- Operator tools used · ${s.microToolsUsed} of ${MICRO_TOOL_KEYS.length}`);
  lines.push('');

  // Assessment
  type Status = 'coherent' | 'gap' | 'notyet' | 'na';
  const assessment = read<Partial<Record<string, Status>>>('oia:assessment:v1', {});
  lines.push('## 2 · Architecture Assessment');
  if (Object.keys(assessment).length === 0) {
    lines.push('_Not yet rated._');
  } else {
    lines.push('| Layer | Status |');
    lines.push('|---|---|');
    for (const l of layers) {
      const st = assessment[l.id];
      lines.push(`| Layer ${l.number} — ${l.name} | ${statusLabel(st)} |`);
    }
  }
  lines.push('');

  // Implementation
  type ImplState = Partial<Record<string, Record<string, boolean>>>;
  const impl = read<ImplState>('oia:implementation:v1', {});
  lines.push('## 3 · Implementation Roadmap');
  if (Object.keys(impl).length === 0) {
    lines.push('_No checklist progress yet._');
  } else {
    for (const l of layers) {
      const row = impl[l.id] ?? {};
      const done = Object.values(row).filter(Boolean).length;
      const total = l.concerns.length + l.openQuestions.length;
      if (done === 0) continue;
      lines.push(`### Layer ${l.number} — ${l.name}  (${done}/${total})`);
      for (let i = 0; i < l.concerns.length; i++) {
        const id = `c-${i}`;
        const checked = row[id] ? '[x]' : '[ ]';
        lines.push(`- ${checked} Decide approach for: ${l.concerns[i]}`);
      }
      for (let i = 0; i < l.openQuestions.length; i++) {
        const id = `q-${i}`;
        const checked = row[id] ? '[x]' : '[ ]';
        lines.push(`- ${checked} Track resolution of: ${l.openQuestions[i]}`);
      }
      lines.push('');
    }
  }

  // Decisions
  const votes = read<Partial<Record<string, 'reopen' | 'hold' | 'confirm'>>>('oia:decision-votes:v1', {});
  const voteNotes = read<Partial<Record<string, string>>>('oia:decision-notes:v1', {});
  lines.push('## 4 · Decision review register');
  const groups: { v: 'reopen' | 'hold' | 'confirm'; h: string }[] = [
    { v: 'reopen', h: 'Decisions to reopen' },
    { v: 'hold', h: 'Decisions held' },
    { v: 'confirm', h: 'Decisions confirmed' },
  ];
  let anyVote = false;
  for (const g of groups) {
    const members = decisions.filter((d) => votes[d.number] === g.v);
    if (!members.length) continue;
    anyVote = true;
    lines.push(`### ${g.h}`);
    for (const d of members) {
      const note = voteNotes[d.number]?.trim();
      if (g.v === 'reopen') {
        lines.push(`- **Decision ${d.number} — ${d.title}**`);
        lines.push(`  - reopen decision ${d.number}, because ${note || '…'}`);
      } else {
        lines.push(`- **Decision ${d.number} — ${d.title}**${note ? ` — ${note}` : ''}`);
      }
    }
    lines.push('');
  }
  if (!anyVote) lines.push('_No decisions voted on yet._');
  lines.push('');

  // Micro-tool artifacts
  lines.push('## 5 · Operator-tool inputs');
  const all = s.all;
  const hasAny = MICRO_TOOL_KEYS.some((k) => all[k] !== undefined && all[k] !== null && all[k] !== '');
  if (!hasAny) {
    lines.push('_No operator tools used yet._');
  } else {
    const put = (label: string, val: unknown) => {
      if (val === undefined || val === null) return;
      if (typeof val === 'string' && val.trim() === '') return;
      if (Array.isArray(val) && val.length === 0) return;
      if (typeof val === 'object' && val !== null && Object.keys(val as object).length === 0) return;
      lines.push(`- **${label}** — ${stringify(val)}`);
    };
    put('Reading plan — role', all['oia:op:reading-role']);
    put('Reading plan — depth', all['oia:op:reading-depth']);
    put('Era transition — from', all['oia:op:era-from']);
    put('Era transition — to', all['oia:op:era-to']);
    put('Era transition — org', all['oia:op:era-org']);
    put('System scope — properties', all['oia:op:scope-props']);
    put('System scope — name', all['oia:op:scope-name']);
    put('System scope — context', all['oia:op:scope-context']);
    put('Governance overlay — frameworks in use', all['oia:op:frameworks']);
    put('Urgency brief — severities', all['oia:op:urgency']);
    put('Layer priority — property intensities', all['oia:op:intensity']);
    put('Layer scope — owned layers', all['oia:op:scope-layers']);
    put('Span posture', all['oia:op:span-posture']);
    put('Stack composition', all['oia:op:composition']);
    put('Adoption scale', all['oia:op:scale']);
    put('Adoption starting point', all['oia:op:starting-point']);
    put('Deferral priorities', all['oia:op:deferral-priority']);
    put('Deferral notes', all['oia:op:deferral-notes']);
    put('Deferral submitter', all['oia:op:deferral-submitter']);
    put('Reviewer stance', all['oia:op:stance']);
  }
  lines.push('');

  // Feedback draft
  lines.push('## 6 · Feedback draft');
  const fb = read<Record<string, unknown>>('oia:feedback:draft:v2', {});
  if (s.feedbackFields === 0) {
    lines.push('_No draft yet._');
  } else {
    const fbq: { key: string; label: string }[] = [
      { key: 'hyperscaler_monopolies', label: 'Hyperscaler monopolies (L5–L8 black boxes)' },
      { key: 'layer8_certification', label: 'L8 certification governance' },
      { key: 'legacy_vendor_mapping', label: 'Legacy vendor mapping' },
      { key: 'foundation_funding', label: 'Foundation funding model' },
      { key: 'regulatory_alignment', label: 'Regulatory alignment' },
      { key: 'shape_response', label: 'Is the shape correctly drawn?' },
      { key: 'reopen_decisions', label: 'Decisions flagged' },
      { key: 'reopen_reasons', label: 'Reopen reasons' },
      { key: 'open_questions_contrib', label: 'Open Questions contribution' },
      { key: 'additional_deferrals', label: 'Additional deferrals' },
      { key: 'prematurely_deferred', label: 'Prematurely deferred' },
      { key: 'missing_concerns', label: 'Missing concerns' },
      { key: 'missing_tech', label: 'Missing reference tech' },
      { key: 'missing_spans', label: 'Missing spans' },
      { key: 'vertical_extension', label: 'Vertical extension experience' },
      { key: 'improvements', label: 'Improvements for next draft' },
      { key: 'general_feedback', label: 'Anything else' },
    ];
    for (const q of fbq) {
      const v = fb[q.key];
      if (v === undefined || v === null) continue;
      if (typeof v === 'string' && v.trim()) {
        lines.push(`**${q.label}:** ${v.trim()}`);
        lines.push('');
      } else if (Array.isArray(v) && v.length) {
        lines.push(`**${q.label}:** ${v.join(', ')}`);
        lines.push('');
      }
    }
  }
  lines.push('');

  // Next steps
  lines.push('## 7 · Recommended next steps');
  const steps = nextSteps(s);
  if (steps.length === 0) lines.push('_Workspace fully filled in — you are ready to submit._');
  else for (const step of steps) lines.push(`- ${step.step}`);
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('_Generated by the OIA Model Reader · Agentics Foundation · 2026._');
  return lines.join('\n');
}

function statusLabel(s?: 'coherent' | 'gap' | 'notyet' | 'na') {
  switch (s) {
    case 'coherent': return 'Coherent ✓';
    case 'gap':      return 'Gap !';
    case 'notyet':   return 'Not yet ○';
    case 'na':       return 'N/A –';
    default:         return 'Unrated';
  }
}

function stringify(v: unknown): string {
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object' && v !== null) return JSON.stringify(v);
  return String(v);
}

/* ---------------- JSON bundle (team sharing) ---------------- */

export function exportJsonBundle(): string {
  const all: Record<string, unknown> = {};
  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith('oia:')) continue;
      const raw = localStorage.getItem(k);
      if (raw === null) continue;
      try { all[k] = JSON.parse(raw); } catch { all[k] = raw; }
    }
  }
  const bundle = {
    _format: 'oia-workspace',
    _version: 1,
    _generated: new Date().toISOString(),
    data: all,
  };
  return JSON.stringify(bundle, null, 2);
}

export interface ImportResult {
  ok: boolean;
  keys?: number;
  error?: string;
}

export function importJsonBundle(text: string): ImportResult {
  let bundle: Record<string, unknown>;
  try {
    bundle = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: 'Invalid JSON: ' + (e as Error).message };
  }
  if (typeof bundle !== 'object' || bundle === null) {
    return { ok: false, error: 'Bundle must be a JSON object.' };
  }
  if (bundle._format !== 'oia-workspace') {
    return { ok: false, error: 'Not an OIA workspace bundle.' };
  }
  const data = bundle.data as Record<string, unknown> | undefined;
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'Bundle has no data field.' };
  }
  let n = 0;
  for (const [k, v] of Object.entries(data)) {
    if (!k.startsWith('oia:')) continue;
    localStorage.setItem(k, JSON.stringify(v));
    n += 1;
  }
  return { ok: true, keys: n };
}

export const WORKSPACE_KEYS = {
  name: WORKSPACE_NAME_KEY,
  context: WORKSPACE_CONTEXT_KEY,
};
