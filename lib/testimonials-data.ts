export interface Testimonial {
  quote: string
  author: string
  location: string
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "La experiencia en ElementSpa superó todas mis expectativas. El ambiente es increíblemente discreto y las terapeutas son verdaderas profesionales. Sin duda, el mejor spa para hombres que he visitado en CDMX.",
    author: "Carlos M.",
    location: "Roma Norte",
  },
  {
    quote:
      "Probé el masaje piel a piel y fue una experiencia que nunca olvidaré. La privacidad, la atención al detalle y la calidad del servicio son de otro nivel. 100% recomendado para quienes buscan algo exclusivo.",
    author: "Luis H.",
    location: "Coyoacán",
  },
  {
    quote:
      "Llevo más de un año viniendo a ElementSpa y cada visita es mejor que la anterior. El equipo sabe exactamente cómo hacerte sentir relajado y consentido. Mi lugar favorito sin dudarlo.",
    author: "David R.",
    location: "Del Valle",
  },
]
