import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Spa para Hombres en la Condesa — Masajes Exclusivos a Minutos",
  description:
    "¿Buscas un spa masculino en la Condesa? ElementSpa Roma Norte está a minutos de tu colonia: masajes sensoriales, relajantes y tántricos para hombres en un ambiente privado. Reserva por WhatsApp.",
  alternates: {
    canonical: "/spa-para-hombres-condesa",
  },
  openGraph: {
    title: "Spa para Hombres en la Condesa — Masajes Exclusivos | ElementSpa",
    description:
      "Masajes exclusivos para hombres a minutos de la Condesa. Experiencias sensoriales y tántricas en un ambiente privado y sofisticado.",
    url: "https://elementspa.mx/spa-para-hombres-condesa",
    images: [
      {
        url: "/luxury-spa-interior-wood-stone-natural-elements-ma.jpg",
        width: 1200,
        height: 630,
        alt: "ElementSpa — Spa masculino cerca de la Condesa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spa para Hombres en la Condesa — ElementSpa",
    description: "Masajes exclusivos para hombres a minutos de la Condesa. Reserva por WhatsApp.",
    images: ["/luxury-spa-interior-wood-stone-natural-elements-ma.jpg"],
  },
}

export { default } from "./content"
