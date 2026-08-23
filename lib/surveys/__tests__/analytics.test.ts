import { describe, expect, it } from "vitest";
import { aggregateSurveyAnalytics } from "../analytics";
import { demoSurveyAnalytics } from "../analytics-demo";
import type { SurveyField } from "../model";

const fields: SurveyField[] = [
  { id: "rating", kind: "rating", label: "Calificación", required: true },
  {
    id: "choice",
    kind: "singleChoice",
    label: "Tipo",
    required: true,
    options: ["A", "B"],
  },
  { id: "text", kind: "text", label: "Nota", required: false },
  { id: "cta", kind: "cta", label: "CTA", required: false },
];

describe("survey analytics", () => {
  it("keeps stable empty metrics for zero rows", () => {
    const analytics = aggregateSurveyAnalytics(fields, []);
    expect(analytics.totalResponses).toBe(0);
    expect(analytics.questions).toHaveLength(3);
    expect(analytics.questions[0].rating?.distribution).toEqual(
      [1, 2, 3, 4, 5].map((value) => ({ value, count: 0 })),
    );
  });

  it("aggregates valid ratings and configured choices only", () => {
    const analytics = aggregateSurveyAnalytics(fields, [
      {
        answers: { rating: "5", choice: "A" },
        createdAt: "2026-08-20T00:00:00.000Z",
      },
      {
        answers: { rating: 3, choice: "Removed" },
        createdAt: "2026-08-19T00:00:00.000Z",
      },
    ]);
    expect(analytics.questions[0].rating).toMatchObject({
      count: 2,
      average: 4,
    });
    expect(analytics.questions[0].rating?.distribution[2]).toEqual({
      value: 3,
      count: 1,
    });
    expect(analytics.questions[1].choice?.options).toEqual([
      { value: "A", count: 1 },
      { value: "B", count: 0 },
    ]);
  });

  it("trims text, sorts timestamps, and ignores malformed answers", () => {
    const analytics = aggregateSurveyAnalytics(fields, [
      {
        answers: { text: "  más reciente  ", rating: 2, stale: "ignored" },
        createdAt: "2026-08-20T00:00:00.000Z",
      },
      {
        answers: { text: "   ", rating: 7 },
        createdAt: "2026-08-19T00:00:00.000Z",
      },
      { answers: null, createdAt: "2026-08-21T00:00:00.000Z" },
    ]);
    expect(analytics.totalResponses).toBe(3);
    expect(analytics.questions[0].rating?.count).toBe(1);
    expect(analytics.questions[2].text?.responses).toEqual([
      { value: "más reciente", createdAt: "2026-08-20T00:00:00.000Z" },
    ]);
  });

  it("binds isolated demo data to unsaved configured fields", () => {
    const analytics = demoSurveyAnalytics([
      {
        id: "new",
        kind: "singleChoice",
        label: "Nueva",
        required: true,
        options: ["Uno", "Dos"],
      },
    ]);
    expect(analytics.totalResponses).toBe(3);
    expect(
      analytics.questions[0].choice?.options.map((option) => option.value),
    ).toEqual(["Uno", "Dos"]);
  });
});
