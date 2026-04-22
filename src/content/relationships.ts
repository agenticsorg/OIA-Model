/**
 * §6 — Relationship to Other Reference Models. Six framework treatments +
 * opening and closing meta-paragraphs, verbatim.
 */

import type { Relationship } from './types';

export const relationshipsIntro =
  "The OIA Model does not replace the reference architectures it inherits from. It addresses a domain that existing frameworks were not designed to organise, while drawing on their intellectual conventions and complementing their coverage. Organisations deploying intelligent systems at scale apply multiple frameworks simultaneously, and clarity about how they fit together reduces the risk of gaps, duplication, and confusion.";

export const relationships: Relationship[] = [
  {
    id: 'rel-osi',
    name: 'ISO/IEC 7498 (OSI)',
    shortName: 'OSI',
    body: "Organises networking. Does not organise intelligence. The OIA Model inherits OSI's layered abstraction, bottom-up numbering, and institutional framing. Where they meet architecturally is at Layer 2 of the OIA Model, which consumes networking that OSI organises.",
  },
  {
    id: 'rel-csf',
    name: 'NIST Cybersecurity Framework',
    shortName: 'NIST CSF',
    body: "A functional rather than structural framework — describes cybersecurity activities rather than system architecture. Complementary: CSF's five functions (Identify, Protect, Detect, Respond, Recover) apply at every layer of the OIA Model.",
  },
  {
    id: 'rel-atlas',
    name: 'MITRE ATT&CK and ATLAS',
    shortName: 'ATT&CK / ATLAS',
    body: 'Threat taxonomies rather than reference architectures. Strongly complementary: the OIA Model provides structural vocabulary within which threats can be located; ATLAS provides threat vocabulary that informs what must be defended at each layer.',
  },
  {
    id: 'rel-airmf',
    name: 'NIST AI Risk Management Framework',
    shortName: 'NIST AI RMF',
    body: 'A functional framework for AI risk governance. The AI RMF organises how an organisation manages AI risk; the OIA Model organises the architecture of the systems the AI RMF asks them to manage. Strong intersection at the auditability, provenance, and sovereignty spans.',
  },
  {
    id: 'rel-owasp',
    name: 'OWASP Top 10 for LLM Applications',
    shortName: 'OWASP LLM',
    body: 'A risk enumeration. Strongly complementary: the OWASP risks manifest at specific OIA layers and inform the Key Concerns of relevant layers.',
  },
  {
    id: 'rel-42001',
    name: 'ISO/IEC 42001',
    shortName: 'ISO 42001',
    body: 'An AI management system standard. Operates at the management-system level; the OIA Model operates at the architecture level. Organisations certified against ISO/IEC 42001 benefit from the structural vocabulary the OIA Model provides.',
  },
];

export const relationshipsComposition =
  'A practical composition that the OIA Model supports: OSI for networking, ISO/IEC 42001 for management systems, the NIST CSF for cybersecurity programme structure, the NIST AI RMF for AI risk governance, MITRE ATLAS and the OWASP LLM Top 10 for threat awareness, and the OIA Model for the architecture of the intelligent systems themselves. The OIA Model is additive to the reference architecture ecosystem rather than competitive with it.';

export const practicalCompositionChips = [
  { name: 'OSI', use: 'networking' },
  { name: 'ISO/IEC 42001', use: 'management systems' },
  { name: 'NIST CSF', use: 'cybersecurity programme structure' },
  { name: 'NIST AI RMF', use: 'AI risk governance' },
  { name: 'MITRE ATLAS', use: 'threat awareness' },
  { name: 'OWASP LLM Top 10', use: 'threat awareness' },
  { name: 'OIA Model', use: 'architecture of the intelligent systems' },
];
