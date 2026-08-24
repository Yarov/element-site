import { describe, expect, it } from "vitest";
import { evaluateFlow } from "../evaluator";
import { seedFlow } from "../fixtures";
import { validateFlow } from "../schema";
import type { SurveyFlow } from "../model";

const conditionalFlow: SurveyFlow = {
  ...seedFlow,
  id: "service-flow",
  nodes: [
    {
      id: "trigger",
      type: "trigger",
      label: "Inicio",
      config: { visitCount: 1 },
    },
    {
      id: "service",
      type: "condition",
      label: "Servicio",
      config: { kind: "selectedServiceId", operator: "equals", value: "svc-1" },
    },
    {
      id: "survey",
      type: "survey",
      label: "Encuesta",
      config: {
        fields: [
          {
            id: "feedback",
            kind: "text",
            label: "Feedback",
            required: true,
          },
        ],
      },
    },
    { id: "action", type: "action", label: "Fin", config: {} },
  ],
  edges: [
    { from: "trigger", to: "service", outcome: "next" },
    { from: "service", to: "survey", outcome: "match" },
    { from: "service", to: "action", outcome: "else" },
    { from: "survey", to: "action", outcome: "next" },
  ],
};

describe("survey flow evaluator", () => {
  it("does not activate before the third visit", () => {
    expect(evaluateFlow(seedFlow, { visitCount: 2 })).toMatchObject({
      matched: false,
      path: ["3 visitas"],
      reasons: ["trigger:visitCount:fail"],
    });
  });

  it("preserves legacy visit and page-path behavior", () => {
    const flow = {
      ...seedFlow,
      nodes: [
        {
          ...seedFlow.nodes[0],
          config: { visitCount: 3, pagePath: "/reservar" },
        },
        ...seedFlow.nodes.slice(1),
      ],
    } as SurveyFlow;
    expect(evaluateFlow(flow, { visitCount: 3, pathname: "/" }).matched).toBe(
      false,
    );
    expect(
      evaluateFlow(flow, { visitCount: 3, pathname: "/reservar" }).matched,
    ).toBe(true);
  });

  it("matches any catalog page path and gives it precedence over a legacy path", () => {
    const flow = {
      ...seedFlow,
      nodes: [
        {
          ...seedFlow.nodes[0],
          config: { pagePath: "/legacy", pagePaths: ["/", "/blog"] },
        },
        ...seedFlow.nodes.slice(1),
      ],
    } as SurveyFlow;

    expect(evaluateFlow(flow, { visitCount: 3, pathname: "/" }).matched).toBe(
      true,
    );
    expect(
      evaluateFlow(flow, { visitCount: 3, pathname: "/blog" }).matched,
    ).toBe(true);
    expect(
      evaluateFlow(flow, { visitCount: 3, pathname: "/legacy" }).matched,
    ).toBe(false);
  });

  it("does not restrict a trigger when it has no page target", () => {
    const flow = {
      ...seedFlow,
      nodes: [
        {
          ...seedFlow.nodes[0],
          config: { visitCount: 3 },
        },
        ...seedFlow.nodes.slice(1),
      ],
    } as SurveyFlow;

    expect(
      evaluateFlow(flow, { visitCount: 3, pathname: "/cualquier-ruta" })
        .matched,
    ).toBe(true);
  });

  it("matches every page with explicit all targeting", () => {
    const flow = {
      ...seedFlow,
      nodes: [
        {
          ...seedFlow.nodes[0],
          config: { visitCount: 3, targetMode: "all" },
        },
        ...seedFlow.nodes.slice(1),
      ],
    } as SurveyFlow;

    expect(
      evaluateFlow(flow, { visitCount: 3, pathname: "/cualquier-ruta" })
        .matched,
    ).toBe(true);
  });

  it("restricts explicit selected targeting to its public paths", () => {
    const flow = {
      ...seedFlow,
      nodes: [
        {
          ...seedFlow.nodes[0],
          config: { targetMode: "selected", pagePaths: ["/", "/blog"] },
        },
        ...seedFlow.nodes.slice(1),
      ],
    } as SurveyFlow;

    expect(evaluateFlow(flow, { visitCount: 3, pathname: "/" }).matched).toBe(
      true,
    );
    expect(
      evaluateFlow(flow, { visitCount: 3, pathname: "/reservar" }).matched,
    ).toBe(false);
  });

  it("follows explicit matching and fallback condition edges with diagnostics", () => {
    const matching = evaluateFlow(conditionalFlow, {
      visitCount: 1,
      pathname: "/",
      selectedServiceId: "svc-1",
    });
    expect(matching).toMatchObject({
      matched: true,
      path: ["Inicio", "Servicio", "Encuesta", "Fin"],
    });
    expect(matching.reasons).toEqual([
      "trigger:match",
      "edge:next",
      "condition:selectedServiceId:match",
      "edge:match",
      "edge:next",
    ]);

    const fallback = evaluateFlow(conditionalFlow, {
      visitCount: 1,
      pathname: "/",
    });
    expect(fallback).toMatchObject({
      matched: false,
      path: ["Inicio", "Servicio", "Fin"],
    });
    expect(fallback.reasons).toContain("condition:selectedServiceId:else");
  });

  it("suppresses a flow until its cooldown elapses", () => {
    const flow: SurveyFlow = {
      ...conditionalFlow,
      nodes: [
        conditionalFlow.nodes[0],
        {
          id: "cooldown",
          type: "condition",
          label: "Cooldown",
          config: { kind: "cooldown", operator: "elapsed", value: 1_000 },
        },
        conditionalFlow.nodes[2],
        conditionalFlow.nodes[3],
      ],
      edges: [
        { from: "trigger", to: "cooldown", outcome: "next" },
        { from: "cooldown", to: "survey", outcome: "match" },
        { from: "cooldown", to: "action", outcome: "else" },
        { from: "survey", to: "action", outcome: "next" },
      ],
    };
    expect(
      evaluateFlow(
        flow,
        {
          visitCount: 1,
          pathname: "/",
          flows: { [flow.id]: { dismissedAt: 5_000 } },
        },
        5_500,
      ).matched,
    ).toBe(false);
    expect(
      evaluateFlow(
        flow,
        {
          visitCount: 1,
          pathname: "/",
          flows: { [flow.id]: { dismissedAt: 5_000 } },
        },
        6_000,
      ).matched,
    ).toBe(true);
  });

  it("normalizes legacy unlabelled edges to next", () => {
    const legacy = {
      ...seedFlow,
      edges: [
        { from: "trigger", to: "survey" },
        { from: "survey", to: "action" },
      ],
    };
    expect(validateFlow(legacy).success).toBe(true);
    expect(evaluateFlow(legacy as SurveyFlow, { visitCount: 3 }).matched).toBe(
      true,
    );
  });

  it("rejects malformed graphs without throwing", () => {
    expect(
      evaluateFlow(
        { ...seedFlow, nodes: [{ ...seedFlow.nodes[0], label: "" }] },
        { visitCount: 3 },
      ).errors,
    ).toHaveLength(1);
    const gate = {
      ...conditionalFlow,
      edges: conditionalFlow.edges.filter((edge) => edge.outcome !== "else"),
    };
    expect(validateFlow(gate).success).toBe(true);
    expect(
      evaluateFlow(gate, { visitCount: 3, pathname: "/" }).matched,
    ).toBe(false);
    expect(
      validateFlow({
        ...seedFlow,
        edges: [
          ...seedFlow.edges,
          { from: "action", to: "trigger", outcome: "next" },
        ],
      }).success,
    ).toBe(false);
  });
});
