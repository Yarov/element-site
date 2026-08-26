import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { surveyFlows, surveyResponses } from "@/db/schema";
import { admitResponse } from "@/lib/surveys/schema";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json(
      { error: { code: "INVALID_SURVEY_ID", message: "Invalid survey id" } },
      { status: 400 },
    );
  }
  const body = await request.json().catch(() => null);
  const db = getDb();
  if (!db)
    return NextResponse.json(
      {
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Database unavailable",
        },
      },
      { status: 503 },
    );
  const [storedFlow] = await db
    .select()
    .from(surveyFlows)
    .where(eq(surveyFlows.id, id))
    .limit(1);
  if (!storedFlow) {
    return NextResponse.json(
      { error: { code: "SURVEY_NOT_FOUND", message: "Survey not found" } },
      { status: 404 },
    );
  }

  const admission = admitResponse(
    storedFlow.graph,
    storedFlow.status,
    body?.answers,
    {
      pathname: typeof body?.pathname === "string" ? body.pathname : undefined,
      selectedServiceId:
        typeof body?.selectedServiceId === "string"
          ? body.selectedServiceId
          : undefined,
      selectedBranchId:
        typeof body?.selectedBranchId === "string"
          ? body.selectedBranchId
          : undefined,
      visitCount:
        typeof body?.visitCount === "number" ? body.visitCount : undefined,
    },
  );
  if (!admission.success)
    return NextResponse.json(
      { error: admission.error },
      { status: admission.status },
    );

  await db
    .insert(surveyResponses)
    .values({ flowId: id, answers: admission.answers });
  return new NextResponse(null, { status: 204 });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
