import { useMemo, useState } from 'react';
import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { decisions } from '../content/decision-log';
import { apiUrl } from '../lib/api-base';

interface FormDraft {
  share_name: boolean;
  name: string;
  email: string;
  organization: string;
  role: string;
  // Foundation-featured
  hyperscaler_monopolies: string;
  layer8_certification: string;
  legacy_vendor_mapping: string;
  foundation_funding: string;
  regulatory_alignment: string;
  // review prompts
  shape_response: string;
  reopen_decisions: string[]; // decision numbers "01".."11"
  reopen_reasons: string;
  open_questions_contrib: string;
  additional_deferrals: string;
  prematurely_deferred: string;
  missing_concerns: string;
  missing_tech: string;
  missing_spans: string;
  vertical_extension: string;
  improvements: string;
  general_feedback: string;
}

const INITIAL: FormDraft = {
  share_name: false,
  name: '',
  email: '',
  organization: '',
  role: '',
  hyperscaler_monopolies: '',
  layer8_certification: '',
  legacy_vendor_mapping: '',
  foundation_funding: '',
  regulatory_alignment: '',
  shape_response: '',
  reopen_decisions: [],
  reopen_reasons: '',
  open_questions_contrib: '',
  additional_deferrals: '',
  prematurely_deferred: '',
  missing_concerns: '',
  missing_tech: '',
  missing_spans: '',
  vertical_extension: '',
  improvements: '',
  general_feedback: '',
};

const ROLES = [
  'Architect',
  'Builder / Vendor',
  'Researcher',
  'Regulator',
  'Foundation member',
  'Other',
];

/** Five Foundation-featured review questions. */
const FOUNDATION_QUESTIONS: { id: keyof FormDraft; title: string; hint: string }[] = [
  {
    id: 'hyperscaler_monopolies',
    title: 'How do we prevent hyperscaler monopolies from collapsing Layers 5 through 8 into proprietary black boxes?',
    hint: 'Touches on sovereignty span, vertical extension (Decision 10), and the Continuity Fabric.',
  },
  {
    id: 'layer8_certification',
    title: 'Who governs the certification of compliance and verifiable memory at Layer 8?',
    hint: 'The Continuity Fabric is the least architecturally mature layer — governance of verification is an open question.',
  },
  {
    id: 'legacy_vendor_mapping',
    title: 'How will incumbent cybersecurity and data vendors map their legacy products to this new stack?',
    hint: 'Affects Layers 2, 3, and the cross-layer spans — where do current vendors land?',
  },
  {
    id: 'foundation_funding',
    title: "What is the sustainable funding model for the Foundation's long-term stewardship of the OIA specification?",
    hint: 'What keeps a reference architecture durable across multiple revisions?',
  },
  {
    id: 'regulatory_alignment',
    title: 'How do we drive global regulatory alignment so that OIA becomes the default framework for compliance?',
    hint: 'EU AI Act, NIST AI RMF, ISO/IEC 42001 all already apply — where is the alignment path?',
  },
];

/** Review prompts drawn from the digests. */
const REVIEW_QUESTIONS: {
  id: keyof FormDraft;
  title: string;
  placeholder?: string;
  hint?: string;
}[] = [
  {
    id: 'shape_response',
    title: 'Is the shape correctly drawn? If not, where specifically is it wrong?',
    hint: 'From the Closing: reviewers who think the shape is wrong are encouraged to say so specifically.',
  },
  {
    id: 'reopen_reasons',
    title: 'For the decisions you checked above, what would you change?',
    placeholder: 'One paragraph per decision — the Foundation requests the form "reopen decision NN, because…"',
  },
  {
    id: 'open_questions_contrib',
    title: 'Which Open Questions (at which layer) can you speak to from experience?',
    hint: "Every layer ends with Open Questions. Which ones does your work touch?",
  },
  {
    id: 'additional_deferrals',
    title: 'Is there anything in this first draft that should have been deferred to a later version?',
  },
  {
    id: 'prematurely_deferred',
    title: "Is there anything currently deferred that should have been included in v0.1?",
  },
  {
    id: 'missing_concerns',
    title: 'Are there Key Concerns we missed at any specific layer?',
  },
  {
    id: 'missing_tech',
    title: "Are there reference technologies we didn't name that belong in the model?",
  },
  {
    id: 'missing_spans',
    title: 'Do the six cross-layer spans feel complete? Any missing?',
    hint: 'Security · Sovereignty · Auditability · Identity · Energy · Provenance.',
  },
  {
    id: 'vertical_extension',
    title: 'Any field experience with provider vertical extension into Layers 6, 7, or 8?',
    hint: 'Decision 10 names this as an architecturally consequential pattern.',
  },
  {
    id: 'improvements',
    title: 'What would most improve the next draft of the OIA Model?',
  },
  {
    id: 'general_feedback',
    title: 'Anything else you want the Foundation to hear?',
  },
];

