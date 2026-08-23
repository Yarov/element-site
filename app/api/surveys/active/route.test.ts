import { describe, expect, it, vi } from "vitest";
import { seedFlow } from "@/lib/surveys/fixtures";

const where = vi.fn();
const from = vi.fn(() => ({ where }));
const select = vi.fn(() => ({ from }));

vi.mock("@/db", () => ({
  getDb: () => ({ select }),
}));

import { GET } from "./route";

describe("GET /api/surveys/active", () => {
  it("exposes published flows only", async () => {
    where.mockResolvedValueOnce([
      { id: "published", status: "published", graph: seedFlow },
      { id: "draft", status: "draft", graph: seedFlow },
      { id: "paused", status: "paused", graph: seedFlow },
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      flows: [{ id: "published", flow: seedFlow }],
    });
    expect(where).toHaveBeenCalledTimes(1);
  });
});
