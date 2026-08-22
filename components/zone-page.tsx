"use client"

import { useState } from "react"
import Image from "next/image"
import { MessageCircle, MapPin, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { LocationSelector } from "@/components/location-selector"
import { services, buildWhatsAppMessage, getServiceDetail } from "@/lib/data"
import {
  buildServiceArea,
  AGGREGATE_RATING,
  OPENING_HOURS,
  ORG_ID,
  AUTHOR_ID,
} from "@/lib/schema"
import { ViewContentTracker } from "@/components/view-content-tracker"

export interface ZoneFaq {
  q: string
  a: string
}

export interface ZonePageConfig {
  /* Tracking */
  trackerName: string
  /** Página de origen para el mensaje de WhatsApp, ej. "spa cerca de la Condesa" */
  waPage: string
  /* JSON-LD ya construidos (local business, FAQ, breadcrumb) */
  jsonLd: object[]
  /* Hero */
  eyebrow: string
  h1: string
  heroText: string
  heroImage: string
  heroImageAlt: string
  heroCtaLabel: string
  /* About */
  aboutTitle: string
  aboutParagraphs: string[]
  aboutImage: string
  aboutImageAlt: string
  locationLine: string
  hoursLine?: string
  /* Services */
  servicesTitle: string
  servicesIntro: string
  /* Benefits */
  benefitsTitle: string
  benefits: string[]
  /* FAQ */
  faqTitle: string
  faqs: ZoneFaq[]
  /* CTA final */
  finalTitle: string
  finalText: string
}

export function ZonePage(config: ZonePageConfig) {
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState("")
  const [selectedServicio, setSelectedServicio] = useState("")

  const handleReservar = (servicio?: string, detalle?: string) => {
    setWhatsappMessage(buildWhatsAppMessage({ page: config.waPage, servicio, detalle }))
    setSelectedServicio(servicio || "")
    setShowLocationSelector(true)
  }

  return (
    <main className="min-h-screen">
      <Header />
      <ViewContentTracker contentName={config.trackerName} contentCategory="sucursales" />
      {config.jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Hero */}
      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 z-0">
          <Image
            src={config.heroImage}
            alt={config.heroImageAlt}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">{config.eyebrow}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-6">
              {config.h1}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">{config.heroText}</p>
            <Button
              size="lg"
              onClick={() => handleReservar()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              {config.heroCtaLabel}
            </Button>
          </div>
        </div>
      </section>

      {/* About the Zone */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src={config.aboutImage}
                alt={config.aboutImageAlt}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">{config.aboutTitle}</h2>
              {config.aboutParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-muted-foreground leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
              <div className="flex flex-col gap-3 mt-6">
                <span className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  {config.locationLine}
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  {config.hoursLine ?? "Lunes a Domingo: 11:00 — 19:00"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">{config.servicesTitle}</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">{config.servicesIntro}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const detalle = getServiceDetail(service)
              return (
                <div key={service.id} className="p-6 bg-card rounded-lg border border-border flex flex-col">
                  <h3 className="font-serif text-lg mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{service.seoTitle}</p>
                  <p className="text-sm text-primary font-medium mb-4">
                    {service.price
                      ? `${service.time} · ${service.price}`
                      : `Desde ${service.options?.[0].price}`}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleReservar(service.title, detalle)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 mt-auto"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Reservar
                  </Button>
                </div>
              )
            })}
          </div>
          <div className="mt-10 text-center">
            <Button
              size="lg"
              onClick={() => handleReservar()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Reservar ahora
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-10">{config.benefitsTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {config.benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 p-4">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-10 text-center">{config.faqTitle}</h2>
          <div className="space-y-6">
            {config.faqs.map((faq) => (
              <div key={faq.q} className="border-b border-border pb-6">
                <h3 className="font-medium mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">{config.finalTitle}</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">{config.finalText}</p>
          <Button
            size="lg"
            onClick={() => handleReservar()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            Reservar por WhatsApp
          </Button>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
      <LocationSelector
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        message={whatsappMessage}
        servicio={selectedServicio}
      />
    </main>
  )
}

/** Helper para el JSON-LD de negocio local de una página de zona.
 *  Importante: NO publicamos dirección exacta por privacidad. Solo señalamos
 *  el serviceArea (GeoCircle de la sucursal real que atiende la zona) y
 *  areaServed con las colonias que atendemos desde ahí. */
export function buildZoneBusinessJsonLd({
  name,
  url,
  image,
  description,
  branchLocality,
  areaServed,
  makesOffer,
}: {
  name: string
  url: string
  image: string
  description: string
  branchLocality: "romaNorte" | "coyoacan"
  areaServed: string[]
  makesOffer: object[]
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name,
    url,
    image,
    description,
    telephone: "+525647114561",
    serviceArea: buildServiceArea(branchLocality),
    areaServed,
    openingHoursSpecification: [OPENING_HOURS],
    priceRange: "$1,100 - $5,000 MXN",
    priceCurrency: "MXN",
    paymentAccepted: "Efectivo, tarjeta de crédito, tarjeta de débito",
    currenciesAccepted: "MXN",
    aggregateRating: AGGREGATE_RATING,
    parentOrganization: { "@id": ORG_ID },
    author: { "@id": AUTHOR_ID },
    makesOffer,
  }
}

export function buildZoneFaqJsonLd(faqs: ZoneFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  }
}
