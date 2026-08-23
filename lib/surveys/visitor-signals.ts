import type { FlowTerminalState, VisitorSignals } from "./model";

export const VISITOR_SIGNALS_STORAGE_KEY = "elementspa:survey-signals:v1";
export const SESSION_DISPLAY_DEDUPE_KEY = "elementspa:survey-display-dedupe:v1";

const DAY_MS = 24 * 60 * 60 * 1000;
const SELECTION_TTL_MS = 30 * DAY_MS;
const FLOW_STATE_TTL_MS = 90 * DAY_MS;

type StoredVisitorSignals = Omit<VisitorSignals, "visitCount" | "pathname">;

export function readVisitorSignals(now = Date.now()): StoredVisitorSignals {
  const stored = readStoredSignals();
  const pruned = pruneSignals(stored, now);
  if (JSON.stringify(stored) !== JSON.stringify(pruned))
    writeStoredSignals(pruned);
  return pruned;
}

export function getVisitorSignals(
  visitCount: number,
  pathname: string,
  now = Date.now(),
): VisitorSignals {
  return {
    visitCount: Number.isFinite(visitCount) ? visitCount : 0,
    pathname,
    ...readVisitorSignals(now),
  };
}

export function recordSelectedService(serviceId: string, now = Date.now()) {
  if (!serviceId) return false;
  return updateSignals(
    (signals) => ({
      ...signals,
      selectedServiceId: serviceId,
      selectedServiceAt: now,
    }),
    now,
  );
}

export function recordSelectedBranch(branchId: string, now = Date.now()) {
  if (!branchId) return false;
  return updateSignals(
    (signals) => ({
      ...signals,
      selectedBranchId: branchId,
      selectedBranchAt: now,
    }),
    now,
  );
}

export function recordWhatsappBookingIntent(now = Date.now()) {
  return updateSignals(
    (signals) => ({ ...signals, whatsappBookingIntentAt: now }),
    now,
  );
}

export function recordFlowShown(flowId: string, now = Date.now()) {
  return updateFlowState(flowId, { shownAt: now }, now);
}

export function recordFlowDismissed(flowId: string, now = Date.now()) {
  return updateFlowState(flowId, { dismissedAt: now }, now);
}

export function recordFlowCompleted(flowId: string, now = Date.now()) {
  return updateFlowState(flowId, { completedAt: now }, now);
}

export function wasShownThisSession(flowId: string) {
  try {
    return (
      getSessionStorage()?.getItem(
        `${SESSION_DISPLAY_DEDUPE_KEY}:${flowId}`,
      ) === "1"
    );
  } catch {
    return false;
  }
}

export function markShownThisSession(flowId: string) {
  try {
    const storage = getSessionStorage();
    if (!storage) return false;
    storage.setItem(`${SESSION_DISPLAY_DEDUPE_KEY}:${flowId}`, "1");
    return true;
  } catch {
    return false;
  }
}

export function resetVisitorSignals() {
  try {
    getLocalStorage()?.removeItem(VISITOR_SIGNALS_STORAGE_KEY);
    const storage = getSessionStorage();
    if (storage) {
      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const key = storage.key(index);
        if (key?.startsWith(SESSION_DISPLAY_DEDUPE_KEY))
          storage.removeItem(key);
      }
    }
    return true;
  } catch {
    return false;
  }
}

function updateFlowState(
  flowId: string,
  state: FlowTerminalState,
  now: number,
) {
  if (!flowId) return false;
  return updateSignals(
    (signals) => ({
      ...signals,
      flows: {
        ...signals.flows,
        [flowId]: { ...signals.flows?.[flowId], ...state },
      },
    }),
    now,
  );
}

function updateSignals(
  updater: (signals: StoredVisitorSignals) => StoredVisitorSignals,
  now: number,
) {
  return writeStoredSignals(
    pruneSignals(updater(readVisitorSignals(now)), now),
  );
}

function readStoredSignals(): StoredVisitorSignals {
  try {
    const raw = getLocalStorage()?.getItem(VISITOR_SIGNALS_STORAGE_KEY);
    if (!raw) return {};
    return sanitizeStoredSignals(JSON.parse(raw));
  } catch {
    return {};
  }
}

function writeStoredSignals(signals: StoredVisitorSignals) {
  try {
    const storage = getLocalStorage();
    if (!storage) return false;
    storage.setItem(VISITOR_SIGNALS_STORAGE_KEY, JSON.stringify(signals));
    return true;
  } catch {
    return false;
  }
}

function pruneSignals(
  signals: StoredVisitorSignals,
  now: number,
): StoredVisitorSignals {
  const next: StoredVisitorSignals = {};
  if (
    signals.selectedServiceId &&
    isRecent(signals.selectedServiceAt, now, SELECTION_TTL_MS)
  ) {
    next.selectedServiceId = signals.selectedServiceId;
    next.selectedServiceAt = signals.selectedServiceAt;
  }
  if (
    signals.selectedBranchId &&
    isRecent(signals.selectedBranchAt, now, SELECTION_TTL_MS)
  ) {
    next.selectedBranchId = signals.selectedBranchId;
    next.selectedBranchAt = signals.selectedBranchAt;
  }
  if (isRecent(signals.whatsappBookingIntentAt, now, DAY_MS))
    next.whatsappBookingIntentAt = signals.whatsappBookingIntentAt;
  const flows = Object.fromEntries(
    Object.entries(signals.flows ?? {}).filter(([, state]) =>
      isRecent(
        Math.max(
          state.shownAt ?? 0,
          state.dismissedAt ?? 0,
          state.completedAt ?? 0,
        ),
        now,
        FLOW_STATE_TTL_MS,
      ),
    ),
  );
  if (Object.keys(flows).length) next.flows = flows;
  return next;
}

function isRecent(timestamp: number | undefined, now: number, ttl: number) {
  return (
    typeof timestamp === "number" && timestamp <= now && now - timestamp <= ttl
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeStoredSignals(value: unknown): StoredVisitorSignals {
  if (!isRecord(value)) return {};
  const signals = value;
  const next: StoredVisitorSignals = {};
  if (typeof signals.selectedServiceId === "string")
    next.selectedServiceId = signals.selectedServiceId;
  if (typeof signals.selectedServiceAt === "number")
    next.selectedServiceAt = signals.selectedServiceAt;
  if (typeof signals.selectedBranchId === "string")
    next.selectedBranchId = signals.selectedBranchId;
  if (typeof signals.selectedBranchAt === "number")
    next.selectedBranchAt = signals.selectedBranchAt;
  if (typeof signals.whatsappBookingIntentAt === "number")
    next.whatsappBookingIntentAt = signals.whatsappBookingIntentAt;
  if (isRecord(signals.flows)) {
    const flows = Object.fromEntries(
      Object.entries(signals.flows).flatMap(([id, state]) => {
        if (!isRecord(state)) return [];
        const terminal: FlowTerminalState = {};
        if (typeof state.shownAt === "number") terminal.shownAt = state.shownAt;
        if (typeof state.dismissedAt === "number")
          terminal.dismissedAt = state.dismissedAt;
        if (typeof state.completedAt === "number")
          terminal.completedAt = state.completedAt;
        return Object.keys(terminal).length ? [[id, terminal]] : [];
      }),
    );
    if (Object.keys(flows).length) next.flows = flows;
  }
  return next;
}

function getLocalStorage() {
  return typeof window === "undefined" ? undefined : window.localStorage;
}

function getSessionStorage() {
  return typeof window === "undefined" ? undefined : window.sessionStorage;
}
