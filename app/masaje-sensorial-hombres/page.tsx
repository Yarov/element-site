import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Masaje Sensorial para Hombres — Técnicas Suaves y Profundas",
  description:
    "Masaje sensorial para hombres en CDMX. Caricias suaves, estímulos con yemas de los dedos y técnicas envolventes que despiertan cada fibra de tu piel. Roma Norte y Coyoacán.",
  alternates: {
    canonical: "/masaje-sensorial-hombres",
  },
  openGraph: {
    title: "Masaje Sensorial para Hombres — ElementSpa",
    description:
      "Experiencia de masaje sensorial exclusiva para caballeros. Caricias suaves que despiertan todos tus sentidos en un ambiente privado.",
    url: "https://elementspa.mx/masaje-sensorial-hombres",
    images: [
      {
        url: "/luxury-grooming-tools-razor-brush-masculine.jpg",
        width: 1200,
        height: 630,
        alt: "Masaje sensorial para hombres — ElementSpa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Masaje Sensorial para Hombres — ElementSpa",
    description: "Masaje sensorial exclusivo para hombres en CDMX. Reserva en ElementSpa.",
    images: ["/luxury-grooming-tools-razor-brush-masculine.jpg"],
  },
}

export { default } from "./content"
