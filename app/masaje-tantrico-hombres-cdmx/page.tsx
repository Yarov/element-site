import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Masaje Tántrico para Hombres en CDMX — Experiencia Premium | ElementSpa",
  description:
    "Descubre el masaje tántrico para hombres en CDMX. Técnicas de contacto corporal completo, estimulación sensorial y conexión profunda. Terapeutas profesionales en Roma Norte y Coyoacán.",
  alternates: {
    canonical: "/masaje-tantrico-hombres-cdmx",
  },
  openGraph: {
    title: "Masaje Tántrico para Hombres en CDMX — ElementSpa",
    description:
      "Experiencia de masaje tántrico exclusivo para caballeros en CDMX. Contacto piel a piel, estimulación sensorial y relajación profunda.",
    url: "https://elementspa.mx/masaje-tantrico-hombres-cdmx",
    images: [
      {
        url: "/masaje-piel-a-piel-premium.jpg",
        width: 1200,
        height: 630,
        alt: "Masaje tántrico para hombres en CDMX — ElementSpa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Masaje Tántrico para Hombres en CDMX — ElementSpa",
    description: "Masaje tántrico exclusivo para hombres en CDMX. Reserva en ElementSpa.",
    images: ["/masaje-piel-a-piel-premium.jpg"],
  },
}

export { default } from "./content"
