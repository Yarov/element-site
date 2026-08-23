import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { seedFlow } from "@/lib/surveys/fixtures";
import { VISITOR_SIGNALS_STORAGE_KEY } from "@/lib/surveys/visitor-signals";
import { SurveyDelivery } from "./survey-delivery";

vi.mock("@/lib/marketing/client", () => ({ getVisitCount: () => 3 }));

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe("SurveyDelivery", () => {
  let container: HTMLDivElement | undefined;
  let root: ReturnType<typeof createRoot> | undefined;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: new MemoryStorage(),
    });
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: new MemoryStorage(),
    });
    container = document.createElement("div");
    root = createRoot(container);
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    const activeRoot = root;
    if (activeRoot) act(() => activeRoot.unmount());
    globalThis.fetch = originalFetch;
  });

  async function renderWithResponseStatus(status: number) {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            flows: [{ id: "flow-1", flow: seedFlow }],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status }));

    await act(async () => root?.render(<SurveyDelivery />));
    await act(async () => Promise.resolve());
    const rating = container?.querySelector('button[aria-pressed="false"]');
    expect(rating).not.toBeNull();
    act(() =>
      rating?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
    );
    const feedback = container?.querySelector("textarea");
    expect(feedback).not.toBeNull();
    act(() => {
      if (feedback instanceof HTMLTextAreaElement) {
        const valueSetter = Object.getOwnPropertyDescriptor(
          HTMLTextAreaElement.prototype,
          "value",
        )?.set;
        valueSetter?.call(feedback, "Great visit");
        feedback.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    const form = container?.querySelector("form");
    expect(form).not.toBeNull();
    await act(async () =>
      form?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      ),
    );
    await act(async () => Promise.resolve());
  }

  it("records completion after a successful response", async () => {
    await renderWithResponseStatus(200);

    expect(
      JSON.parse(
        window.localStorage.getItem(VISITOR_SIGNALS_STORAGE_KEY) ?? "{}",
      ),
    ).toMatchObject({
      flows: { "flow-1": { completedAt: expect.any(Number) } },
    });
  });

  it("does not record completion when the response fails", async () => {
    await renderWithResponseStatus(500);

    expect(
      JSON.parse(
        window.localStorage.getItem(VISITOR_SIGNALS_STORAGE_KEY) ?? "{}",
      ),
    ).not.toMatchObject({
      flows: { "flow-1": { completedAt: expect.any(Number) } },
    });
  });
});
