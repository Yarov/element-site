"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MessageCircle, CheckCircle, MapPin, ArrowRight, Feather, Infinity, Flame, Heart, Sparkles, Flower2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { LocationSelector } from "@/components/location-selector"
import { services, buildWhatsAppMessage, getServiceDetail } from "@/lib/data"
import { buildOffersForServices, buildBreadcrumb } from "@/lib/schema"
import { ViewContentTracker } from "@/components/view-content-tracker"
import type React from "react"

const iconMap: Record<string, React.ReactNode> = {
  feather: <Feather className="h-5 w-5 text-primary" />,
  infinity: <Infinity className="h-5 w-5 text-primary" />,
  flame: <Flame className="h-5 w-5 text-primary" />,
  heart: <Heart className="h-5 w-5 text-primary" />,
  stars: <Sparkles className="h-5 w-5 text-primary" />,
  lotus: <Flower2 className="h-5 w-5 text-primary" />,
}

const localJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Masajes para Hombres en CDMX",
  description:
    "Catálogo completo de masajes exclusivos para hombres en la Ciudad de México: sensoriales, relajantes, descontracturantes y tántricos.",
  url: "https://elementspa.mx/masajes-para-hombres-cdmx",
  provider: {
    "@type": "HealthAndBeautyBusiness",
    name: "ElementSpa",
    url: "https://elementspa.mx",
  },
  areaServed: {
    "@type": "City",
    name: "Ciudad de México",
  },
  // Catálogo completo de servicios con precios
  offers: buildOffersForServices(),
}

const breadcrumbJsonLd = buildBreadcrumb([
  { name: "Inicio", path: "/" },
  { name: "Masajes para Hombres en CDMX", path: "/masajes-para-hombres-cdmx" },
])

const faqs = [
  {
    q: "¿Cuál es el mejor masaje para principiantes?",
    a: "Si es tu primera vez, te recomendamos Conexión Esencial. Es un masaje relajante de cuerpo completo que combina presión perfecta con un ritmo envolvente. Es ideal para conocer el estilo de ElementSpa sin una experiencia demasiado intensa.",
  },
  {
    q: "¿Cuál es la diferencia entre masaje sensorial y tántrico?",
    a: "El masaje sensorial (Caricias del Alma) se enfoca en estímulos suaves con las yemas de los dedos y uñas sobre la piel. El tántrico (Piel a Piel, Fantasía Compartida) involucra contacto corporal completo donde la terapeuta usa su cuerpo para el masaje. Ambos incluyen estimulación final.",
  },
  {
    q: "¿Los precios incluyen todo?",
    a: "Sí, nuestros precios incluyen la experiencia completa sin cargos ocultos. Opcionalmente puedes agregar 10 minutos extra ($300) o una estimulación adicional ($350) a cualquier servicio.",
  },
  {
    q: "¿Puedo elegir a mi terapeuta?",
    a: "La disponibilidad de terapeutas varía según el horario y la sucursal. Te recomendamos contactarnos por WhatsApp con anticipación para conocer la disponibilidad y encontrar el mejor horario para ti.",
  },
]

