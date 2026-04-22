import React from 'react';

/**
 * Consistent inline panel for per-subsection operator tools. Each
 * widget inside a micro-tool takes a user input and produces an
 * actionable output (list, score, or export), so the digest prose
 * turns immediately into something you can carry into ops.
 */
export function MicroTool({
  title,
  subtitle,
  footer,
  children,
  id,
}: {
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className="mt-6 p-5 rounded-xl border border-[#f05122]/30 bg-gradient-to-br from-[#f05122]/[0.06] via-[#f05122]/[0.02] to-transparent relative overflow-hidden"
    >
      <div
        className="absolute -top-16 -right-16 w-40 h-40 bg-[#f05122]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="chip chip-strong">Operator Tool</span>
          <span className="text-sm text-white">{title}</span>
        </div>
        {subtitle && (
          <p className="text-[0.8125rem] text-white/55 leading-relaxed mb-4 max-w-3xl">
            {subtitle}
          </p>
        )}
        <div>{children}</div>
        {footer && (
          <div className="mt-4 pt-3 border-t border-white/10 text-[0.6875rem] font-mono text-white/55 tracking-wide">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Compact button used by radio / checkbox group tools. */
export function TogglePill({
  active,
  onClick,
  children,
  strong,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  strong?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={`px-2.5 py-1 rounded border text-xs font-normal transition-colors ${
        active
          ? strong
            ? 'bg-[#f05122] border-[#f05122] text-white shadow-[0_0_10px_rgba(240,81,34,0.4)]'
            : 'bg-[#f05122]/15 border-[#f05122]/60 text-[#ff8a5c]'
          : 'bg-black border-white/10 text-white/55 hover:text-white hover:border-white/30'
      }`}
    >
      {children}
    </button>
  );
}

/** Copy-to-clipboard helper button used by exporters. */
export function CopyButton({
  label,
  getText,
  disabled,
}: {
  label: string;
  getText: () => string;
  disabled?: boolean;
}) {
  const [status, setStatus] = React.useState<string | null>(null);
  function onClick() {
    const text = getText();
    navigator.clipboard.writeText(text).then(
      () => {
        setStatus('Copied to clipboard');
        window.setTimeout(() => setStatus(null), 2200);
      },
      () => {
        setStatus('Clipboard unavailable');
        window.setTimeout(() => setStatus(null), 2200);
      },
    );
  }
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f05122] hover:bg-[#ff7a4a] text-white text-xs rounded transition-colors shadow-[0_0_14px_rgba(240,81,34,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        {label}
      </button>
      {status && (
        <span className="text-[0.6875rem] font-mono text-[#ff8a5c] tracking-wide">
          {status}
        </span>
      )}
    </div>
  );
}

/**
 * Live-updating preview of a generated Markdown artifact. Each
 * micro-tool derives this text from its inputs and hands it to
 * the user ready to paste into a doc, PR, ticket, or email —
 * that's how the digest ties back into operations.
 */
export function ArtifactPreview({
  text,
  label = 'Your artifact (Markdown)',
  copyLabel = 'Copy to clipboard',
  rows = 7,
  filename,
}: {
  text: string;
  label?: string;
  copyLabel?: string;
  rows?: number;
  filename?: string;
}) {
  const empty = !text.trim();
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase">
          {label}
          {filename && <span className="text-white/40 ml-2">· {filename}</span>}
        </span>
        <CopyButton label={copyLabel} getText={() => text} disabled={empty} />
      </div>
      <textarea
        value={empty ? '(fill in the inputs above — your artifact will generate here)' : text}
        readOnly
        rows={rows}
        onFocus={(e) => !empty && e.currentTarget.select()}
        className={`w-full bg-black border rounded px-3 py-2 text-xs font-mono leading-relaxed resize-y focus:outline-none ${
          empty
            ? 'border-white/10 text-white/35'
            : 'border-[#f05122]/40 text-white/90 focus:border-[#f05122]/70'
        }`}
        aria-label={label}
      />
    </div>
  );
}
