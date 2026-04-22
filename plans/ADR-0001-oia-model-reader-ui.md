# ADR-0001 — Interactive OIA Model Reader UI

- **Status:** Proposed
- **Date:** 2026-04-22
- **Deciders:** Agentics Foundation / OIA-Model maintainers
- **Supersedes:** —
- **Superseded by:** —
- **Source documents (normative):**
  - `docs/OIA-Model-v0.1-Digest.md` — the Reader's Digest (Version 0.1, 2026)
  - `docs/OIA-Model-v0.1-Decision-Log-Digest.md` — the Decision Log Digest
- **Design reference (normative):** `animated-telemetry-dashboard-section (1).tsx`

---

## 1. Context

The Agentics Foundation has published two companion artefacts for OIA Model v0.1 — a Reader's Digest describing the nine-layer Open Intelligence Architecture and cross-layer spans, and a Decision Log Digest recording the eleven most consequential drafting decisions. Both exist today only as prose Markdown. Reviewers are asked to read them together and to push back on specific decisions by number.

We need a web UI that:

1. Presents the full content of **both** digests — every section, heading, paragraph, table row, layer, concern, reference technology, open question, decision, and rationale — **without omission**.
2. Adopts the command/telemetry design language defined in `animated-telemetry-dashboard-section (1).tsx` (dark `#09090b` canvas, `cmd-panel` cards, zinc/emerald/orange/indigo/red accent palette, monospaced tickers, in-viewport-triggered animations, reduced-motion fallback).
3. Makes the nine-layer stack navigable, the cross-layer spans visible as horizontal overlays, and the eleven decisions addressable by number (per Decision Log §"On Using This Log").
4. Preserves institutional voice (ADR-Decision 08) and does not introduce Cognitum/Snapper/ACIUM branding into the reading surface (ADR-Decision 09).

The user has explicitly required: **"The UI must reflect these documents exactly without leaving out any steps whatsoever."** Section 7 below enumerates the full fidelity checklist.

---

## 2. Decision

Build a single-page React application that renders both digests as a unified, scroll-and-deep-link-navigable reading surface, structured as a **mission-control console for a reference architecture**. The nine layers are rendered as a vertical stack of telemetry panels; cross-layer spans are rendered as horizontal "sweep bars" overlaying the stack; decisions are rendered as a "System Log" console with per-row addressability.

The UI is composed of **fourteen top-level sections**, corresponding one-to-one with the combined structure of the two source documents. Nothing from the Markdown is collapsed, paraphrased, or deferred to a footnote. The only rewriting permitted is the conversion of prose into the dashboard's structural vocabulary (header / status chip / body / ticker row), and only when the prose is preserved verbatim inside the body slot.

---

## 3. Design Language (derived from the telemetry snippet)

### 3.1 Palette
| Token | Hex | Use |
|---|---|---|
| `bg-canvas` | `#09090b` | Page background |
| `bg-panel-0` | `#121214` | Panel header fill / sub-panel |
| `bg-panel-1` | `#0a0a0c` | Inset progress/graph wells |
| `border-zinc` | `#3f3f46` @ 55% | Panel borders |
| `text-primary` | `zinc-200/300` | Body |
| `text-mono-dim` | `zinc-500/600` | Monospace labels, timestamps |
| `accent-emerald` | `#10b981` | Active / Stable (Layer 3, Layer 8 integrity, security OK) |
| `accent-orange` | `#f97316` | Warning / Thermal / Compute pressure |
| `accent-indigo` | `#6366f1` / `#818cf8` | Deployment / Uplink / Primary CTA |
| `accent-red` | `#ef4444` | Critical / Deferred / T-minus |

### 3.2 Reused components from the reference snippet
- `cmd-panel` (header + body + inset shadow, rounded-18px)
- `cmd-panel-header` (status chip right-aligned)
- `tactile-glass` (floating toolbar for selection state)
- Radar sweep ring (for "Active" layer indicator)
- Conic/ring dial (for layer-level completeness / open-question count)
- Progress bar with `pb-sheen` (for adoption readiness, decision status)
- `signal-texture` + `sweep-block` lane (for cross-layer spans and timeline)
- Three-bar compute graph (for layer-state histograms)
- System-logs grid (`CHK / REF / OPERATION / STATE / TIMESTAMP`) — the canonical pattern for rendering the Decision Log Digest
- IntersectionObserver entry-trigger pattern (`.telemetry-in` gate) — reused for every animated region so entries animate only when scrolled into view
- `prefers-reduced-motion` override block — reused verbatim

### 3.3 Typography
- UI chrome: system-ui stack as in snippet
- Body prose: same stack, `text-base`, `zinc-300`, `leading-relaxed`, `max-w-[72ch]`
- Monospace captions: preserved for all REF/STATE/TIMESTAMP-style labels; used for decision numbers (e.g. `DEC-04`), layer IDs (`L0`–`L9`), and span codes (`SPAN-SEC`, `SPAN-SOV`, `SPAN-AUD`, `SPAN-IDN`, `SPAN-ENG`, `SPAN-PRV`)

