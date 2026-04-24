# ADR-0004 — Feedback Publication Policy

- **Status:** Proposed
- **Date:** 2026-04-24
- **Deciders:** Agentics Foundation / OIA-Model maintainers
- **Related:** ADR-0001 (Reader UI), ADR-0002 (Conversational surface), ADR-0003 (RAG architecture)

---

## 1. Context

Until 2026-04-24, feedback submitted through `oia.agentics.org` was governed by a promise written into the form itself:

> "submissions are stored in a local SQLite database and are **never published without your consent**."

The consent mechanism was **binary and identity-only**: a single checkbox, `share_name`, controlling whether the submitter's name and organisation appear on a public listing. The bodies of the 22 response fields were treated as private-to-the-Foundation and were not exposed by any public endpoint (the public listing endpoint, `GET /api/feedback`, redacts identity and does not return bodies).

The Foundation has now decided (user direction 2026-04-24) to make response bodies **queryable through the chat surface** (ADR-0002, ADR-0003). This requires a policy upgrade:

- The identity-only consent model is insufficient. A respondent may want their body content shared publicly but not their name; or vice versa; or neither; or both. These are four distinct positions, and we must be able to record each.
- Three feedback rows exist from before this policy. Their submitters were not asked about body publication. The promise "never published without your consent" binds us: we cannot retroactively change the contract.

This ADR decides the consent model going forward, the handling of the three pre-policy rows, the PII posture, and how the chat treats the corpus.

---

## 2. Decision

### 2.1 Two-dimensional consent model

From this point forward, the feedback form collects **two independent consent signals**:

| Field | Type | Default | Meaning |
|---|---|---|---|
| `share_name` | boolean | `false` (off) | Publish the submitter's name and organisation on public surfaces (the existing public listing; the chat's citation rail). |
| `share_body` | boolean | `false` (off) | Publish the submitter's **response content** — the 22 text fields — on public surfaces (the chat's retrieval corpus). |

The two are **independent**. A submitter may consent to body publication while remaining anonymous (`share_body=1, share_name=0`) — the most common combination we expect. Or consent to identity disclosure while keeping responses private (`share_name=1, share_body=0`) — rare but conceivable. Or either both or neither.

Neither default is checked. **Non-consent is the default.** Submitters who skim the form will produce submissions that cannot be quoted by the chat or listed publicly.

### 2.2 Grandfathering the three pre-policy rows

Feedback rows with `id IN (1, 2, 3)` — the Architect submission (2026-04-22), the Foundation member submission (2026-04-24), and the persistence smoketest row — were submitted under the old contract, which did not ask about body publication. These rows are **excluded from the chat corpus** and from any future public-listing surface, unconditionally, by explicit predicate in the retrieval SQL (ADR-0003 §3.3) and by a defensive assertion in the chat server that refuses to emit a `FEEDBACK #1`, `#2`, or `#3` citation even if the model attempts to.

We do not retroactively apply the new consent fields to these rows. We do not ask their submitters for consent after the fact (both would require contact information we may not have and would set a precedent we do not want). They remain visible to the Foundation internally via the existing CLI (`npm run feedback:list`) but do not leave the database.

### 2.3 Database schema change

Add a column:

```sql
ALTER TABLE feedback ADD COLUMN share_body INTEGER NOT NULL DEFAULT 0;
```

`share_body` is nullable-safe via the `DEFAULT 0` clause so existing rows land in the safe state (excluded from publication). The existing `share_name` column is unchanged.

The server's `insertFeedback` and `FeedbackRow` interface are extended to include `share_body`. The public listing endpoint's projection is revisited in §2.4.

### 2.4 Public surfaces after this ADR

| Surface | Respects `share_name` | Respects `share_body` |
|---|---|---|
| `GET /api/feedback` (existing listing) | Yes — redacts name/org when `share_name=0` | Unchanged — no bodies are returned by this endpoint |
| Chat retrieval (ADR-0003) | Yes — citation rail omits name/org when `share_name=0` | **Yes — rows with `share_body=0` are never retrieved** |
| Chat citation format | `FEEDBACK #17 — Role: Architect` (identity-redacted) if `share_name=0`; `FEEDBACK #17 — Jane Doe, Acme Corp, Architect` if `share_name=1` | Citations only appear for rows where `share_body=1` |
| CLI tooling (`npm run feedback:list`) | No — Foundation-internal, full access | No — Foundation-internal, full access |

