import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Masaje Ejecutivo para Hombres en CDMX — Desde $1,100 en 30 min",
  description:
    "Masaje ejecutivo para hombres en CDMX desde $1,100. Sesiones de 30 a 50 min que caben en tu jornada laboral: liberan cuello, espalda y estrés de oficina. Roma Norte y Coyoacán.",
  alternates: {
    canonical: "/masaje-ejecutivo-hombres-cdmx",
  },
  openGraph: {
    title: "Masaje Ejecutivo para Hombres en CDMX — ElementSpa",
    description:
      "Spa ejecutivo para hombres en CDMX. Sesiones de 30 a 50 minutos que se ajustan a tu agenda, con total discreción. Desde $1,100.",
    url: "https://elementspa.mx/masaje-ejecutivo-hombres-cdmx",
    images: [
      {
        url: "/luxury-grooming-tools-razor-brush-masculine.jpg",
        width: 1200,
        height: 630,
        alt: "Masaje ejecutivo para hombres en CDMX — ElementSpa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Masaje Ejecutivo para Hombres en CDMX — ElementSpa",
    description: "Masaje ejecutivo para hombres en CDMX desde $1,100. Reserva por WhatsApp.",
    images: ["/luxury-grooming-tools-razor-brush-masculine.jpg"],
  },
}

export { default } from "./content"
