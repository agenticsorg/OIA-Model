import { useMemo } from 'react';
import { MicroTool, ArtifactPreview } from './MicroTool';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { layers } from '../../content/layers';

type Intensity = { persistence: number; autonomy: number; consequence: number };

const DEFAULT: Intensity = { persistence: 50, autonomy: 50, consequence: 50 };

/** Layers primarily addressed by each property, per §2.3. */
const PROP_LAYERS = {
  persistence: [8, 3],
  autonomy: [7, 5, 6, 9],
  consequence: [3, 4, 5, 6, 7, 8, 9],
};

export function LayerPriorityPlan() {
  const [intensity, setIntensity] = useLocalStorage<Intensity>('oia:op:intensity', DEFAULT);

  const priorityScores = useMemo(() => {
    const scores: Record<number, number> = {};
    const apply = (ns: number[], weight: number) => {
      for (const n of ns) scores[n] = (scores[n] ?? 0) + weight;
    };
    apply(PROP_LAYERS.persistence, intensity.persistence);
    apply(PROP_LAYERS.autonomy, intensity.autonomy);
    apply(PROP_LAYERS.consequence, intensity.consequence);
    return layers
      .map((l) => ({ layer: l, score: scores[l.number] ?? 0 }))
      .sort((a, b) => b.score - a.score)
      .filter((r) => r.score > 0);
  }, [intensity]);

  const artifact = useMemo(() => {
    if (priorityScores.length === 0) return '';
    const lines: string[] = [];
    lines.push('# Layer-prioritisation plan');
    lines.push('');
    lines.push(
      `Property intensity — Persistence ${intensity.persistence} · Autonomy ${intensity.autonomy} · Consequence ${intensity.consequence}`,
    );
    lines.push('');
    lines.push('## Priority order for architectural investment');
    priorityScores.slice(0, 8).forEach((r, i) => {
      lines.push(`${i + 1}. **Layer ${r.layer.number} — ${r.layer.name}** (priority score ${r.score})`);
      lines.push(`   - Key concerns: ${r.layer.concerns.slice(0, 3).join(' · ')}`);
    });
    lines.push('');
    lines.push('## Suggested cadence');
    lines.push('- Weeks 1–4 · pick top 2 layers · decide reference tech + ownership');
    lines.push('- Weeks 5–12 · top 5 layers · implement initial concern treatments');
    lines.push('- Quarter 2 · remaining layers · close gaps identified in Assessment');
    lines.push('');
    lines.push('_Generated from OIA Model §2.3 Defining Properties._');
    return lines.join('\n');
  }, [priorityScores, intensity]);

  return (
    <MicroTool
      title="Build a layer-priority plan from your property intensities"
      subtitle="Rate how strongly each property applies to your system; the tool orders the nine layers by investment priority and generates a plan block you can drop into an engineering roadmap."
    >
      <div className="flex flex-col gap-3">
        {(['persistence', 'autonomy', 'consequence'] as const).map((k) => (
          <div key={k} className="flex items-center gap-3">
            <label className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase w-28">
              {k}
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={intensity[k]}
              onChange={(e) => setIntensity({ ...intensity, [k]: Number(e.target.value) })}
              className="flex-1 accent-[#f05122]"
            />
            <span className="text-xs font-mono text-white/80 w-10 text-right">{intensity[k]}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-5 sm:grid-cols-10 gap-1">
        {layers.map((l) => {
          const score = priorityScores.find((p) => p.layer.number === l.number)?.score ?? 0;
          const max = Math.max(...priorityScores.map((p) => p.score), 1);
          const pct = (score / max) * 100;
          return (
            <a
              key={l.id}
              href={`#${l.id}`}
              title={`${l.name} — priority ${score}`}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="h-10 w-full bg-black rounded border border-white/10 overflow-hidden flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-[#f05122] to-[#ff8a5c] transition-all duration-300"
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-[0.625rem] font-mono text-white/50 tracking-wide group-hover:text-white">
                L{l.number}
              </span>
            </a>
          );
        })}
      </div>
      <ArtifactPreview
        text={artifact}
        label="Priority plan · paste into your roadmap"
        filename="layer-priority-plan.md"
      />
    </MicroTool>
  );
}
