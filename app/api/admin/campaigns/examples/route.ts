import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { campaigns } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth/admin";
import { campaignExamples } from "@/lib/marketing/fixtures";

export const runtime = "nodejs";

export async function POST() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const db = getDb();
  if (!db)
    return NextResponse.json(
      { error: "DATABASE_URL is not configured" },
      { status: 503 },
    );
  const existing = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .limit(1);
  if (existing.length)
    return NextResponse.json({
      seeded: false,
      reason: "Campaigns already exist",
    });
  const created = await db
    .insert(campaigns)
    .values(
      campaignExamples.map((campaign) => ({
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        definition: campaign,
      })),
    )
    .returning({ id: campaigns.id, name: campaigns.name });
  return NextResponse.json(
    { seeded: true, campaigns: created },
    { status: 201 },
  );
}
