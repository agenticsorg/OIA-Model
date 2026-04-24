# ADR-0003 — Retrieval-Augmented Generation Architecture for the Chat

- **Status:** Proposed
- **Date:** 2026-04-24
- **Deciders:** Agentics Foundation / OIA-Model maintainers
- **Related:** ADR-0001 (Reader UI), ADR-0002 (Conversational surface), ADR-0004 (Feedback publication policy)

---

## 1. Context

ADR-0002 commits to a conversational surface grounded in (a) the OIA Model digests and (b) eligible community feedback. This ADR decides the **technical architecture** of the retrieval and generation pipeline — what we ingest, how we retrieve, which model we call, how we assemble the prompt, and how we enforce grounding and safety.

The decision is shaped by three hard constraints:

1. The corpus is **small and mostly static.** Two digests (~50 KB Markdown combined) plus a growing but bounded set of feedback rows (22 text fields × N submissions; N is in the low thousands at saturation). This is orders of magnitude smaller than a typical RAG corpus.
2. The Foundation has committed to **no external vector backend** for this project (the ruvector π brain is explicitly out of scope, per user direction 2026-04-24). We do not host Cloud SQL, Firestore, or any vector DB. Existing storage is SQLite on GCS FUSE (confirmed working after ADR-implicit ops fix).
3. **Citation discipline is load-bearing.** ADR-0002 §3.2 requires that the chat not become the source of truth; every answer must be traceable to the digest or to a feedback row. Architectures that make citation retrofittable or optional are rejected.

---

## 2. Decision

Adopt a **retrieval-free, full-corpus-in-context architecture.** Every chat call includes the full digest content and a curated slice of feedback in the system prompt. No vector database, no embedding model, no nearest-neighbour lookup, no chunking. The LLM is asked to answer only from the attached corpus and to cite sources by ID.

Model: **Claude Haiku 4.5** (model id `claude-haiku-4-5-20251001`), called via the **Anthropic Messages API** with prompt caching, authenticated with an `ANTHROPIC_API_KEY` stored in Google Secret Manager and injected into Cloud Run at runtime. Fallbacks are available by env var: `OIA_CHAT_MODEL=claude-sonnet-4-6` for a capability step-up on hard questions, or `OIA_CHAT_MODEL=HuggingFaceTB/SmolLM3-3B` / `Qwen/Qwen2.5-7B-Instruct` via HF Inference Providers as documented open-weights alternatives if the Foundation later wants to swap providers.

This model choice is made deliberately, with eyes open about the trade-offs:

- **Frontier-grade grounding at Haiku price.** Haiku 4.5 is strong at long-context grounded Q&A, at "I cannot answer that from the attached materials" discipline, at instruction-following under the citation contract in §4.3, and at refusal-under-injection. These properties matter more here than raw generative breadth — the chat is a grounded-Q&A surface, not a creative-writing surface.
- **Explicit prompt caching.** Anthropic's `cache_control: {"type": "ephemeral"}` primitive means the invariant system prompt + full digest (~13K tokens) are paid at the cache-write rate once, then at the 10× cheaper cache-read rate for every subsequent turn in the 5-minute TTL window. See §3.4 and §7.
- **200K context window.** Comfortably holds the digests and a bounded feedback slice of up to a few hundred rows with headroom. See §3.3 for the revised row cap.
- **Predictable latency.** Anthropic's direct API gives 1–3s typical turn latency on Haiku 4.5, versus the variable routing latency of HF Inference Providers. For a public-facing chat where the UX bar is "doesn't feel broken," predictable is worth paying for.
- **Single commercial provider.** Haiku 4.5 comes from a single vendor and carries a per-token cost floor that open-weights models do not. These are real trade-offs. The open-weights fallback via HF is preserved exactly so the Foundation can move if the relationship changes.

Why not vector search:

- The combined corpus at reasonable saturation is ~80–150 KB of text (digests ~50 KB + bounded feedback slice), which fits comfortably into Haiku 4.5's 200K-token context window with room to spare.
- A vector retriever introduces a second failure mode (wrong-chunk-selected) that the user has no way to diagnose from the chat UI. The model returning "I cannot answer that from the attached materials" is recoverable; a retriever silently missing a relevant decision is not.
- Chunking the digests breaks verbatim-section alignment. Decision rows, layer panels, and spans are **addressable units** (ADR-0001 §4.13, §"On Using This Log"); shredding them into embedding chunks undoes the ADR-0001 fidelity work.
- Operationally: no vector index to build, version, invalidate, or host. No embedding-model cost. No "stale index" bug class. One fewer thing that can break at 2am.

