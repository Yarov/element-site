import { trackLead } from "@/lib/meta-tracking"

export const locations = {
  condesa: {
    name: "Roma Norte",
    whatsapp: "+525647114561",
  },
  coyoacan: {
    name: "Coyoacán",
    whatsapp: "+525647114561",
  },
}

// Páginas de sucursal — permite preseleccionar la ubicación en el modal de
// reserva cuando el CTA (header, float) vive en una página de sucursal.
const locationByPath: Record<string, keyof typeof locations> = {
  "/spa-para-hombres-roma-norte": "condesa",
  "/spa-para-hombres-coyoacan": "coyoacan",
}

export function getLocationKeyFromPath(pathname: string): keyof typeof locations | undefined {
  return locationByPath[pathname.replace(/\/+$/, "") || "/"]
}

export const extraServices = {
  extra_10_min: {
    name: "10 min. extra",
    price: 300,
  },
  extra_stimulation: {
    name: "1 estimulación extra",
    price: 350,
  },
}

export interface ServiceOption {
  name: string
  time: string
  price: string
  estimulations: number
  description?: string
}

export interface Service {
  id: number
  title: string
  seoTitle: string
  price?: string
  time?: string
  description: string
  estimulations?: number
  iconType: string
  options?: ServiceOption[]
}

export const services: Service[] = [
  {
    id: 1,
    title: "CARICIAS DEL ALMA",
    seoTitle: "Masaje sensorial suave para despertar el cuerpo con caricias envolventes",
    price: "$1,100",
    time: "30 min",
    description:
      "Una experiencia rápida pero profundamente provocativa. Caricias muy suaves con las yemas de los dedos y uñas que recorren todo tu cuerpo y despiertan cada fibra de tu piel. Perfecto para encender tus sentidos en pocos minutos.\n\n*Este servicio no es un masaje, si esperas recibir un masaje te recomiendo elegir la siguiente opción.",
    estimulations: 1,
    iconType: "feather",
  },
  {
    id: 2,
    title: "CONEXIÓN ESENCIAL",
    seoTitle: "Masaje relajante de cuerpo completo ideal para liberar tensión y estrés",
    price: "$1,350",
    time: "50 min",
    description:
      "Comienza como un masaje relajante de cuerpo completo y termina como una fantasía cumplida. Este masaje evoluciona con delicadeza, una presión perfecta y un ritmo envolvente hacia un toque final que libera mucho más que tensión.",
    estimulations: 1,
    iconType: "infinity",
  },
  {
    id: 3,
    title: "ENERGÍA VITAL",
    seoTitle: "Masaje descontracturante profundo que combina fuerza y técnica liberadora",
    price: "$1,550",
    time: "50 min",
    description:
      "Es un masaje descontracturante que mediante movimientos firmes, profundos y liberadores recorren todo tu cuerpo liberando el estrés, aflojando tus músculos y poco a poco despertando deseos. Es la combinación perfecta entre fuerza, técnica y un final estimulante.",
    estimulations: 1,
    iconType: "flame",
  },
  {
    id: 4,
    title: "PIEL A PIEL",
    seoTitle: "Masaje tántrico piel a piel con contacto corporal completo y estimulación",
    iconType: "heart",
    description:
      "La experiencia que despierta cada rincón de tu cuerpo comienza con suaves estímulos mientras estas boca abajo; son objetos delicados que recorren tu piel provocando despertar tus sentidos y preparando tu cuerpo para lo que viene. Una vez listo, la terapeuta se deslizará sobre de ti en topless utilizando todo su cuerpo (torso, pecho, brazos y piernas) para darte un masaje íntimo, intenso y muy sensual. Después de unos minutos, la terapeuta te pedirá que gires para continuar con tu masaje piel a piel hasta provocar tu erección y estimularte con sus manos.",
    options: [
      {
        name: "Opción 50 min",
        time: "50 min",
        price: "$2,250",
        estimulations: 1,
        description: "Experiencia completa de 50 minutos.",
      },
      {
        name: "Opción 60 min",
        time: "60 min",
        price: "$2,500",
        estimulations: 1,
        description: "Disfruta de 10 minutos adicionales para mayor placer.",
      },
    ],
  },
  {
    id: 5,
    title: "FANTASÍA COMPARTIDA",
    seoTitle: "Experiencia interactiva y sensual donde tú también participas del masaje",
    iconType: "stars",
    description:
      "Cumple uno de los deseos más prohibidos. Comienza dándole un masaje a tu terapeuta mientras ella te guía con el cuerpo semi desnudo (topless), creando una conexión íntima y única. Después, te relajarás por completo mientras ella toma el control y te brinda un masaje piel a piel caracterizado por la sensualidad y lo estimulante que transformará el momento hasta llevarte a un completo estado de éxtasis y terminando con tu eyaculación.",
    options: [
      {
        name: "Opción 50 min",
        time: "50 min",
        price: "$3,000",
        estimulations: 1,
      },
      {
        name: "Opción 65 min",
        time: "65 min",
        price: "$3,500",
        estimulations: 1,
      },
    ],
  },
  {
    id: 6,
    title: "MASAJE 4 MANOS",
    seoTitle: "Masaje a cuatro manos con dos terapeutas sincronizadas para máximo placer",
    iconType: "lotus",
    description:
      "Doble contacto, doble placer. Déjate llevar por una experiencia incomparable donde dos terapeutas en topless sincronizan sus cuerpos para despertar todos tus sentidos. En este masaje ambas recorrerán cada parte de tu cuerpo con el suyo dejándote tocar y echando a andar tu imaginación para mantener tu erección el mayor tiempo posible hasta llegar a una estimulación coordinada para que puedas disfrutar de un estado de placer absoluto.",
    options: [
      {
        name: "Opción 50 min",
        time: "50 min",
        price: "$4,000",
        estimulations: 1,
      },
      {
        name: "Opción 70 min",
        time: "70 min",
        price: "$5,000",
        estimulations: 1,
      },
    ],
  },
]

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

