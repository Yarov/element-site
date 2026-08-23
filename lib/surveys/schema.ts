import { z } from "zod";
import type { SurveyField, SurveyFlow } from "./model";

const fieldSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["text", "singleChoice", "rating", "cta"]),
  label: z.string().trim().min(1, "La pregunta necesita una etiqueta"),
  required: z.boolean(),
  options: z.array(z.string().trim().min(1)).min(2).optional(),
});

const triggerConfigSchema = z
  .object({
    visitCount: z.number().int().min(0).optional(),
    pagePath: z.string().min(1).optional(),
  })
  .strict();

const conditionConfigSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("visitCount"),
      operator: z.literal("gte"),
      value: z.number().int().min(0),
    })
    .strict(),
  z
    .object({
      kind: z.literal("pagePath"),
      operator: z.literal("equals"),
      value: z.string().min(1),
    })
    .strict(),
  z
    .object({
      kind: z.literal("selectedServiceId"),
      operator: z.literal("equals"),
      value: z.string().min(1),
    })
    .strict(),
  z
    .object({
      kind: z.literal("selectedBranchId"),
      operator: z.literal("equals"),
      value: z.string().min(1),
    })
    .strict(),
  z
    .object({
      kind: z.literal("whatsappBookingIntent"),
      operator: z.literal("isTrue"),
      value: z.literal(true),
    })
    .strict(),
  z
    .object({
      kind: z.literal("cooldown"),
      operator: z.literal("elapsed"),
      value: z.number().int().positive(),
    })
    .strict(),
]);

const positionSchema = z.object({ x: z.number(), y: z.number() }).strict();

export const nodeSchema = z.discriminatedUnion("type", [
  z
    .object({
      id: z.string().min(1),
      type: z.literal("trigger"),
      label: z.string().trim().min(1),
      config: triggerConfigSchema,
      position: positionSchema.optional(),
    })
    .strict(),
  z
    .object({
      id: z.string().min(1),
      type: z.literal("condition"),
      label: z.string().trim().min(1),
      config: conditionConfigSchema,
      position: positionSchema.optional(),
    })
    .strict(),
  z
    .object({
      id: z.string().min(1),
      type: z.literal("survey"),
      label: z.string().trim().min(1),
      config: z.object({ fields: z.array(fieldSchema) }).strict(),
      position: positionSchema.optional(),
    })
    .strict(),
  z
    .object({
      id: z.string().min(1),
      type: z.literal("action"),
      label: z.string().trim().min(1),
      config: z.object({ message: z.string().optional() }).strict(),
      position: positionSchema.optional(),
    })
    .strict(),
]);

const edgeSchema = z
  .object({
    from: z.string().min(1),
    to: z.string().min(1),
    outcome: z.enum(["next", "match", "else"]).default("next"),
  })
  .strict();

export const flowSchema = z
  .object({
    // Earlier stored flows included this marker alongside the graph.
    version: z.union([z.literal(1), z.literal("1")]).optional(),
    id: z.string().min(1),
    name: z.string().trim().min(1),
    description: z.string(),
    nodes: z.array(nodeSchema),
    edges: z.array(edgeSchema),
    updatedAt: z.string(),
  })
  .strict()
  .transform(({ version: _version, ...flow }) => flow);

export const persistedFlowSchema = z.object({
  version: z.literal(1),
  flow: flowSchema,
});
export const surveyFieldSchema = fieldSchema;

export function validateFlow(flow: unknown) {
  const result = flowSchema.safeParse(flow);
  if (!result.success) return result;

  const graphError = validateGraph(result.data as SurveyFlow);
  if (graphError) {
    return {
      success: false as const,
      error: new z.ZodError([
        { code: "custom", message: graphError, path: ["edges"] },
      ]),
    };
  }

  return { success: true as const, data: result.data as SurveyFlow };
}

const RESPONSE_ERROR_CODES = {
  FLOW_NOT_PUBLISHED: "FLOW_NOT_PUBLISHED",
  INVALID_FLOW: "INVALID_FLOW",
  NO_ANSWERABLE_FIELDS: "NO_ANSWERABLE_FIELDS",
  INVALID_ANSWERS: "INVALID_ANSWERS",
} as const;

type ResponseErrorCode =
  (typeof RESPONSE_ERROR_CODES)[keyof typeof RESPONSE_ERROR_CODES];

type ResponseAdmissionFailure = {
  success: false;
  status: number;
  error: { code: ResponseErrorCode; message: string; issues?: string[] };
};

type ResponseAdmissionSuccess = {
  success: true;
  answers: Record<string, string | number>;
};

export type ResponseAdmission =
  ResponseAdmissionFailure | ResponseAdmissionSuccess;

