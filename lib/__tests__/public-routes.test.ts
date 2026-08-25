import { describe, expect, it } from "vitest";
import { PUBLIC_ROUTES } from "../public-routes";

describe("public route catalog", () => {
  it("contains unique absolute paths with sitemap metadata", () => {
    const paths = PUBLIC_ROUTES.map((route) => route.path);

    expect(paths).toContain("/");
    expect(new Set(paths).size).toBe(paths.length);
    expect(PUBLIC_ROUTES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "/",
          label: expect.any(String),
          changeFrequency: "weekly",
          priority: 1,
        }),
      ]),
    );
    expect(paths.every((path) => path.startsWith("/"))).toBe(true);
  });
});
