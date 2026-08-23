import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDb } from "@/db"
import { campaigns } from "@/db/schema"
import { campaignSchema } from "@/lib/marketing/schema"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const db = getDb()
  if (!db) return NextResponse.json({ components: [] })
  const slot = new URL(request.url).searchParams.get("slot")
  const rows = await db.select().from(campaigns).where(eq(campaigns.status, "published"))
  const now = Date.now()
  const components = rows.flatMap((row) => {
    const campaign = campaignSchema.safeParse(row.definition)
    if (!campaign.success) return []
    const startsAt = campaign.data.startsAt ? Date.parse(campaign.data.startsAt) : null
    const endsAt = campaign.data.endsAt ? Date.parse(campaign.data.endsAt) : null
    if ((startsAt && startsAt > now) || (endsAt && endsAt <= now)) return []
    return campaign.data.components.filter((component) => !slot || component.slot === slot).map((component) => ({ campaignId: row.id, audience: campaign.data.audience, component }))
  })
  components.sort((left, right) => {
    const leftCampaign = campaignSchema.parse(rows.find((row) => row.id === left.campaignId)?.definition)
    const rightCampaign = campaignSchema.parse(rows.find((row) => row.id === right.campaignId)?.definition)
    return rightCampaign.priority - leftCampaign.priority || left.campaignId.localeCompare(right.campaignId)
  })
  return NextResponse.json({ components })
}