export function admitResponse(
  flow: unknown,
  status: string,
  answers: unknown,
): ResponseAdmission {
  if (status !== "published") {
    return responseFailure(
      409,
      RESPONSE_ERROR_CODES.FLOW_NOT_PUBLISHED,
      "This survey is not accepting responses",
    );
  }

  const validFlow = validateFlow(flow);
  if (!validFlow.success) {
    return responseFailure(
      422,
      RESPONSE_ERROR_CODES.INVALID_FLOW,
      "This survey is not available",
    );
  }

  if (!isAnswerRecord(answers)) {
    return responseFailure(
      400,
      RESPONSE_ERROR_CODES.INVALID_ANSWERS,
      "Answers must be an object",
    );
  }

  const fields = validFlow.data.nodes.flatMap((node) =>
    node.type === "survey"
      ? ((node.config.fields as SurveyField[] | undefined) ?? []).filter(
          (field) => field.kind !== "cta",
        )
      : [],
  );
  if (!fields.length) {
    return responseFailure(
      422,
      RESPONSE_ERROR_CODES.NO_ANSWERABLE_FIELDS,
      "This survey has no answerable fields",
    );
  }

  const fieldsById = new Map(fields.map((field) => [field.id, field]));
  const issues: string[] = [];
  const normalized: Record<string, string | number> = {};

  for (const [id, value] of Object.entries(answers)) {
    const field = fieldsById.get(id);
    if (!field) {
      issues.push(`Unknown field: ${id}`);
      continue;
    }
    const answer = normalizeAnswer(field, value);
    if (answer === undefined) {
      issues.push(`Invalid answer for field: ${id}`);
      continue;
    }
    if (answer !== "") normalized[id] = answer;
  }

  for (const field of fields) {
    if (field.required && !(field.id in normalized)) {
      issues.push(`Missing required field: ${field.id}`);
    }
  }

  return issues.length
    ? responseFailure(
        400,
        RESPONSE_ERROR_CODES.INVALID_ANSWERS,
        "The submitted answers are invalid",
        issues,
      )
    : { success: true, answers: normalized };
}

function responseFailure(
  status: number,
  code: ResponseErrorCode,
  message: string,
  issues?: string[],
): ResponseAdmissionFailure {
  return {
    success: false,
    status,
    error: { code, message, ...(issues ? { issues } : {}) },
  };
}

function isAnswerRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeAnswer(
  field: SurveyField,
  value: unknown,
): string | number | undefined {
  if (field.kind === "text") {
    return typeof value === "string" ? value.trim() : undefined;
  }
  if (field.kind === "singleChoice") {
    return typeof value === "string" && field.options?.includes(value.trim())
      ? value.trim()
      : undefined;
  }
  if (field.kind === "rating") {
    return typeof value === "number" &&
      Number.isInteger(value) &&
      value >= 1 &&
      value <= 5
      ? value
      : undefined;
  }
  return undefined;
}

function validateGraph(flow: SurveyFlow) {
  const nodeIds = new Set<string>();
  for (const node of flow.nodes) {
    if (nodeIds.has(node.id)) return `Duplicate node id: ${node.id}`;
    nodeIds.add(node.id);
  }

  const triggers = flow.nodes.filter((node) => node.type === "trigger");
  if (triggers.length !== 1) return "A flow must have exactly one trigger";

  for (const edge of flow.edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to))
      return "Every edge must reference existing nodes";
  }

  for (const node of flow.nodes) {
    const outgoing = flow.edges.filter((edge) => edge.from === node.id);
    if (node.type === "condition") {
      if (outgoing.length !== 2 || !hasOutcomes(outgoing, ["match", "else"]))
        return `Condition ${node.id} requires one match and one else edge`;
      continue;
    }
    if (node.type === "action" && outgoing.length !== 0)
      return `Action ${node.id} cannot have outgoing edges`;
    if (node.type === "survey" && outgoing.length > 1)
      return `Survey ${node.id} has ambiguous outgoing edges`;
    if (
      node.type !== "action" &&
      node.type !== "survey" &&
      (outgoing.length !== 1 || outgoing[0]?.outcome !== "next")
    )
      return `Node ${node.id} requires one next edge`;
    if (
      node.type === "survey" &&
      outgoing.length === 1 &&
      outgoing[0]?.outcome !== "next"
    )
      return `Survey ${node.id} requires a next edge`;
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();
  const traverse = (id: string): string | undefined => {
    if (visiting.has(id)) return "Flow contains a cycle";
    if (visited.has(id)) return undefined;
    visited.add(id);
    visiting.add(id);
    for (const edge of flow.edges.filter(
      (candidate) => candidate.from === id,
    )) {
      const error = traverse(edge.to);
      if (error) return error;
    }
    visiting.delete(id);
    return undefined;
  };
  const traversalError = traverse(triggers[0].id);
  if (traversalError) return traversalError;
  if (visited.size !== flow.nodes.length)
    return "Flow contains unreachable nodes";
  if (
    !flow.nodes.some((node) => node.type === "survey" && visited.has(node.id))
  )
    return "Flow must have a reachable survey";
  if (
    !flow.nodes.some(
      (node) =>
        node.type === "survey" &&
        visited.has(node.id) &&
        ((node.config.fields as SurveyField[] | undefined) ?? []).some(
          (field) => field.kind !== "cta",
        ),
    )
  )
    return "Flow must have a reachable survey with an answerable field";
  if (
    !flow.nodes.some((node) => node.type === "action" && visited.has(node.id))
  )
    return "Flow must have a reachable terminal action";
  return undefined;
}

function hasOutcomes(edges: SurveyFlow["edges"], outcomes: string[]) {
  const actual = edges.map((edge) => edge.outcome).sort();
  return (
    actual.length === outcomes.length &&
    actual.every((outcome, index) => outcome === outcomes.sort()[index])
  );
}
