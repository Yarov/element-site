import { services, type Service } from "@/lib/data"

export const SITE_URL = "https://elementspa.mx"

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
      priceCurrency: "MXN",
      description: `${service.seoTitle}. Duración: ${opt.time}.`,
      availability: "https://schema.org/InStock",
    }))
  }
  return [
    {
      "@type": "Offer",
      name: `${service.title} — ${service.time}`,
      price: parsePrice(service.price!),
      priceCurrency: "MXN",
      description: `${service.seoTitle}. Duración: ${service.time}.`,
      availability: "https://schema.org/InStock",
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
