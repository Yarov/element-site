import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import {
  SITE_URL,
  ORG_ID,
  WEBSITE_ID,
  SPA_ROMA_NORTE_ID,
  SPA_COYOACAN_ID,
  OPENING_HOURS,
  buildServiceArea,
} from "@/lib/schema"

const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  metadataBase: new URL("https://elementspa.mx"),
  title: {
    default: "ElementSpa | Masajes Exclusivos para Hombres en CDMX",
    template: "%s | ElementSpa",
  },
  description:
    "Descubre una experiencia sensorial única en ElementSpa. Masajes exclusivos para caballeros en Roma Norte y Coyoacán. Reserva por WhatsApp.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://elementspa.mx",
    siteName: "ElementSpa",
    title: "ElementSpa | Masajes Exclusivos para Hombres en CDMX",
    description:
      "Descubre una experiencia sensorial única en ElementSpa. Masajes exclusivos para caballeros en Roma Norte y Coyoacán.",
    images: [
      {
        url: "/dark-luxury-spa-massage-room-with-candles-ambient-.jpg",
        width: 1200,
        height: 630,
        alt: "ElementSpa - Masajes Exclusivos en CDMX",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ElementSpa | Masajes Exclusivos para Hombres en CDMX",
    description:
      "Descubre una experiencia sensorial única en ElementSpa. Masajes exclusivos para caballeros en Roma Norte y Coyoacán.",
    images: ["/dark-luxury-spa-massage-room-with-candles-ambient-.jpg"],
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: "ElementSpa",
  alternateName: "Element Spa",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: "https://elementspa.mx/apple-icon.png",
    width: 512,
    height: 512,
  },
  description:
    "Spa exclusivo para hombres en CDMX. Masajes sensoriales, relajantes, descontracturantes y tántricos en Roma Norte y Coyoacán. Atención discreta y profesional para caballeros.",
  sameAs: ["https://www.instagram.com/elementspamx"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "reservas",
    telephone: "+52-56-4711-4561",
    url: "https://wa.me/525647114561",
    availableLanguage: ["es-MX", "en"],
    areaServed: { "@type": "Country", name: "México" },
    contactOption: "WhatsApp",
  },
  department: [
    {
      "@type": "HealthAndBeautyBusiness",
      "@id": SPA_ROMA_NORTE_ID,
      name: "ElementSpa Roma Norte",
      image: "https://elementspa.mx/luxury-spa-interior-wood-stone-natural-elements-ma.jpg",
      url: "https://elementspa.mx/spa-para-hombres-roma-norte",
      description:
        "Spa exclusivo para hombres en Roma Norte, CDMX. Masajes sensoriales, relajantes, descontracturantes y tántricos para caballeros. Privacidad total y atención profesional.",
      telephone: "+52-56-4711-4561",
      serviceArea: buildServiceArea("romaNorte"),
      areaServed: ["Roma Norte", "Roma Sur", "Condesa", "Juárez", "Del Valle", "Polanco"],
      openingHoursSpecification: [OPENING_HOURS],
      priceRange: "$1,100 - $5,000 MXN",
      priceCurrency: "MXN",
      parentOrganization: { "@id": ORG_ID },
    },
    {
      "@type": "HealthAndBeautyBusiness",
      "@id": SPA_COYOACAN_ID,
      name: "ElementSpa Coyoacán",
      image: "https://elementspa.mx/man-relaxing-spa-treatment-massage.jpg",
      url: "https://elementspa.mx/spa-para-hombres-coyoacan",
      description:
        "Spa masculino en Coyoacán, CDMX. Masajes para hombres con enfoque sensorial, relajante y tántrico en un ambiente privado y discreto.",
      telephone: "+52-56-4711-4561",
      serviceArea: buildServiceArea("coyoacan"),
      areaServed: ["Coyoacán", "San Ángel", "Del Valle", "Portales", "Anzures"],
      openingHoursSpecification: [OPENING_HOURS],
      priceRange: "$1,100 - $5,000 MXN",
      priceCurrency: "MXN",
      parentOrganization: { "@id": ORG_ID },
    },
  ],
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: "ElementSpa",
  alternateName: "Element Spa CDMX",
  inLanguage: ["es-MX", "en"],
  publisher: { "@id": ORG_ID },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-MX">
      <head>
        {process.env.NODE_ENV === "production" && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PNCPM9KR');`}
          </Script>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${_playfair.variable} ${_inter.variable} font-sans antialiased`}>
        {process.env.NODE_ENV === "production" && (
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-PNCPM9KR"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {children}
      </body>
    </html>
  )
}
