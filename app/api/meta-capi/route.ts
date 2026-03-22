import { NextRequest, NextResponse } from "next/server"

const PIXEL_ID = process.env.META_PIXEL_ID || "931479589299640"
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || ""

interface CAPIEvent {
  event_name: string
  event_id: string
  event_time: number
  event_source_url: string
  action_source: "website"
  user_data: {
    client_ip_address?: string
    client_user_agent?: string
    fbp?: string
    fbc?: string
  }
  custom_data?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  if (!ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "META_CAPI_ACCESS_TOKEN not configured" },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { event_name, event_id, event_source_url, custom_data, fbp, fbc } = body

    const event: CAPIEvent = {
      event_name,
      event_id,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url,
      action_source: "website",
      user_data: {
        client_ip_address:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          undefined,
        client_user_agent: request.headers.get("user-agent") || undefined,
        fbp: fbp || undefined,
        fbc: fbc || undefined,
      },
      ...(custom_data && { custom_data }),
    }

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [event],
          access_token: ACCESS_TOKEN,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error("Meta CAPI error:", result)
      return NextResponse.json({ error: result }, { status: response.status })
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("Meta CAPI error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
