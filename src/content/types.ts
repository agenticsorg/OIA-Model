/**
 * Content type definitions for the OIA Model Reader UI.
 * The fidelity checklist in ADR-0001 §7 is enforced at type level:
 * missing required fields fail the TypeScript build.
 */

export interface Layer {
  /** Anchor id, e.g. "layer-8" */
  id: string;
  /** 0..9 */
  number: number;
  /** Short layer name, e.g. "Continuity Fabric" */
  name: string;
  /** One- or two-token status label(s) shown as chips in the panel header */
  statusChips: { label: string; tone: 'emerald' | 'orange' | 'indigo' | 'red' | 'zinc' }[];
  /** The full Purpose paragraph from §4 (verbatim). */
  purpose: string;
  /** Additional Purpose/scope sentences that follow the primary paragraph in source. */
  additionalPurpose?: string[];
  /** Each Key Concern listed individually. */
  concerns: string[];
  /** The full Reference Technologies paragraph (verbatim). */
  referenceTechnologies: string;
  /** Extra prose sentence that appears in source between ref-tech and open questions (Layer 8). */
  extraNote?: string;
  /** Each Open Question listed individually. */
  openQuestions: string[];
}

export interface Span {
  id: string;
  /** Internal code, e.g. "SPAN-SEC" */
  code: string;
  name: string;
  /** Verbatim paragraph. */
  body: string;
  /** Which layers this span most strongly touches, used for the mini-lane visual. */
  layerRange: number[];
  tone: 'emerald' | 'orange' | 'indigo' | 'red' | 'zinc';
}

export interface Relationship {
  id: string;
  name: string;
  shortName: string;
  /** Verbatim treatment from §6. */
  body: string;
}

export interface Deferral {
  id: string;
  title: string;
  body: string;
}

export interface Decision {
  /** Two-digit number as string, e.g. "04" */
  number: string;
  /** Anchor id, e.g. "decision-04" */
  id: string;
  category: 'Naming' | 'Structure' | 'Editorial Voice' | 'Explicit Deferrals';
  title: string;
  /** Verbatim rationale paragraph. */
  rationale: string;
  /** Verbatim revisit trigger, where present in source. */
  revisitTrigger?: string;
  /** Sub-items where the source enumerates them (e.g. Decision 11's four deferrals). */
  subItems?: { title: string; body: string }[];
}

export interface Property {
  name: string;
  body: string;
  addressedAt: string;
  anchorTarget: string;
}
