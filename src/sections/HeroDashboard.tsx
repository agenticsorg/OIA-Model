import { TelemetryRegion } from '../components/TelemetryRegion';
import { Chip } from '../components/Chip';

/**
 * HeroDashboard — a direct homage to
 * animated-telemetry-dashboard-section (1).tsx, rethemed to
 * #000000 / #ffffff / #f05122 and populated with content
 * allegorical to the OIA Model:
 *
 *  - Zone Alpha           → "Model Scan" (9 layers)
 *  - Thermal Core         → "L8 Maturity" dial
 *  - System Logs          → OIA operations feed
 *  - Deployment Tasks     → "Community Review" progress
 *  - Compute Usage        → Sovereign / Open / Provider share
 *  - Quantum Relay Uplink → v0.1 → v0.2 transmission
 */
export function HeroDashboard() {
  return (
    <TelemetryRegion id="hero-dashboard" className="scroll-mt-24">
      <div className="main-inset pt-4 pb-10">
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[0.6875rem] font-mono text-white/40 tracking-[0.18em] uppercase">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#f05122] pulse-accent"
                aria-hidden="true"
              />
              Live Telemetry · Reference Architecture Operations
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-normal tracking-tight text-white display-font flex items-center gap-3">
              <span aria-hidden="true" className="text-[#f05122]">▌</span>
              Architecture under review
            </h2>
            <p className="mt-3 text-sm text-white/60 max-w-2xl leading-relaxed">
              Nine layers, six spans, eleven decisions. A reference architecture in active
              public review — instrumented here as a live operations panel so the shape of the
              work is visible at a glance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Chip tone="accent" dot pulseDot>
              Active · v0.1
            </Chip>
            <Chip tone="mono">Cycle 2026</Chip>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ZoneAlphaTile />
          <ThermalCoreTile />
          <SystemLogsTile />
          <DeploymentTasksTile />
          <ComputeUsageTile />
          <QuantumRelayTile />
        </div>
      </div>
    </TelemetryRegion>
  );
}

/* ---------------- individual tiles ---------------- */

