/**
 * chat-schema.ts — Anthropic tool-use JSON schema for the single
 * `answer` tool (ADR-0003 §4.3).
 *
 * The model is forced to respond via this tool (tool_choice: {type:'tool',
 * name:'answer'}). The tool's input shape is a minimal envelope: a prose
 * `answer` in markdown plus a `citations` array. Every citation carries
 * an `id` (e.g. "DEC-04", "§4.8", "FEEDBACK #17"), a `kind` (e.g.
 * "decision", "layer", "feedback"), and a `deeplink` (`#decision-04`).
 *
 * Validation happens server-side in handlers.ts via validateCitation()
 * from corpus.ts — unknown ids are stripped from the citations array
 * before the final frame is forwarded to the client.
 *
 * Keep this schema tight. Anthropic's tool-use adheres strongly to the
 * declared shape; loose schemas invite the model to improvise field names.
 */

export interface ChatCitation {
  id: string;
  kind: string;
  deeplink: string;
}

export interface ChatAnswer {
  answer: string;
  citations: ChatCitation[];
}

export const ANSWER_TOOL_NAME = 'answer' as const;

export const ANSWER_TOOL_DESCRIPTION =
  'Return a grounded answer citing the attached OIA Model digest and feedback corpus. ' +
  'Every claim in `answer` must reference at least one id in `citations`. ' +
  "If the corpus does not support an answer, `answer` must explicitly state so and `citations` may be empty.";

/* JSON Schema in the shape Anthropic expects for a tool input_schema. */
export const ANSWER_TOOL_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    answer: {
      type: 'string',
      description:
        'Prose answer in markdown with inline citation markers like [§4.8] [DEC-04] [FEEDBACK #17].',
    },
    citations: {
      type: 'array',
      description:
        'One entry per cited source. Valid id formats: DIGEST §N.M, DEC-NN, SPAN-XXX, L-N, FEEDBACK #N.',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description:
              'Citation identifier. Examples: "§4.8", "DEC-04", "SPAN-SOV", "L-8", "FEEDBACK #17".',
          },
          kind: {
            type: 'string',
            enum: ['digest', 'decision', 'span', 'layer', 'section', 'feedback'],
            description: 'Category of the cited source.',
          },
          deeplink: {
            type: 'string',
            description:
              'Hash anchor into the reader UI (e.g. "#decision-04", "#layer-8", "#feedback-17").',
          },
        },
        required: ['id', 'kind', 'deeplink'],
        additionalProperties: false,
      },
    },
  },
  required: ['answer', 'citations'],
  additionalProperties: false,
} as const;

/** Full tool definition as passed to the Anthropic Messages API `tools` field. */
export const ANSWER_TOOL_SCHEMA = {
  name: ANSWER_TOOL_NAME,
  description: ANSWER_TOOL_DESCRIPTION,
  input_schema: ANSWER_TOOL_INPUT_SCHEMA,
} as const;
