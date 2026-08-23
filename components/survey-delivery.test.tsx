import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { seedFlow } from "@/lib/surveys/fixtures";
import type { SurveyField, SurveyFlow } from "@/lib/surveys/model";
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

function flowWithFields(fields: SurveyField[]): SurveyFlow {
  return {
    ...seedFlow,
    nodes: seedFlow.nodes.map((node) =>
      node.type === "survey" ? { ...node, config: { fields } } : node,
    ),
  };
}

describe("SurveyDelivery", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
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
    act(() => root.unmount());
    globalThis.fetch = originalFetch;
  });

  async function render(fields: SurveyField[], response?: Promise<Response>) {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ flows: [{ id: "flow-1", flow: flowWithFields(fields) }] }),
          { status: 200 },
        ),
      );
    if (response) fetchMock.mockReturnValueOnce(response);
    globalThis.fetch = fetchMock;

    await act(async () => root.render(<SurveyDelivery />));
    await act(async () => Promise.resolve());
  }

  function button(name: string) {
    const element = Array.from(container.querySelectorAll("button")).find(
      (candidate) => candidate.textContent?.trim() === name,
    );
    expect(element).toBeDefined();
    return element!;
  }

  function click(name: string) {
    act(() => button(name).dispatchEvent(new MouseEvent("click", { bubbles: true })));
  }

  function enterText(value: string) {
    const textarea = container.querySelector("textarea");
    expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      setter?.call(textarea, value);
      textarea?.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  it("validates required text and preserves its answer when navigating back", async () => {
    await render([
      { id: "feedback", kind: "text", label: "Comentario", required: true },
      { id: "followup", kind: "text", label: "Otro detalle", required: false },
    ]);

    expect(container.textContent).toContain("Pregunta 1 de 2");
    click("Siguiente");
    expect(container.textContent).toContain("Esta pregunta es obligatoria");

    enterText("Gran visita");
    click("Siguiente");
    expect(container.textContent).toContain("Pregunta 2 de 2");
    click("Anterior");

    expect(container.querySelector("textarea")?.value).toBe("Gran visita");
  });

  it("skips optional steps and excludes CTA fields from positional progress", async () => {
    await render([
      { id: "cta", kind: "cta", label: "Promociones", required: false },
      { id: "optional", kind: "text", label: "Comentario", required: false },
      { id: "rating", kind: "rating", label: "Calificación", required: true },
    ]);

    expect(container.textContent).toContain("Pregunta 1 de 2");
    click("Siguiente");
    expect(container.textContent).toContain("Pregunta 2 de 2");
    click("Anterior");
    expect(container.textContent).toContain("Pregunta 1 de 2");
  });

  it("auto-advances non-final selections and submits the final answer once", async () => {
    let resolveResponse: ((response: Response) => void) | undefined;
    const pendingResponse = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    await render(
      [
        {
          id: "service",
          kind: "singleChoice",
          label: "Servicio",
          required: true,
          options: ["Masaje", "Facial"],
        },
        { id: "rating", kind: "rating", label: "Calificación", required: true },
      ],
      pendingResponse,
    );

    click("Masaje");
    expect(container.textContent).toContain("Pregunta 2 de 2");
    click("5");
    expect(container.textContent).toContain("Pregunta 2 de 2");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    await act(async () =>
      form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
    );
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(container.querySelector('button[type="submit"]')).toBeDisabled();

    await act(async () =>
      form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
    );
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);

    resolveResponse?.(new Response(null, { status: 200 }));
    await act(async () => Promise.resolve());

    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      "/api/surveys/flow-1/responses",
      expect.objectContaining({
        body: JSON.stringify({ answers: { service: "Masaje", rating: 5 } }),
      }),
    );
    expect(
      JSON.parse(window.localStorage.getItem(VISITOR_SIGNALS_STORAGE_KEY) ?? "{}"),
    ).toMatchObject({
      flows: { "flow-1": { completedAt: expect.any(Number) } },
    });
  });
});
