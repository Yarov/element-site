import {
  aggregateSurveyAnalytics,
  type AnalyticsSourceRow,
  type SurveyAnalytics,
} from "./analytics";
import type { SurveyField } from "./model";

type DemoResponse = {
  ratings: number[];
  choiceIndexes: number[];
  texts: string[];
  createdAt: string;
};

const DEMO_RESPONSES: DemoResponse[] = [
  {
    ratings: [5, 4],
    choiceIndexes: [0, 1],
    texts: ["La atención fue impecable."],
    createdAt: "2026-08-20T18:15:00.000Z",
  },
  {
    ratings: [4, 5],
    choiceIndexes: [1, 0],
    texts: ["Volvería para una tarde de desconexión."],
    createdAt: "2026-08-19T16:30:00.000Z",
  },
  {
    ratings: [5, 3],
    choiceIndexes: [2, 2],
    texts: ["El ambiente se siente muy cuidado."],
    createdAt: "2026-08-18T20:05:00.000Z",
  },
];

export function demoSurveyAnalytics(
  fields: SurveyField[],
  previewResponses: AnalyticsSourceRow[] = [],
): SurveyAnalytics {
  const ratings = fields.filter((field) => field.kind === "rating");
  const choices = fields.filter((field) => field.kind === "singleChoice");
  const texts = fields.filter((field) => field.kind === "text");
  const rows = DEMO_RESPONSES.map((sample) => {
    const answers: Record<string, string | number> = {};
    ratings.forEach((field, index) => {
      const value = sample.ratings[index];
      if (value !== undefined) answers[field.id] = value;
    });
    choices.forEach((field, index) => {
      const value = field.options?.[sample.choiceIndexes[index] ?? 0];
      if (value) answers[field.id] = value;
    });
    texts.forEach((field, index) => {
      const value = sample.texts[index];
      if (value) answers[field.id] = value;
    });
    return { answers, createdAt: sample.createdAt };
  });

  return aggregateSurveyAnalytics(fields, [...rows, ...previewResponses]);
}
