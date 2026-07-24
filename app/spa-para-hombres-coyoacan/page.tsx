import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Spa Masculino en Coyoacán — Masajes Exclusivos para Caballeros",
  description:
    "ElementSpa Coyoacán: masajes sensoriales, relajantes y tántricos exclusivos para hombres. Ambiente privado, terapeutas profesionales y atención personalizada. Reserva por WhatsApp.",
  alternates: {
    canonical: "/spa-para-hombres-coyoacan",
  },
  openGraph: {
    title: "Spa Masculino en Coyoacán — Masajes Exclusivos | ElementSpa",
    description:
      "Masajes exclusivos para hombres en Coyoacán, CDMX. Experiencias sensoriales y tántricas en un ambiente privado y sofisticado.",
    url: "https://elementspa.mx/spa-para-hombres-coyoacan",
    images: [
      {
        url: "/man-relaxing-spa-treatment-massage.jpg",
        width: 1200,
        height: 630,
        alt: "ElementSpa Coyoacán — Spa masculino exclusivo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spa Masculino en Coyoacán — ElementSpa",
    description: "Masajes exclusivos para hombres en Coyoacán, CDMX. Reserva por WhatsApp.",
    images: ["/man-relaxing-spa-treatment-massage.jpg"],
  },
}

export { default } from "./content"
