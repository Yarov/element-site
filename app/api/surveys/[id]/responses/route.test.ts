import { beforeEach, describe, expect, it, vi } from "vitest";
import { seedFlow } from "@/lib/surveys/fixtures";

const { select, limit, insert, values } = vi.hoisted(() => {
  const limit = vi.fn();
  const where = vi.fn(() => ({ limit }));
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));
  const values = vi.fn();
  const insert = vi.fn(() => ({ values }));
  return { select, limit, insert, values };
});

vi.mock("@/db", () => ({
  getDb: () => ({ select, insert }),
}));

import { POST } from "./route";

const id = "11111111-1111-4111-8111-111111111111";
const context = { params: Promise.resolve({ id }) };

beforeEach(() => vi.clearAllMocks());

describe("POST /api/surveys/[id]/responses", () => {
  it("rejects draft flows without inserting a response", async () => {
    limit.mockResolvedValueOnce([{ id, status: "draft", graph: seedFlow }]);

    const response = await POST(
      new Request(`https://example.com/api/surveys/${id}/responses`, {
        method: "POST",
        body: JSON.stringify({ answers: { feedback: "Great", experience: 5 } }),
      }),
      context,
    );

    expect(response.status).toBe(409);
    expect(insert).not.toHaveBeenCalled();
  });

  it("inserts only answers admitted by the persisted published flow", async () => {
    limit.mockResolvedValueOnce([{ id, status: "published", graph: seedFlow }]);

    const response = await POST(
      new Request(`https://example.com/api/surveys/${id}/responses`, {
        method: "POST",
        body: JSON.stringify({
          answers: { feedback: "  Great visit  ", experience: 5 },
        }),
      }),
      context,
    );

    expect(response.status).toBe(204);
    expect(values).toHaveBeenCalledWith({
      flowId: id,
      answers: { feedback: "Great visit", experience: 5 },
    });
  });
});
