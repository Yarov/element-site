import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  VISITOR_SIGNALS_STORAGE_KEY,
  getVisitorSignals,
  markShownThisSession,
  readVisitorSignals,
  recordFlowDismissed,
  recordFlowShown,
  recordSelectedService,
  recordWhatsappBookingIntent,
  resetVisitorSignals,
  wasShownThisSession,
} from "../visitor-signals";

const NOW = 1_000_000_000;

class MemoryStorage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: new MemoryStorage(),
  });
  Object.defineProperty(window, "sessionStorage", {
    configurable: true,
    value: new MemoryStorage(),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("visitor signals", () => {
  it("keeps only anonymous stable IDs and prunes expired values", () => {
    recordSelectedService("svc-1", NOW);
    recordWhatsappBookingIntent(NOW);
    recordFlowDismissed("flow-1", NOW);

    expect(getVisitorSignals(3, "/reservar", NOW)).toEqual({
      visitCount: 3,
      pathname: "/reservar",
      selectedServiceId: "svc-1",
      selectedServiceAt: NOW,
      whatsappBookingIntentAt: NOW,
      flows: { "flow-1": { dismissedAt: NOW } },
    });
    expect(
      readVisitorSignals(NOW + 24 * 60 * 60 * 1000 + 1).whatsappBookingIntentAt,
    ).toBeUndefined();
    expect(readVisitorSignals(NOW + 90 * 24 * 60 * 60 * 1000 + 1)).toEqual({});
  });

  it("persists terminal state under the flow identity used by the evaluator", () => {
    const storeId = "11111111-1111-4111-8111-111111111111";
    const flowId = "graph-flow-id";

    expect(recordFlowShown(storeId, NOW, flowId)).toBe(true);
    expect(
      getVisitorSignals(3, "/", NOW),
    ).toEqual({
      visitCount: 3,
      pathname: "/",
      flows: { [flowId]: { shownAt: NOW } },
    });
  });

  it("drops malformed and non-permitted stored fields", () => {
    window.localStorage.setItem(
      VISITOR_SIGNALS_STORAGE_KEY,
      JSON.stringify({
        selectedServiceId: "svc-1",
        selectedServiceTitle: "Relax",
        phone: "+52 55",
        flows: { "flow-1": { shownAt: NOW, answer: "private" } },
      }),
    );

    expect(readVisitorSignals(NOW)).toEqual({
      flows: { "flow-1": { shownAt: NOW } },
    });
  });

  it("deduplicates display in the current session and resets all local state", () => {
    expect(wasShownThisSession("flow-1")).toBe(false);
    expect(markShownThisSession("flow-1")).toBe(true);
    expect(wasShownThisSession("flow-1")).toBe(true);
    recordSelectedService("svc-1", NOW);

    expect(resetVisitorSignals()).toBe(true);
    expect(window.localStorage.getItem(VISITOR_SIGNALS_STORAGE_KEY)).toBeNull();
    expect(wasShownThisSession("flow-1")).toBe(false);
  });

  it("returns safe empty state when browser storage is unavailable", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(readVisitorSignals(NOW)).toEqual({});
    expect(recordSelectedService("svc-1", NOW)).toBe(false);
    expect(getVisitorSignals(2, "/", NOW)).toEqual({
      visitCount: 2,
      pathname: "/",
    });
  });
});
