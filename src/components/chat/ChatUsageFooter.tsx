/**
 * Daily-usage indicator at the bottom of the chat (ADR-0002 §6).
 *
 * Polls GET /api/chat/usage on mount and every 30 s. Renders a single mono
 * line like `daily usage: 42%`. If the endpoint is unreachable (server
 * down, kill switch on) the footer stays quiet rather than shouting.
 */
import { useEffect, useRef, useState } from 'react';
import { apiUrl } from '../../lib/api-base';

interface Usage {
  daily_used?: number;
  daily_cap?: number;
  percent?: number;
}

const POLL_MS = 30_000;

export function ChatUsageFooter() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [error, setError] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let timer: number | null = null;

    async function poll() {
      try {
        const r = await fetch(apiUrl('/api/chat/usage'));
        if (!r.ok) throw new Error(String(r.status));
        const data = (await r.json()) as Usage;
        if (!mountedRef.current) return;
        setUsage(data);
        setError(false);
      } catch {
        if (!mountedRef.current) return;
        setError(true);
      } finally {
        if (mountedRef.current) {
          timer = window.setTimeout(poll, POLL_MS);
        }
      }
    }

    poll();
    return () => {
      mountedRef.current = false;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, []);

  if (error && !usage) {
    return (
      <div className="flex items-center gap-2 text-[0.6875rem] font-mono text-white/30 tracking-[0.14em]">
        <span className="w-1.5 h-1.5 rounded-full bg-white/20" aria-hidden="true" />
        daily usage: —
      </div>
    );
  }
  if (!usage) {
    return (
      <div className="flex items-center gap-2 text-[0.6875rem] font-mono text-white/30 tracking-[0.14em]">
        <span className="w-1.5 h-1.5 rounded-full bg-white/20" aria-hidden="true" />
        daily usage: loading…
      </div>
    );
  }

  const pct = typeof usage.percent === 'number'
    ? Math.max(0, Math.min(100, Math.round(usage.percent)))
    : computePct(usage);

  const high = pct >= 80;
  const mid = pct >= 50;
  const color = high ? 'bg-[#f05122]' : mid ? 'bg-[#ff8a5c]' : 'bg-white/50';
  const textColor = high ? 'text-[#ff8a5c]' : 'text-white/55';

  return (
    <div
      className={`flex items-center gap-2 text-[0.6875rem] font-mono tracking-[0.14em] ${textColor}`}
      aria-live="polite"
      aria-label={`Daily chat usage ${pct} percent of cap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} aria-hidden="true" />
      daily usage: {pct}%
    </div>
  );
}

function computePct(u: Usage): number {
  if (typeof u.daily_used === 'number' && typeof u.daily_cap === 'number' && u.daily_cap > 0) {
    return Math.max(0, Math.min(100, Math.round((u.daily_used / u.daily_cap) * 100)));
  }
  return 0;
}