---

## 4. Information Architecture

The UI is divided into fourteen sections, rendered top-to-bottom. Deep links (`#layer-8`, `#decision-04`, `#span-sovereignty`, …) are first-class.

| # | Section ID | Source | Content |
|---|---|---|---|
| 0 | `#masthead` | Digest p.1–11 | Publisher, title, subtitle, version, year |
| 1 | `#on-reading` | Digest §"On Reading This Digest" | Full three-paragraph preface |
| 2 | `#foreword` | Digest §"FOREWORD by Reuven Cohen" | Full foreword, personal voice preserved (Decision 08) |
| 3 | `#introduction` | Digest §1 | Four paragraphs on the gap, the thesis, the three properties, technology-agnosticism |
| 4 | `#foundations` | Digest §2 | §2.1 Lineage, §2.2 Contemporary Context, §2.3 Defining Properties |
| 5 | `#nine-layers-overview` | Digest §3 | The nine-row layer table + three relational paragraphs |
| 6 | `#layer-definitions` | Digest §4 | Layers 0–9, each a full panel (see §4.6) |
| 7 | `#cross-layer-spans` | Digest §5 | Six spans + the intersection paragraph |
| 8 | `#relationship-to-others` | Digest §6 | Six reference-model relationships + the practical-composition paragraph |
| 9 | `#adoption` | Digest §7 | Three-scale treatment + open-questions note + evolution statement |
| 10 | `#deferrals` | Digest §8 | The four deferrals, individually addressable |
| 11 | `#closing` | Digest §"Closing" | Two-paragraph close |
| 12 | `#decision-log` | Decision Log Digest §I–IV | Eleven decisions as addressable log rows |
| 13 | `#using-this-log` | Decision Log Digest §"On Using This Log" | Full closing guidance |
| 14 | `#colophon` | Both docs' publisher footers | Agentics Foundation attribution, version, year, both document titles |

### 4.1 `#masthead` — Title Card

- `cmd-panel` spanning full width, `h-[360px]`.
- Header chip: `AGENTICS FOUNDATION` (emerald).
- Body: large `text-zinc-100` display type "The OIA Model" / sub "Reader's Digest" / sub "A Compressed Companion to the Full Draft".
- Footer ticker row: `VERSION 0.1 · 2026 · PUBLISHED BY THE AGENTICS FOUNDATION`.
- Right-side radar-sweep ring (reused from snippet) as ornament; no data encoded.

### 4.2 `#on-reading` — Preface Panel

- Single `cmd-panel lg:col-span-4`, header `ON READING THIS DIGEST`.
- Body renders all three paragraphs verbatim:
  1. "This document is a compressed reading … evaluate whether the model is correctly drawn."
  2. "The compression is disciplined … as important as signalling what it does claim."
  3. "The full draft is available … readable as a whole in a single sitting."
- Plus the Decision-Log-Digest pointer paragraph ("A separate Decision Log Digest records the most consequential decisions …").

### 4.3 `#foreword` — Foreword Panel

- `cmd-panel lg:col-span-4`, header chip `FOREWORD · PERSONAL REGISTER` (orange accent to mark the voice exception called out in Decision 08).
- Byline block: "by Reuven Cohen / Founder, Agentics Foundation".
- Body: every paragraph of the foreword, verbatim, in seven blocks separated as in source:
  1. "Every time computing has shifted fundamentally …"
  2. "We are in one of those moments now."
  3. "The architectures that served us through the data era …"
  4. "Ask any enterprise architect working on production AI deployment …"
  5. "The OIA Model — Open Intelligence Architecture — is the Agentics Foundation's answer …"
  6. "The OIA Model is not a product …"
  7. "We invite the industry to adopt it, extend it, and challenge it. That is how reference models become foundational."
- Sign-off: "Reuven Cohen / Agentics Foundation".

### 4.4 `#introduction` — Section 1

- `cmd-panel lg:col-span-4`, header `§1  INTRODUCTION`.
- Body: all four paragraphs of §1 verbatim.
- Inline status chip: `TECHNOLOGY-AGNOSTIC` (emerald) visually reinforcing the final paragraph.

### 4.5 `#foundations` — Section 2

Three stacked `cmd-panel`s, one per subsection:

- **`#foundations-lineage` — §2.1 Reference Architecture Lineage.**
  Body reproduces the full paragraph naming ISO/IEC 7498 (OSI), NIST CSF, MITRE ATLAS, NIST AI RMF, plus the OWASP LLM Top 10, the EU AI Act, ISO/IEC 42001, and the Model Context Protocol. Each named framework is rendered as an inline chip (zinc-800 border, mono label) so all are individually visible — none omitted.

- **`#foundations-context` — §2.2 Contemporary Context.**
  Body reproduces the paragraph verbatim, with the three developments rendered as three `cmd-panel` sub-tiles inside the body (grid-cols-1 md:grid-cols-3):
  1. *Frontier model capability expansion* — full sentence on Mythos System Card + Project Glasswing, April 2026.
  2. *Agentic deployment at scale* — full sentence on architectural fragmentation.
  3. *Disclosures of unanticipated model behaviours* — full sentence on strategic concealment / unauthorised capability expansion.

