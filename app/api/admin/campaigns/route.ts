import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { campaigns } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth/admin";
import { campaignSchema } from "@/lib/marketing/schema";

export const runtime = "nodejs";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const db = getDb();
  if (!db) return NextResponse.json({ campaigns: [], storage: "local" });
  const rows = await db
    .select()
    .from(campaigns)
    .orderBy(desc(campaigns.updatedAt));
  const validCampaigns = rows.flatMap((row) => {
    const definition = campaignSchema.safeParse(row.definition);
    return definition.success ? [{ ...row, definition: definition.data }] : [];
  });
  return NextResponse.json({
    campaigns: validCampaigns,
    invalidCampaigns: rows.length - validCampaigns.length,
    storage: "postgres",
  });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json().catch(() => null);
    const parsed = campaignSchema.safeParse(body?.campaign);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid campaign", issues: parsed.error.issues },
        { status: 400 },
      );
    const db = getDb();
    if (!db)
      return NextResponse.json(
        { error: "DATABASE_URL is not configured" },
        { status: 503 },
      );
    const [created] = await db
      .insert(campaigns)
      .values({
        name: parsed.data.name,
        description: parsed.data.description,
        status: parsed.data.status,
        definition: parsed.data,
      })
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not create campaign" },
      { status: 500 },
    );
  }
}
