import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Spa para Hombres en Roma Norte — Masajes Exclusivos",
  description:
    "Visita ElementSpa en Roma Norte, CDMX. Masajes sensoriales, relajantes y tántricos exclusivos para caballeros. Ambiente discreto, terapeutas profesionales. Reserva por WhatsApp.",
  alternates: {
    canonical: "/spa-para-hombres-roma-norte",
  },
  openGraph: {
    title: "Spa para Hombres en Roma Norte — ElementSpa",
    description:
      "Masajes exclusivos para hombres en Roma Norte, CDMX. Experiencias sensoriales, relajantes y tántricas en un ambiente privado y sofisticado.",
    url: "https://elementspa.mx/spa-para-hombres-roma-norte",
    images: [
      {
        url: "/luxury-spa-interior-wood-stone-natural-elements-ma.jpg",
        width: 1200,
        height: 630,
        alt: "ElementSpa Roma Norte — Spa exclusivo para hombres",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spa para Hombres en Roma Norte — ElementSpa",
    description:
      "Masajes exclusivos para hombres en Roma Norte, CDMX. Reserva por WhatsApp.",
    images: ["/luxury-spa-interior-wood-stone-natural-elements-ma.jpg"],
  },
}

export { default } from "./content"