- **`#foundations-properties` — §2.3 Defining Properties of Intelligent Systems.**
  Rendered as three "property dials" side-by-side (conic-ring dials reused from Thermal Core widget), each with:
  - Name (`Persistence` / `Autonomy` / `Consequence`)
  - Full-prose definition paragraph verbatim
  - "Addressed primarily at" footer pointing to Layer 8+3 / Layer 7 / Cross-Layer Spans respectively (links to those section anchors).

### 4.6 `#nine-layers-overview` — Section 3

- Header `§3  THE NINE LAYERS`.
- Body opens with the two introductory paragraphs verbatim (bottom-up numbering, why Layer 0 and not Layer 1).
- Below: the canonical **nine-row layer table** rendered as a `cmd-panel` whose body is a grid matching the snippet's System-Logs grid pattern, with columns:
  `LAYER | NAME | PRIMARY PURPOSE`.
  All ten rows (Layer 9 down to Layer 0) are rendered exactly as in source — Layer 9 Human and Browser Interface, Layer 8 Continuity Fabric, … Layer 0 Physical Compute. Clicking a row deep-links to the corresponding `#layer-N` panel in §4.7.
- Below the table: the three relational paragraphs verbatim (vertical dependency / paired state-holding layers bracketing operational layers / cross-layer concerns).

### 4.7 `#layer-definitions` — Section 4 (ten panels, Layers 0–9)

This is the structural centrepiece. **Each layer is one `cmd-panel`** with the following internal schema, applied uniformly for all ten layers:

```
┌─ cmd-panel-header ────────────────────────────────────────────┐
│  L{N}  ·  {NAME}                      {STATUS-CHIP}           │
├─ cmd-panel-body ──────────────────────────────────────────────┤
│  PURPOSE (full paragraph, verbatim)                           │
│                                                                │
│  KEY CONCERNS                                                  │
│  └── chip row: one chip per concern, all listed                │
│                                                                │
│  REFERENCE TECHNOLOGIES                                        │
│  └── full paragraph, verbatim                                  │
│                                                                │
│  OPEN QUESTIONS                                                │
│  └── enumerated list, each item verbatim                       │
└────────────────────────────────────────────────────────────────┘
```

Per-layer content (all verbatim from §4; **no concern, no reference technology, and no open question may be dropped**):

- **Layer 0 — Physical Compute.**
  Concerns: Availability, energy sovereignty, geographic siting, supply chain resilience, physical security, lifecycle. Ref-tech paragraph covers hyperscale cloud, sovereign cloud offerings, private cloud and colocation, edge and distributed compute, energy-co-located compute. Open questions: Energy as a first-class architectural constraint; quantum-classical hybrid compute; supply chain formalisation as a cross-layer span; decentralised and community-operated infrastructure.
- **Layer 1 — Silicon Abstraction.**
  Concerns: Portability, performance transparency, heterogeneity support, attestation pass-through, successor compatibility. Ref-tech: accelerator-native (CUDA), portable runtimes (WebAssembly, RuVector cognitive runtime), compiler-based (ONNX Runtime, Apache TVM), confidential computing abstractions. Open questions: successor to CUDA dominance; quantum-classical integration; neuromorphic compute abstractions; browser as universal runtime.
- **Layer 2 — Sovereign Infrastructure.**
  Concerns: Jurisdictional sovereignty, operational sovereignty, energy sovereignty, composability, operational continuity, policy enforcement, transparency and auditability. Ref-tech: hyperscale with sovereignty offerings (AWS European Sovereign Cloud, Microsoft Cloud for Sovereignty, Google Sovereign Cloud); sovereign/private cloud (Nutanix, VMware by Broadcom, Red Hat OpenShift); hybrid and composable including Kubernetes federation; confidential computing platforms. Open questions: boundary between Layer 2 and hyperscale consumption; sovereignty-performance trade-offs; formal carbon accounting; federation across sovereign boundaries.
- **Layer 3 — Agent Data Substrate.**
  Concerns: Data residency and locality, access control granularity, provenance and lineage, vector and embedding management, temporal consistency, encryption and confidentiality. Ref-tech: enterprise data platforms (Snowflake, Databricks, Microsoft Fabric); dedicated vector platforms (Pinecone, Weaviate, Qdrant, Milvus); streaming platforms (Kafka, Confluent, Flink); emerging agent-native data platforms; confidential data processing. Open questions: integration boundary between data platforms and vector infrastructure; agent identity in data access control; provenance across agent interactions; confidential data processing at scale. *Status chip: `STATE-HOLDING · SUBSTRATE`.*
