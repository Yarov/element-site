export const NODE_TYPES = {
  TRIGGER: "trigger",
  CONDITION: "condition",
  SURVEY: "survey",
  ACTION: "action",
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

export const EDGE_OUTCOMES = {
  NEXT: "next",
  MATCH: "match",
  ELSE: "else",
} as const;

export type EdgeOutcome = (typeof EDGE_OUTCOMES)[keyof typeof EDGE_OUTCOMES];

export const CONDITION_KINDS = {
  VISIT_COUNT: "visitCount",
  PAGE_PATH: "pagePath",
  SELECTED_SERVICE_ID: "selectedServiceId",
  SELECTED_BRANCH_ID: "selectedBranchId",
  WHATSAPP_BOOKING_INTENT: "whatsappBookingIntent",
  COOLDOWN: "cooldown",
} as const;

export type ConditionKind =
  (typeof CONDITION_KINDS)[keyof typeof CONDITION_KINDS];

export type SurveyField = {
  id: string;
  kind: "text" | "singleChoice" | "rating" | "cta";
  label: string;
  required: boolean;
  options?: string[];
};

export type TriggerConfig = {
  visitCount?: number;
  pagePath?: string;
};

export type VisitCountCondition = {
  kind: typeof CONDITION_KINDS.VISIT_COUNT;
  operator: "gte";
  value: number;
};

export type PagePathCondition = {
  kind: typeof CONDITION_KINDS.PAGE_PATH;
  operator: "equals";
  value: string;
};

export type SelectedServiceCondition = {
  kind: typeof CONDITION_KINDS.SELECTED_SERVICE_ID;
  operator: "equals";
  value: string;
};

export type SelectedBranchCondition = {
  kind: typeof CONDITION_KINDS.SELECTED_BRANCH_ID;
  operator: "equals";
  value: string;
};

export type WhatsappBookingIntentCondition = {
  kind: typeof CONDITION_KINDS.WHATSAPP_BOOKING_INTENT;
  operator: "isTrue";
  value: true;
};

export type CooldownCondition = {
  kind: typeof CONDITION_KINDS.COOLDOWN;
  operator: "elapsed";
  value: number;
};

export type ConditionConfig =
  | VisitCountCondition
  | PagePathCondition
  | SelectedServiceCondition
  | SelectedBranchCondition
  | WhatsappBookingIntentCondition
  | CooldownCondition;

// Retains editor type compatibility until Phase 2 replaces the old free-form control.
export type LegacyConditionConfig = { rule?: string };

export type SurveyConfig = { fields: SurveyField[] };
export type ActionConfig = { message?: string };
export type NodePosition = { x: number; y: number };

type WorkflowNodeBase = {
  id: string;
  label: string;
  position?: NodePosition;
};

export type WorkflowNodeConfig = Record<string, unknown> &
  (
    | TriggerConfig
    | ConditionConfig
    | LegacyConditionConfig
    | SurveyConfig
    | ActionConfig
  );

export type WorkflowNode = WorkflowNodeBase & {
  type: NodeType;
  config: WorkflowNodeConfig;
};

export type TriggerNode = WorkflowNode & { type: typeof NODE_TYPES.TRIGGER };
export type ConditionNode = WorkflowNode & {
  type: typeof NODE_TYPES.CONDITION;
};
export type SurveyNode = WorkflowNode & { type: typeof NODE_TYPES.SURVEY };
export type ActionNode = WorkflowNode & { type: typeof NODE_TYPES.ACTION };

export type WorkflowEdge = {
  from: string;
  to: string;
  outcome?: EdgeOutcome;
};

export type SurveyFlow = {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  updatedAt: string;
};

export type FlowTerminalState = {
  shownAt?: number;
  dismissedAt?: number;
  completedAt?: number;
};

export type VisitorSignals = {
  visitCount: number;
  pathname: string;
  selectedServiceId?: string;
  selectedServiceAt?: number;
  selectedBranchId?: string;
  selectedBranchAt?: number;
  whatsappBookingIntentAt?: number;
  flows?: Record<string, FlowTerminalState>;
};

export type Visitor = Pick<VisitorSignals, "visitCount">;

export type EvaluationResult = {
  matched: boolean;
  path: string[];
  reasons: string[];
  survey?: SurveyNode;
  action?: ActionNode;
  errors: string[];
};
