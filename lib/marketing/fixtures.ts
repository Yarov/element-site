import type { Campaign, ComponentKind, MarketingComponent } from "./model"

function component(kind: ComponentKind, overrides: Partial<MarketingComponent> = {}): MarketingComponent {
  return {
    id: crypto.randomUUID(),
    kind,
    slot: kind === "hero" ? "home.hero" : kind === "block" ? "home.promo" : "home.banner",
    title: "Una experiencia creada para ti",
    body: "Descubre una propuesta exclusiva para tu próxima visita.",
    ctaLabel: "Reservar por WhatsApp",
    ctaHref: "https://wa.me/525647114561",
    ...overrides,
  }
}

export function newCampaign(): Campaign {
  return {
    id: crypto.randomUUID(),
    name: "Nueva campaña",
    description: "",
    status: "draft",
    audience: { minVisits: 3, pagePath: "/" },
    priority: 50,
    startsAt: null,
    endsAt: null,
    components: [component("banner")],
    updatedAt: new Date().toISOString(),
  }
}

export const campaignExamples: Campaign[] = [
  {
    id: "returning-visitor-promo",
    name: "Oferta para visitante recurrente",
    description: "Recupera visitantes de la home a partir de la tercera visita.",
    status: "draft",
    audience: { minVisits: 3, pagePath: "/" },
    priority: 70,
    startsAt: null,
    endsAt: null,
    components: [component("banner", { title: "Tu próxima pausa merece algo especial", body: "Agenda esta semana y recibe una cortesía de bienvenida en tu próxima experiencia.", ctaLabel: "Ver disponibilidad" })],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "weekend-hero",
    name: "Hero de fin de semana",
    description: "Variante del encabezado para visitantes de fin de semana.",
    status: "draft",
    audience: { minVisits: 2, pagePath: "/" },
    priority: 60,
    startsAt: null,
    endsAt: null,
    components: [component("hero", { title: "Tu fin de semana empieza aquí", body: "Un espacio privado para bajar el ritmo y volver a ti.", ctaLabel: "Reservar experiencia", imageUrl: "/dark-luxury-spa-massage-room-with-candles-ambient-.jpg" })],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "feedback-survey",
    name: "Feedback después de explorar servicios",
    description: "Encuesta corta para visitantes recurrentes antes de reservar.",
    status: "draft",
    audience: { minVisits: 3, pagePath: "/" },
    priority: 40,
    startsAt: null,
    endsAt: null,
    components: [component("survey", { slot: "home.promo", title: "Ayúdanos a personalizar tu próxima visita", body: "Tus respuestas nos permiten recomendarte una experiencia.", ctaLabel: "Enviar respuestas", questions: [{ id: "interest", label: "¿Qué te interesa explorar?", kind: "choice", options: ["Relajación", "Masaje sensorial", "Masaje tántrico"] }, { id: "rating", label: "¿Qué tan probable es que reserves?", kind: "rating" }] })],
    updatedAt: new Date().toISOString(),
  },
]
