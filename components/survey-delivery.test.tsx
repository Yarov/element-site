import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { seedFlow } from "@/lib/surveys/fixtures";
import type { SurveyField, SurveyFlow } from "@/lib/surveys/model";
import { VISITOR_SIGNALS_STORAGE_KEY } from "@/lib/surveys/visitor-signals";
import { SurveyDelivery } from "./survey-delivery";

vi.mock("@/lib/marketing/client", () => ({ getVisitCount: () => 3 }));

let currentPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

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
    currentPathname = "/";
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
    await renderFlows(
      [{ id: "flow-1", flow: flowWithFields(fields) }],
      response,
    );
  }

  async function renderFlows(
    flows: Array<{ id: string; flow: SurveyFlow }>,
    response?: Promise<Response>,
  ) {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ flows }), { status: 200 }),
      );
    if (response) fetchMock.mockReturnValueOnce(response);
    globalThis.fetch = fetchMock;

    await act(async () => root.render(<SurveyDelivery />));
    await act(async () => Promise.resolve());
  }

  function flowForPath(
    id: string,
    name: string,
    path: string,
    fields: SurveyField[] = [
      { id: "feedback", kind: "text", label: "Comentario", required: true },
    ],
  ): SurveyFlow {
    const flow = flowWithFields(fields);
    return {
      ...flow,
      id,
      nodes: flow.nodes.map((node) => {
        if (node.type === "trigger") {
          return { ...node, config: { visitCount: 3, pagePaths: [path] } };
        }
        if (node.type === "survey") return { ...node, label: name };
        return node;
      }),
    };
  }

  function button(name: string) {
    const element = Array.from(container.querySelectorAll("button")).find(
      (candidate) => candidate.textContent?.trim() === name,
    );
    expect(element).toBeDefined();
    return element!;
  }

  function click(name: string) {
    act(() =>
      button(name).dispatchEvent(new MouseEvent("click", { bubbles: true })),
    );
  }

  function clickByLabel(label: string) {
    const element = container.querySelector(`[aria-label="${label}"]`);
    expect(element).toBeInstanceOf(HTMLButtonElement);
    act(() =>
      element?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
    );
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

  async function navigate(pathname: string) {
    currentPathname = pathname;
    await act(async () => root.render(<SurveyDelivery />));
    await act(async () => Promise.resolve());
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
      form?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      ),
    );
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(container.querySelector('button[type="submit"]')).toBeDisabled();

    await act(async () =>
      form?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      ),
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
      JSON.parse(
        window.localStorage.getItem(VISITOR_SIGNALS_STORAGE_KEY) ?? "{}",
      ),
    ).toMatchObject({
      flows: { "flow-1": { completedAt: expect.any(Number) } },
    });
  });

  it("shows the configured completion message after submitting", async () => {
    let resolveResponse: ((response: Response) => void) | undefined;
    const response = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    const flow = flowWithFields([
      { id: "feedback", kind: "text", label: "Comentario", required: true },
    ]);
    await renderFlows(
      [
        {
          id: "flow-1",
          flow: {
            ...flow,
            nodes: flow.nodes.map((node) =>
              node.type === "action"
                ? { ...node, config: { message: "Gracias, ya recibimos tus comentarios." } }
                : node,
            ),
          },
        },
      ],
      response,
    );

    enterText("Todo excelente");
    const form = container.querySelector("form");
    await act(async () =>
      form?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      ),
    );
    resolveResponse?.(new Response(null, { status: 200 }));
    await act(async () => Promise.resolve());

    expect(container.textContent).toContain("Gracias, ya recibimos tus comentarios.");
  });

  it("re-evaluates eligible surveys after client-side pathname navigation", async () => {
    await renderFlows([
      { id: "home", flow: flowForPath("home", "Encuesta Inicio", "/") },
      { id: "blog", flow: flowForPath("blog", "Encuesta Blog", "/blog") },
    ]);

    expect(container.textContent).toContain("Encuesta Inicio");

    await navigate("/blog");

    expect(container.textContent).toContain("Encuesta Blog");
    expect(container.textContent).not.toContain("Encuesta Inicio");
  });

  it("resets partial answers and progress when navigation selects another flow", async () => {
    await renderFlows([
      {
        id: "home",
        flow: flowForPath("home", "Encuesta Inicio", "/", [
          { id: "feedback", kind: "text", label: "Comentario", required: true },
          {
            id: "followup",
            kind: "text",
            label: "Otro detalle",
            required: false,
          },
        ]),
      },
      { id: "blog", flow: flowForPath("blog", "Encuesta Blog", "/blog") },
    ]);

    enterText("Gran visita");
    click("Siguiente");
    expect(container.textContent).toContain("Pregunta 2 de 2");

    await navigate("/blog");

    expect(container.textContent).toContain("Encuesta Blog");
    expect(container.textContent).toContain("Pregunta 1 de 1");
    expect(container.querySelector("textarea")?.value).toBe("");
  });

  it.each([200, 500])(
    "does not apply a pending submission result after navigation selects another flow (%i)",
    async (status) => {
      let resolveResponse: ((response: Response) => void) | undefined;
      const pendingResponse = new Promise<Response>((resolve) => {
        resolveResponse = resolve;
      });
      await renderFlows(
        [
          { id: "home", flow: flowForPath("home", "Encuesta Inicio", "/") },
          { id: "blog", flow: flowForPath("blog", "Encuesta Blog", "/blog") },
        ],
        pendingResponse,
      );

      enterText("Gran visita");
      const form = container.querySelector("form");
      await act(async () =>
        form?.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        ),
      );

      await navigate("/blog");
      expect(container.textContent).toContain("Encuesta Blog");

      resolveResponse?.(new Response(null, { status }));
      await act(async () => Promise.resolve());

      expect(container.textContent).toContain("Encuesta Blog");
      expect(container.textContent).not.toContain("Gracias por compartir");
      expect(container.querySelector('[role="alert"]')).toBeNull();
    },
  );

  it("shows another eligible flow after dismissing the previous one", async () => {
    await renderFlows([
      { id: "home", flow: flowForPath("home", "Encuesta Inicio", "/") },
      { id: "blog", flow: flowForPath("blog", "Encuesta Blog", "/blog") },
    ]);

    clickByLabel("Cerrar encuesta");
    expect(container.textContent).toBe("");

    await navigate("/blog");

    expect(container.textContent).toContain("Encuesta Blog");
  });

  it("shows a new flow form after completing the previous one", async () => {
    await renderFlows(
      [
        { id: "home", flow: flowForPath("home", "Encuesta Inicio", "/") },
        { id: "blog", flow: flowForPath("blog", "Encuesta Blog", "/blog") },
      ],
      Promise.resolve(new Response(null, { status: 200 })),
    );

    enterText("Gran visita");
    const form = container.querySelector("form");
    await act(async () =>
      form?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      ),
    );

    expect(container.textContent).toContain("Gracias por compartir");

    await navigate("/blog");

    expect(container.textContent).toContain("Encuesta Blog");
    expect(container.textContent).not.toContain("Gracias por compartir");
    expect(container.querySelector("form")).not.toBeNull();
  });
});