const faqJsonLd = {
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

const zonas = [
  { name: "Roma Norte", href: "/spa-para-hombres-roma-norte", note: "Sucursal · Centro de la ciudad" },
  { name: "Coyoacán", href: "/spa-para-hombres-coyoacan", note: "Sucursal · Sur de la ciudad" },
  { name: "Condesa", href: "/spa-para-hombres-condesa", note: "A minutos de Roma Norte" },
  { name: "Polanco", href: "/spa-para-hombres-polanco", note: "A 15 min de Roma Norte" },
  { name: "Del Valle", href: "/spa-para-hombres-del-valle", note: "Entre ambas sucursales" },
]

export default function MasajesParaHombresPage() {
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState("")
  const [selectedServicio, setSelectedServicio] = useState("")

  const handleReservar = (servicio?: string, detalle?: string) => {
    setWhatsappMessage(buildWhatsAppMessage({ page: "masajes para hombres en CDMX", servicio, detalle }))
    setSelectedServicio(servicio || "")
    setShowLocationSelector(true)
  }

  return (
    <main className="min-h-screen">
      <Header />
      <ViewContentTracker contentName="Catálogo Masajes" contentCategory="servicios" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/dark-luxury-spa-massage-room-with-candles-ambient-.jpg"
            alt="Masajes para hombres en CDMX — ElementSpa"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">Catálogo de Servicios</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-6">
              Masajes para Hombres en CDMX — Sensoriales, Relajantes y Tántricos
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              6 experiencias de masaje diseñadas exclusivamente para caballeros, desde $1,100.
              Dos sucursales en CDMX (Roma Norte y Coyoacán), cabinas privadas y reserva
              inmediata por WhatsApp.
            </p>
            <Button
              size="lg"
              onClick={() => handleReservar()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Reservar ahora
            </Button>
          </div>
        </div>
      </section>

      {/* Service Catalog — grid compacto con precios visibles */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Todos nuestros servicios de masaje
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Cada experiencia combina técnica profesional, estimulación sensorial y un ambiente
            completamente privado. Elige la tuya y reserva en menos de un minuto.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="p-6 bg-background rounded-lg border border-border flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-full">{iconMap[service.iconType]}</div>
                  <h3 className="font-serif text-lg">{service.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{service.seoTitle}</p>

                {service.price ? (
                  <p className="text-sm text-primary font-medium mb-3">
                    {service.time} · {service.price}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {service.options?.map((option) => (
                      <span key={option.name} className="text-xs bg-secondary/50 px-3 py-1.5 rounded">
                        {option.time} · <span className="text-primary font-semibold">{option.price}</span>
                      </span>
                    ))}
                  </div>
                )}

                <details className="mb-4 group">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors list-none flex items-center gap-1">
                    <ArrowRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                    Ver descripción completa
                  </summary>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3 whitespace-pre-line">
                    {service.description}
                  </p>
                </details>

                <Button
                  size="sm"
                  onClick={() => handleReservar(service.title, getServiceDetail(service))}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 mt-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  Reservar
                </Button>
              </div>
            ))}
          </div>

          {/* Extras */}
          <div className="mt-8 p-6 bg-background rounded-lg border border-border">
            <h3 className="font-serif text-xl mb-4">Servicios Adicionales</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <span className="text-primary">+</span>
                <span>10 min. extra</span>
                <span className="text-primary font-semibold">$300</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary">+</span>
                <span>1 estimulación extra</span>
                <span className="text-primary font-semibold">$350</span>
              </div>
            </div>
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

      {/* Sucursales y zonas */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">¿Dónde nos encuentras?</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Dos sucursales en la Ciudad de México con los mismos servicios, calidad y privacidad.
            Elige la que te quede más cerca.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {zonas.map((zona) => (
              <Link
                key={zona.href}
                href={zona.href}
                className="p-5 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors group"
              >
                <MapPin className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-serif text-lg mb-1 group-hover:text-primary transition-colors">
                  {zona.name}
                </h3>
                <p className="text-xs text-muted-foreground">{zona.note}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why ElementSpa */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-10">
            ¿Por qué elegir ElementSpa para tu masaje?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "6 experiencias de masaje únicas diseñadas para hombres",
              "Terapeutas profesionales con técnicas sensoriales avanzadas",
              "Ambiente 100% privado y discreto en cada sesión",
              "Dos sucursales en CDMX: Roma Norte y Coyoacán",
              "Horario extendido de 11:00 a 19:00, los 7 días",
              "Reserva fácil y rápida por WhatsApp",
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
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
          <h2 className="text-3xl md:text-4xl font-serif mb-10 text-center">
            Preguntas frecuentes sobre nuestros masajes
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
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
          <h2 className="text-3xl md:text-4xl font-serif mb-6">
            Elige tu experiencia y reserva hoy
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            6 experiencias de masaje te esperan en nuestras sucursales de Roma Norte y Coyoacán.
            Reserva por WhatsApp y vive el mejor masaje para hombres en CDMX.
          </p>
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
