import { describe, expect, it } from "vitest";
import { admitResponse, validateFlow } from "../schema";
import { createStarterFlow, seedFlow } from "../fixtures";

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
