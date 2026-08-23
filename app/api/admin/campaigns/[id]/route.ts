import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { campaignEvents, campaigns } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth/admin";
import { campaignSchema } from "@/lib/marketing/schema";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (!isUuid(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const db = getDb();
  if (!db)
    return NextResponse.json(
      { error: "DATABASE_URL is not configured" },
      { status: 503 },
    );
  const rows = await db
    .select({ event: campaignEvents.event, total: sql<number>`count(*)::int` })
    .from(campaignEvents)
    .where(eq(campaignEvents.campaignId, id))
    .groupBy(campaignEvents.event);
  const totals = Object.fromEntries(rows.map((row) => [row.event, row.total]));
  return NextResponse.json({
    impressions: totals.impression ?? 0,
    clicks: totals.click ?? 0,
    responses: totals.response ?? 0,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const parsed = campaignSchema.safeParse(body?.campaign);
  const { id } = await params;
  if (!isUuid(id) || !parsed.success)
    return NextResponse.json({ error: "Invalid campaign" }, { status: 400 });
  const db = getDb();
  if (!db)
    return NextResponse.json(
      { error: "DATABASE_URL is not configured" },
      { status: 503 },
    );
  const [updated] = await db
    .update(campaigns)
    .set({
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
      definition: parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, id))
    .returning();
  return updated
    ? NextResponse.json(updated)
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (!isUuid(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const db = getDb();
  if (!db)
    return NextResponse.json(
      { error: "DATABASE_URL is not configured" },
      { status: 503 },
    );
  await db.delete(campaigns).where(eq(campaigns.id, id));
  return new NextResponse(null, { status: 204 });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