- **Layer 4 — Model Training and Adaptation.**
  Concerns: Training data provenance, adaptation governance, reversibility, evaluation before release, drift detection, sovereignty of training and adaptation. Ref-tech: frontier pre-training concentrated among Anthropic, OpenAI, Google DeepMind, Meta AI, Mistral; open-weight families (Llama, Mistral); post-training (TRL, TRLX); parameter-efficient fine-tuning via Hugging Face PEFT; emerging continuous adaptation including RuVector's nightly LoRA pipelines and federated learning frameworks. Open questions: standardised evaluation regimes; continuous adaptation governance; boundary between Layer 4 adaptation and Layer 8 cognitive state; training sovereignty.
- **Layer 5 — Inference and Retrieval.**
  Concerns: Latency discipline, throughput and cost management, heterogeneous inference targeting, streaming semantics, retrieval quality, provenance pass-through. Ref-tech: managed services (Anthropic, OpenAI, Google, AWS Bedrock, Azure OpenAI); self-hosted (vLLM, TensorRT-LLM, Ollama); edge and on-device (Apple Silicon, Qualcomm AI Engine, NVIDIA Jetson); retrieval platforms (Pinecone, OpenSearch). Open questions: bifurcation between centralised and edge inference; streaming as default interaction pattern; economics of inference at frontier scale; provenance in retrieval-augmented generation.
- **Layer 6 — Context and Knowledge.**
  Concerns: Grounding faithfulness, context assembly discipline, citation and attribution, freshness and temporal validity, context window economics, continuous perception accommodation. Ref-tech: RAG frameworks (LangChain, LlamaIndex, Haystack); knowledge graphs (Neo4j, TigerGraph, AWS Neptune); provider-integrated context (Anthropic Claude Skills and Memory, OpenAI Assistants, Google Vertex AI Search, Microsoft Copilot extensibility); emerging continuous perception including RuVector's RuView work. Open questions: provider vertical extension into Layer 6 and beyond; transition from retrieval to continuous perception; structured versus unstructured grounding; faithfulness evaluation standardisation.
- **Layer 7 — Orchestration and Workflow.**
  Concerns: Intent verification, action auditability, tool integrity, workflow composability, long-horizon coherence, multi-agent coordination discipline, kill-chain detection. Ref-tech: open orchestration (LangGraph, LlamaIndex workflows, CrewAI, AutoGen); provider-integrated (Anthropic Claude Agent SDK, OpenAI Assistants/Agents SDK, Google Vertex AI Agent Builder, Microsoft Copilot Studio); interop protocols (Model Context Protocol, Agent-to-Agent); workflow automation (n8n, Zapier, Power Automate) and agent-native (Sierra, Decagon); behavioural governance / agent security / agent application firewalls with multi-entry-point enforcement. Open questions: composability of open orchestration with provider-integrated; multi-agent coordination standards; separation of orchestration from governance; autonomy boundaries and human oversight.
- **Layer 8 — Continuity Fabric.**
  Concerns: Memory integrity, safe learning constraints, decision auditability, verifiability against self-reporting, witness chains and external attestation, continuity across model transitions, separation from the model provider. Ref-tech: provider-integrated memory (Anthropic Claude Memory, OpenAI persistent threads, Google Gemini cross-session memory, Microsoft Copilot memory); agent-framework memory abstractions (LangChain, LlamaIndex, CrewAI); emerging dedicated continuity fabric platforms including proof-gated cognitive runtimes with cryptographic witness chain verification; external verification and audit platforms. Includes the explicit sentence: *"Layer 8 is the least architecturally mature of the nine layers; the category of dedicated continuity fabric technology is emerging."* Open questions: standardisation of continuity fabric interfaces; boundary between Layer 4 adaptation and Layer 8 cognitive state; verification in the presence of sophisticated self-report failure; multi-agent continuity fabric; sovereignty of cognitive state in provider-integrated architectures. *Status chip: `STATE-HOLDING · FABRIC · EMERGING`.*
- **Layer 9 — Human and Browser Interface.**
  Concerns: Interface transparency, identity discrimination between humans and agents, browser-as-action-surface integrity, consent and authority, handoff integrity, accessibility and inclusive design. Ref-tech: provider-integrated conversational (Claude.ai, ChatGPT, Gemini, Copilot); embedded assistants (Microsoft Copilot in Office, Google Gemini in Workspace, GitHub Copilot); enterprise browsers (Island, Talon/Palo Alto, Chrome Enterprise Premium, Edge for Business); browser-based agent platforms and agent-optimised browsers; browser-based agent security platforms. Open questions: convergence or divergence of human and agent interfaces; agent identity in web and enterprise environments; browser capability governance; future of enterprise-controlled interfaces.

**Paired-layer asymmetry cue.** Layers 3 and 8 are the only layers whose status chip reads `STATE-HOLDING`. A thin vertical rail between the two draws attention to the bracketing relationship (Decision 03 and Decision 05), without resolving the asymmetry into symmetry (Decision 03 says the asymmetry stands).

### 4.8 `#cross-layer-spans` — Section 5

