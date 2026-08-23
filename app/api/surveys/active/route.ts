import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { surveyFlows } from "@/db/schema";
import { validateFlow } from "@/lib/surveys/schema";

export const runtime = "nodejs";

export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json({ flows: [] });
  const rows = await db
    .select()
    .from(surveyFlows)
    .where(eq(surveyFlows.status, "published"));
  const flows = rows.flatMap((row) => {
    if (row.status !== "published") return [];
    const flow = validateFlow(row.graph);
    return flow.success ? [{ id: row.id, flow: flow.data }] : [];
  });
  return NextResponse.json({ flows });
}