The Foundation retains full access to all rows via the server-side CLI and direct SQLite queries. The public surfaces are strictly filtered.

---

## 3. PII posture

Consent alone does not carry the PII obligation all the way. A submitter who checks `share_body` while typing their boss's personal email address into the `general_feedback` field has consented to publication of that email, but that is still a PII disclosure we want to mitigate.

### 3.1 Client-side warning

The revised form warns, at the moment the `share_body` checkbox is clicked, that response bodies may appear publicly via the chat, and that the submitter is responsible for not including information about third parties without permission. Plain language, not a wall of legalese.

### 3.2 Server-side heuristic

On submission, a lightweight heuristic scans body fields for patterns that look like:

- Email addresses other than the `email` field.
- Phone numbers.
- Bearer-token-ish strings (long base64 blobs).

If any are found **and** `share_body=1`, the server responds with a 200 but attaches an advisory flag: `{ ok: true, id, advisory: "possible PII detected in body fields — review stored submission" }`. The UI displays a follow-up dialog: *"We noticed something that looks like an email address in your response. If you'd like to withdraw this submission or resubmit with that redacted, click here."*

The heuristic is non-blocking. It does not reject the submission; it does not auto-redact. The Foundation gets a signal; the submitter gets a chance to self-correct. Heuristics false-positive constantly — we do not build policy on them alone.

### 3.3 Manual redaction path

The Foundation retains the ability to edit or delete individual feedback rows via the existing CLI (`npm run feedback:query -- "..."`). ADR-0003's chat corpus reads live from SQLite, so a redaction-then-update takes effect on the next chat turn with no redeploy. An `UPDATE feedback SET share_body = 0 WHERE id = N;` is the hard-kill path.

### 3.4 What this ADR does not do

- Does not promise automated PII redaction. The heuristic in §3.2 is best-effort.
- Does not implement a formal "right to be forgotten" workflow. The Foundation will honour withdrawal requests via email, executed manually; a formal workflow is deferred.
- Does not rotate or hash submitters' IP addresses (the server does not log them; rate-limit maps in ADR-0003 §6 hold an IP hash for ten minutes only).

---

## 4. Form copy changes

The Feedback section's current copy reads:

> "Submissions are stored in a local SQLite database and are never published without your consent."

This copy is **factually inaccurate** after this ADR lands: submissions may be published, if the submitter consents. The copy is rewritten to match the new model:

> "Submissions are stored in SQLite. Your identity and your response content are **published only with your explicit consent** — use the two checkboxes below. Without your consent, your submission is visible only to the Foundation and will not appear in public listings or in the Chat."

The two checkboxes are grouped under an "Sharing and consent" subsection, with the `share_name` checkbox slightly expanded and a new `share_body` checkbox added. The visual treatment mirrors the existing `share_name` checkbox (filled emerald/orange square on check) for consistency.

Concretely, the new checkbox label:

> **I consent to my response content being published.** My response bodies (the answers below) may be used by the Foundation to build publicly queryable tools, including the OIA Model Chat. You can withdraw this consent by emailing the Foundation — we will redact or delete your submission.

---

## 5. Server changes required

Concrete, minimal, orthogonal to the chat work:

1. Migration: `ALTER TABLE feedback ADD COLUMN share_body INTEGER NOT NULL DEFAULT 0;` — additive, idempotent (the existing `ensure()` pattern in `server/db.ts` handles this).
2. `FeedbackRow` and `insertFeedback` extended to include `share_body`.
3. `normaliseFeedback` in `server/handlers.ts` coerces the new field: `share_body: body.share_body === true || body.share_body === 1 ? 1 : 0`.
4. New PII-heuristic function; applied after successful insert; attaches the advisory flag to the response.
5. The `listFeedbackPublic` projection is unchanged (it already redacts identity per `share_name` and returns no bodies).

### Operator tooling

Two new scripts under `scripts/`:

- `scripts/feedback-redact.mjs <id>` — sets `share_body = 0` and `share_name = 0` on a single row. The hard-kill path referenced in §3.3.
- `scripts/feedback-audit.mjs` — runs the PII heuristic over every row and lists flagged rows with their PII matches, for periodic Foundation review.

---

## 6. Client changes required

In `src/sections/Feedback.tsx`:

1. Add `share_body: boolean` to `FormDraft`; default `false` in `INITIAL`.
2. Rewrite the Identity/Consent block's copy per §4.
3. Add the second checkbox, visually consistent with `share_name`.
4. On successful submission, if the server returns `advisory: "..."`, render a follow-up dialog with the copy from §3.2.
5. The `filled` count logic (`countFilled`) should ignore `share_body` the same way it ignores `share_name` (neither is a content field).

---

## 7. Consequences

**Positive.**
- The promise to the three pre-policy respondents is kept: their bodies are never published.
- The new consent model is explicit and defensible. A submitter who thoughtfully opts in has meaningfully opted in; a submitter who clicks through without reading is in the safe default.
- The two-dimensional model correctly separates identity from content, which the binary model conflated.
- The chat corpus is opt-in at the row level. The Foundation can quote a feedback row in the chat only if the submitter said so.
- Foundation operators retain the `share_body=0` hard-kill path for any row that needs to be pulled from the public corpus after submission (§3.3).

**Negative.**
- A default-off model means the chat's feedback corpus starts empty and grows only as engaged respondents opt in. The first month or two may produce a chat that honestly says "I cannot answer that from the attached materials" more than the Foundation would prefer. Accepted trade-off; the alternative is breaking a promise to past respondents.
- The PII heuristic will false-positive (someone's ORCID ID, a URL that looks like a bearer token). The UX is forgiving but adds a small follow-up step.
- The policy does not extend across providers. If the chat is ever moved to a provider that trains on prompts, this ADR must be revisited *before* the move.

**Neutral.**
- The form gets one additional checkbox. The consent UX is slightly more work for the submitter. Acceptable.

---

## 8. Open Questions

- **OQ-1.** Should the Foundation send an email to the two Foundation-facing pre-policy respondents (ids 1 and 2; id 3 is the smoketest) offering them the option to republish under the new consent model? This ADR decides *no, for now* — we do not know whether we have contact consent for that outbound message. Revisit if the Foundation receives an inbound inquiry.
- **OQ-2.** Should `share_body` default to the same value as `share_name`, so a respondent who ticks "share my name" implicitly ticks "share my body too"? This ADR decides *no* — explicit separation is the point. Revisit if user-testing shows submitters expect linked behaviour.
- **OQ-3.** Should the chat citation format include the submission date (`FEEDBACK #17, 2026-05-03`)? This ADR decides *yes*, because the date is always publishable (it carries no PII) and gives the visitor a sense of freshness. Revisit if dates correlate identifyingly with a small respondent pool.
- **OQ-4.** Should the PII heuristic be expanded to look for possible names (proper nouns in unusual positions)? This ADR decides *no* — false-positive rate will be unworkable. Revisit only if the advisory-flag rate is anomalous.

---

## 9. Acceptance criteria

- [ ] The `feedback` table carries a `share_body INTEGER NOT NULL DEFAULT 0` column after the next server start.
- [ ] The feedback form exposes a second checkbox, `I consent to my response content being published`, defaulting to off.
- [ ] The form copy no longer says "never published without your consent" in the old form; it states the new two-dimensional consent model.
- [ ] A submission with `share_body=0` is never included in the chat retrieval SQL (ADR-0003 §3.3).
- [ ] Feedback rows with `id IN (1, 2, 3)` are excluded from the chat retrieval SQL and from the defensive server-side citation allow-list.
- [ ] `scripts/feedback-redact.mjs <id>` exists and sets both `share_name=0` and `share_body=0` for the given row.
- [ ] `scripts/feedback-audit.mjs` exists and flags rows whose body fields match the PII heuristic.
- [ ] The PII-heuristic advisory is returned from the submission endpoint when triggered and surfaced in the UI.
- [ ] A manual `UPDATE feedback SET share_body=0 WHERE id=N;` takes effect on the next chat turn with no redeploy.

---

*End of ADR-0004.*
