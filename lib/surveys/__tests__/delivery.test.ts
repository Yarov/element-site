import { describe, expect, it } from "vitest";
import { selectEligibleSurvey } from "../delivery";
import { seedFlow } from "../fixtures";

describe("survey delivery selection", () => {
  it("returns the first eligible flow in API priority order", () => {
    const first = { id: "first", flow: { ...seedFlow, id: "first" } };
    const second = { id: "second", flow: { ...seedFlow, id: "second" } };

    expect(
      selectEligibleSurvey(
        [first, second],
        { visitCount: 3, pathname: "/" },
        1_000,
      ),
    ).toMatchObject(first);
  });

  it("skips flows already displayed during the current tab session", () => {
    const first = { id: "first", flow: { ...seedFlow, id: "first" } };
    const second = { id: "second", flow: { ...seedFlow, id: "second" } };

    expect(
      selectEligibleSurvey(
        [first, second],
        { visitCount: 3, pathname: "/" },
        1_000,
        (id) => id === "first",
      ),
    ).toMatchObject(second);
  });

  it("returns the survey selected by a condition branch", () => {
    const flow = {
      ...seedFlow,
      nodes: [
        seedFlow.nodes[0],
        {
          id: "branch",
          type: "condition" as const,
          label: "Sucursal Condesa",
          config: {
            kind: "selectedBranchId" as const,
            operator: "equals" as const,
            value: "condesa",
          },
        },
        {
          id: "matching-survey",
          type: "survey" as const,
          label: "Encuesta Condesa",
          config: {
            fields: [
              {
                id: "feedback",
                kind: "text" as const,
                label: "Feedback",
                required: true,
              },
            ],
          },
        },
        {
          id: "other-survey",
          type: "survey" as const,
          label: "Encuesta general",
          config: { fields: [] },
        },
        {
          id: "action",
          type: "action" as const,
          label: "Gracias",
          config: {},
        },
      ],
      edges: [
        { from: "trigger", to: "branch", outcome: "next" as const },
        { from: "branch", to: "matching-survey", outcome: "match" as const },
        { from: "branch", to: "other-survey", outcome: "else" as const },
        { from: "matching-survey", to: "action", outcome: "next" as const },
        { from: "other-survey", to: "action", outcome: "next" as const },
      ],
    };

    expect(
      selectEligibleSurvey(
        [{ id: "branch-flow", flow }],
        { visitCount: 3, pathname: "/", selectedBranchId: "condesa" },
        1_000,
      )?.survey.id,
    ).toBe("matching-survey");
  });
});
