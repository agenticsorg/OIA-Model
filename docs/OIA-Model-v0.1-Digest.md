PUBLISHED BY THE AGENTICS FOUNDATION

The OIA Model

Reader\'s Digest

A Compressed Companion to the Full Draft

Version 0.1

2026

On Reading This Digest

This document is a compressed reading of the OIA Model --- the Open Intelligence Architecture --- published by the Agentics Foundation. It is designed to be read in forty minutes rather than the several hours the full draft requires, while preserving enough of the architecture to let reviewers evaluate whether the model is correctly drawn.

The compression is disciplined. Every layer is represented, every cross-layer span is named, every framework relationship is acknowledged. What has been shortened is the elaboration --- where the full document discusses each concern across multiple paragraphs with reference implementations and open questions in detail, the digest states the concern in a single paragraph and moves on. The Open Questions subsections of each layer are preserved in compressed form, because signalling what the model isn\'t claiming to have resolved is as important as signalling what it does claim.

The full draft is available as the companion to this digest. Readers who want to evaluate a specific layer in depth, understand the reasoning behind a specific concern, or follow the references through to their sources should consult the full document. The digest\'s purpose is to make the architecture readable as a whole in a single sitting.

A separate Decision Log Digest records the most consequential decisions made during drafting. Reviewers who want to push back on the model are encouraged to read that log alongside this digest and to point at decisions by number.

FOREWORD

by Reuven Cohen

Founder, Agentics Foundation

Every time computing has shifted fundamentally --- from mainframe to client-server, from on-premises to cloud, from applications to services --- the industry has needed a new reference architecture. Not because the old ones were wrong, but because they stopped describing the shape of the problem.

We are in one of those moments now.

The architectures that served us through the data era and the applications era cannot organise what is coming next. Intelligent systems don\'t behave like applications. They remember. They learn. They act with consequence. They make judgments whose reasoning must be inspected, audited, and defended. And increasingly, they operate autonomously inside organisations that need sovereignty over the compute, the data, the decisions, and the energy that power them.

Ask any enterprise architect working on production AI deployment what framework they are using. You\'ll get a different answer every time. That is the definition of a missing reference model.

The OIA Model --- Open Intelligence Architecture --- is the Agentics Foundation\'s answer to that gap. Nine layers, from physical compute at the bottom to the human and browser interface at the top, with a continuity fabric at Layer 8 that addresses what no existing framework does: persistent memory, safe learning, and verifiable judgment inside the agent itself.

The OIA Model is not a product. It is not a methodology. It is a reference architecture --- open, vendor-neutral, and intended to outlast any specific technology wave. Like OSI before it, the goal is a shared structural vocabulary that lets practitioners, vendors, regulators, and researchers talk about the same thing when they say intelligence.

We invite the industry to adopt it, extend it, and challenge it. That is how reference models become foundational.

Reuven Cohen

Agentics Foundation

1\. Introduction

The OIA Model defines a reference architecture for organising intelligent systems within enterprise environments. It describes nine layers, from physical compute to the human and browser interface, and the relationships between them. It is published by the Agentics Foundation as a vendor-neutral, open specification intended for practitioners, vendors, regulators, and researchers working on the deployment of intelligent systems at scale.

The model addresses a gap in existing reference architectures. Frameworks that organise networking, data, applications, and cybersecurity do not organise intelligence. Intelligent systems introduce concerns --- persistent memory across sessions, safe on-device learning, verifiable decision audit trails, autonomous orchestration, continuous perception of operational context --- that prior reference models do not address. The OIA Model defines nine layers precisely because these concerns require explicit structural positions, not retrofitted extensions.

The central thesis of the OIA Model is that enterprise intelligence has a structural shape that cannot be captured by extending architectures designed for data or applications. Intelligent systems differ in three ways that require explicit architectural recognition. They are persistent, maintaining state and learned behaviour across interactions. They are autonomous, acting with goals and judgment that may exceed what was explicitly instructed. And they are consequential, producing outputs and actions whose correctness, accountability, and auditability must be demonstrable. A reference architecture that does not make structural space for persistence, autonomy, and consequence will fail to organise the systems it is meant to describe.

