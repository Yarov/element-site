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

/** Convierte "$1,350" -> 1350. Devuelve undefined si no hay precio parseable. */
function parsePrice(price?: string): number | undefined {
  if (!price) return undefined
  const n = Number(price.replace(/[^0-9.]/g, ""))
  return Number.isFinite(n) && n > 0 ? n : undefined
}

/**
 * Valor POTENCIAL del lead (no ingreso confirmado): el precio del servicio
 * solicitado. Para servicios con varias duraciones usa la opción más barata,
 * para no inflar el valor. Sin servicio identificado devuelve undefined —
 * preferimos no enviar valor a enviar uno inventado.
 *
 * Sirve para que Meta y GA4 optimicen por valor y no solo por volumen:
 * un lead de MASAJE 4 MANOS ($4,000) no vale lo mismo que uno de $1,100.
 */
export function getLeadValue(servicio?: string): number | undefined {
  if (!servicio) return undefined
  const service = services.find((s) => s.title === servicio)
  if (!service) return undefined
  if (service.price) return parsePrice(service.price)
  const optionPrices = (service.options ?? [])
    .map((o) => parsePrice(o.price))
    .filter((p): p is number => p !== undefined)
  return optionPrices.length ? Math.min(...optionPrices) : undefined
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
  trackLead(sucursal, servicio, getLeadValue(servicio))

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

export function buildWhatsAppMessage({ page, servicio, detalle }: {
  page: string
  servicio?: string
  detalle?: string
}): string {
  const lines = [`Hola, vi la página de ${page} de ElementSpa.`]
  lines.push("Quiero agendar en la sucursal {sucursal}.")
  if (servicio) {
    const info = detalle ? ` (${detalle})` : ""
    lines.push(`Me interesa: ${servicio}${info}.`)
  }
  lines.push("¿Tienen disponibilidad para hoy o mañana?")
  return lines.join("\n")
}

export function getWhatsAppLink(phone: string, message: string) {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phone.replace(/\+/g, "")}?text=${encodedMessage}`
}
