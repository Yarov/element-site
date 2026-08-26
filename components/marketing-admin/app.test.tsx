import { describe, expect, it } from "vitest";
import { ensureQuestion, defaultQuestion } from "./app";

describe("marketing survey question helpers", () => {
  it("preserves choice options and dedupes trimmed values", () => {
    const result = ensureQuestion({
      id: "q1",
      kind: "choice",
      label: "Intereses",
      options: [" Relajación ", "Sensorial", "Sensorial", "", "Tántrico"],
    });

    expect(result.options).toEqual(["Relajación", "Sensorial", "Tántrico"]);
  });

  it("drops options for non-choice questions", () => {
    const result = ensureQuestion({
      id: "q2",
      kind: "rating",
      label: "Rating",
      options: ["1", "2", "3"],
    });

    expect(result.options).toBeUndefined();
  });

  it("creates a default choice with two starter options", () => {
    const choice = defaultQuestion("choice");
    expect(choice.kind).toBe("choice");
    expect(choice.options).toEqual(["Relajación", "Sensorial"]);

    const rating = defaultQuestion("rating");
    expect(rating.kind).toBe("rating");
    expect(rating.options).toBeUndefined();

    const text = defaultQuestion("text");
    expect(text.kind).toBe("text");
    expect(text.options).toBeUndefined();
  });
});