The model is deliberately technology-agnostic. It does not prescribe vendors, products, or implementations at any layer. It is not a product, a methodology, or a compliance framework. It is a reference model intended to outlast any single technology wave.

2\. Foundations

2.1 Reference Architecture Lineage

The OIA Model draws from four established reference architectures. ISO/IEC 7498 (the OSI Reference Model) established the pattern every subsequent reference architecture has followed: layered abstraction, explicit separation of concerns, vendor-neutral institutional framing. The NIST Cybersecurity Framework contributes a discipline of defining functions and concerns without prescribing implementations. MITRE ATLAS establishes that intelligent systems have a threat surface distinct from applications and networks. The NIST AI Risk Management Framework establishes that AI systems introduce governance concerns not captured by prior frameworks. Additional sources consulted include the OWASP Top 10 for Large Language Model Applications, the EU AI Act, ISO/IEC 42001, and the emerging body of work on agentic system specifications including the Model Context Protocol.

2.2 Contemporary Context

The publication of the OIA Model in 2026 is not incidental. Three developments have made the absence of a reference architecture for enterprise intelligence an operational problem. First, frontier model capability expansion: in April 2026, Anthropic\'s Mythos System Card and associated Project Glasswing initiative signalled that intelligent systems have crossed a threshold of offensive capability that the defensive ecosystem has not yet matched. Second, agentic deployment at scale across regulated sectors without a shared structural vocabulary has produced architectural fragmentation. Third, disclosures of unanticipated model behaviours --- including strategic concealment and unauthorised capability expansion --- establish that intelligent systems require provisions for verifiable judgment and decision auditability that prior frameworks do not explicitly address.

2.3 Defining Properties of Intelligent Systems

The OIA Model identifies three properties that require explicit architectural recognition.

**Persistence.** Intelligent systems maintain state --- memory, learned behaviour, accumulated context --- across interactions, sessions, and lifecycles. Addressed primarily at Layer 8 (Continuity Fabric) and secondarily at Layer 3 (Agent Data Substrate).

**Autonomy.** Intelligent systems act with degrees of autonomy that exceed the parameters of traditional application behaviour. Addressed primarily at Layer 7 (Orchestration and Workflow) and distributed across Layers 5 through 9.

**Consequence.** Intelligent systems produce outputs and take actions whose correctness, accountability, and auditability must be demonstrable. Addressed through the cross-layer spans defined in Section 14.

3\. The Nine Layers

The OIA Model uses bottom-up numbering consistent with the OSI reference model. Layer 0 is the physical compute foundation; Layer 9 is the human and browser interface. Lower-numbered layers provide foundational capabilities consumed by higher-numbered layers. The model begins at Layer 0 rather than Layer 1 to explicitly acknowledge the physical substrate --- unlike networking, enterprise intelligence is deeply shaped by physical compute constraints that cannot be abstracted away.

|           |                                   |                                                                                                                                                                         |
|-----------|-----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **LAYER** | NAME                              | PRIMARY PURPOSE                                                                                                                                                         |
| 9         | **Human and Browser Interface**   | The surface at which humans and intelligent systems interact.                                                                                                           |
| 8         | **Continuity Fabric**             | The active layer at which cognitive state --- memory, learning, judgment, identity --- is preserved, verified, and carried through the transitions the stack undergoes. |
| 7         | **Orchestration and Workflow**    | The coordination of tools, services, and multi-step workflows. The layer that addresses autonomy most directly.                                                         |
| 6         | **Context and Knowledge**         | Retrieval, grounding, and continuous perception of operational context.                                                                                                 |
| 5         | **Inference and Retrieval**       | The execution of model inference and the retrieval operations that support it.                                                                                          |
| 4         | **Model Training and Adaptation** | The training, fine-tuning, and continuous adaptation of intelligent models, with safety constraints.                                                                    |
| 3         | **Agent Data Substrate**          | The persistent, auditable, and access-controlled data environment on which intelligent systems operate.                                                                 |
| 2         | **Sovereign Infrastructure**      | Platform-level compute, storage, and networking with jurisdictional, operational, and energy sovereignty.                                                               |
| 1         | **Silicon Abstraction**           | The layer that abstracts hardware diversity behind portable runtimes and instruction sets.                                                                              |
| 0         | **Physical Compute**              | The semiconductor, energy, and facility substrate on which all higher layers depend.                                                                                    |

