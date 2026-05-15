import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';

/**
 * "Read me first" framing — sits between the Masthead/HeroDashboard
 * and the working tools. Tells a first-time reader what the OIA Model
 * is, what problem it answers, why OSI is the precedent worth invoking,
 * and that everything below this section is a *proposed* way to put
 * the model into practice, not the model itself.
 */
export function About() {
  return (
    <TelemetryRegion id="about" className="">
      <div className="main-inset py-10">
        <CmdPanel
          eyebrow="Section 00 · Read first"
          title="What this is, and why it should matter to you"
          trailing={
            <div className="flex items-center gap-2">
              <Chip tone="accent" dot>Reference Model</Chip>
              <Chip tone="mono">Open · Vendor-Neutral</Chip>
            </div>
          }
        >
          {/* Lead */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
            <div className="max-w-3xl flex flex-col gap-4">
              <p className="text-base sm:text-lg text-white/85 leading-relaxed">
                The <span className="text-white">OIA Model</span> — Open Intelligence
                Architecture — is a reference architecture for the systems that
                increasingly run inside organisations: agents and copilots that
                <em className="not-italic text-white"> remember</em>,
                <em className="not-italic text-white"> learn</em>, and act with
                <em className="not-italic text-white"> consequence</em>. It describes
                how to organise them in nine layers, from physical compute at the bottom
                to the human and browser interface at the top.
              </p>
              <p className="text-sm sm:text-base text-white/65 leading-relaxed">
                It is <span className="text-white/85">not a product, methodology, or
                compliance regime</span>. It is a shared structural vocabulary — the
                kind of vocabulary the industry has historically needed at every major
                shift, and currently lacks for intelligent systems.
              </p>
            </div>

            <aside className="lg:w-[260px] flex-shrink-0 p-4 rounded-xl border border-[#f05122]/30 bg-[#f05122]/[0.04] shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
              <div className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase mb-2">
                Bottom line
              </div>
              <p className="text-sm text-white/85 leading-relaxed">
                If you ship intelligent systems — or have to review, govern, or buy
                them — this is a way to talk about the same thing when you say
                <span className="text-white"> intelligence</span>.
              </p>
            </aside>
          </div>

          {/* Three pillars: The Gap / The Precedent / The Model */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Pillar
              index="01"
              eyebrow="The gap"
              title="No shared reference architecture for intelligence"
              body="Ask ten enterprise architects what framework they use for production AI and you will get ten answers. Frameworks that organise networking, data, applications, and cybersecurity do not organise intelligence. Persistent memory, safe on-device learning, verifiable judgment, autonomous orchestration — these have no architectural home in the models that came before."
              footer="Why it matters: without a shared shape, every team rebuilds the same vocabulary, and reviewers cannot disagree precisely."
            />
            <Pillar
              index="02"
              eyebrow="The precedent"
              title="OSI worked because it was shared"
              body="ISO/IEC 7498 — the OSI Reference Model — did not invent networking. It gave the industry a way to talk about it: seven layers, separation of concerns, vendor-neutral, institutionally framed. Every reference architecture since has followed that pattern. The win was never the diagram. The win was that competitors, regulators, and researchers could finally point at the same thing."
              footer="The lesson: a reference model becomes foundational by being shared, not by being clever."
              accent
            />
            <Pillar
              index="03"
              eyebrow="The model"
              title="Nine layers, designed for intelligent systems"
              body="OIA names the structural positions that intelligent systems actually need. Layer 0 grounds the stack in physical compute; Layer 8 introduces a Continuity Fabric that holds memory, learning, and judgment across change; Layer 9 is the human surface. Six cross-layer spans — security, sovereignty, auditability, energy, identity, provenance — sit horizontally across the stack."
              footer="The claim: intelligence has a structural shape that data and application models cannot capture by extension."
            />
          </div>

          {/* OSI → OIA bridge strip */}
          <div className="mt-8 p-5 rounded-xl border border-white/10 bg-black shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-[0.625rem] font-mono text-white/40 tracking-[0.22em] uppercase">
                  Pattern
                </span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-white/85">OSI · 1984</span>
                  <span className="text-white/30">→</span>
                  <span className="font-mono text-white/85">TCP/IP era</span>
                  <span className="text-white/30">→</span>
                  <span className="font-mono text-[#ff8a5c]">OIA · 2026</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-white/55 max-w-xl leading-relaxed">
                Every time computing has shifted fundamentally — mainframe to client-server,
                on-prem to cloud, applications to services — the industry has produced a
                new reference architecture. OIA is published in that lineage, not in
                opposition to it.
              </p>
            </div>
          </div>

          {/* How the rest of the page is organised */}
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f05122] pulse-accent" aria-hidden="true" />
              <span className="text-[0.6875rem] font-mono text-white/55 tracking-[0.22em] uppercase">
                How this page is organised
              </span>
            </div>
            <p className="text-sm sm:text-base text-white/75 leading-relaxed max-w-3xl">
              What follows is in two parts. <span className="text-white">First the reference
              architecture itself</span> — the prose digest, Foreword through Closing,
              that names the nine layers, the cross-layer spans, and the open questions.
              <span className="text-white"> Then a set of proposed implementations</span> —
              interactive panels that let you apply the model against your own context
              and walk out with a review package.
            </p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href="#foreword"
                className="block p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#f05122]/50 hover:bg-[#f05122]/[0.04] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.22em] uppercase">
                    Part I · The Reference Architecture
                  </span>
                  <span className="text-[#ff8a5c] text-xs font-mono">↓</span>
                </div>
                <span className="text-base text-white">Foreword → Closing</span>
                <p className="mt-1.5 text-xs text-white/55 leading-relaxed">
                  The forty-minute reading of the model: foundations, the nine layers,
                  the cross-layer spans, relationships to existing frameworks, adoption,
                  deferrals.
                </p>
              </a>
              <a
                href="#tools-intro"
                className="block p-4 rounded-xl border border-[#f05122]/40 bg-[#f05122]/[0.04] hover:bg-[#f05122]/[0.08] transition-colors shadow-[0_0_24px_rgba(240,81,34,0.12)]"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.22em] uppercase">
                    Part II · Proposed Implementations
                  </span>
                  <span className="text-[#ff8a5c] text-xs font-mono">↓</span>
                </div>
                <span className="text-base text-white">Workspace, Assessment, Diagram, Decision Log…</span>
                <p className="mt-1.5 text-xs text-white/55 leading-relaxed">
                  Interactive panels — proposed ways to put the model into practice.
                  Not part of the model itself; disagreement with a tool is not
                  disagreement with the architecture.
                </p>
              </a>
            </div>

            <div className="mt-6 text-[0.6875rem] font-mono text-white/45 tracking-[0.18em] uppercase">
              v0.1 is open for review · expect rough edges · point at decisions by number
            </div>
          </div>
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}

interface PillarProps {
  index: string;
  eyebrow: string;
  title: string;
  body: string;
  footer: string;
  accent?: boolean;
}

function Pillar({ index, eyebrow, title, body, footer, accent }: PillarProps) {
  return (
    <article
      className={`relative p-5 rounded-xl border bg-black shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] flex flex-col gap-3 ${
        accent
          ? 'border-[#f05122]/40 shadow-[0_0_24px_rgba(240,81,34,0.12)]'
          : 'border-white/10'
      }`}
    >
      <header className="flex items-center justify-between gap-3">
        <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.22em] uppercase">
          {eyebrow}
        </span>
        <span className="text-[0.625rem] font-mono text-white/30 tracking-[0.22em]">
          {index}
        </span>
      </header>
      <h3 className="text-base sm:text-lg text-white leading-snug">{title}</h3>
      <p className="text-sm text-white/65 leading-relaxed flex-1">{body}</p>
      <footer className="pt-3 border-t border-white/10 text-[0.6875rem] font-mono text-white/55 leading-relaxed">
        {footer}
      </footer>
    </article>
  );
}

