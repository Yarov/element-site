import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Masajes para Hombres en Roma Norte — Spa Masculino desde $1,100",
  description:
    "Masajes para hombres en la colonia Roma Norte, CDMX, desde $1,100. Sensoriales, relajantes y tántricos en cabinas privadas, a minutos del Metrobús. Reserva por WhatsApp.",
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
