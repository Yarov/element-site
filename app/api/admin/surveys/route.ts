import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { surveyFlows } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth/admin";
import { validateFlow } from "@/lib/surveys/schema";

export const runtime = "nodejs";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const db = getDb();
  if (!db) return NextResponse.json({ flows: [], storage: "local" });
  const flows = await db
    .select()
    .from(surveyFlows)
    .orderBy(desc(surveyFlows.updatedAt));
  return NextResponse.json({ flows, storage: "postgres" });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const flow = body?.flow;
  const valid = validateFlow(flow);
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
  const [created] = await db
    .insert(surveyFlows)
    .values({
      name: valid.data.name,
      description: valid.data.description,
      graph: valid.data,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const id = new URL(request.url).searchParams.get("id");
  const db = getDb();
  if (!id || !db)
    return NextResponse.json(
      { error: "Missing id or database" },
      { status: 400 },
    );
  await db.delete(surveyFlows).where(eq(surveyFlows.id, id));
  return new NextResponse(null, { status: 204 });
}
