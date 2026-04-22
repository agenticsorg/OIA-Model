import { useMemo, useState } from 'react';
import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { layers } from '../content/layers';
import { vendorFootprint, tierLabel, type Tier } from '../content/vendor-footprint';

const TIER_ORDER: Tier[] = ['frontier', 'cloud', 'enterprise', 'open', 'interface'];

export function ProviderFootprint() {
  const [tierFilter, setTierFilter] = useState<Tier | null>(null);
  const [sort, setSort] = useState<'reach' | 'alpha' | 'tier'>('reach');

  const rows = useMemo(() => {
    let list = [...vendorFootprint];
    if (tierFilter) list = list.filter((v) => v.tier === tierFilter);
    if (sort === 'reach') list.sort((a, b) => b.layers.length - a.layers.length || a.vendor.localeCompare(b.vendor));
    else if (sort === 'alpha') list.sort((a, b) => a.vendor.localeCompare(b.vendor));
    else if (sort === 'tier') {
      list.sort((a, b) => {
        const ta = TIER_ORDER.indexOf(a.tier);
        const tb = TIER_ORDER.indexOf(b.tier);
        return ta - tb || b.layers.length - a.layers.length;
      });
    }
    return list;
  }, [tierFilter, sort]);

  const layerTotals = useMemo(() => {
    const t = Array(10).fill(0);
    for (const v of rows) for (const l of v.layers) t[l] += 1;
    return t;
  }, [rows]);

  const verticalCount = rows.filter((v) => v.layers.length >= 4).length;
  const maxTotal = Math.max(...layerTotals, 1);

  return (
    <TelemetryRegion id="provider-footprint">
      <div className="main-inset py-8">
        <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[0.6875rem] font-mono text-white/40 tracking-[0.18em] uppercase">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#f05122] pulse-accent"
                aria-hidden="true"
              />
              Implementation Tool · Market Map
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-normal text-white display-font">
              Provider Footprint
            </h2>
            <p className="mt-2 text-sm text-white/60 max-w-2xl leading-relaxed">
              Which vendors operate at which layers — derived from the Reference Technologies
              named in §4. Rows with four or more layers filled are candidates for the
              &quot;vertical extension&quot; pattern Decision&nbsp;10 calls out (provider reach
              into Layers 6, 7, and 8).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Chip tone="strong">{verticalCount} vertical · ≥4 layers</Chip>
            <Chip tone="mono">{rows.length} vendors</Chip>
          </div>
        </header>

        <CmdPanel bodyClassName="p-0">
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex items-center gap-1 bg-black p-1 rounded-lg border border-white/10 shadow-inner flex-wrap">
              <TierButton active={tierFilter === null} onClick={() => setTierFilter(null)}>All</TierButton>
              {TIER_ORDER.map((t) => (
                <TierButton key={t} active={tierFilter === t} onClick={() => setTierFilter(tierFilter === t ? null : t)}>
                  {tierLabel[t]}
                </TierButton>
              ))}
            </div>
            <div className="sm:ml-auto flex items-center gap-2 text-[0.6875rem] font-mono text-white/45 tracking-[0.18em] uppercase">
              Sort
              <div className="flex items-center gap-1 bg-black p-1 rounded-lg border border-white/10 shadow-inner">
                <SortButton active={sort === 'reach'} onClick={() => setSort('reach')}>Reach</SortButton>
                <SortButton active={sort === 'tier'} onClick={() => setSort('tier')}>Tier</SortButton>
                <SortButton active={sort === 'alpha'} onClick={() => setSort('alpha')}>A–Z</SortButton>
              </div>
            </div>
          </div>

          {/* column headers */}
          <div className="grid grid-cols-[220px_1fr_auto] gap-4 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <span className="text-[0.625rem] text-white/35 font-mono tracking-[0.18em] uppercase">
              Vendor / tier
            </span>
            <div className="grid grid-cols-10 gap-1">
              {layers.map((l) => (
                <span
                  key={l.id}
                  className="text-[0.625rem] text-white/45 font-mono tracking-[0.18em] uppercase text-center"
                  title={l.name}
                >
                  L{l.number}
                </span>
              ))}
            </div>
            <span className="text-[0.625rem] text-white/35 font-mono tracking-[0.18em] uppercase w-16 text-right">
              Reach
            </span>
          </div>

          {/* rows */}
          <div className="divide-y divide-white/5">
            {rows.map((v) => {
              const vertical = v.layers.length >= 4;
              const set = new Set(v.layers);
              return (
                <div
                  key={v.vendor}
                  className={`grid grid-cols-[220px_1fr_auto] gap-4 px-4 py-2.5 items-center ${
                    vertical ? 'bg-[#f05122]/[0.04]' : 'hover:bg-white/[0.02]'
                  } transition-colors`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-white truncate flex items-center gap-2">
                      {v.vendor}
                      {vertical && <Chip tone="strong">Vertical</Chip>}
                    </span>
                    <span className="text-[0.625rem] font-mono text-white/40 tracking-[0.14em] uppercase truncate">
                      {tierLabel[v.tier]}
                      {v.note ? ` · ${v.note}` : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {layers.map((l) => {
                      const on = set.has(l.number);
                      return (
                        <a
                          key={l.id}
                          href={`#${l.id}`}
                          title={`${v.vendor} at L${l.number} — ${l.name}`}
                          className={`h-6 rounded flex items-center justify-center border ${
                            on
                              ? 'bg-[#f05122]/25 border-[#f05122] shadow-[0_0_6px_rgba(240,81,34,0.35)]'
                              : 'border-white/5 bg-transparent'
                          }`}
                        >
                          {on && (
                            <span
                              className="w-1 h-1 rounded-full bg-white"
                              aria-hidden="true"
                            />
                          )}
                        </a>
                      );
                    })}
                  </div>
                  <span className="text-sm font-mono w-16 text-right text-white/80">
                    {v.layers.length}/10
                  </span>
                </div>
              );
            })}
          </div>

          {/* layer totals */}
          <div className="grid grid-cols-[220px_1fr_auto] gap-4 px-4 py-3 border-t border-white/10 bg-white/[0.02]">
            <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase self-center">
              Providers at layer
            </span>
            <div className="grid grid-cols-10 gap-1">
              {layerTotals.map((n, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="h-8 w-full bg-black rounded border border-white/10 overflow-hidden flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-[#f05122] to-[#ff8a5c]"
                      style={{ height: `${(n / maxTotal) * 100}%` }}
                    />
                  </div>
                  <span className="text-[0.625rem] font-mono text-white/60 tracking-wide">
                    {n}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase w-16 text-right self-center">
              Count
            </span>
          </div>
        </CmdPanel>

        <p className="mt-4 text-xs text-white/50 leading-relaxed max-w-3xl">
          <span className="text-[#ff8a5c] font-mono tracking-[0.18em] uppercase mr-1">Note</span>
          Footprint derived from vendor / product names appearing in §4 Reference
          Technologies — it is neither exhaustive nor a purchase recommendation. It is a
          lens on Decision&nbsp;10&apos;s &quot;provider vertical extension into Layers 6,
          7, and 8&quot; pattern and the sovereignty implications that follow.
        </p>
      </div>
    </TelemetryRegion>
  );
}

function TierButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded border transition-colors ${
        active
          ? 'bg-[#f05122] border-[#f05122] text-white'
          : 'border-transparent text-white/50 hover:text-white/90'
      }`}
    >
      {children}
    </button>
  );
}

function SortButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-0.5 text-[0.6875rem] font-mono tracking-wide rounded border transition-colors ${
        active
          ? 'bg-white/10 border-white/20 text-white'
          : 'border-transparent text-white/50 hover:text-white/90'
      }`}
    >
      {children}
    </button>
  );
}
