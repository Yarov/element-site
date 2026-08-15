import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Masaje Tántrico y Spa para Hombres en Polanco — desde $1,100",
  description:
    "Masajes tántricos y sensoriales para hombres cerca de Polanco, desde $1,100. ElementSpa está a 15 min por Reforma: cabinas privadas, discreción total. Reserva por WhatsApp.",
  alternates: {
    canonical: "/spa-para-hombres-polanco",
  },
  openGraph: {
    title: "Spa para Hombres en Polanco — Masajes Exclusivos | ElementSpa",
    description:
      "Masajes exclusivos para hombres cerca de Polanco. Experiencias sensoriales y tántricas en un ambiente privado y sofisticado.",
    url: "https://elementspa.mx/spa-para-hombres-polanco",
    images: [
      {
        url: "/dark-luxury-spa-massage-room-with-candles-ambient-.jpg",
        width: 1200,
        height: 630,
        alt: "ElementSpa — Spa masculino cerca de Polanco",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spa para Hombres en Polanco — ElementSpa",
    description: "Masajes exclusivos para hombres cerca de Polanco. Reserva por WhatsApp.",
    images: ["/dark-luxury-spa-massage-room-with-candles-ambient-.jpg"],
  },
}

export { default } from "./content"