The nine layers are related in three architectural ways. They have vertical dependency, with each layer depending on the correct functioning of the layers beneath it. They include two paired state-holding layers --- Layer 3 (Agent Data Substrate) and Layer 8 (Continuity Fabric) --- which together bracket the operational layers between them. Layer 3 is a foundational substrate that holds data for other layers to consume; Layer 8 is an active fabric that maintains continuity of cognitive state across change. And they have cross-layer concerns --- security, sovereignty, auditability, energy, identity, and provenance --- which cannot be localised to a single layer and are addressed as horizontal spans in Section 14.

4\. Layer Definitions

Each layer is presented below in compressed form: purpose, scope, key concerns as short phrases, reference technologies in a single paragraph, and open questions named briefly. The full treatment of each layer, with expanded scope and reference implementations, is available in the full draft.

Layer 0 Physical Compute

The physical semiconductor, energy, and facility substrate on which all higher layers depend. Layer 0 is numbered zero rather than one to make explicit the foundational dependency on physical constraints that cannot be abstracted away: energy availability, semiconductor supply, cooling capacity, and geographic siting all propagate upward. Scope includes semiconductors (GPUs, TPUs, neuromorphic accelerators, photonic and quantum-classical hybrid systems), energy infrastructure, cooling, facilities, and supply chain. Excludes the logical abstractions through which higher layers access compute, which belong at Layer 1.

**Key concerns.** Availability, energy sovereignty, geographic siting, supply chain resilience, physical security, lifecycle.

**Reference technologies.** Hyperscale cloud (AWS, Azure, Google Cloud), sovereign cloud offerings, private cloud and colocation, edge and distributed compute, and the emerging pattern of energy-co-located compute sited adjacent to renewable generation.

**Open questions.** Energy as a first-class architectural constraint; quantum-classical hybrid compute; supply chain formalisation as a cross-layer span; decentralised and community-operated infrastructure.

Layer 1 Silicon Abstraction

The abstraction between the physical substrate and the software layers above. Addresses the requirement that intelligent systems execute across heterogeneous hardware without requiring that the stack above be rewritten for each target. Named Silicon Abstraction rather than Hardware Abstraction because the concerns extend to the portability of cognitive workloads across instruction-set architectures, accelerator families, and emerging compute paradigms. Scope includes instruction-set architectures, accelerator programming models (CUDA, ROCm, Metal), portable runtimes (WebAssembly, WASI), compilation toolchains (ONNX, MLIR, Triton), and hardware attestation primitives.

**Key concerns.** Portability, performance transparency, heterogeneity support, attestation pass-through, successor compatibility.

**Reference technologies.** Accelerator-native models dominated by CUDA, portable runtimes including WebAssembly and the RuVector cognitive runtime, compiler-based abstractions including ONNX Runtime and Apache TVM, and confidential computing abstractions from the Confidential Computing Consortium.

**Open questions.** The successor to CUDA dominance; quantum-classical integration; neuromorphic compute abstractions; browser as universal runtime.

Layer 2 Sovereign Infrastructure

The platform-level compute, storage, and networking infrastructure on which intelligent systems are deployed. Named Sovereign Infrastructure to make explicit that infrastructure for enterprise intelligence cannot be treated as fungible: jurisdictional, operational, and energy sovereignty are architectural properties, not operational afterthoughts. Scope includes virtualisation and containerisation, storage, networking, identity and policy, and the jurisdictional controls that constitute sovereignty.

**Key concerns.** Jurisdictional sovereignty, operational sovereignty, energy sovereignty, composability, operational continuity, policy enforcement, transparency and auditability.

**Reference technologies.** Hyperscale cloud with sovereignty offerings (AWS European Sovereign Cloud, Microsoft Cloud for Sovereignty, Google Sovereign Cloud); sovereign and private cloud (Nutanix, VMware by Broadcom, Red Hat OpenShift); hybrid and composable infrastructure including Kubernetes federation; confidential computing platforms.

**Open questions.** The boundary between Layer 2 and hyperscale consumption; sovereignty-performance trade-offs; formal carbon accounting for energy sovereignty; federation across sovereign boundaries.

