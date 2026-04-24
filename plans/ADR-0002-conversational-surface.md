# ADR-0002 — Conversational Surface (Chat) as a Sibling of the Reader

- **Status:** Proposed
- **Date:** 2026-04-24
- **Deciders:** Agentics Foundation / OIA-Model maintainers
- **Supersedes:** —
- **Superseded by:** —
- **Related:** ADR-0001 (Reader UI), ADR-0003 (RAG architecture), ADR-0004 (Feedback publication policy)

---

## 1. Context

ADR-0001 shipped the **OIA Model Reader** — a single-page reading surface for the Reader's Digest and the Decision Log Digest. The reader is one-way: the Foundation publishes, reviewers read, and (per ADR-0001 §4 Feedback) submit structured form responses. Three feedback rows have been collected since the feedback form went live (2026-04-22 through 2026-04-24).

The Foundation now requires a **conversational surface** that lets visitors ask questions grounded in three corpora:

1. The OIA Model digests (already in `/docs/` and rendered by the reader).
2. Community feedback submissions collected through the existing form — *excluding the three rows collected before the publication-consent policy in ADR-0004 existed*.

This is a meaningful product shift. The reader is a **document**; a chat UI is a **conversation**. They have different commitments, different failure modes, and different audiences. This ADR decides how the chat relates to the reader — not the technical architecture of retrieval or generation (that is ADR-0003), nor the feedback-publication policy (that is ADR-0004).

---

## 2. Decision

Adopt **Option A — Reader with chat as a sibling surface**. The Reader remains the authoritative reading surface of the OIA Model, with verbatim fidelity to the digests as committed in ADR-0001 §7. A new Chat surface is added alongside, as one more top-level section in the same SPA, reachable from:

- a new `CHAT` chip in the top nav (between `DIGEST` and `DECISIONS`),
- the command palette (`/` key → `Ask about the OIA Model`),
- an inline "Ask about this section" affordance on each digest section header.

The reader is preserved unchanged. The chat is additive. Neither surface replaces the other.

**Rejected alternatives:**

- **Option B — Chat as primary landing page.** Rejected because putting a conversational surface in front of the digest inverts the product's posture. Architects and regulators landing on `oia.agentics.org` expect a reference architecture document; a chatbot first impression cuts against the care that went into the digest's editorial voice (ADR-Decision 08) and the digest's own instruction that it be "readable as a whole in a single sitting" (§"On Reading This Digest").
- **Option C — Chat replaces the reader.** Rejected because it directly violates the hard acceptance criterion in ADR-0001 §1: *"The UI must reflect these documents exactly without leaving out any steps whatsoever."* A chat surface cannot preserve the structural shape of nine layers, six cross-layer spans, and eleven decisions. It cannot deep-link decisions by number, which Decision Log §"On Using This Log" explicitly requires. A chat-only surface would be a regression on the central thesis of ADR-0001.

---

## 3. What the chat is, and what it isn't

### 3.1 It is

- A **grounded Q&A surface** over the OIA Model digests and eligible community feedback. Every answer cites the specific digest section, decision number, span, or feedback submission it draws from.
- A **stateless conversation**: each session is ephemeral unless the user explicitly saves/shares it. No user account, no memory across sessions, no cross-user learning.
- A **read-only derivative** of the digest and feedback. The chat cannot modify the digest. The chat cannot submit feedback on the user's behalf. The chat cannot call tools or take actions on external systems.
- A **convenience for engaged visitors** — reviewers who want to ask "what does the digest say about Layer 8 governance?" without scrolling, or "has anyone else raised this concern?" against the feedback corpus.

### 3.2 It isn't

- Not an **agent**. It does not take actions in the world.
- Not **"Claude for the OIA Model"** or any other branded assistant. It is an anonymous grounded-Q&A surface on the Foundation's site. Per ADR-Decision 09, no Cognitum/Snapper/ACIUM branding appears in the chat UI.
- Not a **memory system**. Conversations are not persisted server-side by default; see §5 below.
- Not **the source of truth**. The digest is the source of truth. Where the chat disagrees with the digest, the digest wins. The UI makes this explicit.
- Not **a way to bypass the feedback form**. Visitors who want to push back on a decision still do so through the form; the chat points them to it.

