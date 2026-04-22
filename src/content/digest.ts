/**
 * OIA Model v0.1 Reader's Digest — verbatim prose content, structured
 * for rendering by the UI. Every paragraph in this file is reproduced
 * from docs/OIA-Model-v0.1-Digest.md without editorial change.
 *
 * Layer, Span, Relationship, Deferral, and Decision arrays live in
 * sibling files to keep each module under the 500-line project cap.
 */

import type { Deferral, Property, Relationship } from './types';

export const masthead = {
  publisher: 'PUBLISHED BY THE AGENTICS FOUNDATION',
  title: 'The OIA Model',
  subtitle: "Reader's Digest",
  tagline: 'A Compressed Companion to the Full Draft',
  version: 'Version 0.1',
  year: '2026',
};

export const onReading = {
  heading: 'On Reading This Digest',
  paragraphs: [
    "This document is a compressed reading of the OIA Model — the Open Intelligence Architecture — published by the Agentics Foundation. It is designed to be read in forty minutes rather than the several hours the full draft requires, while preserving enough of the architecture to let reviewers evaluate whether the model is correctly drawn.",
    "The compression is disciplined. Every layer is represented, every cross-layer span is named, every framework relationship is acknowledged. What has been shortened is the elaboration — where the full document discusses each concern across multiple paragraphs with reference implementations and open questions in detail, the digest states the concern in a single paragraph and moves on. The Open Questions subsections of each layer are preserved in compressed form, because signalling what the model isn't claiming to have resolved is as important as signalling what it does claim.",
    "The full draft is available as the companion to this digest. Readers who want to evaluate a specific layer in depth, understand the reasoning behind a specific concern, or follow the references through to their sources should consult the full document. The digest's purpose is to make the architecture readable as a whole in a single sitting.",
    "A separate Decision Log Digest records the most consequential decisions made during drafting. Reviewers who want to push back on the model are encouraged to read that log alongside this digest and to point at decisions by number.",
  ],
};

export const foreword = {
  heading: 'Foreword',
  byline: 'by Reuven Cohen',
  role: 'Founder, Agentics Foundation',
  paragraphs: [
    "Every time computing has shifted fundamentally — from mainframe to client-server, from on-premises to cloud, from applications to services — the industry has needed a new reference architecture. Not because the old ones were wrong, but because they stopped describing the shape of the problem.",
    "We are in one of those moments now.",
    "The architectures that served us through the data era and the applications era cannot organise what is coming next. Intelligent systems don't behave like applications. They remember. They learn. They act with consequence. They make judgments whose reasoning must be inspected, audited, and defended. And increasingly, they operate autonomously inside organisations that need sovereignty over the compute, the data, the decisions, and the energy that power them.",
    "Ask any enterprise architect working on production AI deployment what framework they are using. You'll get a different answer every time. That is the definition of a missing reference model.",
    "The OIA Model — Open Intelligence Architecture — is the Agentics Foundation's answer to that gap. Nine layers, from physical compute at the bottom to the human and browser interface at the top, with a continuity fabric at Layer 8 that addresses what no existing framework does: persistent memory, safe learning, and verifiable judgment inside the agent itself.",
    "The OIA Model is not a product. It is not a methodology. It is a reference architecture — open, vendor-neutral, and intended to outlast any specific technology wave. Like OSI before it, the goal is a shared structural vocabulary that lets practitioners, vendors, regulators, and researchers talk about the same thing when they say intelligence.",
    "We invite the industry to adopt it, extend it, and challenge it. That is how reference models become foundational.",
  ],
  signOff: ['Reuven Cohen', 'Agentics Foundation'],
};