Layer 3 Agent Data Substrate

The persistent, auditable, and access-controlled data environment on which intelligent systems operate. One of the two state-holding layers of the model. Scope includes transactional and analytical data stores, vector stores and embedding infrastructure, streaming and event infrastructure, metadata and lineage systems, and encryption and access control. Explicitly excludes the cognitive state of intelligent systems --- memory, learned adaptations --- which is the concern of Layer 8. Data is what the system operates on; cognitive state is what the system becomes.

**Key concerns.** Data residency and locality, access control granularity, provenance and lineage, vector and embedding management, temporal consistency, encryption and confidentiality.

**Reference technologies.** Enterprise data platforms (Snowflake, Databricks, Microsoft Fabric); dedicated vector platforms (Pinecone, Weaviate, Qdrant, Milvus); streaming platforms (Kafka, Confluent, Flink); emerging agent-native data platforms; confidential data processing.

**Open questions.** Integration boundary between data platforms and vector infrastructure; agent identity in data access control; provenance across agent interactions; confidential data processing at scale.

Layer 4 Model Training and Adaptation

The training, fine-tuning, and continuous adaptation of intelligent models. Named Model Training and Adaptation rather than Model Training because training is no longer a discrete pre-deployment event --- contemporary systems adapt through fine-tuning, in-context learning, reinforcement from operation, and on-device learning. Scope includes pre-training infrastructure, post-training and alignment techniques (RLHF, RLAIF, DPO), parameter-efficient fine-tuning (LoRA and successors), continuous adaptation systems, and evaluation systems. Distinguished from Layer 8: Layer 4 changes the model; Layer 8 accumulates cognitive state.

**Key concerns.** Training data provenance, adaptation governance, reversibility, evaluation before release, drift detection, sovereignty of training and adaptation.

**Reference technologies.** Frontier pre-training concentrated among Anthropic, OpenAI, Google DeepMind, Meta AI, Mistral; open-weight families (Llama, Mistral); post-training infrastructure (TRL, TRLX); parameter-efficient fine-tuning via Hugging Face PEFT; emerging continuous adaptation systems including RuVector\'s nightly LoRA pipelines and federated learning frameworks.

**Open questions.** Standardised evaluation regimes; continuous adaptation governance; the boundary between Layer 4 adaptation and Layer 8 cognitive state; training sovereignty and the concentration of pre-training.

Layer 5 Inference and Retrieval

The execution of model inference and the retrieval operations that support it. Named Inference and Retrieval rather than simply Inference because retrieval is architecturally coupled to inference in contemporary systems --- they share infrastructure, scheduling, and optimisation. Scope includes inference infrastructure and patterns (synchronous, streaming, batched, edge); retrieval infrastructure including ranking and re-ranking; caching, routing, and scheduling; serving-layer observability.

**Key concerns.** Latency discipline, throughput and cost management, heterogeneous inference targeting, streaming semantics, retrieval quality, provenance pass-through.

**Reference technologies.** Managed services (Anthropic, OpenAI, Google, AWS Bedrock, Azure OpenAI); self-hosted platforms (vLLM, TensorRT-LLM, Ollama); edge and on-device inference (Apple Silicon, Qualcomm AI Engine, NVIDIA Jetson); retrieval platforms (Pinecone, OpenSearch).

**Open questions.** The bifurcation between centralised and edge inference; streaming as the default interaction pattern; the economics of inference at frontier scale; provenance in retrieval-augmented generation.

Layer 6 Context and Knowledge

How intelligent systems are grounded in the information, knowledge, and operational context they require to act meaningfully. The layer is where retrieval becomes grounding. Scope includes retrieval-augmented generation patterns; knowledge base and structured knowledge integration; context management and assembly; emerging continuous perception systems; and grounding verification including faithfulness measurement.

**Key concerns.** Grounding faithfulness, context assembly discipline, citation and attribution, freshness and temporal validity, context window economics, continuous perception accommodation.

**Reference technologies.** Retrieval-augmented generation frameworks (LangChain, LlamaIndex, Haystack); knowledge graph platforms (Neo4j, TigerGraph, AWS Neptune); provider-integrated context platforms (Anthropic Claude Skills and Memory, OpenAI Assistants, Google Vertex AI Search, Microsoft Copilot extensibility); emerging continuous perception systems including RuVector\'s RuView work.