- Header `§5  CROSS-LAYER SPANS`.
- Body opens with the first paragraph of §5 verbatim (six classes of concern, displacement and omission failure modes).
- Then: six `cmd-panel` span cards, each using the `signal-texture` + `sweep-block` lane visual (reused from the Quantum Relay Uplink widget) running horizontally across a miniature representation of Layers 0–9 beneath the card, so the reader sees which layers each span touches:

  1. **Span — Security** (`SPAN-SEC`). Full paragraph, listing the per-layer surfacing from Layer 0 supply chain → Layer 9 identity discrimination, plus the coherence requirement.
  2. **Span — Sovereignty** (`SPAN-SOV`). Full paragraph: three dimensions (jurisdictional, operational, energy), established at Layer 2, threading upward; sentence on weakest-layer coherence.
  3. **Span — Auditability** (`SPAN-AUD`). Full paragraph: per-layer reconstruction chain Layer 3 → Layer 9; "cannot be retrofitted".
  4. **Span — Identity** (`SPAN-IDN`). Full paragraph on agent identities: acting on behalf of multiple humans, composed of sub-agents, inherited trust, divergent lifetimes.
  5. **Span — Energy and Environmental Concerns** (`SPAN-ENG`). Full paragraph: propagation from Layer 0 upward; architectural (not operational) nature.
  6. **Span — Provenance** (`SPAN-PRV`). Full paragraph: lineage from Layer 3 to Layer 9; distinction from auditability.

- Closing: the full "The six spans are not independent …" paragraph on intersections (security/sovereignty, auditability/provenance, identity foundational to auditability).

### 4.9 `#relationship-to-others` — Section 6

- Header `§6  RELATIONSHIP TO OTHER REFERENCE MODELS`.
- Opens with the introductory paragraph verbatim.
- Body: six `cmd-panel` tiles (grid-cols-1 md:grid-cols-2 lg:grid-cols-3), each reproducing the full treatment from source:
  1. **ISO/IEC 7498 (OSI)** — inheritance + meeting point at Layer 2.
  2. **NIST Cybersecurity Framework** — functional vs structural, five CSF functions apply at every OIA layer.
  3. **MITRE ATT&CK and ATLAS** — threat taxonomies; OIA provides structural vocabulary, ATLAS provides threat vocabulary.
  4. **NIST AI Risk Management Framework** — management vs architecture; intersection at auditability / provenance / sovereignty spans.
  5. **OWASP Top 10 for LLM Applications** — OWASP risks manifest at specific OIA layers and inform Key Concerns.
  6. **ISO/IEC 42001** — management-system level vs architecture level.
- Closing: the full "A practical composition that the OIA Model supports …" paragraph, rendered as a `cmd-panel` summary strip with each named framework as an inline chip.

### 4.10 `#adoption` — Section 7

- Header `§7  ADOPTION`.
- Body: three stacked paragraphs, verbatim:
  1. The three scales (single system / enterprise portfolio / industry or jurisdiction), with the three scales rendered as three sub-tiles.
  2. The starting-points paragraph (existing deployments → diagnostic; new deployments → design vocabulary; vendors → positioning; regulators → locator).
  3. The Open Questions paragraph.
  4. The closing statement "The OIA Model is intended to evolve. …".

### 4.11 `#deferrals` — Section 8

