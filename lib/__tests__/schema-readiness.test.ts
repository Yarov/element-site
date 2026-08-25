import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  COLONIAS,
  ORG_ID,
  SITE_URL,
  SPA_COYOACAN_ID,
  SPA_ROMA_NORTE_ID,
  WEBSITE_ID,
  buildBreadcrumb,
  buildOffersForServices,
  buildServiceArea,
} from "../schema"
import { services } from "../data"
import { PUBLIC_ROUTE_PATHS } from "../public-routes"

const root = resolve(__dirname, "../..")
const read = (file: string) => readFileSync(resolve(root, file), "utf8")

const schemaFiles = [
  "app/layout.tsx",
  "app/spa-para-hombres-roma-norte/content.tsx",
  "app/spa-para-hombres-coyoacan/content.tsx",
  "app/spa-para-hombres-condesa/content.tsx",
  "app/spa-para-hombres-polanco/content.tsx",
  "app/spa-para-hombres-del-valle/content.tsx",
  "components/zone-page.tsx",
]

describe("schema readiness", () => {
  it("keeps canonical entity IDs stable", () => {
    expect(SITE_URL).toBe("https://elementspa.mx")
    expect(ORG_ID).toBe(`${SITE_URL}/#organization`)
    expect(WEBSITE_ID).toBe(`${SITE_URL}/#website`)
    expect(SPA_ROMA_NORTE_ID).toBe(`${SITE_URL}/#spa-roma-norte`)
    expect(SPA_COYOACAN_ID).toBe(`${SITE_URL}/#spa-coyoacan`)
  })

  it("keeps public service-area centroids approximate and bounded", () => {
    expect(COLONIAS.romaNorte.radius).toBe(600)
    expect(COLONIAS.coyoacan.radius).toBe(600)
    expect(buildServiceArea("romaNorte")["@type"]).toBe("GeoCircle")
    expect(buildServiceArea("coyoacan")["@type"]).toBe("GeoCircle")
  })

  it("keeps all six services and valid MXN offers", () => {
    expect(services).toHaveLength(6)
    const offers = buildOffersForServices()
    expect(offers.length).toBeGreaterThan(0)
    for (const offer of offers) {
      expect(offer.priceCurrency).toBe("MXN")
      expect(offer.price).toBeGreaterThan(0)
      expect(offer["@type"]).toBe("Offer")
    }
  })

  it("builds absolute breadcrumb URLs", () => {
    const breadcrumb = buildBreadcrumb([{ name: "Inicio", path: "/" }])
    expect(breadcrumb.itemListElement[0].item).toBe(`${SITE_URL}/`)
  })

  for (const file of schemaFiles) {
    it(`never publishes a precise address in ${file}`, () => {
      const source = read(file)
      expect(source).not.toMatch(/streetAddress|postalCode/)
      expect(source).not.toMatch(/\baddress\s*:\s*\{/)
    })
  }

  it("does not publish self-serving ratings or assumed review dates", () => {
    const source = schemaFiles.map(read).join("\n")
    expect(source).not.toContain("aggregateRating")
    expect(source).not.toContain("datePublished")
    expect(source).not.toContain("ratingValue")
  })

  it("links the site and branches to the canonical Organization", () => {
    const layout = read("app/layout.tsx")
    expect(layout).toContain('"@type": "Organization"')
    expect(layout).toContain('"@id": ORG_ID')
    expect(layout).toContain('"@type": "WebSite"')
    expect(layout).toContain('"@id": WEBSITE_ID')
    expect(layout).toContain("publisher: { \"@id\": ORG_ID }")
    for (const file of [
      "app/spa-para-hombres-roma-norte/content.tsx",
      "app/spa-para-hombres-coyoacan/content.tsx",
      "components/zone-page.tsx",
    ]) {
      expect(read(file)).toContain('parentOrganization: { "@id": ORG_ID }')
    }
  })

  it("uses WhatsApp as the only declared reservation contact", () => {
    const layout = read("app/layout.tsx")
    expect(layout).toContain('url: "https://wa.me/525647114561"')
    expect(layout).not.toContain("ReserveAction")
    expect(read("app/llms.txt/route.ts")).toContain("locations.condesa.whatsapp")
  })

  it("keeps the trust page and privacy notice indexable", () => {
    const privacy = read("app/aviso-de-privacidad/page.tsx")
    const trust = read("app/privacidad-seguridad-y-reservas/page.tsx")
    expect(privacy).not.toContain("index: false")
    expect(privacy).not.toContain("follow: false")
    expect(trust).toContain("WhatsApp oficial")
    expect(read("app/robots.ts")).not.toContain("/aviso-de-privacidad")
  })

  it("includes trust and privacy URLs in the sitemap and llms.txt", () => {
    const sitemap = read("app/sitemap.ts")
    const llms = read("app/llms.txt/route.ts")
    for (const slug of ["privacidad-seguridad-y-reservas", "aviso-de-privacidad"]) {
      expect(PUBLIC_ROUTE_PATHS).toContain(`/${slug}`)
      expect(llms).toContain(slug)
    }
    expect(sitemap).toContain("PUBLIC_ROUTES")
  })

  it("keeps llms.txt factual and privacy-safe", () => {
    const llms = read("app/llms.txt/route.ts")
    expect(llms).toMatch(/más de 5 años/i)
    expect(llms).toContain("Equipo variable, siempre con más de 3 terapeutas profesionales activas")
    expect(llms).not.toMatch(/cientos|certificadas|todos los días del año|menos de 5 minutos/i)
    expect(llms).toContain("dirección exacta solo al confirmar reserva")
  })

  it("uses the brand as the blog author instead of an invented author entity", () => {
    const blog = read("app/blog/[slug]/page.tsx")
    expect(blog).toContain('"@id": ORG_ID')
    expect(blog).not.toContain("AUTHOR_ID")
    expect(blog).not.toContain("Equipo ElementSpa")
  })

  it("does not use fake rolling sitemap dates for static pages", () => {
    const sitemap = read("app/sitemap.ts")
    expect(sitemap).not.toContain("lastModified: new Date()")
  })
})
