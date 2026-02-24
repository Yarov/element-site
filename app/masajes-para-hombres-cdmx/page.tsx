import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Masajes para Hombres en CDMX — Sensoriales, Relajantes y Tántricos | ElementSpa",
  description:
    "Catálogo completo de masajes para hombres en CDMX. Sensoriales, relajantes, descontracturantes y tántricos. Terapeutas profesionales en Roma Norte y Coyoacán. Reserva por WhatsApp.",
  alternates: {
    canonical: "/masajes-para-hombres-cdmx",
  },
  openGraph: {
    title: "Masajes para Hombres en CDMX — ElementSpa",
    description:
      "Descubre 6 experiencias de masaje exclusivas para caballeros en la Ciudad de México. Desde relajación profunda hasta estimulación tántrica.",
    url: "https://elementspa.mx/masajes-para-hombres-cdmx",
    images: [
      {
        url: "/dark-luxury-spa-massage-room-with-candles-ambient-.jpg",
        width: 1200,
        height: 630,
        alt: "Masajes para hombres en CDMX — ElementSpa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Masajes para Hombres en CDMX — ElementSpa",
    description: "6 experiencias de masaje exclusivas para hombres en CDMX. Reserva en ElementSpa.",
    images: ["/dark-luxury-spa-massage-room-with-candles-ambient-.jpg"],
  },
}

export { default } from "./content"
