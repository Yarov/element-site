import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { surveyFlows, surveyResponses } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth/admin";
import { aggregateSurveyAnalytics } from "@/lib/surveys/analytics";
import type { SurveyField, SurveyFlow } from "@/lib/surveys/model";

export const runtime = "nodejs";

// This follows the authorization posture of the existing admin survey routes.
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
  if (!flow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const responses = await db
    .select({
      answers: surveyResponses.answers,
      createdAt: surveyResponses.createdAt,
    })
    .from(surveyResponses)
    .where(eq(surveyResponses.flowId, id));
  const graph = flow.graph as SurveyFlow;
  const fields = graph.nodes
    .filter((node) => node.type === "survey")
    .flatMap((node) => (node.config.fields as SurveyField[] | undefined) ?? []);

  return NextResponse.json(aggregateSurveyAnalytics(fields, responses));
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