- Header `§8  WHAT THIS DRAFT DEFERS`.
- Opening paragraph verbatim.
- Four `cmd-panel` deferral tiles (grid-cols-1 md:grid-cols-2), each with a red `DEFERRED` status chip:
  1. **The maturity model** — full paragraph (Christensen, Moore, CMMI, adoption-curve frameworks; separate companion document after first community review round).
  2. **The architectural diagram** — full paragraph (Section 3 describes but doesn't include; illustrated edition).
  3. **The Appendix** — full paragraph (contributors acknowledged after community review closes).
  4. **Verified citations** — full paragraph (several References entries flagged).

### 4.12 `#closing` — Closing

- Header `CLOSING`.
- Body: both closing paragraphs verbatim.

### 4.13 `#decision-log` — Decision Log Digest §I–IV

This is the showpiece application of the **System Logs** pattern from the reference snippet.

- Header `DECISION LOG DIGEST · THE ELEVEN DECISIONS MOST WORTH WEIGHING IN ON`.
- A preface `cmd-panel` reproduces the Decision Log Digest's "Purpose" section in full (three paragraphs: thirty decisions total, eleven selected subset, revisit-trigger convention, "Reviewers who disagree with a decision should point at it by number").
- The eleven decisions are rendered as **eleven log rows** in the System-Logs grid, with columns:
  `CHK | DEC | TITLE | STATE | CATEGORY`.
  Each row is expandable to a full-body panel showing the rationale paragraph and (where present) the revisit trigger.
  Row IDs permit deep-linking of the form `#decision-01` … `#decision-11`, per Decision Log §"On Using This Log".

Category grouping uses header rows (rendered as section separators, not as selectable log rows):

- **I. Naming**
  - **DEC-01 — The model is called the OIA Model — Open Intelligence Architecture.**
    Full rationale paragraph (SAA/SAAR history, "moment-in-time framing", OSI analogue, durable reference architecture names domain + posture). Revisit trigger: *"Strong evidence that Open Intelligence Architecture has an existing specific usage in a related domain that would create confusion."*
  - **DEC-02 — Layer 8 is called the Continuity Fabric.**
    Full rationale (four candidates: Cognitive Substrate, Cognitive Core, Cognitive Container, Continuity Fabric; rejections: forced symmetry with Layer 3, self-aggrandising, brand-captured by RuVector RVF; final logic: names what the layer does). Revisit trigger: *"A better name that preserves both the active-layer quality and the continuity-through-change function. Fabric is the weakest component of the name if any word is."*
  - **DEC-03 — The asymmetry between Layers 3 and 8 is an architectural feature, not an awkwardness.** Full rationale.

- **II. Structure**
  - **DEC-04 — Nine layers, not seven or twelve.** Full rationale (seven → OSI clean mapping but forced merging; twelve → less memorable/teachable/adoptable; nine is the smallest number that gives each concern a structural home).
  - **DEC-05 — State-holding layers bracket the operational layers.** Full rationale (Layers 3 and 8 on either side of 4–7; bidirectional dependency structurally visible; alternative of adjacency rejected).
  - **DEC-06 — Cross-layer concerns are a separate section, not distributed into each layer.** Full rationale (honesty about which concerns are genuinely layered vs cross-cutting; failure modes of displacement and omission).
  - **DEC-07 — Each layer ends with Open Questions.** Full rationale (intellectual honesty; community contribution; structured place to push back).

- **III. Editorial Voice**
  - **DEC-08 — Institutional third-person voice throughout, with the Foreword as the one exception.** Full rationale (ISO/NIST parallel; Foreword in Reuven's voice for why-now framing; "Editorial discipline throughout the rest of the document depends on keeping the Foreword's personal register from leaking past the page break").
  - **DEC-09 — No Cognitum, Snapper, or ACIUM branding in the body of the document.** Full rationale (applied retroactively; structural credibility; these ventures are consequential at Layer 8, Layer 7, and the cross-layer security and identity spans respectively; will appear in future publications — adoption case studies, implementation guide, vendor-specific reference architectures).
  - **DEC-10 — The document is correctly opinionated where evidence supports it.** Full rationale (MCP dominance at Layer 7; WebAssembly at Layer 1; provider vertical extension into Layers 6, 7, 8; Anthropic mentioned naturally across layers; balance from accuracy not artificial avoidance; Open Questions used where convergence hasn't happened).

- **IV. Explicit Deferrals**
  - **DEC-11 — Four things are deliberately deferred to future work.** Full rationale. Sub-tile strip lists all four: the maturity model (Christensen / Moore / CMMI / adoption-curve lineage); the architectural diagram (illustrated edition); the Appendix (contributors after community review closes); several References entries flagged as requiring verification.

**Row state chips.** Each row carries a `STATE` chip — default `OPEN` (emerald, i.e. the decision currently stands unchallenged). The chip is designed to support the log's stated lifecycle (per §"On Using This Log"): `REOPENED` (orange) and `CHANGED` (red) or `CONFIRMED` (indigo) when reviewers push back. For v1, all eleven render as `OPEN` and the state model is implemented but not exercised.

**Addressability.** A floating `tactile-glass` toolbar (reused from the snippet's "1 selected" pattern) is enabled when a decision row is selected, exposing a `Cite decision by number` action that copies `reopen decision 04, because…` scaffolding to clipboard — the exact form recommended in §"On Using This Log".

### 4.14 `#using-this-log` — Decision Log §"On Using This Log"

- `cmd-panel lg:col-span-4`.
- Body reproduces all three paragraphs verbatim:
  1. "These are not the only decisions made during drafting. They are the decisions most worth the team's attention …"
  2. "Reviewers who disagree with a specific decision are encouraged to point at it by number. A comment of the form *reopen decision 04, because…* is more productive than marginalia …"
  3. "Decisions that are reopened and changed will be re-recorded with the change noted and the previous rationale preserved. Decisions that are reopened and confirmed will be so noted, so the log captures not only what was decided but what has been challenged and held."

### 4.15 `#colophon` — Footer

- `cmd-panel` footer spanning full width.
- Ticker row, mono, zinc-500:
  `AGENTICS FOUNDATION · THE OIA MODEL — READER'S DIGEST · VERSION 0.1 · 2026`
  `AGENTICS FOUNDATION · DECISION LOG DIGEST · COMPANION TO THE READER'S DIGEST · 2026`

---

## 5. Navigation & Global Chrome

- **Top bar (sticky):** emerald dot + `AGENTICS FOUNDATION · OIA MODEL v0.1` + right-side nav chip group `DIGEST / LAYERS / SPANS / DECISIONS`. Mirrors the System-Logs tab group (`Global / Alerts / Routine`) but wired to section anchors.
- **Left-edge layer rail:** a thin vertical stack of `L9 … L0` mono labels — always visible on `lg:` breakpoints. Clicking a label scrolls to the matching layer panel. The currently in-view layer is highlighted with the emerald "Active" chip pattern from Zone Alpha.
- **Right-edge span rail:** six vertical mono pills (`SEC / SOV / AUD / IDN / ENG / PRV`) acting as shortcuts to §5 span tiles.
- **Deep links:** every section, every layer, every span, every decision has a stable anchor.
- **Search:** a single keyboard shortcut (`/`) opens a palette that searches headings (layers, spans, decisions) — not full-text; keeps scope tight and predictable.

---

## 6. Motion & Accessibility

- Every animated region uses the snippet's **IntersectionObserver gate** — animations do not fire until the section enters the viewport. This is load-bearing for the "paired layers bracket operational layers" reveal and for the six span sweep-bars.
- The snippet's `@media (prefers-reduced-motion: reduce)` rule is kept verbatim: all animation is disabled, progress bars resolve instantly to their target width, radar sweep is rendered static.
- All status chips expose their textual state to assistive tech (`aria-label` includes both the colour-neutral status noun and the category).
- All decision rows are keyboard-focusable; the `tactile-glass` toolbar is reachable via tab, and `Enter` triggers the `Cite decision by number` action.
- Colour contrast: all accent-on-canvas pairs meet WCAG AA for large text; body prose is rendered on `bg-panel-0` (not directly on `bg-canvas`) to keep contrast above 7:1.

---

## 7. Fidelity Checklist (hard acceptance criteria)

The UI does **not** ship until each of the following can be checked off by reading the rendered page end-to-end:

**Reader's Digest:**
- [ ] Masthead: publisher, title, subtitle "Reader's Digest", sub-subtitle "A Compressed Companion to the Full Draft", `Version 0.1`, `2026`.
- [ ] "On Reading This Digest" — all three paragraphs + the Decision Log Digest pointer.
- [ ] Foreword by Reuven Cohen — all seven paragraph-blocks + byline + sign-off.
- [ ] §1 Introduction — all four paragraphs.
- [ ] §2.1 Reference Architecture Lineage — full paragraph; all named frameworks visible (OSI, NIST CSF, MITRE ATLAS, NIST AI RMF, OWASP LLM Top 10, EU AI Act, ISO/IEC 42001, MCP).
- [ ] §2.2 Contemporary Context — full paragraph; all three developments called out individually.
- [ ] §2.3 Defining Properties — Persistence, Autonomy, Consequence each with full definition and "addressed at" pointer.
- [ ] §3 The Nine Layers — introductory paragraphs + full ten-row table (Layers 0–9) + three relational paragraphs.
- [ ] §4 Layer Definitions — ten panels, one per layer, each with Purpose, every Key Concern listed, full Reference Technologies paragraph, every Open Question listed.
- [ ] Layer 8's "least architecturally mature" sentence is preserved verbatim and visible without interaction.
- [ ] §5 Cross-Layer Spans — intro paragraph + six spans (Security, Sovereignty, Auditability, Identity, Energy and Environmental Concerns, Provenance) with full text + intersection paragraph.
- [ ] §6 Relationship to Other Reference Models — intro + six framework relationships + practical-composition paragraph.
- [ ] §7 Adoption — all paragraphs including the three scales, starting points, open questions, evolution statement.
- [ ] §8 What This Draft Defers — intro + all four deferrals with full text.
- [ ] Closing — both paragraphs.
- [ ] Publisher colophon line for the Reader's Digest.

**Decision Log Digest:**
- [ ] Title block (Companion to the Reader's Digest · 2026).
- [ ] Purpose section — all three paragraphs.
- [ ] All four categories (I Naming, II Structure, III Editorial Voice, IV Explicit Deferrals) rendered as separators.
- [ ] All eleven decisions rendered as addressable rows with full rationale paragraphs.
- [ ] Decisions 01 and 02 preserve their revisit triggers verbatim.
- [ ] Decision 11's four sub-deferrals all named (maturity model, architectural diagram, Appendix, verified citations).
- [ ] "On Using This Log" — all three paragraphs.
- [ ] Publisher colophon line for the Decision Log Digest.

**Design fidelity:**
- [ ] Dark `#09090b` canvas; `cmd-panel` borders and inner shadow match the snippet.
- [ ] Radar-sweep, progress-bar, signal-texture, sweep-block, compute-bar, and ring-dial animations all sourced from the snippet (no new motion idioms introduced).
- [ ] IntersectionObserver entry-trigger applied to every animated region.
- [ ] `prefers-reduced-motion` rule present and effective.

---

## 8. Technology Choices

- **Framework:** React (TypeScript), app-router setup. The existing snippet is already a React component.
- **Styling:** TailwindCSS via the same `<script src="https://cdn.tailwindcss.com">` path used in the snippet for the embed variant; a Tailwind-PostCSS build for the production bundle. Class names in the snippet (`cmd-panel`, `tactile-glass`, `pb-fill`, `pb-sheen`, `signal-texture`, `sweep-block`, `radar-sweep`, `telemetry-in`) are promoted to a shared CSS module `src/styles/telemetry.css` and reused across all panels.
- **Icons:** `lucide-react` (the snippet uses the CDN `lucide`; we switch to the React package).
- **Content source:** The two Markdown digests remain the source of truth. Content is extracted into typed data modules (`src/content/digest.ts`, `src/content/decision-log.ts`) at build time, so edits to the Markdown flow into the UI without hand-syncing. This is the mechanism by which the fidelity checklist is mechanically enforceable rather than depending on copy-paste discipline.
- **Routing:** Single page with hash-based deep links for v1; history-mode routes for v2 once the content stabilises.

(File-organisation rules in project CLAUDE.md: source under `/src`, tests under `/tests`, no working files in root — all implementation work will respect this.)

---

## 9. Consequences

**Positive.**
- Reviewers can address a specific decision by number from the URL bar (`/#decision-04`) — the behaviour §"On Using This Log" explicitly calls for.
- The nine-layer stack, the two state-holding layers, the six cross-layer spans, and the eleven decisions become visually and structurally distinguishable — giving the document's architectural shape an interactive counterpart.
- The fidelity checklist in §7 is a mechanical gate: the UI is not "done" until every bullet renders verbatim.
- Editorial voice (Decision 08) is preserved — the Foreword panel is the one place personal register appears, and the visual treatment (orange register chip) makes the voice exception explicit rather than accidental.
- Decision 09's institutional discipline is respected: no Cognitum / Snapper / ACIUM branding in the reading surface. Where the source text itself names RuVector (Layer 1, Layer 4, Layer 6) or references proof-gated cognitive runtimes (Layer 8), the UI preserves the exact source wording and nothing more.

**Negative.**
- The telemetry dashboard aesthetic is visually loud. For a document that aims to outlast its publication moment (Decision 01), a more restrained presentation may read more durably over time. Accepted trade-off for v0.1; revisit at v0.2 review.
- Animations introduce cognitive load for screen readers and for low-vision readers; mitigated by reduced-motion compliance and by keeping the prose the primary surface and motion decorative.
- A single-page layout with fourteen sections is long. Mitigated by the sticky top nav, the left-edge layer rail, and the right-edge span rail.

**Neutral.**
- Decisions 02 and 08 both foreground "asymmetry" and "editorial discipline" respectively — the UI makes both structurally visible (asymmetric chip on L3 vs L8, orange-register chip on Foreword). These are interpretive choices that reviewers may reasonably push back on.

---

## 10. Open Questions (in the spirit of §4's per-layer close)

- **OQ-1.** Should the Decision Log's `STATE` lifecycle (`OPEN / REOPENED / CHANGED / CONFIRMED`) be implemented against a real backing store in v1, or kept as a display-only type until a review workflow exists?
- **OQ-2.** Should the "Cite decision by number" action copy plain scaffolding (`reopen decision NN, because…`) or pre-fill a GitHub Discussions URL for the OIA-Model repository?
- **OQ-3.** Should the architectural diagram deferred in §8 / Decision 11 be rendered as a placeholder panel in the UI (marking the deferral visibly) or omitted entirely until the illustrated edition lands?
- **OQ-4.** How should the UI accommodate the future "full Decision Log" of thirty decisions once it is published, given that this UI renders only the eleven-decision digest?
- **OQ-5.** Should reviewer comments attach to decision rows (per §"On Using This Log") be in scope for v1, or deferred to a separate companion interface?

---

## 11. Implementation Plan (to be executed after approval)

Phased, each phase landable independently, none starts until this ADR is approved.

1. **Phase 0 — Scaffold.** `src/` app skeleton, Tailwind + shared `telemetry.css`, routing, IntersectionObserver gate hook, reduced-motion test harness.
2. **Phase 1 — Content extraction.** `src/content/digest.ts` + `src/content/decision-log.ts`, typed against the fidelity checklist in §7 so missing fields fail the build.
3. **Phase 2 — Core panels.** Masthead, On Reading, Foreword, Introduction, Foundations (all three subsections). Validates the reading surface and voice treatment.
4. **Phase 3 — Layer definitions.** The ten layer panels. Validates the Key Concerns / Reference Technologies / Open Questions schema.
5. **Phase 4 — Cross-layer spans.** Six span cards with the signal-lane visual. Validates that every span touches the correct layers.
6. **Phase 5 — Decision log console.** Eleven log rows + purpose panel + using-this-log panel + `tactile-glass` cite toolbar. Validates deep-linking and the review scaffolding copy action.
7. **Phase 6 — Relationship / Adoption / Deferrals / Closing / Colophon.** The remaining sections.
8. **Phase 7 — Navigation chrome.** Sticky top bar, left layer rail, right span rail, `/` palette.
9. **Phase 8 — Accessibility & reduced-motion audit.** WCAG AA contrast verification, keyboard-only traversal, screen-reader pass, motion-off pass.
10. **Phase 9 — Fidelity checklist sign-off.** Every item in §7 checked against the rendered page.

---

*End of ADR-0001.*
