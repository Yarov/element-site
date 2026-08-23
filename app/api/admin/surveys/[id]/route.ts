import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { surveyFlows } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth/admin";
import { validateFlow } from "@/lib/surveys/schema";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const db = getDb();
  if (!db)
    return NextResponse.json(
      { error: "DATABASE_URL is not configured" },
      { status: 503 },
    );
  const { id } = await params;
  if (!isUuid(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const [flow] = await db
    .select()
    .from(surveyFlows)
    .where(eq(surveyFlows.id, id))
    .limit(1);
  return flow
    ? NextResponse.json(flow)
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const valid = validateFlow(body?.flow);
  if (!valid.success)
    return NextResponse.json(
      { error: "Invalid flow", issues: valid.error.issues },
      { status: 400 },
    );
  const db = getDb();
  if (!db)
    return NextResponse.json(
      { error: "DATABASE_URL is not configured" },
      { status: 503 },
    );
  const { id } = await params;
  if (!isUuid(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const status =
    body?.status === "published" ||
    body?.status === "paused" ||
    body?.status === "draft"
      ? body.status
      : undefined;
  const [updated] = await db
    .update(surveyFlows)
    .set({
      name: valid.data.name,
      description: valid.data.description,
      graph: valid.data,
      ...(status ? { status } : {}),
      updatedAt: new Date(),
    })
    .where(eq(surveyFlows.id, id))
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

  const db = getDb();
  if (!db)
    return NextResponse.json(
      { error: "DATABASE_URL is not configured" },
      { status: 503 },
    );
  const { id } = await params;
  if (!isUuid(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await db.delete(surveyFlows).where(eq(surveyFlows.id, id));
  return new NextResponse(null, { status: 204 });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
