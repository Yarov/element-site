import type {
  ConditionConfig,
  EvaluationResult,
  FlowTerminalState,
  SurveyFlow,
  SurveyNode,
  ActionNode,
  TriggerConfig,
  Visitor,
  VisitorSignals,
  WorkflowNode,
} from "./model";
import { validateFlow } from "./schema";

const DEFAULT_VISIT_COUNT = 3;
const WHATSAPP_INTENT_TTL_MS = 24 * 60 * 60 * 1000;

export function evaluateFlow(
  flow: SurveyFlow,
  input: VisitorSignals | Visitor,
  now = Date.now(),
): EvaluationResult {
  const valid = validateFlow(flow);
  if (!valid.success)
    return {
      matched: false,
      path: [],
      reasons: ["flow:invalid"],
      errors: ["El flujo no es válido"],
    };

  const signals = normalizeSignals(input);
  const trigger = valid.data.nodes.find((node) => node.type === "trigger");
  if (!trigger)
    return {
      matched: false,
      path: [],
      reasons: ["trigger:missing"],
      errors: ["El flujo no es válido"],
    };

  const path = [trigger.label];
  const reasons: string[] = [];
  const triggerConfig = trigger.config as TriggerConfig;
  if (signals.visitCount < (triggerConfig.visitCount ?? DEFAULT_VISIT_COUNT)) {
    reasons.push("trigger:visitCount:fail");
    return { matched: false, path, reasons, errors: [] };
  }
  if (triggerConfig.targetMode === "selected") {
    if (!triggerConfig.pagePaths?.includes(signals.pathname)) {
      reasons.push("trigger:pagePaths:fail");
      return { matched: false, path, reasons, errors: [] };
    }
  } else if (triggerConfig.targetMode !== "all" && triggerConfig.pagePaths) {
    if (!triggerConfig.pagePaths.includes(signals.pathname)) {
      reasons.push("trigger:pagePaths:fail");
      return { matched: false, path, reasons, errors: [] };
    }
  } else if (
    triggerConfig.targetMode !== "all" &&
    triggerConfig.pagePath &&
    signals.pathname !== triggerConfig.pagePath
  ) {
    reasons.push("trigger:pagePath:fail");
    return { matched: false, path, reasons, errors: [] };
  }
  reasons.push("trigger:match");

  let current: WorkflowNode = trigger;
  let survey: EvaluationResult["survey"];
  let action: EvaluationResult["action"];
  while (true) {
    if (current.type === "survey") survey = current as SurveyNode;
    if (current.type === "action") action = current as ActionNode;

    const condition =
      current.type === "condition" && isConditionConfig(current.config)
        ? current.config
        : undefined;
    const outcome: "next" | "match" | "else" =
      current.type === "condition"
        ? matchesCondition(condition, signals, flow.id, now)
          ? "match"
          : "else"
        : "next";
    if (condition) reasons.push(`condition:${condition.kind}:${outcome}`);

    const edge = valid.data.edges.find(
      (candidate) =>
        candidate.from === current.id && candidate.outcome === outcome,
    );
    if (!edge) break;
    reasons.push(`edge:${outcome}`);
    const next = valid.data.nodes.find((node) => node.id === edge.to);
    if (!next)
      return {
        matched: false,
        path,
        reasons,
        errors: ["El flujo no es válido"],
      };
    current = next;
    path.push(current.label);
  }

  if (!survey) return { matched: false, path, reasons, action, errors: [] };
  return { matched: true, path, reasons, survey, action, errors: [] };
}

function normalizeSignals(input: VisitorSignals | Visitor): VisitorSignals {
  return {
    ...input,
    visitCount: Number.isFinite(input.visitCount) ? input.visitCount : 0,
    pathname:
      "pathname" in input && typeof input.pathname === "string"
        ? input.pathname
        : "/",
  };
}

function matchesCondition(
  config: ConditionConfig | undefined,
  signals: VisitorSignals,
  flowId: string,
  now: number,
) {
  if (!config) return false;
  switch (config.kind) {
    case "visitCount":
      return signals.visitCount >= config.value;
    case "pagePath":
      return signals.pathname === config.value;
    case "selectedServiceId":
      return signals.selectedServiceId === config.value;
    case "selectedBranchId":
      return signals.selectedBranchId === config.value;
    case "whatsappBookingIntent":
      return Boolean(
        signals.whatsappBookingIntentAt &&
        now - signals.whatsappBookingIntentAt <= WHATSAPP_INTENT_TTL_MS,
      );
    case "cooldown":
      return cooldownElapsed(signals.flows?.[flowId], config.value, now);
  }
}

function isConditionConfig(value: unknown): value is ConditionConfig {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    "operator" in value &&
    "value" in value
  );
}

function cooldownElapsed(
  state: FlowTerminalState | undefined,
  duration: number,
  now: number,
) {
  const terminalAt = Math.max(
    state?.shownAt ?? 0,
    state?.dismissedAt ?? 0,
    state?.completedAt ?? 0,
  );
  return terminalAt === 0 || now - terminalAt >= duration;
}