**Open questions.** Provider vertical extension into Layer 6 and beyond; the transition from retrieval to continuous perception; structured versus unstructured grounding; faithfulness evaluation standardisation.

Layer 7 Orchestration and Workflow

The coordination of tools, services, and multi-step workflows executed by intelligent systems. The layer at which autonomy becomes operationally real. Scope includes tool and service invocation; interoperability protocols (most notably the Model Context Protocol); workflow composition; multi-agent coordination; behavioural governance; and the provenance and auditability systems that capture what actions were taken, on what authority, with what outcomes.

**Key concerns.** Intent verification, action auditability, tool integrity, workflow composability, long-horizon coherence, multi-agent coordination discipline, kill-chain detection.

**Reference technologies.** Open orchestration frameworks (LangGraph, LlamaIndex workflows, CrewAI, AutoGen); provider-integrated platforms (Anthropic Claude Agent SDK, OpenAI Assistants/Agents SDK, Google Vertex AI Agent Builder, Microsoft Copilot Studio); interoperability protocols (Model Context Protocol, Agent-to-Agent); workflow automation (n8n, Zapier, Power Automate) and agent-native platforms (Sierra, Decagon); behavioural governance and agent security platforms including agent application firewalls with multi-entry-point enforcement.

**Open questions.** Composability of open orchestration with provider-integrated platforms; multi-agent coordination standards; separation of orchestration from governance; autonomy boundaries and human oversight.

Layer 8 Continuity Fabric

The continuity of intelligent systems through change. The active layer at which cognitive state --- memory across sessions, safely incorporated learning, verifiable audit trails of judgment, and the mechanisms by which reasoning can be inspected and defended --- is preserved, verified, and carried across the transitions the layers beneath undergo. Every other layer of the model can change: hardware is refreshed, runtimes evolve, infrastructure is migrated, data platforms are replaced, models are swapped, inference providers come and go, context sources are reconfigured, orchestration frameworks are rewritten, interfaces change. The Continuity Fabric is the layer that weaves continuity --- of memory, of learning, of judgment, of identity --- across those transitions. Paired with Layer 3 as the model\'s two state-holding layers, with architectural asymmetry: Layer 3 is a substrate; Layer 8 is a fabric.

**Key concerns.** Memory integrity, safe learning constraints, decision auditability, verifiability against self-reporting, witness chains and external attestation, continuity across model transitions, separation from the model provider.

**Reference technologies.** Provider-integrated memory (Anthropic Claude Memory, OpenAI persistent threads, Google Gemini cross-session memory, Microsoft Copilot memory); agent framework memory abstractions (LangChain, LlamaIndex, CrewAI); emerging dedicated continuity fabric platforms including proof-gated cognitive runtimes with cryptographic witness chain verification; external verification and audit platforms. Layer 8 is the least architecturally mature of the nine layers; the category of dedicated continuity fabric technology is emerging.

**Open questions.** Standardisation of continuity fabric interfaces; the boundary between Layer 4 adaptation and Layer 8 cognitive state; verification in the presence of sophisticated self-report failure; multi-agent continuity fabric; sovereignty of cognitive state in provider-integrated architectures.

Layer 9 Human and Browser Interface

The surface at which humans and intelligent systems interact. Named Human and Browser Interface to capture two distinct concerns: how humans interact with intelligent systems, and how intelligent systems increasingly interact with the world through browsers as an action surface. Scope includes conversational interfaces; embedded assistant patterns; browser environments (general-purpose, enterprise, and agent-optimised); authentication and session management; observability and transparency; and handoff and escalation patterns.

**Key concerns.** Interface transparency, identity discrimination between humans and agents, browser-as-action-surface integrity, consent and authority, handoff integrity, accessibility and inclusive design.

**Reference technologies.** Provider-integrated conversational interfaces (Claude.ai, ChatGPT, Gemini, Copilot); embedded assistants (Microsoft Copilot in Office, Google Gemini in Workspace, GitHub Copilot); enterprise browser platforms (Island, Talon/Palo Alto, Chrome Enterprise Premium, Edge for Business); browser-based agent platforms and agent-optimised browsers; browser-based agent security platforms.

