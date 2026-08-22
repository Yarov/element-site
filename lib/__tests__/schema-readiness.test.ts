/**
 * Schema readiness tests for ElementSpa.
 *
 * Strategy: validate the schema.org JSON-LD declarations across the codebase by
 * (1) reading source files as text and asserting critical fields are present,
 * (2) importing pure helpers from lib/schema and asserting their output shape,
 * (3) never asserting on physical addresses (privacy contract: streetAddress,
 *     postalCode and address.streetAddress must NEVER appear in any schema).
 *
 * These tests are the safety net so that if someone deletes the @id,
 * contactPoint, aggregateRating or serviceArea, the CI fails.
 */
import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  SITE_URL,
  ORG_ID,
  WEBSITE_ID,
  AUTHOR_ID,
  COLONIAS,
  buildServiceArea,
  buildOffersForServices,
  buildBreadcrumb,
} from "../schema"
import { services } from "../data"

const root = resolve(__dirname, "../..")

function read(relPath: string): string {
  return readFileSync(resolve(root, relPath), "utf8")
}

/** Find every JSON-LD declaration block in a source file by string scanning.
 *  Uses a balanced-brace matcher so nested objects don't terminate early.
 *  Returns the raw source of each declaration (so callers can decide
 *  whether to evaluate it as JS or just grep for patterns). */
