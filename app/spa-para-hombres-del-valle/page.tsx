import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Spa para Hombres en Del Valle — Masajes Exclusivos para Caballeros",
  description:
    "¿Buscas un spa masculino en Del Valle o Nápoles? ElementSpa tiene dos sucursales cercanas (Roma Norte y Coyoacán): masajes sensoriales, relajantes y tántricos para hombres. Reserva por WhatsApp.",
  alternates: {
    canonical: "/spa-para-hombres-del-valle",
  },
  openGraph: {
    title: "Spa para Hombres en Del Valle — Masajes Exclusivos | ElementSpa",
    description:
      "Masajes exclusivos para hombres cerca de Del Valle y Nápoles. Dos sucursales cercanas con experiencias sensoriales y tántricas en ambiente privado.",
    url: "https://elementspa.mx/spa-para-hombres-del-valle",
    images: [
      {
        url: "/man-relaxing-spa-treatment-massage.jpg",
        width: 1200,
        height: 630,
        alt: "ElementSpa — Spa masculino cerca de Del Valle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spa para Hombres en Del Valle — ElementSpa",
    description: "Masajes exclusivos para hombres cerca de Del Valle. Reserva por WhatsApp.",
    images: ["/man-relaxing-spa-treatment-massage.jpg"],
  },
}

export { default } from "./content"