export function trackWhatsAppClick(sucursal: string, waUrl: string, servicio?: string) {
  if (typeof window === 'undefined') return

  // 1) Disparar tracking PRIMERO (sync) — fbq + fetch keepalive a /api/meta-capi.
  //    trackLead retorna inmediato; el fetch se inicia en este tick síncrono y
  //    queda en background con keepalive=true, por lo que sobrevive a la
  //    navegación posterior (window.open / location.href).
  //
  //    Si se invoca window.open ANTES, en iOS Safari el cambio de contexto
  //    aborta el fetch aunque tenga keepalive y se pierde el evento CAPI
  //    server-side (~50% de los Lead events en mobile).
  trackLead(sucursal, servicio)

  // 2) Abrir WhatsApp INMEDIATAMENTE en el siguiente statement síncrono del
  //    mismo handler de click, para preservar el "user gesture" y evitar
  //    que iOS/Android bloqueen el popup.
  const waWindow = window.open(waUrl, '_blank')

  // 3) Fallback si el navegador bloqueó el popup
  if (!waWindow) {
    window.location.href = waUrl
  }
}

export function getServiceDetail(service: Service): string {
  return service.price
    ? `${service.time} - ${service.price}`
    : `Desde ${service.options?.[0].price}`
}

export function buildWhatsAppMessage({ servicio, detalle }: {
  servicio?: string
  detalle?: string
} = {}): string {
  // El mensaje llega al WhatsApp del spa — no hace falta presentarse ni citar
  // la página; el staff solo necesita sucursal, servicio y horario.
  const lines = ["Hola, quiero agendar una cita en la sucursal {sucursal}."]
  if (servicio) {
    const info = detalle ? ` (${detalle})` : ""
    lines.push(`Servicio: ${servicio}${info}`)
  }
  // La línea de horario se agrega en LocationSelector, que sí conoce la hora
  // real y el horario sugerido — así el mensaje nunca pregunta "hoy" cuando
  // ya sabemos que el spa está cerrado por hoy.
  return lines.join("\n")
}

export function getWhatsAppLink(phone: string, message: string) {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phone.replace(/\+/g, "")}?text=${encodedMessage}`
}

// Horario de atención para sugerencias de horario (no es disponibilidad real).
const OPENING_HOUR = 11
const CLOSING_HOUR = 19
const SLOT_MINUTES = 30
const MAX_SUGGESTED_SLOTS = 8

function getMexicoCityParts(date: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date)
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0)
  return { hour, minute }
}

function formatSlot(hour: number, minute: number): string {
  const period = hour >= 12 ? "pm" : "am"
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  const displayMinute = minute === 0 ? "00" : String(minute).padStart(2, "0")
  return `${displayHour}:${displayMinute} ${period}`
}

export interface SuggestedSchedule {
  day: "hoy" | "mañana"
  slots: string[]
}

/**
 * Sugerencias de horario (no validación real de disponibilidad).
 * Primer horario = hora actual (CDMX) + 30 min, redondeado a la siguiente
 * media hora, dentro del horario de atención (11am-7pm). Si ya no queda
 * horario hoy, sugiere desde la apertura de mañana.
 */
export function getSuggestedTimeSlots(now: Date = new Date()): SuggestedSchedule {
  const { hour, minute } = getMexicoCityParts(now)
  const openMinutes = OPENING_HOUR * 60
  const closeMinutes = CLOSING_HOUR * 60

  let startMinutes = Math.ceil((hour * 60 + minute + SLOT_MINUTES) / SLOT_MINUTES) * SLOT_MINUTES
  let day: "hoy" | "mañana" = "hoy"

  if (startMinutes > closeMinutes) {
    day = "mañana"
    startMinutes = openMinutes
  } else if (startMinutes < openMinutes) {
    startMinutes = openMinutes
  }

  const slots: string[] = []
  for (let m = startMinutes; m <= closeMinutes && slots.length < MAX_SUGGESTED_SLOTS; m += SLOT_MINUTES) {
    slots.push(formatSlot(Math.floor(m / 60), m % 60))
  }

  return { day, slots }
}
