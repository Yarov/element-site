import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { seedFlow } from "@/lib/surveys/fixtures";

const { requireAdminApi, set, returning } = vi.hoisted(() => {
  const returning = vi.fn();
  const where = vi.fn(() => ({ returning }));
  const set = vi.fn<
    (changes: Record<string, unknown>) => { where: typeof where }
  >(() => ({ where }));
  return { requireAdminApi: vi.fn(), set, returning };
});

vi.mock("@/lib/auth/admin", () => ({ requireAdminApi }));
vi.mock("@/db", () => ({
  getDb: () => ({ update: () => ({ set }) }),
}));

import { PATCH } from "./route";

const id = "11111111-1111-4111-8111-111111111111";
const context = { params: Promise.resolve({ id }) };

beforeEach(() => vi.clearAllMocks());

describe("PATCH /api/admin/surveys/[id]", () => {
  it("retains the stored lifecycle when a save omits status", async () => {
    requireAdminApi.mockResolvedValueOnce(null);
    returning.mockResolvedValueOnce([
      { id, status: "paused", name: seedFlow.name, graph: seedFlow },
    ]);

    const response = await PATCH(
      new Request(`https://example.com/api/admin/surveys/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ flow: seedFlow }),
      }),
      context,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ id, status: "paused" });
    const changes = set.mock.calls[0]?.[0];
    expect(changes).not.toHaveProperty("status");
  });

  it("rejects an unauthenticated save before touching storage", async () => {
    requireAdminApi.mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await PATCH(
      new Request(`https://example.com/api/admin/surveys/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ flow: seedFlow }),
      }),
      context,
    );

    expect(response.status).toBe(401);
    expect(set).not.toHaveBeenCalled();
  });

  it("accepts an incomplete draft save without applying publish rules", async () => {
    requireAdminApi.mockResolvedValueOnce(null);
    returning.mockResolvedValueOnce([
      { id, status: "draft", name: "Borrador", graph: seedFlow },
    ]);

    const incompleteFlow = {
      ...seedFlow,
      nodes: seedFlow.nodes.filter((node) => node.type !== "action"),
    };

    const response = await PATCH(
      new Request(`https://example.com/api/admin/surveys/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ flow: incompleteFlow, status: "draft" }),
      }),
      context,
    );

    expect(response.status).toBe(200);
  });
});
