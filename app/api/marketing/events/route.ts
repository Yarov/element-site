import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/db"
import { campaignEvents } from "@/db/schema"

const eventSchema = z.object({
  campaignId: z.string().uuid(),
  componentId: z.string().min(1),
  event: z.enum(["impression", "click", "response"]),
  payload: z.record(z.unknown()).default({}),
})

export const runtime = "nodejs"

export async function POST(request: Request) {
  const parsed = eventSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid event" }, { status: 400 })
  const db = getDb()
  if (!db) return new NextResponse(null, { status: 204 })
  await db.insert(campaignEvents).values(parsed.data)
  return new NextResponse(null, { status: 204 })
}
