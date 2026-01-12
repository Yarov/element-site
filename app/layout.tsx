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
  description:
    "Descubre una experiencia sensorial única en ElementSpa. Masajes exclusivos para caballeros en Roma Norte y Coyoacán. Reserva por WhatsApp.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-MX">
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
