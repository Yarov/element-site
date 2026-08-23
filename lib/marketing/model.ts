export const componentKinds = ["banner", "hero", "block", "survey", "cta"] as const
export type ComponentKind = (typeof componentKinds)[number]
export type CampaignStatus = "draft" | "published" | "paused"

export type MarketingComponent = {
  id: string
  kind: ComponentKind
  slot: "home.banner" | "home.hero" | "home.promo" | "service.cta"
  title: string
  body: string
  ctaLabel: string
  ctaHref: string
  imageUrl?: string
  questions?: Array<{ id: string; label: string; kind: "text" | "rating" | "choice"; options?: string[] }>
}

export type Campaign = {
  id: string
  name: string
  description: string
  status: CampaignStatus
  audience: { minVisits: number; pagePath: string }
  priority: number
  startsAt: string | null
  endsAt: string | null
  components: MarketingComponent[]
  updatedAt: string
}
