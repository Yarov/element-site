import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Massage for Men in Mexico City — Private Spa in Roma Norte & Coyoacán",
  description:
    "Men-only massage in Mexico City from $1,100 MXN. Sensual, relaxing and tantric sessions in private rooms in Roma Norte and Coyoacán. Discreet, no membership. Book on WhatsApp.",
  alternates: {
    canonical: "/en/massage-for-men-mexico-city",
    languages: {
      en: "/en/massage-for-men-mexico-city",
      "es-MX": "/masajes-para-hombres-cdmx",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "es_MX",
    title: "Massage for Men in Mexico City — ElementSpa",
    description:
      "Men-only massage in Mexico City. Private rooms in Roma Norte and Coyoacán, transparent pricing from $1,100 MXN, booking on WhatsApp.",
    url: "https://elementspa.mx/en/massage-for-men-mexico-city",
    images: [
      {
        url: "/dark-luxury-spa-massage-room-with-candles-ambient-.jpg",
        width: 1200,
        height: 630,
        alt: "Massage for men in Mexico City — ElementSpa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Massage for Men in Mexico City — ElementSpa",
    description: "Men-only massage in Roma Norte and Coyoacán. From $1,100 MXN. Book on WhatsApp.",
    images: ["/dark-luxury-spa-massage-room-with-candles-ambient-.jpg"],
  },
}

export { default } from "./content"