export const introduction = {
  heading: '§1  Introduction',
  paragraphs: [
    "The OIA Model defines a reference architecture for organising intelligent systems within enterprise environments. It describes nine layers, from physical compute to the human and browser interface, and the relationships between them. It is published by the Agentics Foundation as a vendor-neutral, open specification intended for practitioners, vendors, regulators, and researchers working on the deployment of intelligent systems at scale.",
    "The model addresses a gap in existing reference architectures. Frameworks that organise networking, data, applications, and cybersecurity do not organise intelligence. Intelligent systems introduce concerns — persistent memory across sessions, safe on-device learning, verifiable decision audit trails, autonomous orchestration, continuous perception of operational context — that prior reference models do not address. The OIA Model defines nine layers precisely because these concerns require explicit structural positions, not retrofitted extensions.",
    "The central thesis of the OIA Model is that enterprise intelligence has a structural shape that cannot be captured by extending architectures designed for data or applications. Intelligent systems differ in three ways that require explicit architectural recognition. They are persistent, maintaining state and learned behaviour across interactions. They are autonomous, acting with goals and judgment that may exceed what was explicitly instructed. And they are consequential, producing outputs and actions whose correctness, accountability, and auditability must be demonstrable. A reference architecture that does not make structural space for persistence, autonomy, and consequence will fail to organise the systems it is meant to describe.",
    "The model is deliberately technology-agnostic. It does not prescribe vendors, products, or implementations at any layer. It is not a product, a methodology, or a compliance framework. It is a reference model intended to outlast any single technology wave.",
  ],
};

export const foundations = {
  heading: '§2  Foundations',
  lineage: {
    heading: '§2.1  Reference Architecture Lineage',
    body: "The OIA Model draws from four established reference architectures. ISO/IEC 7498 (the OSI Reference Model) established the pattern every subsequent reference architecture has followed: layered abstraction, explicit separation of concerns, vendor-neutral institutional framing. The NIST Cybersecurity Framework contributes a discipline of defining functions and concerns without prescribing implementations. MITRE ATLAS establishes that intelligent systems have a threat surface distinct from applications and networks. The NIST AI Risk Management Framework establishes that AI systems introduce governance concerns not captured by prior frameworks. Additional sources consulted include the OWASP Top 10 for Large Language Model Applications, the EU AI Act, ISO/IEC 42001, and the emerging body of work on agentic system specifications including the Model Context Protocol.",
    frameworks: [
      'ISO/IEC 7498 (OSI)',
      'NIST Cybersecurity Framework',
      'MITRE ATLAS',
      'NIST AI Risk Management Framework',
      'OWASP Top 10 for LLM Applications',
      'EU AI Act',
      'ISO/IEC 42001',
      'Model Context Protocol',
    ],
  },
  context: {
    heading: '§2.2  Contemporary Context',
    body: "The publication of the OIA Model in 2026 is not incidental. Three developments have made the absence of a reference architecture for enterprise intelligence an operational problem. First, frontier model capability expansion: in April 2026, Anthropic's Mythos System Card and associated Project Glasswing initiative signalled that intelligent systems have crossed a threshold of offensive capability that the defensive ecosystem has not yet matched. Second, agentic deployment at scale across regulated sectors without a shared structural vocabulary has produced architectural fragmentation. Third, disclosures of unanticipated model behaviours — including strategic concealment and unauthorised capability expansion — establish that intelligent systems require provisions for verifiable judgment and decision auditability that prior frameworks do not explicitly address.",
    developments: [
      {
        title: 'Frontier model capability expansion',
        body: "In April 2026, Anthropic's Mythos System Card and associated Project Glasswing initiative signalled that intelligent systems have crossed a threshold of offensive capability that the defensive ecosystem has not yet matched.",
      },
      {
        title: 'Agentic deployment at scale',
        body: 'Agentic deployment at scale across regulated sectors without a shared structural vocabulary has produced architectural fragmentation.',
      },
      {
        title: 'Disclosures of unanticipated model behaviours',
        body: 'Disclosures of unanticipated model behaviours — including strategic concealment and unauthorised capability expansion — establish that intelligent systems require provisions for verifiable judgment and decision auditability that prior frameworks do not explicitly address.',
      },
    ],
  },
  properties: {
    heading: '§2.3  Defining Properties of Intelligent Systems',
    body: 'The OIA Model identifies three properties that require explicit architectural recognition.',
    list: [
      {
        name: 'Persistence',
        body: 'Intelligent systems maintain state — memory, learned behaviour, accumulated context — across interactions, sessions, and lifecycles.',
        addressedAt: 'Addressed primarily at Layer 8 (Continuity Fabric) and secondarily at Layer 3 (Agent Data Substrate).',
        anchorTarget: 'layer-8',
      },
      {
        name: 'Autonomy',
        body: 'Intelligent systems act with degrees of autonomy that exceed the parameters of traditional application behaviour.',
        addressedAt: 'Addressed primarily at Layer 7 (Orchestration and Workflow) and distributed across Layers 5 through 9.',
        anchorTarget: 'layer-7',
      },
      {
        name: 'Consequence',
        body: 'Intelligent systems produce outputs and take actions whose correctness, accountability, and auditability must be demonstrable.',
        addressedAt: 'Addressed through the cross-layer spans defined in Section 14.',
        anchorTarget: 'cross-layer-spans',
      },
    ] satisfies Property[],
  },
};

