import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import { SectionClickTracker } from "@/components/section-click-tracker"
import "./globals.css"

const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "ElementSpa | Masajes Exclusivos para Hombres en CDMX",
  description:"Descubre una experiencia sensorial única en ElementSpa. Masajes exclusivos para caballeros en Roma Norte y Coyoacán. Reserva por WhatsApp."
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  name: "ElementSpa",
  description:
    "Spa exclusivo para hombres en CDMX. Masajes relajantes, descontracturantes y sensoriales en un ambiente discreto y sofisticado.",
  url: "https://elementspa.mx",
  telephone: "+525516793129",
  image: "https://elementspa.mx/dark-luxury-spa-massage-room-with-candles-ambient-.jpg",
  priceRange: "$1,100 - $5,000 MXN",
  currenciesAccepted: "MXN",
  paymentAccepted: "Cash, Credit Card",
  areaServed: {
    "@type": "City",
    name: "Ciudad de México",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "11:00",
    closes: "22:00",
  },
  department: [
    {
      "@type": "HealthAndBeautyBusiness",
      name: "ElementSpa Roma Norte",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Roma Norte",
        addressRegion: "Ciudad de México",
        addressCountry: "MX",
      },
      telephone: "+525516793129",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "11:00",
        closes: "22:00",
      },
    },
    {
      "@type": "HealthAndBeautyBusiness",
      name: "ElementSpa Coyoacán",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Coyoacán",
        addressRegion: "Ciudad de México",
        addressCountry: "MX",
      },
      telephone: "+525645886177",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "11:00",
        closes: "22:00",
      },
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios de Masaje",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Caricias del Alma",
          description: "Masaje sensorial de 30 minutos con caricias suaves.",
        },
        price: "1100",
        priceCurrency: "MXN",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Conexión Esencial",
          description: "Masaje relajante de cuerpo completo de 50 minutos.",
        },
        price: "1350",
        priceCurrency: "MXN",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Energía Vital",
          description: "Masaje descontracturante de 50 minutos.",
        },
        price: "1550",
        priceCurrency: "MXN",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Piel a Piel",
          description: "Masaje sensorial e íntimo desde 50 minutos.",
        },
        price: "2250",
        priceCurrency: "MXN",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Fantasía Compartida",
          description: "Experiencia de masaje interactivo desde 50 minutos.",
        },
        price: "3000",
        priceCurrency: "MXN",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Masaje 4 Manos",
          description: "Masaje sincronizado con dos terapeutas desde 50 minutos.",
        },
        price: "4000",
        priceCurrency: "MXN",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-MX">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${_playfair.variable} ${_inter.variable} font-sans antialiased`}>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-J3Q1EL831E" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-J3Q1EL831E');`}
        </Script>
        <SectionClickTracker />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
