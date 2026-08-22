import { ORG_ID } from "./schema"

export interface Testimonial {
  quote: string
  author: string
  location: string
  datePublished: string
  branch: "romaNorte" | "coyoacan"
}

/**
 * Testimonios reales (3) recolectados durante 2026. Mantener sincronizados
 * con los textos renderizados en `components/testimonials.tsx` y los
 * payloads `Review` emitidos por `components/reviews-markup.tsx`.
 *
 * IMPORTANTE: no inflar. Google penaliza el aggregateRating si el
 * reviewCount no corresponde a reseñas verificables.
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      "La experiencia en ElementSpa superó todas mis expectativas. El ambiente es increíblemente discreto y las terapeutas son verdaderas profesionales. Sin duda, el mejor spa para hombres que he visitado en CDMX.",
    author: "Carlos M.",
    location: "Roma Norte",
    branch: "romaNorte",
    datePublished: "2026-05-15",
  },
  {
    quote:
      "Probé el masaje piel a piel y fue una experiencia que nunca olvidaré. La privacidad, la atención al detalle y la calidad del servicio son de otro nivel. 100% recomendado para quienes buscan algo exclusivo.",
    author: "Luis H.",
    location: "Coyoacán",
    branch: "coyoacan",
    datePublished: "2026-06-20",
  },
  {
    quote:
      "Llevo más de un año viniendo a ElementSpa y cada visita es mejor que la anterior. El equipo sabe exactamente cómo hacerte sentir relajado y consentido. Mi lugar favorito sin dudarlo.",
    author: "David R.",
    location: "Del Valle",
    branch: "romaNorte",
    datePublished: "2026-07-10",
  },
]

/** Build schema.org Review[] for use in JSON-LD markup. */
export function buildReviewsJsonLd(
  selectedTestimonials: Testimonial[] = testimonials,
  itemReviewedId: string = ORG_ID,
) {
  return selectedTestimonials.map((t) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@id": itemReviewedId },
    reviewBody: t.quote,
    author: { "@type": "Person", name: t.author },
    datePublished: t.datePublished,
    reviewRating: {
      "@type": "Rating",
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
    },
  }))
}