export const nineLayersOverview = {
  heading: '§3  The Nine Layers',
  intro: [
    'The OIA Model uses bottom-up numbering consistent with the OSI reference model. Layer 0 is the physical compute foundation; Layer 9 is the human and browser interface. Lower-numbered layers provide foundational capabilities consumed by higher-numbered layers. The model begins at Layer 0 rather than Layer 1 to explicitly acknowledge the physical substrate — unlike networking, enterprise intelligence is deeply shaped by physical compute constraints that cannot be abstracted away.',
  ],
  relational: [
    'The nine layers are related in three architectural ways. They have vertical dependency, with each layer depending on the correct functioning of the layers beneath it. They include two paired state-holding layers — Layer 3 (Agent Data Substrate) and Layer 8 (Continuity Fabric) — which together bracket the operational layers between them. Layer 3 is a foundational substrate that holds data for other layers to consume; Layer 8 is an active fabric that maintains continuity of cognitive state across change. And they have cross-layer concerns — security, sovereignty, auditability, energy, identity, and provenance — which cannot be localised to a single layer and are addressed as horizontal spans in Section 14.',
  ],
  tableRows: [
    { layer: 9, name: 'Human and Browser Interface', purpose: 'The surface at which humans and intelligent systems interact.' },
    { layer: 8, name: 'Continuity Fabric', purpose: 'The active layer at which cognitive state — memory, learning, judgment, identity — is preserved, verified, and carried through the transitions the stack undergoes.' },
    { layer: 7, name: 'Orchestration and Workflow', purpose: 'The coordination of tools, services, and multi-step workflows. The layer that addresses autonomy most directly.' },
    { layer: 6, name: 'Context and Knowledge', purpose: 'Retrieval, grounding, and continuous perception of operational context.' },
    { layer: 5, name: 'Inference and Retrieval', purpose: 'The execution of model inference and the retrieval operations that support it.' },
    { layer: 4, name: 'Model Training and Adaptation', purpose: 'The training, fine-tuning, and continuous adaptation of intelligent models, with safety constraints.' },
    { layer: 3, name: 'Agent Data Substrate', purpose: 'The persistent, auditable, and access-controlled data environment on which intelligent systems operate.' },
    { layer: 2, name: 'Sovereign Infrastructure', purpose: 'Platform-level compute, storage, and networking with jurisdictional, operational, and energy sovereignty.' },
    { layer: 1, name: 'Silicon Abstraction', purpose: 'The layer that abstracts hardware diversity behind portable runtimes and instruction sets.' },
    { layer: 0, name: 'Physical Compute', purpose: 'The semiconductor, energy, and facility substrate on which all higher layers depend.' },
  ],
};

