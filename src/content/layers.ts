/**
 * The ten layer panels — Layer 0 through Layer 9 — with Purpose,
 * Key Concerns, Reference Technologies, and Open Questions reproduced
 * verbatim from docs/OIA-Model-v0.1-Digest.md §4.
 *
 * Ordered bottom-up (Layer 0 first) to match the source numbering and
 * the model's vertical dependency ordering. Layers 3 and 8 carry the
 * `STATE-HOLDING` chip — the only layers that do (ADR-0001 §4.7).
 */

import type { Layer } from './types';

export const layers: Layer[] = [
  {
    id: 'layer-0',
    number: 0,
    name: 'Physical Compute',
    statusChips: [{ label: 'Foundational', tone: 'emerald' }],
    purpose:
      'The physical semiconductor, energy, and facility substrate on which all higher layers depend. Layer 0 is numbered zero rather than one to make explicit the foundational dependency on physical constraints that cannot be abstracted away: energy availability, semiconductor supply, cooling capacity, and geographic siting all propagate upward. Scope includes semiconductors (GPUs, TPUs, neuromorphic accelerators, photonic and quantum-classical hybrid systems), energy infrastructure, cooling, facilities, and supply chain. Excludes the logical abstractions through which higher layers access compute, which belong at Layer 1.',
    concerns: [
      'Availability',
      'Energy sovereignty',
      'Geographic siting',
      'Supply chain resilience',
      'Physical security',
      'Lifecycle',
    ],
    referenceTechnologies:
      'Hyperscale cloud (AWS, Azure, Google Cloud), sovereign cloud offerings, private cloud and colocation, edge and distributed compute, and the emerging pattern of energy-co-located compute sited adjacent to renewable generation.',
    openQuestions: [
      'Energy as a first-class architectural constraint',
      'Quantum-classical hybrid compute',
      'Supply chain formalisation as a cross-layer span',
      'Decentralised and community-operated infrastructure',
    ],
  },
  {
    id: 'layer-1',
    number: 1,
    name: 'Silicon Abstraction',
    statusChips: [{ label: 'Portable Runtime', tone: 'indigo' }],
    purpose:
      'The abstraction between the physical substrate and the software layers above. Addresses the requirement that intelligent systems execute across heterogeneous hardware without requiring that the stack above be rewritten for each target. Named Silicon Abstraction rather than Hardware Abstraction because the concerns extend to the portability of cognitive workloads across instruction-set architectures, accelerator families, and emerging compute paradigms. Scope includes instruction-set architectures, accelerator programming models (CUDA, ROCm, Metal), portable runtimes (WebAssembly, WASI), compilation toolchains (ONNX, MLIR, Triton), and hardware attestation primitives.',
    concerns: [
      'Portability',
      'Performance transparency',
      'Heterogeneity support',
      'Attestation pass-through',
      'Successor compatibility',
    ],
    referenceTechnologies:
      'Accelerator-native models dominated by CUDA, portable runtimes including WebAssembly and the RuVector cognitive runtime, compiler-based abstractions including ONNX Runtime and Apache TVM, and confidential computing abstractions from the Confidential Computing Consortium.',
    openQuestions: [
      'The successor to CUDA dominance',
      'Quantum-classical integration',
      'Neuromorphic compute abstractions',
      'Browser as universal runtime',
    ],
  },
  {
    id: 'layer-2',
    number: 2,
    name: 'Sovereign Infrastructure',
    statusChips: [{ label: 'Sovereignty', tone: 'indigo' }],
    purpose:
      'The platform-level compute, storage, and networking infrastructure on which intelligent systems are deployed. Named Sovereign Infrastructure to make explicit that infrastructure for enterprise intelligence cannot be treated as fungible: jurisdictional, operational, and energy sovereignty are architectural properties, not operational afterthoughts. Scope includes virtualisation and containerisation, storage, networking, identity and policy, and the jurisdictional controls that constitute sovereignty.',
    concerns: [
      'Jurisdictional sovereignty',
      'Operational sovereignty',
      'Energy sovereignty',
      'Composability',
      'Operational continuity',
      'Policy enforcement',
      'Transparency and auditability',
    ],
    referenceTechnologies:
      'Hyperscale cloud with sovereignty offerings (AWS European Sovereign Cloud, Microsoft Cloud for Sovereignty, Google Sovereign Cloud); sovereign and private cloud (Nutanix, VMware by Broadcom, Red Hat OpenShift); hybrid and composable infrastructure including Kubernetes federation; confidential computing platforms.',
    openQuestions: [
      'The boundary between Layer 2 and hyperscale consumption',
      'Sovereignty-performance trade-offs',
      'Formal carbon accounting for energy sovereignty',
      'Federation across sovereign boundaries',
    ],
  },
  {
    id: 'layer-3',
    number: 3,
    name: 'Agent Data Substrate',
    statusChips: [
      { label: 'State-Holding', tone: 'emerald' },
      { label: 'Substrate', tone: 'zinc' },
    ],
    purpose:
      'The persistent, auditable, and access-controlled data environment on which intelligent systems operate. One of the two state-holding layers of the model. Scope includes transactional and analytical data stores, vector stores and embedding infrastructure, streaming and event infrastructure, metadata and lineage systems, and encryption and access control. Explicitly excludes the cognitive state of intelligent systems — memory, learned adaptations — which is the concern of Layer 8. Data is what the system operates on; cognitive state is what the system becomes.',
    concerns: [
      'Data residency and locality',
      'Access control granularity',
      'Provenance and lineage',
      'Vector and embedding management',
      'Temporal consistency',
      'Encryption and confidentiality',
    ],
    referenceTechnologies:
      'Enterprise data platforms (Snowflake, Databricks, Microsoft Fabric); dedicated vector platforms (Pinecone, Weaviate, Qdrant, Milvus); streaming platforms (Kafka, Confluent, Flink); emerging agent-native data platforms; confidential data processing.',
    openQuestions: [
      'Integration boundary between data platforms and vector infrastructure',
      'Agent identity in data access control',
      'Provenance across agent interactions',
      'Confidential data processing at scale',
    ],
  },
  {
    id: 'layer-4',
    number: 4,
    name: 'Model Training and Adaptation',
    statusChips: [{ label: 'Adaptation', tone: 'orange' }],
    purpose:
      'The training, fine-tuning, and continuous adaptation of intelligent models. Named Model Training and Adaptation rather than Model Training because training is no longer a discrete pre-deployment event — contemporary systems adapt through fine-tuning, in-context learning, reinforcement from operation, and on-device learning. Scope includes pre-training infrastructure, post-training and alignment techniques (RLHF, RLAIF, DPO), parameter-efficient fine-tuning (LoRA and successors), continuous adaptation systems, and evaluation systems. Distinguished from Layer 8: Layer 4 changes the model; Layer 8 accumulates cognitive state.',
    concerns: [
      'Training data provenance',
      'Adaptation governance',
      'Reversibility',
      'Evaluation before release',
      'Drift detection',
      'Sovereignty of training and adaptation',
    ],
    referenceTechnologies:
      "Frontier pre-training concentrated among Anthropic, OpenAI, Google DeepMind, Meta AI, Mistral; open-weight families (Llama, Mistral); post-training infrastructure (TRL, TRLX); parameter-efficient fine-tuning via Hugging Face PEFT; emerging continuous adaptation systems including RuVector's nightly LoRA pipelines and federated learning frameworks.",
    openQuestions: [
      'Standardised evaluation regimes',
      'Continuous adaptation governance',
      'The boundary between Layer 4 adaptation and Layer 8 cognitive state',
      'Training sovereignty and the concentration of pre-training',
    ],
  },
  {
    id: 'layer-5',
    number: 5,
    name: 'Inference and Retrieval',
    statusChips: [{ label: 'Operational', tone: 'indigo' }],
    purpose:
      'The execution of model inference and the retrieval operations that support it. Named Inference and Retrieval rather than simply Inference because retrieval is architecturally coupled to inference in contemporary systems — they share infrastructure, scheduling, and optimisation. Scope includes inference infrastructure and patterns (synchronous, streaming, batched, edge); retrieval infrastructure including ranking and re-ranking; caching, routing, and scheduling; serving-layer observability.',
    concerns: [
      'Latency discipline',
      'Throughput and cost management',
      'Heterogeneous inference targeting',
      'Streaming semantics',
      'Retrieval quality',
      'Provenance pass-through',
    ],
    referenceTechnologies:
      'Managed services (Anthropic, OpenAI, Google, AWS Bedrock, Azure OpenAI); self-hosted platforms (vLLM, TensorRT-LLM, Ollama); edge and on-device inference (Apple Silicon, Qualcomm AI Engine, NVIDIA Jetson); retrieval platforms (Pinecone, OpenSearch).',
    openQuestions: [
      'The bifurcation between centralised and edge inference',
      'Streaming as the default interaction pattern',
      'The economics of inference at frontier scale',
      'Provenance in retrieval-augmented generation',
    ],
  },
  {
    id: 'layer-6',
    number: 6,
    name: 'Context and Knowledge',
    statusChips: [{ label: 'Operational', tone: 'indigo' }],
    purpose:
      'How intelligent systems are grounded in the information, knowledge, and operational context they require to act meaningfully. The layer is where retrieval becomes grounding. Scope includes retrieval-augmented generation patterns; knowledge base and structured knowledge integration; context management and assembly; emerging continuous perception systems; and grounding verification including faithfulness measurement.',
    concerns: [
      'Grounding faithfulness',
      'Context assembly discipline',
      'Citation and attribution',
      'Freshness and temporal validity',
      'Context window economics',
      'Continuous perception accommodation',
    ],
    referenceTechnologies:
      "Retrieval-augmented generation frameworks (LangChain, LlamaIndex, Haystack); knowledge graph platforms (Neo4j, TigerGraph, AWS Neptune); provider-integrated context platforms (Anthropic Claude Skills and Memory, OpenAI Assistants, Google Vertex AI Search, Microsoft Copilot extensibility); emerging continuous perception systems including RuVector's RuView work.",
    openQuestions: [
      'Provider vertical extension into Layer 6 and beyond',
      'The transition from retrieval to continuous perception',
      'Structured versus unstructured grounding',
      'Faithfulness evaluation standardisation',
    ],
  },
  {
    id: 'layer-7',
    number: 7,
    name: 'Orchestration and Workflow',
    statusChips: [{ label: 'Autonomy', tone: 'orange' }],
    purpose:
      'The coordination of tools, services, and multi-step workflows executed by intelligent systems. The layer at which autonomy becomes operationally real. Scope includes tool and service invocation; interoperability protocols (most notably the Model Context Protocol); workflow composition; multi-agent coordination; behavioural governance; and the provenance and auditability systems that capture what actions were taken, on what authority, with what outcomes.',
    concerns: [
      'Intent verification',
      'Action auditability',
      'Tool integrity',
      'Workflow composability',
      'Long-horizon coherence',
      'Multi-agent coordination discipline',
      'Kill-chain detection',
    ],
    referenceTechnologies:
      'Open orchestration frameworks (LangGraph, LlamaIndex workflows, CrewAI, AutoGen); provider-integrated platforms (Anthropic Claude Agent SDK, OpenAI Assistants/Agents SDK, Google Vertex AI Agent Builder, Microsoft Copilot Studio); interoperability protocols (Model Context Protocol, Agent-to-Agent); workflow automation (n8n, Zapier, Power Automate) and agent-native platforms (Sierra, Decagon); behavioural governance and agent security platforms including agent application firewalls with multi-entry-point enforcement.',
    openQuestions: [
      'Composability of open orchestration with provider-integrated platforms',
      'Multi-agent coordination standards',
      'Separation of orchestration from governance',
      'Autonomy boundaries and human oversight',
    ],
  },
  {
    id: 'layer-8',
    number: 8,
    name: 'Continuity Fabric',
    statusChips: [
      { label: 'State-Holding', tone: 'emerald' },
      { label: 'Fabric', tone: 'zinc' },
      { label: 'Emerging', tone: 'orange' },
    ],
    purpose:
      "The continuity of intelligent systems through change. The active layer at which cognitive state — memory across sessions, safely incorporated learning, verifiable audit trails of judgment, and the mechanisms by which reasoning can be inspected and defended — is preserved, verified, and carried across the transitions the layers beneath undergo. Every other layer of the model can change: hardware is refreshed, runtimes evolve, infrastructure is migrated, data platforms are replaced, models are swapped, inference providers come and go, context sources are reconfigured, orchestration frameworks are rewritten, interfaces change. The Continuity Fabric is the layer that weaves continuity — of memory, of learning, of judgment, of identity — across those transitions. Paired with Layer 3 as the model's two state-holding layers, with architectural asymmetry: Layer 3 is a substrate; Layer 8 is a fabric.",
    concerns: [
      'Memory integrity',
      'Safe learning constraints',
      'Decision auditability',
      'Verifiability against self-reporting',
      'Witness chains and external attestation',
      'Continuity across model transitions',
      'Separation from the model provider',
    ],
    referenceTechnologies:
      'Provider-integrated memory (Anthropic Claude Memory, OpenAI persistent threads, Google Gemini cross-session memory, Microsoft Copilot memory); agent framework memory abstractions (LangChain, LlamaIndex, CrewAI); emerging dedicated continuity fabric platforms including proof-gated cognitive runtimes with cryptographic witness chain verification; external verification and audit platforms.',
    extraNote:
      'Layer 8 is the least architecturally mature of the nine layers; the category of dedicated continuity fabric technology is emerging.',
    openQuestions: [
      'Standardisation of continuity fabric interfaces',
      'The boundary between Layer 4 adaptation and Layer 8 cognitive state',
      'Verification in the presence of sophisticated self-report failure',
      'Multi-agent continuity fabric',
      'Sovereignty of cognitive state in provider-integrated architectures',
    ],
  },
  {
    id: 'layer-9',
    number: 9,
    name: 'Human and Browser Interface',
    statusChips: [{ label: 'Surface', tone: 'indigo' }],
    purpose:
      'The surface at which humans and intelligent systems interact. Named Human and Browser Interface to capture two distinct concerns: how humans interact with intelligent systems, and how intelligent systems increasingly interact with the world through browsers as an action surface. Scope includes conversational interfaces; embedded assistant patterns; browser environments (general-purpose, enterprise, and agent-optimised); authentication and session management; observability and transparency; and handoff and escalation patterns.',
    concerns: [
      'Interface transparency',
      'Identity discrimination between humans and agents',
      'Browser-as-action-surface integrity',
      'Consent and authority',
      'Handoff integrity',
      'Accessibility and inclusive design',
    ],
    referenceTechnologies:
      'Provider-integrated conversational interfaces (Claude.ai, ChatGPT, Gemini, Copilot); embedded assistants (Microsoft Copilot in Office, Google Gemini in Workspace, GitHub Copilot); enterprise browser platforms (Island, Talon/Palo Alto, Chrome Enterprise Premium, Edge for Business); browser-based agent platforms and agent-optimised browsers; browser-based agent security platforms.',
    openQuestions: [
      'Convergence or divergence of human and agent interfaces',
      'Agent identity in web and enterprise environments',
      'Browser capability governance',
      'The future of enterprise-controlled interfaces',
    ],
  },
];

/** Top-down ordering (Layer 9 first) — matches the source table in §3. */
export const layersTopDown = [...layers].reverse();