export function Feedback() {
  const [draft, setDraft] = useLocalStorage<FormDraft>('oia:feedback:draft:v2', INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | { ok: true; id: number } | { ok: false; error: string }>(null);

  function patch<K extends keyof FormDraft>(key: K, value: FormDraft[K]) {
    setDraft({ ...draft, [key]: value });
  }

  function toggleDecision(num: string) {
    const s = new Set(draft.reopen_decisions);
    if (s.has(num)) s.delete(num);
    else s.add(num);
    patch('reopen_decisions', Array.from(s).sort());
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const body = {
        ...draft,
        reopen_decisions: draft.reopen_decisions.join(', '),
      };
      const r = await fetch(apiUrl('/api/feedback'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error ?? 'Submission failed');
      setStatus({ ok: true, id: data.id });
      setDraft(INITIAL);
    } catch (e) {
      setStatus({ ok: false, error: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  const filled = useMemo(() => countFilled(draft), [draft]);

  return (
    <TelemetryRegion id="feedback">
      <div className="main-inset py-8">
        <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[0.6875rem] font-mono text-white/40 tracking-[0.18em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f05122] pulse-accent" aria-hidden="true" />
              Agentics Foundation · Feedback Channel
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-normal text-white display-font">
              Submit Feedback
            </h2>
            <p className="mt-2 text-sm text-white/60 max-w-2xl leading-relaxed">
              Push back, propose improvements, or contribute experience to any Open Question.
              Answer the questions that apply — you can skip the rest. Sharing your name is
              optional; submissions are stored in a local SQLite database and are never
              published without your consent.
            </p>
          </div>
          <Chip tone="accent">{filled} field{filled === 1 ? '' : 's'} filled</Chip>
        </header>

        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          {/* Identity */}
          <CmdPanel eyebrow="Identity" title="Who's submitting (optional)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <LabeledInput
                label="Name"
                value={draft.name}
                onChange={(v) => patch('name', v)}
                placeholder="Your name (optional)"
              />
              <LabeledInput
                label="Email"
                value={draft.email}
                onChange={(v) => patch('email', v)}
                placeholder="your@email.example (optional)"
                type="email"
              />
              <LabeledInput
                label="Organisation"
                value={draft.organization}
                onChange={(v) => patch('organization', v)}
                placeholder="Org / affiliation (optional)"
              />
              <div className="flex flex-col gap-1">
                <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase">
                  Role
                </span>
                <select
                  value={draft.role}
                  onChange={(e) => patch('role', e.target.value)}
                  className="bg-black border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#f05122]/60"
                >
                  <option value="">— select —</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="mt-4 flex items-start gap-3 cursor-pointer group">
              <span
                className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center flex-shrink-0 ${
                  draft.share_name
                    ? 'bg-[#f05122] border-[#f05122] shadow-[0_0_8px_rgba(240,81,34,0.45)]'
                    : 'bg-black border-white/20 group-hover:border-white/45'
                }`}
                aria-hidden="true"
              >
                {draft.share_name && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                checked={draft.share_name}
                onChange={(e) => patch('share_name', e.target.checked)}
                className="sr-only"
              />
              <span className="text-sm text-white/85">
                <strong className="text-white">I consent to my name being shared publicly</strong> with this feedback. Leave this
                unchecked to remain anonymous — your name and organisation will still be stored for
                the Foundation's internal follow-up but redacted from any public listing.
              </span>
            </label>
          </CmdPanel>

          {/* Foundation-featured questions */}
          <CmdPanel
            eyebrow="Foundation Questions · Featured"
            title="Five questions the Foundation most wants your input on"
            trailing={<Chip tone="strong">Featured</Chip>}
          >
            <div className="flex flex-col gap-5">
              {FOUNDATION_QUESTIONS.map((q, i) => (
                <QuestionField
                  key={q.id}
                  index={i + 1}
                  q={q.title}
                  hint={q.hint}
                  value={draft[q.id] as string}
                  onChange={(v) => patch(q.id, v as never)}
                />
              ))}
            </div>
          </CmdPanel>

          {/* Review prompts */}
          <CmdPanel
            eyebrow="Review Prompts · From the Digest"
            title="Questions drawn from the two digests"
          >
            <div className="flex flex-col gap-5">
              <QuestionField
                index="A"
                q={REVIEW_QUESTIONS[0].title}
                hint={REVIEW_QUESTIONS[0].hint}
                value={draft.shape_response}
                onChange={(v) => patch('shape_response', v)}
              />

              {/* Decision-reopen picker */}
              <div>
                <div className="flex items-start gap-3">
                  <span className="text-[0.6875rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase w-6 pt-1 flex-shrink-0">
                    B
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white leading-snug">
                      Which of the eleven decisions would you reopen?
                    </div>
                    <div className="text-[0.75rem] text-white/50 leading-relaxed mt-1">
                      Click any decision to flag it — then expand on the reasons in question C below.
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {decisions.map((d) => {
                        const on = draft.reopen_decisions.includes(d.number);
                        return (
                          <button
                            key={d.number}
                            type="button"
                            onClick={() => toggleDecision(d.number)}
                            aria-pressed={on}
                            title={d.title}
                            className={`px-2.5 py-1 rounded border text-[0.6875rem] font-mono tracking-wide transition-colors ${
                              on
                                ? 'bg-[#f05122] border-[#f05122] text-white shadow-[0_0_8px_rgba(240,81,34,0.4)]'
                                : 'bg-black border-white/10 text-white/55 hover:text-white hover:border-white/30'
                            }`}
                          >
                            DEC-{d.number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {REVIEW_QUESTIONS.slice(1).map((q, i) => (
                <QuestionField
                  key={q.id}
                  index={String.fromCharCode(67 + i)}
                  q={q.title}
                  placeholder={q.placeholder}
                  hint={q.hint}
                  value={draft[q.id] as string}
                  onChange={(v) => patch(q.id, v as never)}
                />
              ))}
            </div>
          </CmdPanel>

          {/* Submit bar */}
          <div className="sticky bottom-4 z-20 tactile-glass rounded-lg border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.6)] p-4 flex flex-wrap items-center gap-4">
            <div className="text-[0.6875rem] font-mono text-white/55 tracking-wide">
              Draft saves locally as you type.{' '}
              {draft.share_name ? (
                <span className="text-[#ff8a5c]">Name will be shared publicly.</span>
              ) : (
                <span className="text-white/50">Submitting anonymously.</span>
              )}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear the draft?')) setDraft(INITIAL);
                }}
                className="text-[0.6875rem] font-mono text-white/55 hover:text-[#ff8a5c] uppercase tracking-[0.18em] px-2 py-1 border border-white/10 rounded"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={submitting || filled === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#f05122] hover:bg-[#ff7a4a] text-white text-sm rounded transition-colors shadow-[0_0_20px_rgba(240,81,34,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {submitting ? 'Submitting…' : 'Send feedback'}
              </button>
            </div>
            {status && status.ok && (
              <div className="w-full text-sm text-[#ff8a5c] font-mono">
                Thank you — submission #{status.id} recorded.
              </div>
            )}
            {status && !status.ok && (
              <div className="w-full text-sm text-[#ff8a5c] font-mono">
                Submission failed: {status.error}
              </div>
            )}
          </div>
        </form>

        <p className="mt-6 text-[0.75rem] text-white/45 leading-relaxed max-w-3xl">
          <span className="text-[#ff8a5c] font-mono tracking-[0.18em] uppercase mr-1">Storage</span>
          Submissions are stored in <code className="text-white/80">data/feedback.db</code> (SQLite). The
          Foundation can query directly via <code className="text-white/80">npm run feedback:list</code> or{' '}
          <code className="text-white/80">npm run feedback:query -- "SELECT …"</code>.
        </p>
      </div>
    </TelemetryRegion>
  );
}

function QuestionField({
  index,
  q,
  value,
  onChange,
  placeholder,
  hint,
}: {
  index: string | number;
  q: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[0.6875rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase w-6 pt-1 flex-shrink-0">
        {typeof index === 'number' ? `Q${index}` : index}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white leading-snug">{q}</div>
        {hint && (
          <div className="text-[0.75rem] text-white/50 leading-relaxed mt-1">{hint}</div>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Your thoughts (optional)'}
          rows={3}
          className="mt-2 w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/25 font-mono focus:outline-none focus:border-[#f05122]/60 resize-y leading-relaxed"
        />
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-black border border-white/10 rounded px-2 py-1.5 text-sm text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-[#f05122]/60"
      />
    </label>
  );
}

function countFilled(d: FormDraft): number {
  let n = 0;
  for (const [k, v] of Object.entries(d)) {
    if (k === 'share_name') continue;
    if (Array.isArray(v)) { if (v.length) n += 1; continue; }
    if (typeof v === 'string' && v.trim()) n += 1;
  }
  return n;
}
