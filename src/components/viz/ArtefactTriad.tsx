/**
 * Three companion artefacts called out in the Closing: the Reader's
 * Digest, the Full Draft, and the Decision Log Digest — each framed
 * as one facet of the model's publication.
 */

const ARTEFACTS = [
  {
    title: "Reader's Digest",
    subtitle: 'Architecture',
    body: 'Nine layers · six spans — read in a single sitting.',
    current: true,
  },
  {
    title: 'Full Draft',
    subtitle: 'Rationale',
    body: 'Expanded scope, reference implementations, open questions in detail.',
  },
  {
    title: 'Decision Log Digest',
    subtitle: 'Invitation',
    body: 'The eleven decisions most worth challenging.',
  },
];

export function ArtefactTriad() {
  return (
    <figure className="mt-6">
      <figcaption className="flex items-center justify-between mb-4">
        <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase">
          Figure · Three Artefacts
        </span>
        <span className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
          Closing
        </span>
      </figcaption>

      <div className="bg-black rounded-xl border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-6 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4">
        {ARTEFACTS.map((a, i) => (
          <div
            key={a.title}
            className={`relative p-4 rounded-lg border overflow-hidden ${
              a.current
                ? 'border-[#f05122]/60 bg-[#f05122]/10'
                : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            <div
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f05122] to-transparent"
              aria-hidden="true"
            />
            <div
              className={`text-[0.625rem] font-mono tracking-[0.18em] uppercase ${
                a.current ? 'text-[#ff8a5c]' : 'text-white/45'
              }`}
            >
              Artefact 0{i + 1} · {a.subtitle}
            </div>
            <div className="text-lg text-white mt-2 display-font">{a.title}</div>
            <div className="text-[0.8125rem] text-white/65 leading-relaxed mt-2">
              {a.body}
            </div>
            {a.current && (
              <div className="mt-3 text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f05122] pulse-accent" />
                You are reading this
              </div>
            )}
          </div>
        ))}
      </div>
    </figure>
  );
}
