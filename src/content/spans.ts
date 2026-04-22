/**
 * §5 — Cross-Layer Spans. Six spans + the opening and closing
 * meta-paragraphs, verbatim.
 */

import type { Span } from './types';

export const spansIntro =
  'Several classes of concern cannot be localised to a single layer. The OIA Model addresses these through horizontal spans — architectural treatments that cut across multiple layers and must be designed coherently across them. Reference architectures that attempt to localise cross-cutting concerns to individual layers produce characteristic failure modes of displacement (a concern assigned to one layer is actually addressed at adjacent layers, with none comprehensive) and omission (a concern that belongs at multiple layers is addressed at none). Six spans are defined; the number is not definitive and may be refined as the model matures.';

export const spans: Span[] = [
  {
    id: 'span-security',
    code: 'SPAN-SEC',
    name: 'Security',
    body: 'The cross-layer concern with the widest scope. Every layer has security properties — from physical access and supply chain integrity at Layer 0, through hardware attestation at Layer 1, through infrastructure access control at Layer 2, through confidential data processing at Layer 3, through training data provenance at Layer 4, through inference integrity at Layer 5, through grounding faithfulness at Layer 6, through kill-chain detection at Layer 7, through memory integrity and verifiability at Layer 8, through identity discrimination at Layer 9. Coherence requires that security guarantees at lower layers are surfaced to higher layers without being lost, and that concerns at higher layers propagate requirements downward.',
    layerRange: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    tone: 'red',
  },
  {
    id: 'span-sovereignty',
    code: 'SPAN-SOV',
    name: 'Sovereignty',
    body: "Three dimensions — jurisdictional, operational, energy — established at Layer 2 and threading through every layer above. An organisation's sovereignty posture is only as strong as its weakest layer: strong jurisdictional controls at Layer 2 can be undermined by provider-integrated memory at Layer 8. Coherence across layers matters more than depth at any single layer.",
    layerRange: [2, 3, 4, 5, 6, 7, 8, 9],
    tone: 'indigo',
  },
  {
    id: 'span-auditability',
    code: 'SPAN-AUD',
    name: 'Auditability',
    body: 'The capacity to reconstruct, after the fact, what happened and why. A consequential action can only be meaningfully audited if the data that informed it is traceable (Layer 3), the training history is inspectable (Layer 4), the inference is reproducible (Layer 5), the context is recoverable (Layer 6), the workflow is recorded (Layer 7), the cognitive state is preserved (Layer 8), and the human authority is verifiable (Layer 9). Auditability cannot be retrofitted; it must be designed into every layer from the outset.',
    layerRange: [3, 4, 5, 6, 7, 8, 9],
    tone: 'emerald',
  },
  {
    id: 'span-identity',
    code: 'SPAN-IDN',
    name: 'Identity',
    body: 'Who — human, intelligent system, service, or device — is acting in any given operation. Intelligent systems introduce agent identities that existing identity frameworks address incompletely: identities that may act on behalf of multiple humans, may be composed of multiple sub-agents, may inherit trust across contexts, and may have lifetimes that differ from human identity lifetimes.',
    layerRange: [2, 3, 7, 8, 9],
    tone: 'orange',
  },
  {
    id: 'span-energy',
    code: 'SPAN-ENG',
    name: 'Energy and Environmental Concerns',
    body: 'The energy consumed at Layer 0 propagates as cost, environmental impact, and capacity constraint to every layer above. Architectural decisions about model size (Layer 4), inference patterns (Layer 5), context window economics (Layer 6), and continuous adaptation (Layer 8) all have direct energy implications. Energy is increasingly architectural rather than operational.',
    layerRange: [0, 1, 2, 4, 5, 6, 8],
    tone: 'orange',
  },
  {
    id: 'span-provenance',
    code: 'SPAN-PRV',
    name: 'Provenance',
    body: 'The lineage and origin of information, models, decisions, and actions. Threads through the model from Layer 3 to Layer 9 and must be preserved across every layer transition. Distinct from auditability: auditability is the capacity to reconstruct; provenance is the inherent property that enables reconstruction.',
    layerRange: [3, 4, 5, 6, 7, 8, 9],
    tone: 'emerald',
  },
];

export const spansIntersections =
  'The six spans are not independent. Security and sovereignty are closely related where sovereignty drives security requirements. Auditability and provenance are closely related because auditability depends on preserved provenance. Identity is foundational to auditability because audit trails require identity resolution. The architectural work of designing for cross-layer concerns frequently requires designing for these intersections rather than for individual spans in isolation.';
