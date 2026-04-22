/**
 * Structured index of every named reference technology / vendor /
 * framework in the OIA Model digest, tagged by source layer. Enables
 * the Explorer's alphabetical + filterable lookup without having to
 * re-parse the `referenceTechnologies` prose paragraphs.
 *
 * Each entry is named exactly as it appears in the source text.
 */

export interface RefTech {
  name: string;
  layer: number;
  /** Optional grouping label shown in the explorer, e.g. "Hyperscale cloud" */
  group?: string;
}

export const refTechs: RefTech[] = [
  /* Layer 0 — Physical Compute */
  { name: 'AWS', layer: 0, group: 'Hyperscale cloud' },
  { name: 'Azure', layer: 0, group: 'Hyperscale cloud' },
  { name: 'Google Cloud', layer: 0, group: 'Hyperscale cloud' },
  { name: 'Sovereign cloud offerings', layer: 0 },
  { name: 'Private cloud and colocation', layer: 0 },
  { name: 'Edge and distributed compute', layer: 0 },
  { name: 'Energy-co-located compute', layer: 0 },

  /* Layer 1 — Silicon Abstraction */
  { name: 'CUDA', layer: 1, group: 'Accelerator programming' },
  { name: 'ROCm', layer: 1, group: 'Accelerator programming' },
  { name: 'Metal', layer: 1, group: 'Accelerator programming' },
  { name: 'WebAssembly', layer: 1, group: 'Portable runtime' },
  { name: 'WASI', layer: 1, group: 'Portable runtime' },
  { name: 'RuVector cognitive runtime', layer: 1, group: 'Portable runtime' },
  { name: 'ONNX Runtime', layer: 1, group: 'Compiler abstraction' },
  { name: 'Apache TVM', layer: 1, group: 'Compiler abstraction' },
  { name: 'MLIR', layer: 1, group: 'Compiler abstraction' },
  { name: 'Triton', layer: 1, group: 'Compiler abstraction' },
  { name: 'Confidential Computing Consortium', layer: 1 },

  /* Layer 2 — Sovereign Infrastructure */
  { name: 'AWS European Sovereign Cloud', layer: 2, group: 'Sovereign cloud' },
  { name: 'Microsoft Cloud for Sovereignty', layer: 2, group: 'Sovereign cloud' },
  { name: 'Google Sovereign Cloud', layer: 2, group: 'Sovereign cloud' },
  { name: 'Nutanix', layer: 2, group: 'Private cloud' },
  { name: 'VMware by Broadcom', layer: 2, group: 'Private cloud' },
  { name: 'Red Hat OpenShift', layer: 2, group: 'Private cloud' },
  { name: 'Kubernetes federation', layer: 2, group: 'Hybrid / composable' },
  { name: 'Confidential computing platforms', layer: 2 },

  /* Layer 3 — Agent Data Substrate */
  { name: 'Snowflake', layer: 3, group: 'Enterprise data platform' },
  { name: 'Databricks', layer: 3, group: 'Enterprise data platform' },
  { name: 'Microsoft Fabric', layer: 3, group: 'Enterprise data platform' },
  { name: 'Pinecone', layer: 3, group: 'Vector platform' },
  { name: 'Weaviate', layer: 3, group: 'Vector platform' },
  { name: 'Qdrant', layer: 3, group: 'Vector platform' },
  { name: 'Milvus', layer: 3, group: 'Vector platform' },
  { name: 'Kafka', layer: 3, group: 'Streaming platform' },
  { name: 'Confluent', layer: 3, group: 'Streaming platform' },
  { name: 'Flink', layer: 3, group: 'Streaming platform' },
  { name: 'Agent-native data platforms', layer: 3 },
  { name: 'Confidential data processing', layer: 3 },

  /* Layer 4 — Model Training and Adaptation */
  { name: 'Anthropic', layer: 4, group: 'Frontier pre-training' },
  { name: 'OpenAI', layer: 4, group: 'Frontier pre-training' },
  { name: 'Google DeepMind', layer: 4, group: 'Frontier pre-training' },
  { name: 'Meta AI', layer: 4, group: 'Frontier pre-training' },
  { name: 'Mistral', layer: 4, group: 'Frontier pre-training' },
  { name: 'Llama', layer: 4, group: 'Open-weight families' },
  { name: 'TRL', layer: 4, group: 'Post-training' },
  { name: 'TRLX', layer: 4, group: 'Post-training' },
  { name: 'Hugging Face PEFT', layer: 4, group: 'Parameter-efficient fine-tuning' },
  { name: "RuVector nightly LoRA pipelines", layer: 4, group: 'Continuous adaptation' },
  { name: 'Federated learning frameworks', layer: 4, group: 'Continuous adaptation' },

  /* Layer 5 — Inference and Retrieval */
  { name: 'Anthropic', layer: 5, group: 'Managed services' },
  { name: 'OpenAI', layer: 5, group: 'Managed services' },
  { name: 'Google', layer: 5, group: 'Managed services' },
  { name: 'AWS Bedrock', layer: 5, group: 'Managed services' },
  { name: 'Azure OpenAI', layer: 5, group: 'Managed services' },
  { name: 'vLLM', layer: 5, group: 'Self-hosted' },
  { name: 'TensorRT-LLM', layer: 5, group: 'Self-hosted' },
  { name: 'Ollama', layer: 5, group: 'Self-hosted' },
  { name: 'Apple Silicon', layer: 5, group: 'Edge / on-device' },
  { name: 'Qualcomm AI Engine', layer: 5, group: 'Edge / on-device' },
  { name: 'NVIDIA Jetson', layer: 5, group: 'Edge / on-device' },
  { name: 'Pinecone', layer: 5, group: 'Retrieval platform' },
  { name: 'OpenSearch', layer: 5, group: 'Retrieval platform' },

  /* Layer 6 — Context and Knowledge */
  { name: 'LangChain', layer: 6, group: 'RAG framework' },
  { name: 'LlamaIndex', layer: 6, group: 'RAG framework' },
  { name: 'Haystack', layer: 6, group: 'RAG framework' },
  { name: 'Neo4j', layer: 6, group: 'Knowledge graph' },
  { name: 'TigerGraph', layer: 6, group: 'Knowledge graph' },
  { name: 'AWS Neptune', layer: 6, group: 'Knowledge graph' },
  { name: 'Anthropic Claude Skills and Memory', layer: 6, group: 'Provider-integrated context' },
  { name: 'OpenAI Assistants', layer: 6, group: 'Provider-integrated context' },
  { name: 'Google Vertex AI Search', layer: 6, group: 'Provider-integrated context' },
  { name: 'Microsoft Copilot extensibility', layer: 6, group: 'Provider-integrated context' },
  { name: "RuVector RuView", layer: 6, group: 'Continuous perception' },

  /* Layer 7 — Orchestration and Workflow */
  { name: 'LangGraph', layer: 7, group: 'Open orchestration' },
  { name: 'LlamaIndex workflows', layer: 7, group: 'Open orchestration' },
  { name: 'CrewAI', layer: 7, group: 'Open orchestration' },
  { name: 'AutoGen', layer: 7, group: 'Open orchestration' },
  { name: 'Anthropic Claude Agent SDK', layer: 7, group: 'Provider-integrated agents' },
  { name: 'OpenAI Assistants/Agents SDK', layer: 7, group: 'Provider-integrated agents' },
  { name: 'Google Vertex AI Agent Builder', layer: 7, group: 'Provider-integrated agents' },
  { name: 'Microsoft Copilot Studio', layer: 7, group: 'Provider-integrated agents' },
  { name: 'Model Context Protocol', layer: 7, group: 'Interop protocol' },
  { name: 'Agent-to-Agent', layer: 7, group: 'Interop protocol' },
  { name: 'n8n', layer: 7, group: 'Workflow automation' },
  { name: 'Zapier', layer: 7, group: 'Workflow automation' },
  { name: 'Power Automate', layer: 7, group: 'Workflow automation' },
  { name: 'Sierra', layer: 7, group: 'Agent-native platform' },
  { name: 'Decagon', layer: 7, group: 'Agent-native platform' },
  { name: 'Agent application firewalls', layer: 7, group: 'Behavioural governance' },

  /* Layer 8 — Continuity Fabric */
  { name: 'Anthropic Claude Memory', layer: 8, group: 'Provider-integrated memory' },
  { name: 'OpenAI persistent threads', layer: 8, group: 'Provider-integrated memory' },
  { name: 'Google Gemini cross-session memory', layer: 8, group: 'Provider-integrated memory' },
  { name: 'Microsoft Copilot memory', layer: 8, group: 'Provider-integrated memory' },
  { name: 'LangChain', layer: 8, group: 'Agent-framework memory' },
  { name: 'LlamaIndex', layer: 8, group: 'Agent-framework memory' },
  { name: 'CrewAI', layer: 8, group: 'Agent-framework memory' },
  { name: 'Proof-gated cognitive runtimes', layer: 8, group: 'Dedicated continuity fabric' },
  { name: 'External verification and audit platforms', layer: 8 },

  /* Layer 9 — Human and Browser Interface */
  { name: 'Claude.ai', layer: 9, group: 'Conversational' },
  { name: 'ChatGPT', layer: 9, group: 'Conversational' },
  { name: 'Gemini', layer: 9, group: 'Conversational' },
  { name: 'Copilot', layer: 9, group: 'Conversational' },
  { name: 'Microsoft Copilot in Office', layer: 9, group: 'Embedded assistant' },
  { name: 'Google Gemini in Workspace', layer: 9, group: 'Embedded assistant' },
  { name: 'GitHub Copilot', layer: 9, group: 'Embedded assistant' },
  { name: 'Island', layer: 9, group: 'Enterprise browser' },
  { name: 'Talon / Palo Alto', layer: 9, group: 'Enterprise browser' },
  { name: 'Chrome Enterprise Premium', layer: 9, group: 'Enterprise browser' },
  { name: 'Edge for Business', layer: 9, group: 'Enterprise browser' },
  { name: 'Agent-optimised browsers', layer: 9, group: 'Agent platforms' },
  { name: 'Browser-based agent security platforms', layer: 9 },
];
