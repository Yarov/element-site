import type { MarketingComponent } from "./model"

export type ActiveComponent = { campaignId: string; audience: { minVisits: number; pagePath: string }; component: MarketingComponent }

export function getVisitCount() {
  const value = document.cookie.split("; ").find((entry) => entry.startsWith("elementspa_visits="))?.split("=")[1]
  return Number(value ?? 0)
}

export async function getActiveComponent(slot: MarketingComponent["slot"]) {
  const response = await fetch(`/api/marketing/components?slot=${encodeURIComponent(slot)}`)
  if (!response.ok) return null
  const data = await response.json() as { components: ActiveComponent[] }
  return data.components.find((item) => item.audience.minVisits <= getVisitCount() && item.audience.pagePath === window.location.pathname) ?? null
}

export function trackMarketingEvent(active: ActiveComponent, event: "impression" | "click" | "response", payload: Record<string, unknown> = {}) {
  void fetch("/api/marketing/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ campaignId: active.campaignId, componentId: active.component.id, event, payload }),
    keepalive: true,
  })
}
