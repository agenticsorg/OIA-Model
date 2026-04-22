import { useEffect, useRef, useState } from 'react';
import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  snapshot,
  nextSteps,
  generateReviewPackage,
  exportJsonBundle,
  importJsonBundle,
  WORKSPACE_KEYS,
  type WorkspaceSnapshot,
} from '../lib/workspace';

/**
 * Top-of-page practical anchor. Shows live KPIs across every tool,
 * derives "priority next steps" from the user's current data, and
 * exports a single Markdown review package + a JSON bundle for
 * team sharing.
 */
export function Workspace() {
  const [name, setName] = useLocalStorage<string>(WORKSPACE_KEYS.name, '');
  const [context, setContext] = useLocalStorage<string>(WORKSPACE_KEYS.context, '');
  const [snap, setSnap] = useState<WorkspaceSnapshot | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Re-snapshot on mount and whenever the window regains focus — we
     don't want to watch every storage mutation individually. */
  useEffect(() => {
    const refresh = () => setSnap(snapshot());
    refresh();
    const onVis = () => { if (!document.hidden) refresh(); };
    const onStorage = (e: StorageEvent) => { if (e.key?.startsWith('oia:')) refresh(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('storage', onStorage);
    const id = window.setInterval(refresh, 2500);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(id);
    };
  }, []);

  if (!snap) return null;

  const steps = nextSteps(snap);

  function copyPackage() {
    const md = generateReviewPackage({ ...snap!, project: { name, context } });
    navigator.clipboard.writeText(md).then(
      () => {
        setCopyStatus('Review package copied to clipboard (Markdown)');
        window.setTimeout(() => setCopyStatus(null), 2800);
      },
      () => setCopyStatus('Clipboard unavailable'),
    );
  }

  function downloadPackage() {
    const md = generateReviewPackage({ ...snap!, project: { name, context } });
    download(md, 'oia-review-package.md', 'text/markdown');
  }

  function exportJson() {
    const json = exportJsonBundle();
    download(json, 'oia-workspace.json', 'application/json');
  }

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const result = importJsonBundle(String(r.result ?? ''));
      if (result.ok) {
        setCopyStatus(`Imported ${result.keys} keys — reloading to apply…`);
        window.setTimeout(() => window.location.reload(), 800);
      } else {
        setCopyStatus('Import failed: ' + (result.error ?? 'unknown'));
      }
    };
    r.readAsText(file);
  }

  return (
    <TelemetryRegion id="workspace">
      <div className="main-inset py-8">
        <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[0.6875rem] font-mono text-white/40 tracking-[0.18em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f05122] pulse-accent" aria-hidden="true" />
              Your OIA Workspace · Single Deliverable
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-normal text-white display-font">
              Workspace
            </h2>
            <p className="mt-2 text-sm text-white/60 max-w-2xl leading-relaxed">
              One place to see everything you've done across the tools — assessment, roadmap,
              decision votes, operator-tool drafts, feedback. When you're ready, export the
              whole thing as a single Markdown review package or a JSON bundle your team can
              import.
            </p>
          </div>
          <Chip tone="accent" dot pulseDot>
            Live · auto-saved
          </Chip>
        </header>

        {/* Project identity */}
        <CmdPanel eyebrow="Project" title="Name this review package">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase">
                Project / org
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project Atlas / Our organisation"
                className="bg-black border border-white/10 rounded px-2 py-1.5 text-sm text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-[#f05122]/60"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase">
                Context (one line)
              </span>
              <input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. enterprise review · Q2 architecture board · sovereign deployment"
                className="bg-black border border-white/10 rounded px-2 py-1.5 text-sm text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-[#f05122]/60"
              />
            </label>
          </div>
        </CmdPanel>

        {/* KPIs */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiCard label="Assessment" value={`${snap.assessmentPct}%`} sub={`${snap.assessmentRated}/10 rated`} href="#assessment" />
          <KpiCard label="Roadmap" value={`${snap.implementationPct}%`} sub={`${snap.implementationDone}/${snap.implementationTotal} tasks`} href="#implementation" />
          <KpiCard label="Decisions" value={`${snap.votesRated}/11`} sub={`${snap.votesReopen} to reopen`} href="#decision-log" />
          <KpiCard label="Operator tools" value={`${snap.microToolsUsed}`} sub="tools used" href="#on-reading" />
          <KpiCard label="Feedback draft" value={`${snap.feedbackFields}`} sub="fields filled" href="#feedback" />
        </div>

        {/* Next steps + Export */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <CmdPanel eyebrow="Priority" title="Recommended next steps">
            {steps.length === 0 ? (
              <p className="text-sm text-white/70">
                Workspace fully filled in — you're ready to export a complete review package.
              </p>
            ) : (
              <ol className="flex flex-col gap-3">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#ff8a5c] font-mono text-[0.6875rem] pt-1 tracking-[0.18em] w-6 flex-shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <span className="text-sm text-white/85 leading-relaxed">{s.step}</span>
                      <a
                        href={s.cta.href}
                        className="text-xs font-mono text-[#ff8a5c] hover:text-white self-start"
                      >
                        {s.cta.label} →
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CmdPanel>

          <CmdPanel eyebrow="Export" title="Deliverables">
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={copyPackage}
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#f05122] hover:bg-[#ff7a4a] text-white text-sm rounded transition-colors shadow-[0_0_20px_rgba(240,81,34,0.35)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy review package (Markdown)
              </button>
              <button
                type="button"
                onClick={downloadPackage}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-white/85 text-sm rounded transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download as .md
              </button>
              <div className="h-px bg-white/10 my-1" />
              <div className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase">
                Share with your team
              </div>
              <button
                type="button"
                onClick={exportJson}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-white/85 text-sm rounded transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export workspace JSON
              </button>
              <label className="inline-flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-white/85 text-sm rounded transition-colors cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Import workspace JSON
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={onImport}
                  className="sr-only"
                />
              </label>
              {copyStatus && (
                <span className="text-[0.6875rem] font-mono text-[#ff8a5c] tracking-wide">
                  {copyStatus}
                </span>
              )}
            </div>
          </CmdPanel>
        </div>
      </div>
    </TelemetryRegion>
  );
}

function KpiCard({ label, value, sub, href }: { label: string; value: string; sub: string; href: string }) {
  return (
    <a
      href={href}
      className="block p-4 rounded-xl border border-white/10 bg-black hover:border-[#f05122]/50 hover:bg-[#f05122]/[0.04] transition-colors shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]"
    >
      <div className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase">
        {label}
      </div>
      <div className="mt-2 text-3xl font-normal text-white display-font leading-none">{value}</div>
      <div className="mt-2 text-[0.6875rem] font-mono text-[#ff8a5c] tracking-wide">{sub}</div>
    </a>
  );
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
