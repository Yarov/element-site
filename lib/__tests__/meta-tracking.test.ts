import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { trackLead, trackViewContent, trackContact } from "../meta-tracking"

interface FbqCall {
  args: unknown[]
}

interface FetchCall {
  url: string
  init: RequestInit | undefined
  body: unknown
}

interface DataLayerEvent {
  [key: string]: unknown
}

declare global {
  interface Window {
    dataLayer: DataLayerEvent[]
  }
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/`
}

function clearCookies() {
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=")
    const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim()
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  })
}

let fbqCalls: FbqCall[]
let fetchCalls: FetchCall[]
let originalFetch: typeof globalThis.fetch

beforeEach(() => {
  clearCookies()
  fbqCalls = []
  fetchCalls = []

  window.fbq = ((...args: unknown[]) => {
    fbqCalls.push({ args })
  }) as typeof window.fbq

  window.dataLayer = []

  originalFetch = globalThis.fetch
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString()
    let parsedBody: unknown = undefined
    if (init?.body && typeof init.body === "string") {
      try {
        parsedBody = JSON.parse(init.body)
      } catch {
        parsedBody = init.body
      }
    }
    fetchCalls.push({ url, init, body: parsedBody })
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  }) as typeof globalThis.fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
  delete (window as { fbq?: unknown }).fbq
})

describe("trackLead", () => {
  it("fires fbq Lead with content_name and content_category", () => {
    trackLead("Roma Norte", "Caricias del Alma")

    expect(fbqCalls).toHaveLength(1)
    const [type, eventName, params, options] = fbqCalls[0].args as [
      string,
      string,
      Record<string, unknown>,
      { eventID: string },
    ]
    expect(type).toBe("track")
    expect(eventName).toBe("Lead")
    expect(params.content_name).toBe("Caricias del Alma")
    expect(params.content_category).toBe("Roma Norte")
    expect(options.eventID).toMatch(/^\d+-[a-z0-9]+$/)
  })

  it("uses 'general' as default content_name when servicio omitted", () => {
    trackLead("Coyoacán")

    const params = fbqCalls[0].args[2] as Record<string, unknown>
    expect(params.content_name).toBe("general")
    expect(params.content_category).toBe("Coyoacán")
  })

  it("sends server-side CAPI event with same event_id (deduplication)", () => {
    trackLead("Roma Norte", "Conexión Esencial")

    expect(fetchCalls).toHaveLength(1)
    const fetchCall = fetchCalls[0]
    expect(fetchCall.url).toBe("/api/meta-capi")
    expect(fetchCall.init?.method).toBe("POST")
    expect((fetchCall.init as RequestInit & { keepalive?: boolean }).keepalive).toBe(true)

    const body = fetchCall.body as {
      event_name: string
      event_id: string
      custom_data: Record<string, unknown>
    }
    const eventOptions = fbqCalls[0].args[3] as { eventID: string }

    expect(body.event_name).toBe("Lead")
    expect(body.event_id).toBe(eventOptions.eventID)
    expect(body.custom_data.content_category).toBe("Roma Norte")
    expect(body.custom_data.content_name).toBe("Conexión Esencial")
  })

  it("includes _fbp and _fbc cookies in CAPI payload when present", () => {
    setCookie("_fbp", "fb.1.1234567890.987654321")
    setCookie("_fbc", "fb.1.1234567890.IwAR-test")

    trackLead("Roma Norte")

    const body = fetchCalls[0].body as { fbp?: string; fbc?: string }
    expect(body.fbp).toBe("fb.1.1234567890.987654321")
    expect(body.fbc).toBe("fb.1.1234567890.IwAR-test")
  })

  it("omits fbp/fbc when cookies are missing", () => {
    trackLead("Coyoacán")

    const body = fetchCalls[0].body as { fbp?: string; fbc?: string }
    expect(body.fbp).toBeUndefined()
    expect(body.fbc).toBeUndefined()
  })

  it("pushes click_whatsapp event to dataLayer with normalized sucursal", () => {
    trackLead("Roma Norte", "Caricias del Alma")

    expect(window.dataLayer).toHaveLength(1)
    const dlEvent = window.dataLayer[0] as Record<string, unknown>
    expect(dlEvent.event).toBe("click_whatsapp")
    expect(dlEvent.sucursal).toBe("Roma_Norte")
    expect(dlEvent.servicio).toBe("Caricias_del_Alma")
    expect(dlEvent.event_id).toBeTypeOf("string")
  })

  it("does NOT include servicio in dataLayer when not provided", () => {
    trackLead("Coyoacán")

    const dlEvent = window.dataLayer[0] as Record<string, unknown>
    expect(dlEvent.servicio).toBeUndefined()
  })

  it("uses the same event_id across browser, dataLayer, and CAPI", () => {
    trackLead("Roma Norte")

    const fbqEventId = (fbqCalls[0].args[3] as { eventID: string }).eventID
    const dlEventId = (window.dataLayer[0] as { event_id: string }).event_id
    const capiEventId = (fetchCalls[0].body as { event_id: string }).event_id

    expect(fbqEventId).toBe(dlEventId)
    expect(fbqEventId).toBe(capiEventId)
  })

  it("does nothing when fbq is not yet loaded (retries via interval)", async () => {
    delete (window as { fbq?: unknown }).fbq
    vi.useFakeTimers()

    trackLead("Roma Norte")

    // fbq not yet fired (waiting for interval)
    expect(fbqCalls).toHaveLength(0)
    // but CAPI fired immediately
    expect(fetchCalls).toHaveLength(1)

    // simulate fbq becoming available
    window.fbq = ((...args: unknown[]) => {
      fbqCalls.push({ args })
    }) as typeof window.fbq

    vi.advanceTimersByTime(250)
    expect(fbqCalls).toHaveLength(1)

    vi.useRealTimers()
  })
})

describe("trackViewContent", () => {
  it("fires fbq ViewContent with content_name", () => {
    trackViewContent("Spa Roma Norte", "sucursales")

    expect(fbqCalls).toHaveLength(1)
    const [, eventName, params] = fbqCalls[0].args as [string, string, Record<string, unknown>]
    expect(eventName).toBe("ViewContent")
    expect(params.content_name).toBe("Spa Roma Norte")
    expect(params.content_category).toBe("sucursales")
  })

  it("includes value and currency when provided", () => {
    trackViewContent("Caricias del Alma", "servicios", 1100)

    const params = fbqCalls[0].args[2] as Record<string, unknown>
    expect(params.value).toBe(1100)
    expect(params.currency).toBe("MXN")
  })

  it("omits value/currency when not provided", () => {
    trackViewContent("Spa Coyoacán", "sucursales")

    const params = fbqCalls[0].args[2] as Record<string, unknown>
    expect(params.value).toBeUndefined()
    expect(params.currency).toBeUndefined()
  })

  it("sends matching CAPI event with same event_id", () => {
    trackViewContent("Masaje Tántrico", "servicios", 2500)

    expect(fetchCalls).toHaveLength(1)
    const body = fetchCalls[0].body as {
      event_name: string
      event_id: string
      custom_data: Record<string, unknown>
    }
    expect(body.event_name).toBe("ViewContent")
    expect(body.custom_data.content_name).toBe("Masaje Tántrico")
    expect(body.custom_data.value).toBe(2500)
    expect(body.custom_data.currency).toBe("MXN")

    const fbqEventId = (fbqCalls[0].args[3] as { eventID: string }).eventID
    expect(body.event_id).toBe(fbqEventId)
  })

  it("pushes view_content to dataLayer", () => {
    trackViewContent("Spa Roma Norte", "sucursales")

    expect(window.dataLayer).toHaveLength(1)
    const dl = window.dataLayer[0] as Record<string, unknown>
    expect(dl.event).toBe("view_content")
    expect(dl.content_name).toBe("Spa Roma Norte")
    expect(dl.content_category).toBe("sucursales")
  })
})

describe("trackContact", () => {
  it("fires fbq Contact with sucursal and method", () => {
    trackContact("Roma Norte", "phone")

    const [, eventName, params] = fbqCalls[0].args as [string, string, Record<string, unknown>]
    expect(eventName).toBe("Contact")
    expect(params.content_category).toBe("Roma Norte")
    expect(params.content_name).toBe("phone")
  })

  it("sends matching CAPI event", () => {
    trackContact("Coyoacán", "whatsapp")

    expect(fetchCalls).toHaveLength(1)
    const body = fetchCalls[0].body as {
      event_name: string
      custom_data: Record<string, unknown>
    }
    expect(body.event_name).toBe("Contact")
    expect(body.custom_data.content_category).toBe("Coyoacán")
    expect(body.custom_data.content_name).toBe("whatsapp")
  })

  it("pushes contact event to dataLayer with normalized sucursal", () => {
    trackContact("Roma Norte", "phone")

    const dl = window.dataLayer[0] as Record<string, unknown>
    expect(dl.event).toBe("contact")
    expect(dl.sucursal).toBe("Roma_Norte")
    expect(dl.contact_method).toBe("phone")
  })
})
