import type { SurveyField } from "./model";

export type AnalyticsQuestionKind = "rating" | "singleChoice" | "text";

export type AnalyticsSourceRow = {
  answers: unknown;
  createdAt: Date | string;
};

export type AnalyticsDistribution = {
  value: number;
  count: number;
};

export type AnalyticsChoiceOption = {
  value: string;
  count: number;
};

export type AnalyticsTextResponse = {
  value: string;
  createdAt: string;
};

export type AnalyticsRating = {
  count: number;
  average: number | null;
  distribution: AnalyticsDistribution[];
};

export type AnalyticsChoice = {
  options: AnalyticsChoiceOption[];
};

export type AnalyticsText = {
  responses: AnalyticsTextResponse[];
};

export type AnalyticsQuestion = {
  id: string;
  label: string;
  kind: AnalyticsQuestionKind;
  rating?: AnalyticsRating;
  choice?: AnalyticsChoice;
  text?: AnalyticsText;
};

export type SurveyAnalytics = {
  totalResponses: number;
  questions: AnalyticsQuestion[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function timestamp(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function supportedFields(fields: SurveyField[]) {
  return fields.filter(
    (field): field is SurveyField & { kind: AnalyticsQuestionKind } =>
      field.kind === "rating" ||
      field.kind === "singleChoice" ||
      field.kind === "text",
  );
}

export function aggregateSurveyAnalytics(
  fields: SurveyField[],
  rows: AnalyticsSourceRow[],
): SurveyAnalytics {
  const questions = supportedFields(fields).map((field): AnalyticsQuestion => {
    if (field.kind === "rating") {
      return {
        id: field.id,
        label: field.label,
        kind: field.kind,
        rating: {
          count: 0,
          average: null,
          distribution: [1, 2, 3, 4, 5].map((value) => ({ value, count: 0 })),
        },
      };
    }
    if (field.kind === "singleChoice") {
      return {
        id: field.id,
        label: field.label,
        kind: field.kind,
        choice: {
          options: (field.options ?? []).map((value) => ({ value, count: 0 })),
        },
      };
    }
    return {
      id: field.id,
      label: field.label,
      kind: field.kind,
      text: { responses: [] },
    };
  });

  const fieldsById = new Map(
    supportedFields(fields).map((field) => [field.id, field]),
  );
  const questionsById = new Map(
    questions.map((question) => [question.id, question]),
  );

  for (const row of rows) {
    if (!isRecord(row.answers)) continue;
    for (const [id, answer] of Object.entries(row.answers)) {
      const field = fieldsById.get(id);
      const question = questionsById.get(id);
      if (
        !field ||
        !question ||
        (typeof answer !== "string" && typeof answer !== "number")
      )
        continue;

      if (field.kind === "rating" && question.rating) {
        const value = typeof answer === "number" ? answer : Number(answer);
        if (!Number.isInteger(value) || value < 1 || value > 5) continue;
        question.rating.count += 1;
        const bucket = question.rating.distribution[value - 1];
        if (bucket) bucket.count += 1;
      }

      if (
        field.kind === "singleChoice" &&
        question.choice &&
        typeof answer === "string"
      ) {
        const option = question.choice.options.find(
          (item) => item.value === answer,
        );
        if (option) option.count += 1;
      }

      if (
        field.kind === "text" &&
        question.text &&
        typeof answer === "string"
      ) {
        const value = answer.trim();
        if (value)
          question.text.responses.push({
            value,
            createdAt: timestamp(row.createdAt),
          });
      }
    }
  }

  for (const question of questions) {
    if (question.rating) {
      const total = question.rating.distribution.reduce(
        (sum, item) => sum + item.value * item.count,
        0,
      );
      question.rating.average = question.rating.count
        ? total / question.rating.count
        : null;
    }
    if (question.text) {
      question.text.responses.sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );
    }
  }

  return { totalResponses: rows.length, questions };
}
