import { useMemo, useState } from 'react';
import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { Prose } from '../components/Prose';
import { useLocalStorage, LS_KEYS } from '../hooks/useLocalStorage';
import {
  decisionLogMeta,
  decisionLogPurpose,
  decisions,
  decisionCategoryOrder,
  decisionCategoryRoman,
} from '../content/decision-log';
import type { Decision } from '../content/types';
import { ReviewerBrief } from '../components/micro/ReviewerBrief';

type Vote = 'reopen' | 'hold' | 'confirm';
type Votes = Partial<Record<string, Vote>>;
type Notes = Partial<Record<string, string>>;

const VOTE_META: Record<Vote, { short: string; label: string }> = {
  reopen: { short: 'RE', label: 'Reopen' },
  hold: { short: 'HD', label: 'Hold' },
  confirm: { short: 'OK', label: 'Confirm' },
};

export function DecisionLog() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [votes, setVotes] = useLocalStorage<Votes>(LS_KEYS.votes, {});
  const [notes, setNotes] = useLocalStorage<Notes>(LS_KEYS.voteNotes, {});

  const grouped = useMemo(() => {
    const byCat: Record<string, Decision[]> = {};
    for (const d of decisions) (byCat[d.category] ??= []).push(d);
    return byCat;
  }, []);

  const counts = useMemo(() => {
    const c = { reopen: 0, hold: 0, confirm: 0, unrated: 0 };
    for (const d of decisions) {
      const v = votes[d.number];
      if (!v) c.unrated += 1;
      else c[v] += 1;
    }
    return c;
  }, [votes]);

  function toggle(id: string) {
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function setVote(number: string, v: Vote) {
    setVotes((prev) => {
      const n = { ...prev };
      if (n[number] === v) delete n[number];
      else n[number] = v;
      return n;
    });
  }

  function setNote(number: string, text: string) {
    setNotes((prev) => {
      const n = { ...prev };
      if (!text.trim()) delete n[number];
      else n[number] = text;
      return n;
    });
  }

  function citeSelected() {
    if (!selected) return;
    const d = decisions.find((x) => x.id === selected);
    if (!d) return;
    const scaffold = `reopen decision ${d.number}, because…`;
    navigator.clipboard.writeText(scaffold).then(
      () => {
        setCopyStatus(`Copied "${scaffold}"`);
        window.setTimeout(() => setCopyStatus(null), 2400);
      },
      () => {
        setCopyStatus('Clipboard unavailable');
        window.setTimeout(() => setCopyStatus(null), 2400);
      },
    );
  }

  function exportReview() {
    const lines: string[] = ['# OIA Model v0.1 — Review Notes', ''];
    const groups: { vote: Vote; heading: string }[] = [
      { vote: 'reopen', heading: 'Decisions I would reopen' },
      { vote: 'hold', heading: 'Decisions I am holding for now' },
      { vote: 'confirm', heading: 'Decisions I confirm as drafted' },
    ];
    for (const g of groups) {
      const members = decisions.filter((d) => votes[d.number] === g.vote);
      if (!members.length) continue;
      lines.push(`## ${g.heading}`);
      for (const d of members) {
        const reason = notes[d.number]?.trim();
        if (g.vote === 'reopen') {
          lines.push(`- **Decision ${d.number} — ${d.title}**`);
          lines.push(`  - reopen decision ${d.number}, because ${reason || '…'}`);
        } else {
          lines.push(`- **Decision ${d.number} — ${d.title}**${reason ? ` — ${reason}` : ''}`);
        }
      }
      lines.push('');
    }
    const unrated = decisions.filter((d) => !votes[d.number]);
    if (unrated.length) {
      lines.push(`## Unrated (${unrated.length})`);
      for (const d of unrated) lines.push(`- Decision ${d.number} — ${d.title}`);
      lines.push('');
    }
    const md = lines.join('\n');
    navigator.clipboard.writeText(md).then(
      () => {
        setCopyStatus('Review copied to clipboard (Markdown)');
        window.setTimeout(() => setCopyStatus(null), 2800);
      },
      () => {
        setCopyStatus('Clipboard unavailable');
        window.setTimeout(() => setCopyStatus(null), 2800);
      },
    );
  }

  function clearAll() {
    if (window.confirm('Clear all votes and notes?')) {
      setVotes({});
      setNotes({});
    }
  }

  const totalRated = counts.reopen + counts.hold + counts.confirm;
  const pctRated = Math.round((totalRated / decisions.length) * 100);

  return (
    <TelemetryRegion id="decision-log" className="">
      <div className="main-inset py-8 flex flex-col gap-6">
        <CmdPanel
          eyebrow={decisionLogMeta.publisher}
          title={decisionLogMeta.title}
          trailing={<Chip tone="mono">{decisionLogMeta.tagline}</Chip>}
        >
          <h3 className="text-xl text-white font-normal mb-4 display-font">
            {decisionLogMeta.heading}
          </h3>
          <div className="border-t border-white/10 pt-4">
            <div className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase mb-2">
              {decisionLogPurpose.heading}
            </div>
            <Prose paragraphs={decisionLogPurpose.paragraphs} className="max-w-3xl" />
          </div>
          <ReviewerBrief />
        </CmdPanel>

        {/* Review Register — voting summary */}
        <CmdPanel
          eyebrow="Review Register"
          title="Your running review"
          trailing={
            <div className="flex items-center gap-2">
              <Chip tone="accent">{totalRated}/11 rated</Chip>
              <button
                type="button"
                onClick={clearAll}
                className="text-[0.6875rem] font-mono text-white/45 hover:text-[#ff8a5c] uppercase tracking-[0.18em] transition-colors px-2 py-1 border border-white/10 rounded"
              >
                Clear
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
            <div className="grid grid-cols-4 gap-2">
              <SummaryCell label="Reopen" value={counts.reopen} strong />
              <SummaryCell label="Hold" value={counts.hold} />
              <SummaryCell label="Confirm" value={counts.confirm} />
              <SummaryCell label="Unrated" value={counts.unrated} muted />
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <div className="h-1.5 w-full md:w-64 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#f05122] to-[#ff8a5c] transition-all duration-500"
                  style={{ width: `${pctRated}%` }}
                />
              </div>
              <button
                type="button"
                onClick={exportReview}
                disabled={totalRated === 0}
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#f05122] hover:bg-[#ff7a4a] text-white text-sm font-normal rounded transition-colors shadow-[0_0_20px_rgba(240,81,34,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Export review (Markdown)
              </button>
              {copyStatus && (
                <span className="text-[0.6875rem] font-mono text-[#ff8a5c] tracking-wide">
                  {copyStatus}
                </span>
              )}
            </div>
          </div>
        </CmdPanel>

        {/* System Log with per-row voting */}
        <CmdPanel
          eyebrow="System Log"
          title="Eleven decisions — addressable by number"
          trailing={
            <div className="hidden md:flex items-center gap-1 bg-black p-1 rounded-lg border border-white/10 shadow-inner">
              <span className="px-3 py-1 text-xs text-white bg-white/5 rounded border border-white/10">
                Global
              </span>
              <span className="px-3 py-1 text-xs text-white/40">Naming</span>
              <span className="px-3 py-1 text-xs text-white/40">Structure</span>
              <span className="px-3 py-1 text-xs text-white/40">Voice</span>
              <span className="px-3 py-1 text-xs text-white/40">Deferrals</span>
            </div>
          }
          bodyClassName="p-0"
        >
          <div className="hidden md:grid grid-cols-[auto_auto_1fr_auto_auto] gap-4 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <span className="text-[0.625rem] text-white/35 font-mono tracking-[0.18em] uppercase w-4">
              Chk
            </span>
            <span className="text-[0.625rem] text-white/35 font-mono tracking-[0.18em] uppercase">
              Dec
            </span>
            <span className="text-[0.625rem] text-white/35 font-mono tracking-[0.18em] uppercase">
              Title
            </span>
            <span className="text-[0.625rem] text-white/35 font-mono tracking-[0.18em] uppercase text-right">
              Your Vote
            </span>
            <span className="text-[0.625rem] text-white/35 font-mono tracking-[0.18em] uppercase">
              Category
            </span>
          </div>

          {decisionCategoryOrder.map((cat) => (
            <div key={cat}>
              <div className="px-4 py-2 bg-black border-b border-white/5 text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase">
                {decisionCategoryRoman[cat]}
              </div>
              {(grouped[cat] ?? []).map((d) => (
                <DecisionRow
                  key={d.id}
                  d={d}
                  expanded={expanded.has(d.id)}
                  selected={selected === d.id}
                  vote={votes[d.number]}
                  note={notes[d.number] ?? ''}
                  onToggle={() => toggle(d.id)}
                  onSelect={() => setSelected(selected === d.id ? null : d.id)}
                  onVote={(v) => setVote(d.number, v)}
                  onNote={(t) => setNote(d.number, t)}
                />
              ))}
            </div>
          ))}

          {selected && (
            <div
              role="toolbar"
              aria-label="Decision actions"
              className="sticky bottom-4 mx-auto mt-4 mb-4 w-fit tactile-glass px-4 py-2 rounded-full border border-white/15 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center gap-4 z-20"
            >
              <span className="text-xs text-[#ff8a5c] font-normal">
                Decision {decisions.find((d) => d.id === selected)?.number} selected
              </span>
              <div className="w-px h-4 bg-white/15" aria-hidden="true" />
              <button
                type="button"
                onClick={citeSelected}
                className="flex items-center gap-1.5 text-xs text-white/85 hover:text-white transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Cite decision by number
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-xs text-white/40 hover:text-white/80 transition-colors"
              >
                clear
              </button>
            </div>
          )}
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}

function DecisionRow({
  d,
  expanded,
  selected,
  vote,
  note,
  onToggle,
  onSelect,
  onVote,
  onNote,
}: {
  d: Decision;
  expanded: boolean;
  selected: boolean;
  vote?: Vote;
  note: string;
  onToggle: () => void;
  onSelect: () => void;
  onVote: (v: Vote) => void;
  onNote: (t: string) => void;
}) {
  return (
    <article
      id={d.id}
      className={`border-b border-white/5 transition-colors ${
        selected ? 'bg-[#f05122]/[0.06]' : 'hover:bg-white/[0.03]'
      }`}
    >
      <div className="grid grid-cols-[auto_auto_1fr] md:grid-cols-[auto_auto_1fr_auto_auto] gap-3 md:gap-4 items-center px-4 py-3">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          aria-label={`Select decision ${d.number}`}
          className={`w-4 h-4 rounded border flex items-center justify-center shadow-inner ${
            selected
              ? 'bg-[#f05122] border-[#f05122] shadow-[0_0_8px_rgba(240,81,34,0.5)]'
              : 'bg-black border-white/15 hover:border-white/40'
          }`}
        >
          {selected && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </button>
        <span className="text-xs text-white/65 font-mono tracking-wider">DEC-{d.number}</span>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="text-sm text-white/90 text-left hover:text-white"
        >
          {d.title}
        </button>

        {/* Vote pills — on mobile, wrap to second row spanning all three columns */}
        <div className="col-span-3 md:col-auto flex items-center justify-between md:justify-end gap-2 pl-7 md:pl-0">
          <span className="md:hidden text-[0.625rem] text-white/35 font-mono tracking-[0.18em] uppercase">
            {d.category}
          </span>
          <div className="flex gap-1 flex-shrink-0 justify-end">
            {(['reopen', 'hold', 'confirm'] as Vote[]).map((v) => {
              const active = vote === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVote(v);
                  }}
                  aria-pressed={active}
                  title={VOTE_META[v].label}
                  className={`min-w-[2.25rem] px-1.5 py-1 rounded border text-[0.625rem] font-mono tracking-[0.14em] uppercase transition-all ${
                    active
                      ? v === 'reopen'
                        ? 'bg-[#f05122] border-[#f05122] text-white shadow-[0_0_8px_rgba(240,81,34,0.45)]'
                        : v === 'hold'
                          ? 'bg-white/10 border-white/40 text-white'
                          : 'bg-white/5 border-white/30 text-[#ff8a5c]'
                      : 'border-white/10 text-white/35 hover:border-white/40 hover:text-white/80'
                  }`}
                >
                  {VOTE_META[v].short}
                </button>
              );
            })}
          </div>
        </div>

        <span className="hidden md:block text-[0.6875rem] text-white/45 font-mono tracking-[0.14em] uppercase">
          {d.category}
        </span>
      </div>
      {expanded && (
        <div className="mx-4 mb-4 px-4 py-4 bg-black border border-white/10 rounded-lg">
          <Prose paragraphs={[d.rationale]} />
          {d.revisitTrigger && (
            <div className="mt-4 px-3 py-2 rounded border border-[#f05122]/40 bg-[#f05122]/10">
              <div className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase mb-1">
                Revisit Trigger
              </div>
              <p className="text-sm text-[#ffb08c] leading-relaxed italic">{d.revisitTrigger}</p>
            </div>
          )}
          {d.subItems && d.subItems.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {d.subItems.map((si) => (
                <div
                  key={si.title}
                  className="p-3 bg-white/[0.02] border border-white/10 rounded"
                >
                  <div className="text-sm text-white font-normal mb-1">{si.title}</div>
                  <p className="text-[0.8125rem] text-white/60 leading-relaxed">{si.body}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <label
              htmlFor={`note-${d.number}`}
              className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase block mb-2"
            >
              Your reason (optional · saved locally)
            </label>
            <textarea
              id={`note-${d.number}`}
              value={note}
              onChange={(e) => onNote(e.target.value)}
              placeholder={`reopen decision ${d.number}, because…`}
              rows={2}
              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/25 font-mono focus:outline-none focus:border-[#f05122]/60 resize-y"
            />
          </div>
        </div>
      )}
    </article>
  );
}

function SummaryCell({ label, value, strong, muted }: { label: string; value: number; strong?: boolean; muted?: boolean }) {
  const base = 'flex flex-col px-3 py-2 rounded border gap-0.5';
  const tone = strong
    ? 'border-[#f05122]/50 bg-[#f05122]/10'
    : muted
      ? 'border-white/10 bg-white/[0.01] opacity-80'
      : 'border-white/10 bg-white/[0.02]';
  const valueColor = strong ? 'text-[#ff8a5c]' : muted ? 'text-white/50' : 'text-white';
  return (
    <div className={`${base} ${tone}`}>
      <span className="text-[0.625rem] font-mono text-white/50 tracking-[0.18em] uppercase">
        {label}
      </span>
      <span className={`text-2xl font-normal display-font ${valueColor}`}>{value}</span>
    </div>
  );
}
