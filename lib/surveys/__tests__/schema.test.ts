import { describe, expect, it } from "vitest";
import { admitResponse, validateFlow } from "../schema";
import { createStarterFlow, seedFlow } from "../fixtures";
import { PUBLIC_ROUTE_PATHS } from "@/lib/public-routes";

function responseFlow() {
  return {
    ...seedFlow,
    nodes: seedFlow.nodes.map((node) =>
      node.type === "survey"
        ? {
            ...node,
            config: {
              fields: [
                {
                  id: "comment",
                  kind: "text" as const,
                  label: "Comment",
                  required: true,
                },
                {
                  id: "service",
                  kind: "singleChoice" as const,
                  label: "Service",
                  required: false,
                  options: ["Massage", "Facial"],
                },
                {
                  id: "rating",
                  kind: "rating" as const,
                  label: "Rating",
                  required: true,
                },
              ],
            },
          }
        : node,
    ),
  };
}

describe("survey flow validation", () => {
  it("creates a valid starter flow", () => {
    expect(validateFlow(createStarterFlow()).success).toBe(true);
  });

  it("accepts explicit all and selected target modes alongside legacy triggers", () => {
    const trigger = seedFlow.nodes[0];
    const selected = {
      ...seedFlow,
      nodes: [
        {
          ...trigger,
          config: {
            targetMode: "selected",
            pagePaths: [PUBLIC_ROUTE_PATHS[0], PUBLIC_ROUTE_PATHS[1]],
          },
        },
        ...seedFlow.nodes.slice(1),
      ],
    };
    const all = {
      ...seedFlow,
      nodes: [
        { ...trigger, config: { targetMode: "all" } },
        ...seedFlow.nodes.slice(1),
      ],
    };
    const legacy = {
      ...seedFlow,
      nodes: [
        { ...trigger, config: { pagePaths: [PUBLIC_ROUTE_PATHS[0]] } },
        ...seedFlow.nodes.slice(1),
      ],
    };

    expect(validateFlow(selected).success).toBe(true);
    expect(validateFlow(all).success).toBe(true);
    expect(validateFlow(legacy).success).toBe(true);
  });

  it("requires unique public paths only for explicit selected targeting", () => {
    const trigger = seedFlow.nodes[0];
    for (const pagePaths of [[], ["/", "/"], ["/not-a-public-route"]]) {
      expect(
        validateFlow({
          ...seedFlow,
          nodes: [
            { ...trigger, config: { targetMode: "selected", pagePaths } },
            ...seedFlow.nodes.slice(1),
          ],
        }).success,
      ).toBe(false);
    }
    expect(
      validateFlow({
        ...seedFlow,
        nodes: [
          { ...trigger, config: { targetMode: "selected" } },
          ...seedFlow.nodes.slice(1),
        ],
      }).success,
    ).toBe(false);
    expect(
      validateFlow({
        ...seedFlow,
        nodes: [
          { ...trigger, config: { targetMode: "all", pagePaths: ["/"] } },
          ...seedFlow.nodes.slice(1),
        ],
      }).success,
    ).toBe(false);
  });

  it("requires a reachable required text field and terminal action", () => {
    expect(validateFlow(responseFlow()).success).toBe(true);
    expect(
      validateFlow({
        ...seedFlow,
        nodes: seedFlow.nodes.map((node) =>
          node.type === "survey" ? { ...node, config: { fields: [] } } : node,
        ),
      }).success,
    ).toBe(false);
    expect(
      validateFlow({
        ...responseFlow(),
        edges: responseFlow().edges.slice(0, 1),
      }).success,
    ).toBe(false);
  });
});

describe("response admission", () => {
  it("normalizes answers for a published valid flow", () => {
    expect(
      admitResponse(responseFlow(), "published", {
        comment: "  Great visit  ",
        service: "Massage",
        rating: 5,
      }),
    ).toEqual({
      success: true,
      answers: { comment: "Great visit", service: "Massage", rating: 5 },
    });
  });

  it("rejects unpublished, invalid, and unusable flows", () => {
    expect(admitResponse(responseFlow(), "draft", {})).toMatchObject({
      success: false,
      status: 409,
      error: { code: "FLOW_NOT_PUBLISHED" },
    });
    expect(
      admitResponse(
        {
          ...seedFlow,
          nodes: seedFlow.nodes.filter((node) => node.type !== "action"),
        },
        "published",
        {},
      ),
    ).toMatchObject({
      success: false,
      status: 422,
      error: { code: "INVALID_FLOW" },
    });
  });

  it("rejects malformed, unknown, incomplete, choice, and rating answers", () => {
    for (const answers of [
      null,
      { unknown: "value", comment: "ok", rating: 5 },
      { comment: "", rating: 5 },
      { comment: "ok", service: "Unknown", rating: 5 },
      { comment: "ok", rating: 6 },
    ]) {
      expect(admitResponse(responseFlow(), "published", answers)).toMatchObject(
        {
          success: false,
          status: 400,
          error: { code: "INVALID_ANSWERS" },
        },
      );
    }
  });
});