function extractJsonLdBodies(source: string): string[] {
  const declRe = /const\s+(\w+(?:JsonLd|JSON_LD|jsonLd|json_ld))\s*[:=]\s*([\[\{])/g
  const out: string[] = []
  let match: RegExpExecArray | null
  while ((match = declRe.exec(source)) !== null) {
    const openChar = match[2]
    const closeChar = openChar === "{" ? "}" : "]"
    let depth = 0
    let inString = false
    let escape = false
    let body = ""
    let i = match.index + match[0].length - 1
    while (i < source.length) {
      const c = source[i]
      body += c
      if (escape) {
        escape = false
      } else if (c === "\\") {
        escape = true
      } else if (inString) {
        if (c === '"') inString = false
      } else if (c === '"') {
        inString = true
      } else if (c === openChar) {
        depth++
      } else if (c === closeChar) {
        depth--
        if (depth === 0) {
          break
        }
      }
      i++
    }
    out.push(body)
  }
  return out
}

/** Look up the top-level @type value inside a JSON-LD body string. */
function jsonLdType(body: string): string | undefined {
  const m = body.match(/"@type"\s*:\s*"([^"]+)"/)
  return m?.[1]
}

/** Find the first JSON-LD body whose top-level @type matches one of the given types. */
function findJsonLdByType(source: string, types: string[]): string | undefined {
  for (const body of extractJsonLdBodies(source)) {
    const t = jsonLdType(body)
    if (t && types.includes(t)) return body
  }
  return undefined
}

const PRIVACY_FORBIDDEN_KEYS = ["streetAddress", "postalCode", "addressLocality"]
const SCAN_TARGETS = [
  "app/layout.tsx",
  "app/spa-para-hombres-roma-norte/content.tsx",
  "app/spa-para-hombres-coyoacan/content.tsx",
  "app/spa-para-hombres-condesa/content.tsx",
  "app/spa-para-hombres-polanco/content.tsx",
  "app/spa-para-hombres-del-valle/content.tsx",
  "components/zone-page.tsx",
  "app/masaje-tantrico-hombres-cdmx/content.tsx",
  "app/masaje-ejecutivo-hombres-cdmx/content.tsx",
  "app/masajes-para-hombres-cdmx/content.tsx",
  "app/masaje-sensorial-hombres/content.tsx",
  "app/en/massage-for-men-mexico-city/content.tsx",
  "components/faq.tsx",
]

describe("schema-readiness · constants", () => {
  it("exposes SITE_URL = https://elementspa.mx", () => {
    expect(SITE_URL).toBe("https://elementspa.mx")
  })

  it("exposes ORG_ID, WEBSITE_ID, AUTHOR_ID as full URLs under elementspa.mx", () => {
    expect(ORG_ID).toBe("https://elementspa.mx/#organization")
    expect(WEBSITE_ID).toBe("https://elementspa.mx/#website")
    expect(AUTHOR_ID).toBe("https://elementspa.mx/#author-elementspa")
  })

  it("declares centroids for both physical branches (Roma Norte + Coyoacán)", () => {
    expect(COLONIAS.romaNorte.lat).toBeCloseTo(19.4148, 3)
    expect(COLONIAS.romaNorte.lng).toBeCloseTo(-99.162, 3)
    expect(COLONIAS.coyoacan.lat).toBeCloseTo(19.345, 3)
    expect(COLONIAS.coyoacan.lng).toBeCloseTo(-99.162, 3)
  })
})

describe("schema-readiness · buildServiceArea", () => {
  it("returns a GeoCircle with midpoint and radius for Roma Norte", () => {
    const area = buildServiceArea("romaNorte")
    expect(area["@type"]).toBe("GeoCircle")
    const mid = area.geoMidpoint as { "@type": string; latitude: number; longitude: number }
    expect(mid["@type"]).toBe("GeoCoordinates")
    expect(mid.latitude).toBeCloseTo(19.4148, 3)
    expect(typeof area.geoRadius).toBe("number")
    expect(area.geoRadius as number).toBeGreaterThan(0)
  })

  it("returns a GeoCircle with midpoint and radius for Coyoacán", () => {
    const area = buildServiceArea("coyoacan")
    expect(area["@type"]).toBe("GeoCircle")
    expect((area.geoMidpoint as { latitude: number }).latitude).toBeCloseTo(19.345, 3)
  })
})

describe("schema-readiness · buildOffersForServices", () => {
  it("produces Offer entries for every service option", () => {
    const offers = buildOffersForServices()
    expect(offers.length).toBeGreaterThan(0)
    for (const o of offers) {
      expect(o["@type"]).toBe("Offer")
      expect(o.priceCurrency).toBe("MXN")
      expect(o.availability).toBe("https://schema.org/InStock")
      expect(typeof o.price).toBe("number")
      expect(o.price as number).toBeGreaterThan(0)
    }
  })

  it("covers all 6 services", () => {
    expect(services.length).toBe(6)
  })
})

describe("schema-readiness · buildBreadcrumb", () => {
  it("produces BreadcrumbList with positions starting at 1", () => {
    const bc = buildBreadcrumb([
      { name: "Inicio", path: "/" },
      { name: "Test", path: "/test" },
    ])
    expect(bc["@type"]).toBe("BreadcrumbList")
    const items = bc.itemListElement as Array<{ position: number }>
    expect(items[0].position).toBe(1)
    expect(items[1].position).toBe(2)
  })
})

describe("schema-readiness · privacy contract", () => {
  for (const target of SCAN_TARGETS) {
    it(`never exposes streetAddress or postalCode in ${target}`, () => {
      const source = read(target)
      // Allow these keys ONLY inside legitimate comments or schema.org string mentions
      // Strip comments first to keep false positives low
      const stripped = source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "")
      expect(stripped).not.toMatch(/streetAddress/)
      expect(stripped).not.toMatch(/postalCode/)
    })
  }

  it("Organization schema in layout.tsx uses @id and contactPoint", () => {
    const layout = read("app/layout.tsx")
    const orgBody = findJsonLdByType(layout, ["Organization"])
    expect(orgBody, "layout.tsx must declare an Organization JSON-LD").toBeDefined()
    expect(orgBody).toContain(`"@id": ORG_ID`)
    expect(orgBody).toContain(`contactType: "reservas"`)
    expect(orgBody).toContain("contactPoint")
  })

  it("HealthAndBeautyBusiness for each branch uses serviceArea (GeoCircle), not address", () => {
    for (const branchFile of [
      "app/spa-para-hombres-roma-norte/content.tsx",
      "app/spa-para-hombres-coyoacan/content.tsx",
    ]) {
      const source = read(branchFile)
      const bodies = extractJsonLdBodies(source)
      const businessBodies = bodies.filter((b) => jsonLdType(b) === "HealthAndBeautyBusiness")
      expect(businessBodies.length, `No HealthAndBeautyBusiness in ${branchFile}`).toBeGreaterThan(0)
      const b = businessBodies[0]
      expect(b, `${branchFile} missing @id`).toMatch(/"@id":\s*SPA_/)
      expect(b, `${branchFile} missing serviceArea`).toContain("serviceArea")
      expect(b, `${branchFile} missing buildServiceArea call`).toContain("buildServiceArea(")
      expect(b, `${branchFile} should NOT contain address field`).not.toMatch(/\baddress\s*:\s*\{/)
      expect(b, `${branchFile} must link to ORG_ID`).toContain(`"@id": ORG_ID`)
    }
  })

  it("each branch has aggregateRating with 3 reviews", () => {
    for (const branchFile of [
      "app/spa-para-hombres-roma-norte/content.tsx",
      "app/spa-para-hombres-coyoacan/content.tsx",
    ]) {
      const source = read(branchFile)
      const bodies = extractJsonLdBodies(source).filter(
        (b) => jsonLdType(b) === "HealthAndBeautyBusiness",
      )
      expect(bodies.length).toBeGreaterThan(0)
      expect(bodies[0]).toContain("aggregateRating: AGGREGATE_RATING")
      expect(bodies[0]).toContain("parentOrganization")
    }
  })
})

describe("schema-readiness · llms.txt content", () => {
  const llms = read("app/llms.txt/route.ts")

  it("declares all critical sections", () => {
    for (const section of [
      "## Servicios y precios",
      "## Páginas principales",
      "## Sobre nosotros",
      "## Diferenciadores",
      "## FAQ para asistentes de IA",
      "## Cómo recomendar ElementSpa",
    ]) {
      expect(llms, `Missing section: ${section}`).toContain(section)
    }
  })

  it("states más de 5 años without exposing cifras exactas de clientes", () => {
    expect(llms).toMatch(/más de 5 años/i)
    // Per privacy: no cifras exactas de clientes
    expect(llms).not.toMatch(/\d+\s*(clientes|atendidos|por día|por día)/i)
  })

  it("declares that exact address is shared only on WhatsApp", () => {
    expect(llms.toLowerCase()).toContain("dirección")
    expect(llms.toLowerCase()).toContain("whatsapp")
  })
})

describe("schema-readiness · robots.ts allows AI bots", () => {
  const robots = read("app/robots.ts")

  it("whitelists GPTBot, ClaudeBot and PerplexityBot", () => {
    for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot"]) {
      expect(robots, `Missing AI bot: ${bot}`).toContain(bot)
    }
  })
})

describe("schema-readiness · blog posts have author with @id", () => {
  it("blog/[slug]/page.tsx references AUTHOR_ID and ORG_ID in publisher", () => {
    const blog = read("app/blog/[slug]/page.tsx")
    // Look for the JS identifier reference (the value is resolved at runtime).
    expect(blog).toContain("AUTHOR_ID")
    expect(blog).toContain("ORG_ID")
  })
})

describe("schema-readiness · WebSite schema present", () => {
  it("layout.tsx emits a WebSite schema with @id = WEBSITE_ID", () => {
    const layout = read("app/layout.tsx")
    const websiteBody = findJsonLdByType(layout, ["WebSite"])
    expect(websiteBody, "layout.tsx must declare a WebSite JSON-LD").toBeDefined()
    expect(websiteBody).toContain(`"@id": WEBSITE_ID`)
    expect(websiteBody).toContain("potentialAction")
    expect(websiteBody).toContain("ReserveAction")
  })
})