---

## 4. URL surface and information architecture

- **`#chat`** — the chat surface itself, rendered as one more top-level section within the existing SPA. Structurally a full-page panel; reachable via deep link.
- **`#chat?q=<question>`** — a deep-linkable initial question. Useful for "Ask about this section" affordances on the digest panels: clicking on the Layer 8 panel's "Ask" affordance opens the chat pre-filled with a prompt scoped to Layer 8.
- **Top nav.** `DIGEST · LAYERS · SPANS · DECISIONS · FEEDBACK · CHAT` — Chat is rightmost, reachable without leaving the SPA.
- **Command palette.** `/` opens the existing palette; a new entry `Ask the OIA Model…` routes to `#chat` with focus in the input.
- **Section affordance.** Each `cmd-panel` header in the reader gets a subtle right-aligned `ASK →` link that deep-links to `#chat?q=<section-scoped-prompt>`. Opt-in per section type (not every panel needs it — masthead and colophon do not).

---

## 5. Conversation persistence

Default: **ephemeral**. Conversations live in the browser tab and are lost on close. No server-side storage.

**Optional, explicit persistence:** a "Share this thread" action serialises the current conversation to a signed URL (client-side serialisation; no server storage). Sharing is off by default and requires a deliberate user click. A shared link is read-only — opening it shows the thread; continuing to chat starts a new local conversation.

No account system. No cross-device sync. No server-side transcript history in v1. This is decided deliberately to:

- Keep PII exposure minimal (users who type personal details into the chat don't thereby create a server-side record).
- Avoid the regulatory weight that comes with storing user queries (EU AI Act Article 50 transparency obligations still apply to generation, but are lighter without storage).
- Match the reader's "read and leave" posture.

Persistence can be revisited in a later ADR if the Foundation wants moderation dashboards or a corpus of good threads.

---

## 6. Public access, rate limits, and the cost ceiling

The chat is **public** — anyone visiting `oia.agentics.org` can use it, no login. This carries cost risk: every message triggers an LLM call, and a malicious or merely enthusiastic visitor could burn meaningful $ if unchecked.

Operational controls (technical detail in ADR-0003 §7):

- **Per-IP rate limit**: e.g. 20 messages / 10 minutes / IP. Limit tunable from env vars.
- **Per-conversation cap**: e.g. 40 turns per thread; thereafter the UI asks the user to start a new thread. Protects against infinite loops and context-window cost.
- **Daily global cap**: a hard spend ceiling implemented as a daily token counter; when hit, the chat surface returns `503 rate limit reached — try again after UTC midnight`. Prevents a bad actor from exhausting the month's budget in one night.
- **Abuse filter**: a lightweight input classifier refuses obvious prompt-injection and jailbreak attempts with a fixed refusal message. Not a safety system — a first line that keeps costs down.
- **Visible budget indicator**: an unobtrusive mono-font line in the chat footer shows `daily usage: 42% of cap` so the Foundation has immediate in-situ signal that something's wrong.

If the chat surface becomes a cost problem, the Foundation can disable it by setting a single env var; the reader is unaffected (Option A's explicit benefit).

---

## 7. Visual language and affordances

The chat surface reuses the existing telemetry-console design language from ADR-0001 §3:

- `cmd-panel` frame for the conversation area; dark canvas; emerald / orange / indigo / red accent palette.
- Monospace for system labels (`USER`, `MODEL`, `CITATION`, `T+0m12s`).
- Body prose set in the same stack as the digest, for visual continuity.
- Each AI message renders with a **citation rail** at the bottom listing the sources it drew from, formatted as log rows: `DIGEST §4.8 / DEC-04 / FEEDBACK #5`. Clicking a citation scrolls the underlying digest panel into view (same-tab) or opens the feedback panel at the cited row.
- Typing indicator uses the radar-sweep ornament from the reader (same primitive).
- `prefers-reduced-motion` honoured — typing indicator is static when reduced motion is set.

No floating chat widget overlaying the reader. The chat is its own full-width section. Mixing a floating bubble with the telemetry aesthetic looks cheap and undermines the product's posture.

---

## 8. Accessibility

- The chat message list is an ARIA live region so screen readers announce assistant responses as they stream in.
- Keyboard-only traversal: `Tab` into the message input, `Ctrl+Enter` submits, `Up/Down` cycles recent turns in the current thread, `Esc` leaves the chat section.
- Citation chips are keyboard-focusable and announce their target (e.g. "link — Digest section 4.8, Cross-Layer Spans").
- The "Share this thread" action announces its output (the URL) via a polite live region.
- Reduced-motion users get the non-animated typing indicator.

---

## 9. Consequences

**Positive.**
- The digest's fidelity commitment (ADR-0001 §7) is preserved unchanged.
- The chat is a **killable feature**: env-var-off without damaging the core product.
- The chat becomes a second way to engage with the OIA Model — lower barrier than reading 14 sections end-to-end, higher engagement than scrolling.
- Citation discipline (§7) keeps the chat answerable to the digest. Visitors can verify every claim the chat makes.
- The feedback corpus becomes **queryable** through natural language, without requiring raw-SQL-style tooling — which was the original motivation for this work.

**Negative.**
- Two surfaces to maintain. Visual drift risk if the chat diverges from the reader's design language over revisions.
- LLM calls cost money. The daily cap in §6 bounds the risk, but the risk is real.
- Chat hallucination is a reputational risk for the document. Citation discipline in ADR-0003 §4 mitigates but does not eliminate it.
- The chat creates an implicit expectation of freshness; if the digest is updated but the retrieval index lags, the chat answers become misleading. ADR-0003 §3 addresses ingestion.

**Neutral.**
- Top-bar navigation gains one item (`CHAT`). Layout continues to fit on mobile, though the top bar becomes the tightest it's been.

---

## 10. Open Questions

- **OQ-1.** Should the chat have a named persona ("Atlas," "the OIA Model assistant," …) or remain deliberately unnamed? This ADR decides *unnamed* — the chat speaks as "the OIA Model" without anthropomorphising. Revisit if user-testing shows this reads as cold.
- **OQ-2.** Should the "Ask about this section" affordance on each digest panel be enabled for **all** panels or only the structurally important ones (layers, spans, decisions)? This ADR decides *structurally important ones only*, to keep the reader uncluttered. Revisit after first feedback.
- **OQ-3.** Should the chat be able to draw on external references listed in the digest (OSI, NIST CSF, MITRE ATLAS, etc.) — or strictly the Foundation's own documents? This ADR decides *strictly the Foundation's own documents, plus eligible feedback*. External references are named in the digest but not ingested. Revisit if users repeatedly ask "what does NIST CSF actually say" and hit a refusal.
- **OQ-4.** Should shared-thread URLs carry a public gallery ("recent good threads from the community") or remain strictly private to the recipient of the link? This ADR decides *strictly private* for v1.

---

## 11. Acceptance criteria

The chat surface does not ship until each of the following can be checked off:

- [ ] A `CHAT` chip in the top nav scrolls / routes to `#chat`.
- [ ] A deep link `oia.agentics.org/#chat?q=Layer+8+governance` opens the chat with the question prefilled and focus in the input.
- [ ] Command palette entry `Ask the OIA Model…` works from every section.
- [ ] Every assistant message renders a citation rail with at least one citation (see ADR-0003 §4 for the "no citation → no answer" rule).
- [ ] The reader is unchanged. Every fidelity-checklist item from ADR-0001 §7 still passes.
- [ ] A daily budget indicator is visible in the chat footer.
- [ ] A single env var (`OIA_CHAT_ENABLED=false`) hides the chat surface entirely and leaves the reader fully functional.
- [ ] Reduced-motion users see the static typing indicator.
- [ ] The chat does not render any Cognitum / Snapper / ACIUM branding (ADR-Decision 09).

---

*End of ADR-0002.*
