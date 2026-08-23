import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { surveyFlows } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth/admin";
import { validateFlow } from "@/lib/surveys/schema";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  { params }: RouteContext<"/api/admin/surveys/[id]/preview">,
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

  const [storedFlow] = await db
    .select()
    .from(surveyFlows)
    .where(eq(surveyFlows.id, id))
    .limit(1);
  if (!storedFlow)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const flow = validateFlow(storedFlow.graph);
  if (!flow.success)
    return NextResponse.json({ error: "Invalid flow" }, { status: 422 });

  return NextResponse.json({ flow: { id: storedFlow.id, flow: flow.data } });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