function ZoneAlphaTile() {
  return (
    <article className="cmd-panel h-[300px] lg:col-span-1">
      <header className="cmd-panel-header">
        <div className="flex flex-col gap-1">
          <span className="text-[0.625rem] text-[#ff8a5c] font-mono uppercase tracking-[0.18em]">
            Zone Alpha
          </span>
          <span className="text-base font-normal text-white">Model Scan</span>
        </div>
        <Chip tone="accent" dot pulseDot>
          Active
        </Chip>
      </header>
      <div className="cmd-panel-body flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-36 h-36 rounded-full border border-white/10 relative flex items-center justify-center">
          <div className="absolute inset-2 rounded-full border border-white/5" />
          <div className="absolute inset-0 rounded-full border border-[#f05122]/15" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-full h-px bg-[#f05122]" />
            <div className="h-full w-px bg-[#f05122] absolute" />
          </div>
          <div className="absolute inset-0 rounded-full radar-sweep" />
          <div className="relative text-center">
            <div className="text-4xl font-normal text-white display-font leading-none">9</div>
            <div className="text-[0.625rem] font-mono text-white/50 tracking-[0.18em] uppercase mt-1">
              Layers Active
            </div>
          </div>
        </div>
        <div className="w-full flex justify-between items-end absolute bottom-4 px-5">
          <span className="text-[0.625rem] text-[#ff8a5c] font-mono tracking-[0.18em] uppercase">
            L0 → L9
          </span>
          <span className="text-[0.625rem] text-white/40 font-mono tracking-[0.18em] uppercase">
            Bottom-up
          </span>
        </div>
      </div>
    </article>
  );
}

function ThermalCoreTile() {
  return (
    <article className="cmd-panel h-[300px] lg:col-span-1">
      <header className="cmd-panel-header">
        <span className="text-[0.625rem] text-white/50 font-mono uppercase tracking-[0.18em]">
          Thermal Core
        </span>
        <span className="text-[0.625rem] text-white/30 font-mono uppercase tracking-[0.18em]">
          L8 · Maturity
        </span>
      </header>
      <div className="cmd-panel-body flex flex-col items-center justify-center relative">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144" aria-hidden="true">
            <circle cx="72" cy="72" r="60" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle
              cx="72"
              cy="72"
              r="60"
              fill="transparent"
              stroke="#f05122"
              strokeWidth="10"
              strokeDasharray="377"
              className="thermal-ring drop-shadow-[0_0_12px_rgba(240,81,34,0.5)]"
              strokeLinecap="round"
              style={{ strokeDashoffset: 120 }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-normal text-white display-font tracking-tight drop-shadow-[0_0_8px_rgba(240,81,34,0.35)] animate-[pulse_4s_ease-in-out_infinite]">
              0018
            </span>
            <span className="text-[0.625rem] text-[#ff8a5c] font-mono tracking-[0.18em] mt-1 uppercase">
              Kelvin
            </span>
          </div>
        </div>
        <div className="w-full flex justify-between items-end absolute bottom-4 px-5">
          <div className="px-2 py-1 rounded bg-white/5 border border-white/10">
            <span className="text-[0.625rem] text-white/60 font-mono tracking-[0.18em] uppercase">
              Emerging
            </span>
          </div>
          <span className="text-[0.625rem] text-white/40 font-mono uppercase tracking-[0.18em]">
            Fabric
          </span>
        </div>
      </div>
    </article>
  );
}

function SystemLogsTile() {
  const rows = [
    {
      ref: 'EVT-L03',
      op: 'Sync state-holding layer',
      state: 'Stable',
      stateTone: 'mono' as const,
      ts: '10:14:22.01',
      level: 'info' as const,
    },
    {
      ref: 'ERR-L6.X',
      op: 'Provider vertical extension detected',
      state: 'Critical',
      stateTone: 'strong' as const,
      ts: '10:12:05.18',
      level: 'critical' as const,
    },
    {
      ref: 'EVT-L08',
      op: 'Continuity fabric register',
      state: 'Pending',
      stateTone: 'mono' as const,
      ts: '09:45:00.62',
      level: 'muted' as const,
    },
  ];
  return (
    <article className="cmd-panel h-[300px] lg:col-span-2">
      <header className="cmd-panel-header">
        <span className="text-base font-normal text-white">System Logs</span>
        <div className="flex items-center gap-1 bg-black p-1 rounded-lg border border-white/10 shadow-inner">
          <button className="px-3 py-1 text-xs text-white bg-white/5 rounded border border-white/10 shadow-sm">
            Global
          </button>
          <button className="px-3 py-1 text-xs text-white/40 hover:text-white/80 transition-colors">
            Alerts
          </button>
          <button className="px-3 py-1 text-xs text-white/40 hover:text-white/80 transition-colors">
            Routine
          </button>
        </div>
      </header>
      <div className="p-0 flex flex-col flex-1 relative overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_2fr_1fr_1fr] gap-4 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <span className="text-[0.625rem] text-white/30 font-mono tracking-[0.18em] uppercase w-6">
            Chk
          </span>
          <span className="text-[0.625rem] text-white/30 font-mono tracking-[0.18em] uppercase">
            Ref
          </span>
          <span className="text-[0.625rem] text-white/30 font-mono tracking-[0.18em] uppercase">
            Operation
          </span>
          <span className="text-[0.625rem] text-white/30 font-mono tracking-[0.18em] uppercase">
            State
          </span>
          <span className="text-[0.625rem] text-white/30 font-mono tracking-[0.18em] uppercase text-right">
            Timestamp
          </span>
        </div>

        {rows.map((r, i) => {
          const critical = r.level === 'critical';
          const muted = r.level === 'muted';
          return (
            <div
              key={i}
              className={`grid grid-cols-[auto_1fr_2fr_1fr_1fr] gap-4 px-4 py-3 items-center border-b border-white/5 last:border-b-0 relative ${
                critical
                  ? 'bg-[#f05122]/[0.06] border-l-2 border-l-[#f05122]'
                  : 'hover:bg-white/[0.03] transition-colors'
              }`}
            >
              {critical && (
                <div
                  className="absolute inset-0 bg-gradient-to-r from-[#f05122]/10 to-transparent pointer-events-none"
                  aria-hidden="true"
                />
              )}
              <div
                className={`w-4 h-4 rounded flex items-center justify-center relative z-10 ${
                  critical
                    ? 'bg-[#f05122]/20 border border-[#f05122]/70'
                    : muted
                      ? 'bg-black border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]'
                      : 'bg-[#f05122]'
                }`}
              >
                {!critical && !muted && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-white"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
                {critical && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-[#f05122]"
                    aria-hidden="true"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                  </svg>
                )}
              </div>
              <span
                className={`text-xs font-mono relative z-10 ${
                  critical ? 'text-[#ff8a5c]' : muted ? 'text-white/30' : 'text-white/60'
                }`}
              >
                {r.ref}
              </span>
              <span
                className={`text-sm truncate relative z-10 ${
                  critical ? 'text-[#ffb08c]' : muted ? 'text-white/30 filter blur-[1px]' : 'text-white/85'
                }`}
              >
                {r.op}
              </span>
              <div className="relative z-10">
                <Chip tone={r.stateTone}>{r.state}</Chip>
              </div>
              <span
                className={`text-[0.6875rem] font-mono text-right relative z-10 ${
                  critical ? 'text-[#ff8a5c]/70' : 'text-white/40'
                }`}
              >
                {r.ts}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function DeploymentTasksTile() {
  return (
    <article className="cmd-panel h-[300px] lg:col-span-1">
      <header className="cmd-panel-header">
        <span className="text-base font-normal text-white">Community Review</span>
        <span className="text-[0.625rem] text-white/30 font-mono uppercase tracking-[0.18em]">
          v0.1 → v0.2
        </span>
      </header>
      <div className="cmd-panel-body flex flex-col gap-4">
        <div className="bg-black rounded-xl p-4 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] flex flex-col gap-4 relative">
          <p className="text-sm text-white/70 leading-relaxed">
            Open for reviewer pushback.<br />
            Eleven decisions addressable by number.
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="text-[0.625rem] text-white/50 font-mono uppercase tracking-[0.18em]">
                Progress
              </span>
              <span className="text-xs font-mono text-[#ff8a5c]">80%</span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden shadow-inner">
              <div
                className="pb-fill h-full rounded-full relative overflow-hidden"
                style={{ ['--pb' as string]: '80%' }}
              >
                <div className="pb-sheen absolute top-0 bottom-0 w-[50%] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30" />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center gap-1.5 text-white/50">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="text-[0.6875rem] font-mono">9/11 open</span>
            </div>
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[0.625rem] text-white/60 font-mono">
                AF
              </div>
              <div className="w-6 h-6 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[0.625rem] text-white/60 font-mono">
                RC
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex justify-between items-center px-1">
          <span className="text-[0.625rem] text-white/40 font-mono uppercase tracking-[0.18em]">
            2/4 Deferrals Pending
          </span>
          <a
            href="#decision-log"
            className="text-[0.625rem] text-[#ff8a5c] font-mono uppercase tracking-[0.18em] hover:text-white transition-colors"
          >
            Cite →
          </a>
        </div>
      </div>
    </article>
  );
}

function ComputeUsageTile() {
  return (
    <article className="cmd-panel h-[300px] lg:col-span-1">
      <header className="cmd-panel-header">
        <span className="text-base font-normal text-white">Deployment Topology</span>
        <span className="text-[0.625rem] text-white/30 font-mono uppercase tracking-[0.18em]">
          L0 · L2 · L5
        </span>
      </header>
      <div className="cmd-panel-body flex flex-col">
        <div className="flex-1 bg-black rounded-xl border border-white/10 p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] relative flex items-end justify-center gap-4 min-h-[120px]">
          <div className="absolute inset-x-4 top-4 border-b border-dashed border-white/10" />
          <div className="absolute inset-x-4 top-1/2 border-b border-dashed border-white/10" />

          <div className="relative flex flex-col items-center w-10 z-10 h-full justify-end">
            <div
              className="w-full rounded-t shadow-[0_0_15px_rgba(240,81,34,0.3)] compute-bar-1"
              style={{ height: '30%', background: 'linear-gradient(0deg, #c43e17, #f05122)' }}
            />
            <span className="text-[0.625rem] text-white/40 font-mono mt-2 uppercase tracking-[0.18em] absolute -bottom-6">
              Sovereign
            </span>
          </div>

          <div className="relative flex flex-col items-center w-10 z-10 h-full justify-end">
            <div className="absolute -top-6 bg-black border border-white/10 text-[#ff8a5c] text-[0.625rem] font-mono px-1.5 py-0.5 rounded tracking-[0.18em] uppercase">
              Max
            </div>
            <div
              className="w-full rounded-t shadow-[0_0_20px_rgba(240,81,34,0.5)] compute-bar-2"
              style={{ height: '60%', background: 'linear-gradient(0deg, #f05122, #ff8a5c)' }}
            />
            <span className="text-[0.625rem] text-white/40 font-mono mt-2 uppercase tracking-[0.18em] absolute -bottom-6">
              Provider
            </span>
          </div>

          <div className="relative flex flex-col items-center w-10 z-10 h-full justify-end">
            <div
              className="w-full rounded-t shadow-[0_0_10px_rgba(240,81,34,0.2)] compute-bar-3"
              style={{ height: '38%', background: 'linear-gradient(0deg, #9b3013, #e44921)' }}
            />
            <span className="text-[0.625rem] text-white/40 font-mono mt-2 uppercase tracking-[0.18em] absolute -bottom-6">
              Hybrid
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2 px-1">
          <div className="flex flex-col">
            <span className="text-xl font-normal text-white display-font">30</span>
            <span className="text-[0.625rem] text-white/40 font-mono uppercase tracking-[0.18em]">
              Full log
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-normal text-[#ff8a5c] drop-shadow-[0_0_5px_rgba(240,81,34,0.5)] display-font animate-[pulse_4s_ease-in-out_infinite]">
              11
            </span>
            <span className="text-[0.625rem] text-white/40 font-mono uppercase tracking-[0.18em]">
              Digest
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-normal text-white/70 display-font">19</span>
            <span className="text-[0.625rem] text-white/40 font-mono uppercase tracking-[0.18em]">
              Design
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function QuantumRelayTile() {
  return (
    <article className="cmd-panel h-[300px] lg:col-span-2">
      <header className="cmd-panel-header">
        <div className="flex items-center gap-3">
          <span
            className="w-2 h-2 rounded-full bg-[#f05122] pulse-accent"
            aria-hidden="true"
          />
          <span className="text-[0.625rem] text-[#ff8a5c] font-mono uppercase tracking-[0.18em] bg-[#f05122]/10 px-2 py-0.5 rounded border border-[#f05122]/30">
            T-Minus Review Close
          </span>
        </div>
        <span className="text-[0.625rem] text-white/30 font-mono uppercase tracking-[0.18em]">
          v0.1 → v0.2
        </span>
      </header>

      <div className="cmd-panel-body flex flex-col justify-between">
        <div className="flex items-center justify-between mb-5">
          <span className="text-base font-normal text-white">Reference Architecture Broadcast</span>
          <div className="flex items-center gap-2">
            <span className="text-[0.625rem] font-mono text-[#ff8a5c] uppercase tracking-[0.18em] animate-pulse">
              Transmitting
            </span>
            <div className="flex gap-0.5">
              <div className="w-1 h-3 bg-[#f05122] rounded-sm animate-[pulse_1s_ease-in-out_infinite]" />
              <div
                className="w-1 h-3 bg-[#f05122] rounded-sm animate-[pulse_1s_ease-in-out_infinite]"
                style={{ animationDelay: '0.2s' }}
              />
              <div
                className="w-1 h-3 bg-[#f05122] rounded-sm animate-[pulse_1s_ease-in-out_infinite]"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          </div>
        </div>

        <div className="w-full relative py-4">
          <div className="h-10 w-full bg-black rounded-lg border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute inset-0 signal-texture opacity-25" aria-hidden="true" />
            <div className="absolute inset-y-0 right-0 w-[15%] bg-[#f05122]/5 border-l border-[#f05122]/30 border-dashed animate-pulse flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#f05122] shadow-[0_0_8px_#f05122]" />
            </div>
            <div className="absolute inset-y-0 left-0 w-[15%] bg-[#f05122]/5 border-r border-[#f05122]/30 border-dashed animate-pulse flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#f05122] shadow-[0_0_8px_#f05122]" />
            </div>
            <div className="sweep-block absolute inset-y-0 border-x flex items-center justify-between px-2 z-10">
              <div className="w-px h-6 bg-[#ff8a5c]/80 shadow-[0_0_8px_rgba(255,138,92,0.8)]" />
              <div className="w-px h-6 bg-[#ff8a5c]/80 shadow-[0_0_8px_rgba(255,138,92,0.8)]" />
            </div>
          </div>

          <div className="flex justify-between mt-3 px-1 relative text-[0.625rem] text-white/40 font-mono">
            <span>2026.04</span>
            <span>REVIEW</span>
            <span>REVISION</span>
            <span>2026.Q3</span>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <span className="text-[0.625rem] text-white/40 uppercase tracking-[0.18em] font-mono">
              Open Channel
            </span>
            <a
              href="#decision-log"
              className="text-sm font-mono text-[#ff8a5c] hover:text-white transition-colors flex items-center gap-1.5 group"
            >
              reopen decision NN, because…
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
            </a>
          </div>
          <a
            href="#layer-definitions"
            className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/10 shadow-lg flex items-center justify-center text-white/60 hover:text-[#ff8a5c] transition-all hover:border-[#f05122]/50 hover:shadow-[0_0_15px_rgba(240,81,34,0.25)]"
            aria-label="Jump to layer definitions"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="m13.5 6.5-3.148-3.148a1.205 1.205 0 0 0-1.704 0L6.352 5.648a1.205 1.205 0 0 0 0 1.704L9.5 10.5" />
              <path d="M16.5 7.5 19 5" />
              <path d="m17.5 10.5 3.148 3.148a1.205 1.205 0 0 1 0 1.704l-2.296 2.296a1.205 1.205 0 0 1-1.704 0L13.5 14.5" />
              <path d="M9 21a6 6 0 0 0-6-6" />
              <path d="M9.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l4.296-4.296a1.205 1.205 0 0 0 0-1.704l-2.296-2.296a1.205 1.205 0 0 0-1.704 0z" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
