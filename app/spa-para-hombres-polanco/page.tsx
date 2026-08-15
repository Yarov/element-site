import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Spa para Hombres en Polanco — Masajes Exclusivos para Caballeros",
  description:
    "¿Buscas un spa masculino en Polanco? ElementSpa Roma Norte está a 15 minutos: masajes sensoriales, relajantes y tántricos para hombres en un ambiente privado y discreto. Reserva por WhatsApp.",
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
