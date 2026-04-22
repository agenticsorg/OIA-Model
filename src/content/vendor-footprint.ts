/**
 * Vendor footprint across the 10 OIA layers — derived from the
 * reference technologies named in §4 of the digest. Rows with four
 * or more layers filled surface as "vertical extension" candidates,
 * the architectural concern Decision 10 explicitly calls out.
 */

export type Tier = 'frontier' | 'cloud' | 'open' | 'enterprise' | 'interface';

export interface VendorRow {
  vendor: string;
  /** Layers (0..9) at which this vendor is named in the digest. */
  layers: number[];
  tier: Tier;
  /** Short note visible on the row header. */
  note?: string;
}

export const vendorFootprint: VendorRow[] = [
  /* Frontier providers */
  { vendor: 'Anthropic', layers: [4, 5, 6, 7, 8, 9], tier: 'frontier', note: 'Pre-training through interface' },
  { vendor: 'OpenAI',    layers: [4, 5, 6, 7, 8, 9], tier: 'frontier', note: 'Pre-training through interface' },
  { vendor: 'Google',    layers: [0, 2, 4, 5, 6, 7, 9], tier: 'frontier', note: 'Cloud, DeepMind, Vertex, Gemini' },
  { vendor: 'Microsoft', layers: [0, 2, 5, 6, 7, 8, 9], tier: 'frontier', note: 'Azure, Copilot stack' },
  { vendor: 'Meta AI',   layers: [4], tier: 'frontier' },
  { vendor: 'Mistral',   layers: [4], tier: 'frontier' },

  /* Cloud / infrastructure */
  { vendor: 'AWS',     layers: [0, 2, 5, 6], tier: 'cloud', note: 'Hyperscale + Bedrock + Neptune' },
  { vendor: 'Azure',   layers: [0, 5],       tier: 'cloud' },
  { vendor: 'Nutanix', layers: [2],          tier: 'cloud' },
  { vendor: 'VMware',  layers: [2],          tier: 'cloud' },
  { vendor: 'Red Hat OpenShift', layers: [2], tier: 'cloud' },

  /* Data & vector */
  { vendor: 'Snowflake',        layers: [3],    tier: 'enterprise' },
  { vendor: 'Databricks',       layers: [3],    tier: 'enterprise' },
  { vendor: 'Microsoft Fabric', layers: [3],    tier: 'enterprise' },
  { vendor: 'Pinecone',         layers: [3, 5], tier: 'enterprise' },
  { vendor: 'Weaviate',         layers: [3],    tier: 'open' },
  { vendor: 'Qdrant',           layers: [3],    tier: 'open' },
  { vendor: 'Milvus',           layers: [3],    tier: 'open' },
  { vendor: 'Kafka / Confluent', layers: [3],   tier: 'enterprise' },

  /* Open orchestration */
  { vendor: 'LangChain',  layers: [6, 7, 8], tier: 'open', note: 'Vertical across Context / Orchestration / Continuity' },
  { vendor: 'LlamaIndex', layers: [6, 7, 8], tier: 'open', note: 'Vertical across Context / Orchestration / Continuity' },
  { vendor: 'CrewAI',     layers: [7, 8],    tier: 'open' },
  { vendor: 'AutoGen',    layers: [7],       tier: 'open' },
  { vendor: 'LangGraph',  layers: [7],       tier: 'open' },

  /* Specialist / emerging */
  { vendor: 'RuVector',     layers: [1, 4, 6, 8], tier: 'open', note: 'Silicon runtime + LoRA + RuView + continuity' },
  { vendor: 'Hugging Face PEFT', layers: [4],     tier: 'open' },
  { vendor: 'vLLM / TensorRT-LLM', layers: [5],   tier: 'open' },
  { vendor: 'Ollama',       layers: [5],          tier: 'open' },

  /* Edge / silicon */
  { vendor: 'NVIDIA (CUDA, Jetson)', layers: [1, 5], tier: 'cloud' },
  { vendor: 'Apple Silicon',         layers: [5],    tier: 'cloud' },
  { vendor: 'Qualcomm AI Engine',    layers: [5],    tier: 'cloud' },

  /* Interface / enterprise browser */
  { vendor: 'GitHub Copilot', layers: [9],    tier: 'interface' },
  { vendor: 'Island',         layers: [9],    tier: 'interface' },
  { vendor: 'Talon / Palo Alto', layers: [9], tier: 'interface' },
  { vendor: 'Chrome Enterprise Premium', layers: [9], tier: 'interface' },
  { vendor: 'Edge for Business', layers: [9], tier: 'interface' },
];

export const tierLabel: Record<Tier, string> = {
  frontier: 'Frontier',
  cloud: 'Cloud / Silicon',
  open: 'Open / Framework',
  enterprise: 'Enterprise',
  interface: 'Interface',
};