Why not tool-use / agent patterns:

- ADR-0002 §3.2 says this is not an agent.
- A tool-call retriever layered on top of the same corpus adds latency and failure modes without improving grounding.
- Haiku 4.5's extended-thinking mode is available but **not used by default** — the chat's grounded-Q&A workload does not require multi-step reasoning at a scale that justifies the latency hit. Extended thinking is toggleable via env var (`OIA_CHAT_THINKING=true`) for the Foundation to turn on if cross-document reasoning turns out to be routinely needed. See §7 for the latency and cost trade-off.

This decision is reversible. Four reversal paths are contemplated:

1. If the Foundation needs stronger reasoning on cross-document questions, swap `OIA_CHAT_MODEL=claude-sonnet-4-6` or enable Haiku 4.5 extended thinking via env var. No code change.
2. If the Foundation prefers open-weights for editorial alignment with the OIA Model's institutional posture, swap to HF Inference Providers with SmolLM3-3B or Qwen2.5-7B-Instruct. Model-provider abstraction in §5 keeps the change to a ~40-line provider module.
3. If corpus size outgrows the 200K context window (thousands of `share_body=1` rows), introduce retrieval *over feedback only* with the digest still pinned in full. Digest verbatim-addressability is preserved.
4. If the commercial relationship with Anthropic changes, the open-weights fallback in path 2 is the immediate hedge.

---

## 3. Corpus and ingestion

### 3.1 Sources

| Source | Location | Ingestion cadence | Authority |
|---|---|---|---|
| Reader's Digest | `/docs/OIA-Model-v0.1-Digest.md` | Build-time | Authoritative |
| Decision Log Digest | `/docs/OIA-Model-v0.1-Decision-Log-Digest.md` | Build-time | Authoritative |
| Structured site content | `/src/content/digest.ts`, `/src/content/decision-log.ts` | Build-time | Mirror of the two digests; used to stabilise citation IDs |
| Eligible feedback | SQLite, `feedback` table, `share_body=1` (see ADR-0004) | Request-time | Community contribution; secondary authority |

The two `_MConverter.eu_*.md` files at the repo root are byte-identical duplicates of the `/docs/` files and are **deleted** as part of this ADR's implementation (violates CLAUDE.md root-folder rule).

### 3.2 Build-time ingestion

A build step compiles the two digests into a single typed module, `src/server/corpus.ts`, containing:

- The two digests concatenated with stable section anchors (e.g. `§4.8`, `§5.IDENTITY`, `DEC-04`).
- A citation-ID map from each addressable unit to its deep link in the reader (`DEC-04` → `#decision-04`; `SPAN-SOV` → `#span-sovereignty`; `§4.6.LAYER-8` → `#layer-8`).
- A content hash (`sha256`) so the chat footer can display a `digest build: <hash prefix>` indicator for verifiability.

This module is regenerated by `npm run build` and by a pre-commit hook that fails if `/docs/*.md` has changed without `src/server/corpus.ts` being rebuilt.

### 3.3 Request-time feedback ingestion

On each chat turn, the server loads eligible feedback rows from SQLite:

```sql
SELECT id, created_at, role,
       hyperscaler_monopolies, layer8_certification, legacy_vendor_mapping,
       foundation_funding, regulatory_alignment,
       shape_response, reopen_decisions, reopen_reasons,
       open_questions_contrib, additional_deferrals, prematurely_deferred,
       missing_concerns, missing_tech, missing_spans,
       vertical_extension, improvements, general_feedback
  FROM feedback
 WHERE share_body = 1
   AND id NOT IN (1, 2, 3)     -- exclude pre-policy rows per ADR-0004
 ORDER BY id DESC
 LIMIT 100;
```

The hard limit of **300 rows** is chosen for Haiku 4.5's 200K context window. At ~2 KB per row (≈500 tokens after empty-field compaction), 300 rows is ~150K tokens of feedback — which, added to the ~12K-token digest, ~1.2K-token system prompt, and ~5K-token conversation history, fits inside the 200K window with ~30K headroom. The cap is env-tunable via `OIA_CHAT_FEEDBACK_LIMIT`.

