import { services, type Service } from "@/lib/data"

export const SITE_URL = "https://elementspa.mx"

/**
 * Canonical entity URIs reused across every JSON-LD payload so that
 * Google's Knowledge Graph treats each schema fragment as part of the
 * same entity instead of fragmenting duplicates.
 */
export const ORG_ID = "https://elementspa.mx/#organization"
export const WEBSITE_ID = "https://elementspa.mx/#website"
export const SPA_ROMA_NORTE_ID = "https://elementspa.mx/#spa-roma-norte"
export const SPA_COYOACAN_ID = "https://elementspa.mx/#spa-coyoacan"

/**
 * Approximate centroids of the two colonias we serve. Public information
 * (visible on Google Maps at zoom 14). We expose them only as the midpoint
 * of a `GeoCircle` — never as a precise `address`. The 600 m radius covers
 * the whole colonia without revealing the exact street.
 */
export const COLONIAS = {
  romaNorte: { lat: 19.4148, lng: -99.162, radius: 600 },
  coyoacan: { lat: 19.345, lng: -99.162, radius: 600 },
} as const

export type ColoniaKey = keyof typeof COLONIAS

export function buildServiceArea(colonia: ColoniaKey) {
  const c = COLONIAS[colonia]
  return {
    "@type": "GeoCircle" as const,
    geoMidpoint: {
      "@type": "GeoCoordinates" as const,
      latitude: c.lat,
      longitude: c.lng,
    },
    geoRadius: c.radius,
  }
}

/** A single opening-hours spec reused across branches. */
export const OPENING_HOURS = {
  "@type": "OpeningHoursSpecification" as const,
  dayOfWeek: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  opens: "11:00",
  closes: "19:00",
}

/** "$1,100" -> 1100 */
export function parsePrice(price: string): number {
  return Number(price.replace(/[^0-9.]/g, ""))
}

interface OfferSchema {
  "@type": "Offer"
  name: string
  price: number
  priceCurrency: "MXN"
  description: string
  availability: "https://schema.org/InStock"
}

/** Builds schema.org Offer entries for a service (one per duration option). */
export function buildServiceOffers(service: Service): OfferSchema[] {
  if (service.options) {
    return service.options.map((opt) => ({
      "@type": "Offer",
      name: `${service.title} — ${opt.time}`,
      price: parsePrice(opt.price),
      priceCurrency: "MXN" as const,
      description: `${service.seoTitle}. Duración: ${opt.time}.`,
      availability: "https://schema.org/InStock" as const,
    }))
  }
  return [
    {
      "@type": "Offer",
      name: `${service.title} — ${service.time}`,
      price: parsePrice(service.price!),
      priceCurrency: "MXN" as const,
      description: `${service.seoTitle}. Duración: ${service.time}.`,
      availability: "https://schema.org/InStock" as const,
    },
  ]
}

/** Offers for a subset of services by id (or all if omitted). */
export function buildOffersForServices(ids?: number[]): OfferSchema[] {
  const selected = ids ? services.filter((s) => ids.includes(s.id)) : services
  return selected.flatMap(buildServiceOffers)
}

/** schema.org BreadcrumbList from ordered path segments. */
export function buildBreadcrumb(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}
