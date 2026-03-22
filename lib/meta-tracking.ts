/**
 * Meta Pixel + CAPI tracking with event deduplication.
 *
 * - Browser: calls fbq() directly with eventID for dedup + pushes to dataLayer for GA4
 * - Server: sends the same event via CAPI with matching event_id
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function getFbCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === "undefined") return {}
  const cookies = document.cookie.split("; ")
  const fbp = cookies.find((c) => c.startsWith("_fbp="))?.split("=")[1]
  const fbc = cookies.find((c) => c.startsWith("_fbc="))?.split("=")[1]
  return { fbp, fbc }
}

function fbqTrack(eventName: string, params: Record<string, unknown>, eventId: string) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params, { eventID: eventId })
  }
}

async function sendServerEvent(payload: {
  event_name: string
  event_id: string
  event_source_url: string
  custom_data?: Record<string, unknown>
  fbp?: string
  fbc?: string
}) {
  try {
    await fetch("/api/meta-capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    // Silent fail — browser pixel is the fallback
  }
}

/** Track Lead event (WhatsApp click) — browser + server */
export function trackLead(sucursal: string, servicio?: string) {
  if (typeof window === "undefined") return

  const eventId = generateEventId()
  const { fbp, fbc } = getFbCookies()

  // Browser: fbq() direct call with eventID for deduplication
  fbqTrack("Lead", {
    content_name: servicio || "general",
    content_category: sucursal,
  }, eventId)

  // Browser: push to dataLayer for GA4/GTM
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: "click_whatsapp",
    event_id: eventId,
    sucursal: sucursal.replace(/\s+/g, "_"),
    ...(servicio && { servicio: servicio.replace(/\s+/g, "_") }),
  })

  // Server: CAPI
  sendServerEvent({
    event_name: "Lead",
    event_id: eventId,
    event_source_url: window.location.href,
    custom_data: {
      content_name: servicio || "general",
      content_category: sucursal,
    },
    fbp,
    fbc,
  })
}

/** Track ViewContent event (service page view) — browser + server */
export function trackViewContent(contentName: string, contentCategory?: string, value?: number) {
  if (typeof window === "undefined") return

  const eventId = generateEventId()
  const { fbp, fbc } = getFbCookies()

  const customData = {
    content_name: contentName,
    ...(contentCategory && { content_category: contentCategory }),
    ...(value && { value, currency: "MXN" }),
  }

  // Browser: fbq() direct call with eventID for deduplication
  fbqTrack("ViewContent", customData, eventId)

  // Browser: push to dataLayer for GA4/GTM
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: "view_content",
    event_id: eventId,
    ...customData,
  })

  // Server: CAPI
  sendServerEvent({
    event_name: "ViewContent",
    event_id: eventId,
    event_source_url: window.location.href,
    custom_data: {
      content_name: contentName,
      ...(contentCategory && { content_category: contentCategory }),
      ...(value && { value, currency: "MXN" }),
    },
    fbp,
    fbc,
  })
}

/** Track Contact event (phone click) — browser + server */
export function trackContact(sucursal: string, method: string) {
  if (typeof window === "undefined") return

  const eventId = generateEventId()
  const { fbp, fbc } = getFbCookies()

  // Browser: fbq() direct call with eventID for deduplication
  fbqTrack("Contact", {
    content_category: sucursal,
    content_name: method,
  }, eventId)

  // Browser: push to dataLayer for GA4/GTM
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: "contact",
    event_id: eventId,
    sucursal: sucursal.replace(/\s+/g, "_"),
    contact_method: method,
  })

  sendServerEvent({
    event_name: "Contact",
    event_id: eventId,
    event_source_url: window.location.href,
    custom_data: {
      content_category: sucursal,
      content_name: method,
    },
    fbp,
    fbc,
  })
}
