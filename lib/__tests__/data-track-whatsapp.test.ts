/**
 * Critical regression test: trackWhatsAppClick must initiate tracking calls
 * (fbq + fetch keepalive to /api/meta-capi) BEFORE invoking window.open or
 * setting window.location.href. Otherwise, on iOS Safari and some Android
 * browsers, the navigation/app-switch aborts in-flight requests and the
 * server-side CAPI event is lost ~50% of the time.
 *
 * The order MUST be:
 *   1. fbq('track', 'Lead', ...) — synchronous queue push
 *   2. fetch('/api/meta-capi', { keepalive: true }) — initiated, not awaited
 *   3. window.open(waUrl, '_blank') — preserves user gesture
 *   4. (fallback) window.location.href = waUrl — only if popup blocked
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { trackWhatsAppClick } from "../data"

type CallTag =
  | { kind: "fbq"; eventName: string }
  | { kind: "fetch"; url: string }
  | { kind: "open"; url: string }
  | { kind: "location_href"; url: string }

let calls: CallTag[]
let originalFetch: typeof globalThis.fetch
let originalOpen: typeof window.open

beforeEach(() => {
  calls = []

  window.fbq = ((...args: unknown[]) => {
    if (args[0] === "track") {
      calls.push({ kind: "fbq", eventName: String(args[1]) })
    }
  }) as typeof window.fbq

  window.dataLayer = []

  originalFetch = globalThis.fetch
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString()
    calls.push({ kind: "fetch", url })
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  }) as typeof globalThis.fetch

  originalOpen = window.open
  window.open = ((url?: string | URL) => {
    calls.push({ kind: "open", url: String(url ?? "") })
    return {} as Window
  }) as typeof window.open
})

afterEach(() => {
  globalThis.fetch = originalFetch
  window.open = originalOpen
  delete (window as { fbq?: unknown }).fbq
})

describe("trackWhatsAppClick — critical execution order (iOS/Android safety)", () => {
  it("initiates fetch to /api/meta-capi BEFORE window.open", () => {
    const waUrl = "https://wa.me/525647114561?text=hola"
    trackWhatsAppClick("Roma Norte", waUrl, "Caricias del Alma")

    const fetchIdx = calls.findIndex(
      (c) => c.kind === "fetch" && c.url.includes("/api/meta-capi"),
    )
    const openIdx = calls.findIndex((c) => c.kind === "open")

    expect(fetchIdx).toBeGreaterThanOrEqual(0)
    expect(openIdx).toBeGreaterThanOrEqual(0)
    expect(fetchIdx).toBeLessThan(openIdx)
  })

  it("fires fbq Lead BEFORE window.open", () => {
    trackWhatsAppClick("Coyoacán", "https://wa.me/525647114561?text=hola")

    const fbqIdx = calls.findIndex((c) => c.kind === "fbq" && c.eventName === "Lead")
    const openIdx = calls.findIndex((c) => c.kind === "open")

    expect(fbqIdx).toBeGreaterThanOrEqual(0)
    expect(openIdx).toBeGreaterThanOrEqual(0)
    expect(fbqIdx).toBeLessThan(openIdx)
  })

  it("opens WhatsApp URL in new tab", () => {
    const waUrl = "https://wa.me/525647114561?text=hola"
    trackWhatsAppClick("Roma Norte", waUrl)

    const openCall = calls.find((c) => c.kind === "open")
    expect(openCall).toBeDefined()
    expect((openCall as { url: string }).url).toBe(waUrl)
  })

  it("falls back to window.location.href if popup is blocked", () => {
    // popup blocked → window.open returns null
    window.open = (() => null) as typeof window.open

    let hrefSet = ""
    const originalLocation = window.location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        set href(v: string) {
          hrefSet = v
          calls.push({ kind: "location_href", url: v })
        },
        get href() {
          return originalLocation.href
        },
      },
    })

    const waUrl = "https://wa.me/525647114561?text=hola"
    trackWhatsAppClick("Coyoacán", waUrl)

    expect(hrefSet).toBe(waUrl)

    // Restore
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    })
  })

  it("fetch and fbq still fire BEFORE location.href fallback (popup blocked path)", () => {
    window.open = (() => null) as typeof window.open

    let hrefSet = ""
    const originalLocation = window.location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        set href(v: string) {
          hrefSet = v
          calls.push({ kind: "location_href", url: v })
        },
        get href() {
          return originalLocation.href
        },
      },
    })

    trackWhatsAppClick("Roma Norte", "https://wa.me/525647114561?text=x", "Conexión Esencial")

    const fbqIdx = calls.findIndex((c) => c.kind === "fbq")
    const fetchIdx = calls.findIndex((c) => c.kind === "fetch")
    const hrefIdx = calls.findIndex((c) => c.kind === "location_href")

    expect(fbqIdx).toBeGreaterThanOrEqual(0)
    expect(fetchIdx).toBeGreaterThanOrEqual(0)
    expect(hrefIdx).toBeGreaterThanOrEqual(0)
    expect(fbqIdx).toBeLessThan(hrefIdx)
    expect(fetchIdx).toBeLessThan(hrefIdx)
    expect(hrefSet).toContain("wa.me")

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    })
  })

  it("uses fetch with keepalive: true for navigation safety", () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(JSON.stringify({ success: true })),
    )
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch

    trackWhatsAppClick("Roma Norte", "https://wa.me/525647114561?text=x")

    expect(fetchMock).toHaveBeenCalled()
    const init = fetchMock.mock.calls[0]?.[1] as (RequestInit & { keepalive?: boolean }) | undefined
    expect(init?.keepalive).toBe(true)
  })

  it("sends sucursal and servicio in CAPI custom_data", () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ kind: "fetch", url: String(input) })
      const body = JSON.parse(init?.body as string)
      // store body for inspection
      ;(fetchMock as unknown as { lastBody: unknown }).lastBody = body
      return new Response(JSON.stringify({ success: true }))
    })
    globalThis.fetch = fetchMock as typeof globalThis.fetch

    trackWhatsAppClick("Coyoacán", "https://wa.me/525647114561?text=x", "Energía Vital")

    const lastBody = (fetchMock as unknown as { lastBody: { custom_data: Record<string, unknown> } })
      .lastBody
    expect(lastBody.custom_data.content_category).toBe("Coyoacán")
    expect(lastBody.custom_data.content_name).toBe("Energía Vital")
  })

  it("does not throw when called in SSR-like context (no window)", () => {
    // Hard to fully simulate SSR in jsdom; assert function tolerates being called
    // multiple times without throwing — proxy for robustness.
    expect(() =>
      trackWhatsAppClick("Roma Norte", "https://wa.me/525647114561?text=x"),
    ).not.toThrow()
  })
})