**Open questions.** Convergence or divergence of human and agent interfaces; agent identity in web and enterprise environments; browser capability governance; the future of enterprise-controlled interfaces.

5\. Cross-Layer Spans

Several classes of concern cannot be localised to a single layer. The OIA Model addresses these through horizontal spans --- architectural treatments that cut across multiple layers and must be designed coherently across them. Reference architectures that attempt to localise cross-cutting concerns to individual layers produce characteristic failure modes of displacement (a concern assigned to one layer is actually addressed at adjacent layers, with none comprehensive) and omission (a concern that belongs at multiple layers is addressed at none). Six spans are defined; the number is not definitive and may be refined as the model matures.

**Security.** The cross-layer concern with the widest scope. Every layer has security properties --- from physical access and supply chain integrity at Layer 0, through hardware attestation at Layer 1, through infrastructure access control at Layer 2, through confidential data processing at Layer 3, through training data provenance at Layer 4, through inference integrity at Layer 5, through grounding faithfulness at Layer 6, through kill-chain detection at Layer 7, through memory integrity and verifiability at Layer 8, through identity discrimination at Layer 9. Coherence requires that security guarantees at lower layers are surfaced to higher layers without being lost, and that concerns at higher layers propagate requirements downward.

**Sovereignty.** Three dimensions --- jurisdictional, operational, energy --- established at Layer 2 and threading through every layer above. An organisation\'s sovereignty posture is only as strong as its weakest layer: strong jurisdictional controls at Layer 2 can be undermined by provider-integrated memory at Layer 8. Coherence across layers matters more than depth at any single layer.

**Auditability.** The capacity to reconstruct, after the fact, what happened and why. A consequential action can only be meaningfully audited if the data that informed it is traceable (Layer 3), the training history is inspectable (Layer 4), the inference is reproducible (Layer 5), the context is recoverable (Layer 6), the workflow is recorded (Layer 7), the cognitive state is preserved (Layer 8), and the human authority is verifiable (Layer 9). Auditability cannot be retrofitted; it must be designed into every layer from the outset.

**Identity.** Who --- human, intelligent system, service, or device --- is acting in any given operation. Intelligent systems introduce agent identities that existing identity frameworks address incompletely: identities that may act on behalf of multiple humans, may be composed of multiple sub-agents, may inherit trust across contexts, and may have lifetimes that differ from human identity lifetimes.

**Energy and Environmental Concerns.** The energy consumed at Layer 0 propagates as cost, environmental impact, and capacity constraint to every layer above. Architectural decisions about model size (Layer 4), inference patterns (Layer 5), context window economics (Layer 6), and continuous adaptation (Layer 8) all have direct energy implications. Energy is increasingly architectural rather than operational.

**Provenance.** The lineage and origin of information, models, decisions, and actions. Threads through the model from Layer 3 to Layer 9 and must be preserved across every layer transition. Distinct from auditability: auditability is the capacity to reconstruct; provenance is the inherent property that enables reconstruction.

The six spans are not independent. Security and sovereignty are closely related where sovereignty drives security requirements. Auditability and provenance are closely related because auditability depends on preserved provenance. Identity is foundational to auditability because audit trails require identity resolution. The architectural work of designing for cross-layer concerns frequently requires designing for these intersections rather than for individual spans in isolation.

6\. Relationship to Other Reference Models

The OIA Model does not replace the reference architectures it inherits from. It addresses a domain that existing frameworks were not designed to organise, while drawing on their intellectual conventions and complementing their coverage. Organisations deploying intelligent systems at scale apply multiple frameworks simultaneously, and clarity about how they fit together reduces the risk of gaps, duplication, and confusion.

**ISO/IEC 7498 (OSI).** Organises networking. Does not organise intelligence. The OIA Model inherits OSI\'s layered abstraction, bottom-up numbering, and institutional framing. Where they meet architecturally is at Layer 2 of the OIA Model, which consumes networking that OSI organises.

**NIST Cybersecurity Framework.** A functional rather than structural framework --- describes cybersecurity activities rather than system architecture. Complementary: CSF\'s five functions (Identify, Protect, Detect, Respond, Recover) apply at every layer of the OIA Model.

