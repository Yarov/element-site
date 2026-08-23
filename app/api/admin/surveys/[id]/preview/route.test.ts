import { NextResponse } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { seedFlow } from "@/lib/surveys/fixtures";

const { requireAdminApi, select, limit } = vi.hoisted(() => {
  const limit = vi.fn();
  const where = vi.fn(() => ({ limit }));
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));
  return { requireAdminApi: vi.fn(), select, limit };
});

vi.mock("@/lib/auth/admin", () => ({ requireAdminApi }));
vi.mock("@/db", () => ({
  getDb: () => ({ select }),
}));

import { GET } from "./route";

const id = "11111111-1111-4111-8111-111111111111";
const context = { params: Promise.resolve({ id }) };

describe("GET /api/admin/surveys/[id]/preview", () => {
  it("rejects an unauthenticated preview request", async () => {
    requireAdminApi.mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await GET(new Request("https://example.com"), context);

    expect(response.status).toBe(401);
    expect(select).not.toHaveBeenCalled();
  });

  it("returns a selected draft flow to an authenticated admin", async () => {
    requireAdminApi.mockResolvedValueOnce(null);
    limit.mockResolvedValueOnce([{ id, status: "draft", graph: seedFlow }]);

    const response = await GET(new Request("https://example.com"), context);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      flow: { id, flow: seedFlow },
    });
  });
});
