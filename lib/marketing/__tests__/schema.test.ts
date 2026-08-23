import { describe, expect, it } from "vitest"
import { campaignSchema } from "../schema"

const validCampaign = {
  id: "campaign-1",
  name: "Campaign",
  description: "",
  status: "draft",
  audience: { minVisits: 3, pagePath: "/" },
  components: [{ id: "component-1", kind: "banner", slot: "home.banner", title: "Title", body: "Body", ctaLabel: "Open", ctaHref: "/" }],
  updatedAt: "2026-08-23T00:00:00.000Z",
}

describe("campaign schema", () => {
  it("applies safe defaults to legacy campaign records", () => {
    const result = campaignSchema.parse(validCampaign)
    expect(result.priority).toBe(50)
    expect(result.startsAt).toBeNull()
    expect(result.endsAt).toBeNull()
  })

  it("rejects a campaign without a component instead of allowing an editor crash", () => {
    expect(campaignSchema.safeParse({ ...validCampaign, components: undefined }).success).toBe(false)
  })
})