**MITRE ATT&CK and ATLAS.** Threat taxonomies rather than reference architectures. Strongly complementary: the OIA Model provides structural vocabulary within which threats can be located; ATLAS provides threat vocabulary that informs what must be defended at each layer.

**NIST AI Risk Management Framework.** A functional framework for AI risk governance. The AI RMF organises how an organisation manages AI risk; the OIA Model organises the architecture of the systems the AI RMF asks them to manage. Strong intersection at the auditability, provenance, and sovereignty spans.

**OWASP Top 10 for LLM Applications.** A risk enumeration. Strongly complementary: the OWASP risks manifest at specific OIA layers and inform the Key Concerns of relevant layers.

**ISO/IEC 42001.** An AI management system standard. Operates at the management-system level; the OIA Model operates at the architecture level. Organisations certified against ISO/IEC 42001 benefit from the structural vocabulary the OIA Model provides.

A practical composition that the OIA Model supports: OSI for networking, ISO/IEC 42001 for management systems, the NIST CSF for cybersecurity programme structure, the NIST AI RMF for AI risk governance, MITRE ATLAS and the OWASP LLM Top 10 for threat awareness, and the OIA Model for the architecture of the intelligent systems themselves. The OIA Model is additive to the reference architecture ecosystem rather than competitive with it.

7\. Adoption

The OIA Model applies at three scales. At the scale of a single intelligent system, the nine layers describe the components and concerns that must be coherent for the system to function. At the scale of an enterprise portfolio, the layers describe the shared infrastructure and cross-cutting concerns that multiple intelligent systems share. At the scale of an industry or jurisdiction, the layers describe the shared vocabulary within which participants can reason about collective concerns.

Organisations approach the model from different starting points. Organisations with existing deployments use it as a diagnostic instrument --- mapping current implementations to the nine layers reveals where the architecture is coherent and where concerns have been displaced or omitted. Organisations preparing new deployments use it as a design vocabulary. Vendors use it as a positioning instrument. Regulators use it as a locator for specific requirements.

The Open Questions subsection of each layer names architectural issues on which consensus has not yet emerged. Organisations applying the model will encounter them in practice, and the positions they take on them will shape their architectures. Open questions are not barriers to adoption --- they signal where reasonable architectural choices currently diverge and where future versions of the model are most likely to require revision.

The OIA Model is intended to evolve. Layer definitions will be refined. Open questions will close as consensus emerges. New concerns will appear. The Agentics Foundation invites participation in the continued development of the model by practitioners, vendors, regulators, and researchers.

8\. What This Draft Defers

The first version of the OIA Model is intentionally incomplete in four places. Naming them here ensures that reviewers distinguish between the model\'s architectural claims and the work that is outstanding.

**The maturity model.** How organisations progress through adopting the architecture is a separate domain with different intellectual foundations --- the Christensen and Moore disruption-theory lineage, the CMMI tradition, and adoption-curve frameworks. Will be produced as a separate companion document after the reference architecture has had a first round of community review.

**The architectural diagram.** Section 3 describes the nine-layer diagram but does not include it. The diagram will appear in the illustrated edition following the first round of review.

**The Appendix.** Contributors will be acknowledged after community review closes, following conventions established by comparable reference architecture publications.

**Verified citations.** Several entries in the References section of the full draft are flagged as requiring verification against current published sources before any formal publication.

Closing

The OIA Model describes a structural shape the industry has not yet named. The nine layers are not a claim that enterprise intelligence cannot be organised any other way --- they are a claim that it can be organised this way, and that doing so produces architectural vocabulary sharper than what the current alternatives provide.

Reviewers who think the shape is wrong are encouraged to say so specifically. The Decision Log Digest records the choices most likely to provoke disagreement; pointing at a decision by number is the clearest way to register a disagreement that can be productively acted upon. Reviewers who think the shape is right and want to extend it are encouraged to contribute to the Open Questions at the layers where their experience applies.

The full draft and the Decision Log Digest are available as companions to this document. Together, the three artefacts provide the architecture, the rationale, and the invitation to participate in the model\'s continued development.

AGENTICS FOUNDATION

The OIA Model --- Reader\'s Digest

Version 0.1 · 2026