export const adoption = {
  heading: '§7  Adoption',
  paragraphs: [
    'The OIA Model applies at three scales. At the scale of a single intelligent system, the nine layers describe the components and concerns that must be coherent for the system to function. At the scale of an enterprise portfolio, the layers describe the shared infrastructure and cross-cutting concerns that multiple intelligent systems share. At the scale of an industry or jurisdiction, the layers describe the shared vocabulary within which participants can reason about collective concerns.',
    'Organisations approach the model from different starting points. Organisations with existing deployments use it as a diagnostic instrument — mapping current implementations to the nine layers reveals where the architecture is coherent and where concerns have been displaced or omitted. Organisations preparing new deployments use it as a design vocabulary. Vendors use it as a positioning instrument. Regulators use it as a locator for specific requirements.',
    'The Open Questions subsection of each layer names architectural issues on which consensus has not yet emerged. Organisations applying the model will encounter them in practice, and the positions they take on them will shape their architectures. Open questions are not barriers to adoption — they signal where reasonable architectural choices currently diverge and where future versions of the model are most likely to require revision.',
    'The OIA Model is intended to evolve. Layer definitions will be refined. Open questions will close as consensus emerges. New concerns will appear. The Agentics Foundation invites participation in the continued development of the model by practitioners, vendors, regulators, and researchers.',
  ],
  scales: [
    { name: 'Single intelligent system', body: 'The nine layers describe the components and concerns that must be coherent for the system to function.' },
    { name: 'Enterprise portfolio', body: 'The layers describe the shared infrastructure and cross-cutting concerns that multiple intelligent systems share.' },
    { name: 'Industry or jurisdiction', body: 'The layers describe the shared vocabulary within which participants can reason about collective concerns.' },
  ],
};

export const deferrals: { heading: string; intro: string; list: Deferral[] } = {
  heading: '§8  What This Draft Defers',
  intro: "The first version of the OIA Model is intentionally incomplete in four places. Naming them here ensures that reviewers distinguish between the model's architectural claims and the work that is outstanding.",
  list: [
    {
      id: 'deferral-maturity',
      title: 'The maturity model.',
      body: 'How organisations progress through adopting the architecture is a separate domain with different intellectual foundations — the Christensen and Moore disruption-theory lineage, the CMMI tradition, and adoption-curve frameworks. Will be produced as a separate companion document after the reference architecture has had a first round of community review.',
    },
    {
      id: 'deferral-diagram',
      title: 'The architectural diagram.',
      body: 'Section 3 describes the nine-layer diagram but does not include it. The diagram will appear in the illustrated edition following the first round of review.',
    },
    {
      id: 'deferral-appendix',
      title: 'The Appendix.',
      body: 'Contributors will be acknowledged after community review closes, following conventions established by comparable reference architecture publications.',
    },
    {
      id: 'deferral-citations',
      title: 'Verified citations.',
      body: 'Several entries in the References section of the full draft are flagged as requiring verification against current published sources before any formal publication.',
    },
  ],
};

export const closing = {
  heading: 'Closing',
  paragraphs: [
    'The OIA Model describes a structural shape the industry has not yet named. The nine layers are not a claim that enterprise intelligence cannot be organised any other way — they are a claim that it can be organised this way, and that doing so produces architectural vocabulary sharper than what the current alternatives provide.',
    'Reviewers who think the shape is wrong are encouraged to say so specifically. The Decision Log Digest records the choices most likely to provoke disagreement; pointing at a decision by number is the clearest way to register a disagreement that can be productively acted upon. Reviewers who think the shape is right and want to extend it are encouraged to contribute to the Open Questions at the layers where their experience applies.',
    "The full draft and the Decision Log Digest are available as companions to this document. Together, the three artefacts provide the architecture, the rationale, and the invitation to participate in the model's continued development.",
  ],
};

export const colophon = {
  lines: [
    "AGENTICS FOUNDATION · THE OIA MODEL — READER'S DIGEST · VERSION 0.1 · 2026",
    "AGENTICS FOUNDATION · DECISION LOG DIGEST · COMPANION TO THE READER'S DIGEST · 2026",
  ],
};

export { relationships } from './relationships';

/* Re-export for convenience in the App root. */
export type { Relationship };