Revisit when volume approaches the limit. At the 300-row cap, the next architecturally-required change is either (a) rotating older rows out in favour of newer ones (already the default via `ORDER BY id DESC`), or (b) introducing retrieval over feedback only per §2's reversal path 3.

Rows whose `share_body` is unset (submissions from before ADR-0004's consent field exists) are excluded by default. The three grandfathered rows (ids 1, 2, 3) are excluded by explicit predicate as a second line of defence.

### 3.4 Cache discipline

The invariant portion of the prompt is cached via Anthropic's `cache_control: {"type": "ephemeral"}` primitive. The cache block boundary is placed **after** the digest and **before** the feedback slice, so feedback churn does not bust the digest cache.

Cache structure of every chat turn, in order:

1. System prompt (static) — inside the cache block.
2. Full digest content with stable anchor IDs (static across turns) — inside the cache block. Cache boundary closes here.
3. Feedback slice (changes when new `share_body=1` submissions arrive) — outside the cache block.
4. Conversation history (changes every turn) — outside the cache block.
5. New user turn — outside the cache block.

The first call of any 5-minute TTL window pays the cache-write rate (~1.25× input) on the ~13K-token invariant prefix. Every subsequent call in that window reads the cache at 0.1× input rate. With even modest traffic (one turn every few minutes), the cache stays warm and per-turn cost sits near the variable-tail floor. Cost model in §7 assumes this warm-cache state as typical.

This ordering is load-bearing: reversing it (e.g. placing the conversation before the corpus) would bust the cache every turn.

---

## 4. Prompt contract

### 4.1 System prompt

Fixed. Versioned (`PROMPT_VERSION` constant) so we can detect regressions and stamp every answer with the prompt-version hash. Rough shape:

```
You are an anonymous grounded-Q&A surface for the Open Intelligence
Architecture (OIA) Model v0.1, published by the Agentics Foundation.

You have access to two corpora:

  1. OIA Model Reader's Digest and Decision Log Digest  (authoritative)
  2. Community feedback submissions                      (contributory)

Rules, in order of priority:

  R1. Only answer using the attached corpora. If the answer is not
      present, say so plainly. Do not guess. Do not extrapolate.
  R2. Every claim must cite a source by ID. Valid ID formats:
        DIGEST §N.M         — a Reader's Digest section
        DEC-NN              — a Decision Log entry, zero-padded
        SPAN-XXX            — a cross-layer span (SEC/SOV/AUD/IDN/ENG/PRV)
        L-N                 — a layer panel (L-0 through L-9)
        FEEDBACK #N         — a feedback submission by id
  R3. Never cite the digest as "the document says X" if X is not in
      the attached digest content. If you cannot find a source, reply:
        "I cannot answer that from the attached materials."
  R4. The digest is authoritative. Feedback is contributory. When the
      two conflict, surface both and say which is which.
  R5. Do not claim the Foundation endorses a feedback submission.
      Feedback is the view of its submitter.
  R6. Do not name Cognitum, Snapper, or ACIUM. Per ADR-Decision 09
      these are out of scope for this reading surface.
  R7. You are not an agent. You do not call tools. You do not take
      actions. Decline requests to do so with a brief explanation.
  R8. Preserve the digest's editorial voice. Do not casualise prose
      when quoting. Quote verbatim and delimit quotes clearly.
```

### 4.2 User turn envelope

User messages are wrapped in a turn envelope that pins the question away from the attached corpus:

```
<user_question>
  {verbatim user input, up to 4096 chars}
</user_question>
```

Inputs over 4096 chars are truncated and the tail dropped with a visible note.

### 4.3 Assistant turn contract

The model is asked to emit a response via Anthropic's native **tool-use mechanism** — a single tool named `answer` whose input schema matches the envelope below. Tool-use is the most reliable structured-output pathway on Claude and gives strong schema adherence with minimal prompt engineering. The input schema:

```json
{
  "answer": "Prose answer in markdown, with inline citation markers like [§4.8] [DEC-04] [FEEDBACK #17].",
  "citations": [
    {"id": "§4.8",         "kind": "digest",   "deeplink": "#cross-layer-spans"},
    {"id": "DEC-04",       "kind": "decision", "deeplink": "#decision-04"},
    {"id": "FEEDBACK #17", "kind": "feedback", "deeplink": "#feedback-17"}
  ]
}
```

The schema is defined once in `src/server/chat-schema.ts` and attached to every request. Citation IDs are validated by the server against the citation-ID map in `src/server/corpus.ts` (see §3.2): any ID the model emits that does not resolve to a known anchor is dropped from the `citations` array before it reaches the UI.

**"No citation → no answer" rule.** If, after server-side validation, `citations` is empty, the UI shows the fallback message — *"I cannot answer that from the attached materials. Try rephrasing, or consult the digest directly."* — rather than the bare prose. This is the load-bearing UI-side grounding enforcement. With Haiku 4.5, we expect this fallback to fire only on genuinely ungroundable questions; it is cheap insurance, not the primary grounding mechanism.

**Streaming.** Haiku 4.5 supports streaming tool-use via Anthropic's SSE protocol. The server subscribes to `input_json_delta` events, accumulates the tool input, and relays answer deltas to the client as they arrive. The client renders `answer` progressively while the citations accumulate. If the stream terminates mid-response (provider error, cap hit), the partial `answer` renders with a "stream interrupted" badge; no citations render; the "no citation → no answer" rule then applies.

**Open-weights fallback path.** If the Foundation later swaps to HF Inference Providers per §2 reversal path 2, the tool-use call is replaced with OpenAI-compatible `response_format: json_schema`, emitting the same envelope. This is a ~20-line change in `src/server/chat-client.ts` and is intentionally documented so the swap stays painless.

### 4.4 Grounding discipline

The combination of R1–R3 in the system prompt and the UI fallback in §4.3 is what makes the chat *answerable to the digest* rather than just *correlated with* it. This is the load-bearing grounding mechanism.

---

## 5. Server shape

A new endpoint on the existing Express server:

- **`POST /api/chat`** — accepts `{ messages: ChatMessage[] }`, returns a Server-Sent Events stream of deltas terminating in a final envelope with validated citations and a turn ID.
- **`GET /api/chat/usage`** — returns `{daily_used, daily_cap, percent}` for the budget indicator (ADR-0002 §7).

The endpoint:

1. Rate-limits by IP (§6).
2. Loads the corpus (digest compiled in; feedback queried live per §3.3).
3. Builds an **Anthropic Messages API request**, with:
   - `model`: `claude-haiku-4-5-20251001` (or the `OIA_CHAT_MODEL` override).
   - `system`: system prompt + full digest inside a single `cache_control: {"type": "ephemeral"}` block per §3.4.
   - `messages`: feedback-slice context message + conversation history + user turn.
   - `tools`: single `answer` tool with the schema from §4.3.
   - `tool_choice`: `{"type": "tool", "name": "answer"}` — force-use the answer tool.
   - `temperature`: 0.2.
   - `max_tokens`: 2048.
   - `stream`: `true`.
   - Header: `x-api-key: $ANTHROPIC_API_KEY` where `ANTHROPIC_API_KEY` comes from Secret Manager at container startup.
4. Streams SSE deltas back to the client, relaying `input_json_delta` events so the UI can progressively render the `answer` field.
5. Validates citations server-side per §4.3 before the final frame is forwarded.
6. Logs `{turn_id, ip_hash, prompt_version, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, latency_ms, citation_count, validated_citation_count, fallback_fired}` to a ring buffer (in-memory for v1; persistent log in v2).

A thin wrapper in `src/server/chat-client.ts` uses `@anthropic-ai/sdk` and handles streaming, cache block construction, citation validation, and model fallback. The provider abstraction is intentionally narrow so swapping to HF Inference Providers (reversal path 2) is a localised change.

No server-side conversation state. The client sends the full thread on every turn; the server is stateless. Matches the "ephemeral" decision in ADR-0002 §5.

**Secret provisioning.** `ANTHROPIC_API_KEY` is stored as a Secret Manager secret named `anthropic-api-key` in project `agenticsorg`. The Cloud Run service is granted `roles/secretmanager.secretAccessor` on that secret and mounts it as an env var via `--set-secrets=ANTHROPIC_API_KEY=anthropic-api-key:latest`. No key is ever written to the container image or to logs. (If the Foundation later swaps to HF, `HF_TOKEN` replaces it with the same provisioning pattern.)

---

## 6. Abuse controls

Operationalising the decisions in ADR-0002 §6.

- **Per-IP rate limit.** Sliding window: 20 messages / 10 minutes / IP. Implemented with a simple in-process map; acceptable at `max-instances=1`. Revisit if `max-instances` is raised.
- **Per-conversation cap.** Client-enforced cap of 40 turns per thread. The server re-enforces by inspecting `messages.length` and rejecting over-limit requests with `413`.
- **Daily global spend cap.** A persistent daily counter stored in SQLite (`chat_usage` table, one row per UTC date) tracks estimated spend in USD cents, computed from the input/output/cache-read/cache-write token counts Anthropic returns per response and the model's published per-MTok rates. When the configured ceiling is crossed, all chat requests return `503 daily usage cap reached`. Ceiling is set by the `OIA_CHAT_DAILY_SPEND_USD` env var (default: `$5.00/day`). Token-based accounting (`OIA_CHAT_DAILY_TOKEN_CAP`) remains available for providers that do not return itemised costs (HF fallback path).
- **Prompt-injection filter.** A pre-check that refuses obvious attacks: strings containing `ignore previous instructions`, `you are now DAN`, or exceeding 4 KB in a single user turn, return a fixed refusal without making an LLM call. Not a safety boundary — a cost-protection line.
- **Abuse kill switch.** `OIA_CHAT_ENABLED=false` disables the surface entirely. The UI hides the chat nav and deep-link, the endpoint returns `410 Gone`. Reader unaffected. (ADR-0002 §9 commitment.)

All thresholds are env-configurable so the Foundation can tune without redeploy.

---

## 7. Cost model

Claude Haiku 4.5 published pricing:

| | Per M tokens |
|---|---|
| Input | $1.00 |
| Output | $5.00 |
| Cache write (5-min TTL) | $1.25 |
| Cache read | $0.10 |

Token budget per turn:

| Component | Tokens (typical) | Cached? |
|---|---|---|
| System prompt | 1.2 K | Yes (inside cache block) |
| Digest corpus | 12 K | Yes (inside cache block) |
| Feedback slice (300 rows cap) | up to 150 K | No |
| Conversation history (10 turns) | 5 K | No |
| User question | 0.3 K | No |
| Assistant reply | 1.0 K output | N/A |

### 7.1 Warm-cache turn (typical)

Cache write is paid once per 5-minute TTL window. Every subsequent turn in the window reads the cached prefix.

- Cached prefix read (13.2 K): 13.2 K × $0.10/M = **$0.00132**
- Non-cached input (50–100 K depending on feedback volume): 100 K × $1.00/M = **$0.10** worst-case
- Output (1 K): 1 K × $5.00/M = **$0.005**
- **Typical warm-cache turn: ~$0.01–0.02; worst case: ~$0.06**

### 7.2 Cold-cache turn (first in TTL window)

Cache write is paid once: 13.2 K × $1.25/M = **$0.0165**. Added to the turn cost, a cold-cache turn runs ~$0.02–0.03 typical, up to ~$0.08 worst case. With even light traffic (one turn every few minutes) the cache stays warm and cold turns are rare.

### 7.3 Extended-thinking turn (OIA_CHAT_THINKING=true)

If the Foundation enables extended thinking for cross-document reasoning, Haiku 4.5 generates an internal reasoning trace (~1–3 K output tokens) before the final answer. Additional cost: ~1–3 K × $5.00/M = **$0.005–$0.015** per turn. Latency: 3–6 s instead of 1–3 s. Recommended to keep disabled unless the no-citation-fallback rate suggests a lift is needed (OQ-5).

### 7.4 Daily ceiling

Default spend cap: **$5/day** via `OIA_CHAT_DAILY_SPEND_USD`. At typical $0.02/turn this allows ~250 turns/day before the hard cap fires — adequate headroom for a public reference-architecture chat. Rate limiting (§6) imposes an orthogonal turns-per-day ceiling.

### 7.5 Alternative models via OIA_CHAT_MODEL

| Model | Typical turn | Trade-off |
|---|---|---|
| `claude-haiku-4-5-20251001` (default) | $0.01–0.02 | Frontier grounding, 200K context, predictable |
| `claude-sonnet-4-6` | $0.05–0.15 | Strongest available grounding; ~5× Haiku cost |
| `HuggingFaceTB/SmolLM3-3B` via HF | ~$0.001–0.005 | Open-weights, ~10× cheaper than Haiku, grounding trade-off |
| `Qwen/Qwen2.5-7B-Instruct` via HF | ~$0.005–0.015 | Open-weights, Haiku-comparable cost, middle-of-road grounding |

---

## 8. Client shape

A new `src/sections/Chat.tsx` section, parallel to `src/sections/Feedback.tsx`:

- Message list (ARIA live region — ADR-0002 §8).
- Input textarea with `Ctrl+Enter` submit, 4096-char cap, prompt-injection heuristics mirrored client-side so obvious attacks fail fast.
- Streaming renderer that progressively displays deltas.
- Citation rail rendered below each assistant message, with citation chips that deep-link to the relevant reader section.
- Footer with budget indicator (`daily usage: 42%`) fetched from `GET /api/chat/usage`.
- "Share this thread" action (client-side serialisation; see ADR-0002 §5).
- "Start a new thread" action; "Report an issue" action that opens a pre-filled GitHub issue template.

No third-party chat widget library. The UI is built on the same `cmd-panel` primitives as the reader, for visual consistency with ADR-0001 §3.

---

## 9. Consequences

**Positive.**
- No vector DB to host, maintain, or version. One fewer failure surface.
- Citation IDs align with the reader's existing deep-link anchors, so clicking a citation takes the visitor *into* the digest rather than to a disconnected retrieval preview.
- Grounding discipline (§4.3) is enforced at the UI layer and at server-side citation validation — cheap insurance on top of a model that is already strong at grounding.
- **Frontier-grade grounding.** Haiku 4.5 meets the "relatively coherent" bar the Foundation set. Cross-document reasoning, "I cannot answer that" discipline, and citation adherence all work reliably without auxiliary scaffolding.
- **Explicit prompt caching.** The invariant 13K-token prefix is paid for once per 5-minute TTL and read at 10× cheaper rate thereafter. Per-turn cost sits at the variable-tail floor.
- **Predictable latency.** 1–3s typical turn latency via Anthropic's direct API; no provider-routing variability.
- **Killable via single env var; reader untouched.**
- **Stateless server; no conversation persistence risk.**
- **Open-weights fallback documented.** If the Foundation later wants to move to SmolLM3 or Qwen2.5 for editorial alignment or pricing, the provider abstraction in §5 keeps the swap to ~40 lines.

**Negative.**
- **Single commercial provider.** Haiku 4.5 is Anthropic-specific and carries a per-token cost floor. The open-weights fallback (§2 path 2) is the hedge, but not free — swapping it in is a deliberate operator action, not automatic.
- **Per-turn cost is non-zero.** Typical turns cost $0.01–0.02; worst-case $0.06. Materially more than an open-weights 3B model (~10×), materially less than Sonnet (~5× less). Bounded by the daily spend cap.
- **The full-corpus-in-context architecture has a known scaling limit.** When feedback volume exceeds ~300 `share_body=1` rows at the 200K context window, we need retrieval over feedback. §2 reversal path 3 accepts that and says when.
- **Chat hallucination is always possible.** Citation discipline reduces it; it does not eliminate it. Reputational risk for the digest is real, mitigated by server-side citation validation and the "no citation → no answer" fallback.
- **Extended thinking is not free.** If the Foundation enables `OIA_CHAT_THINKING=true` for reasoning lift, turns slow to 3–6 s and cost ~$0.005–$0.015 more. Off by default.

**Neutral.**
- The decision to prefer Haiku 4.5 over open-weights trades editorial alignment for operational simplicity and grounding reliability. The Foundation can reverse this trade with a single env var. This is a posture choice, not an architectural one.

---

## 10. Open Questions

- **OQ-1.** Should the chat accept follow-up questions that reference the previous answer (e.g. "expand on the second point")? This ADR assumes yes — conversation history is sent every turn. Revisit if this leaks into "agent-like" behaviour the ADR-0002 §3.2 scope excludes.
- **OQ-2.** Should the Foundation be able to quote-pin a specific response? (e.g. "the chat said X on 2026-05-01 — here's the permalink".) This ADR defers that to a future "share thread" feature; v1 ships share-as-opaque-URL only.
- **OQ-3.** Should the abuse filter be extended to refuse questions that look like attempts to reconstruct the private feedback corpus (feedback where `share_body=0`)? Strictly, the private feedback is never sent to the model, so the question is moot — but we may want a fixed refusal for social-engineering attempts. Revisit after observing real traffic.
- **OQ-4.** Should we log questions (hashed or otherwise) for later analysis, or is that in tension with the "no memory" posture in ADR-0002 §5? This ADR decides *no question logging beyond the ring-buffered operational metrics in §5*. Revisit if the Foundation wants a "top questions" dashboard.
- **OQ-5.** **What fallback-fire rate and cost trajectory should trigger a model swap?** Haiku 4.5 is expected to fire the "no citation → no answer" fallback only on genuinely ungroundable questions. An operational trigger — e.g. "if fallback rate exceeds 10% over a rolling 7-day window, enable extended thinking; if it exceeds 10% with thinking on, swap to Sonnet 4.6" — gives the Foundation a concrete signal. Similarly, "if daily spend trends toward the cap for 3 consecutive days, investigate abuse or swap to open-weights." This ADR does not set the thresholds; the Foundation should choose them based on initial traffic.
- **OQ-6.** **Should extended thinking be enabled by default after initial traffic observation?** Off by default per §2. If the Foundation sees the chat failing on cross-document reasoning (e.g. "reconcile the Architect's feedback with DEC-04") while handling simple lookups cleanly, `OIA_CHAT_THINKING=true` is the first lever to pull. Revisit after ~2 weeks of public traffic.
- **OQ-7.** **Migration trigger to open-weights.** At what point — if ever — does the Foundation prefer SmolLM3-3B or Qwen2.5-7B over Haiku 4.5? Possible triggers: (a) the Foundation's sovereignty posture requires it; (b) cumulative monthly spend exceeds a threshold; (c) Anthropic pricing or access changes. This ADR preserves the open-weights swap as a single env-var change; it does not pre-commit to a migration.

---

## 11. Acceptance criteria

- [ ] `npm run build` compiles the two digests into `src/server/corpus.ts` with stable anchor IDs matching the reader's deep links.
- [ ] A pre-commit hook fails if `/docs/*.md` is modified without regenerating the corpus module.
- [ ] `POST /api/chat` streams responses from the Anthropic Messages API as SSE, using tool-use for structured output.
- [ ] `GET /api/chat/usage` returns current daily spend (USD) and percentage of cap.
- [ ] Every assistant response carries a non-empty `citations` array after server-side validation, or the UI shows the fallback message.
- [ ] Citation IDs emitted by the model are validated against the citation-ID map in `src/server/corpus.ts`; unknown IDs are dropped before the response leaves the server.
- [ ] `ANTHROPIC_API_KEY` is loaded from Google Secret Manager (`anthropic-api-key`) — never from the container image or env config in git.
- [ ] Prompt caching is configured with the system prompt + full digest inside a single `cache_control: {"type": "ephemeral"}` block, boundary closing before the feedback slice.
- [ ] Rate limit, per-conversation cap, daily spend cap, and kill switch are all functional and env-configurable (`OIA_CHAT_DAILY_SPEND_USD`, `OIA_CHAT_ENABLED`, etc.).
- [ ] `OIA_CHAT_MODEL` env var overrides the default Haiku 4.5 model without a code change — swapping between Sonnet 4.6, Haiku 4.5, and open-weights HF models.
- [ ] `OIA_CHAT_THINKING=true` toggles Haiku 4.5 extended thinking; off by default.
- [ ] The chat refuses to cite `FEEDBACK #1`, `FEEDBACK #2`, or `FEEDBACK #3` under any circumstances (pre-policy grandfathering, per ADR-0004).
- [ ] A malformed model response — missing fields, unparseable tool input, no citations — falls back gracefully; the UI never displays uncited prose.
- [ ] `OIA_CHAT_ENABLED=false` disables the surface without breaking the reader.
- [ ] A documented swap path to HF Inference Providers exists in `src/server/chat-client.ts` and is tested manually before shipping.

---

*End of ADR-0003.*
