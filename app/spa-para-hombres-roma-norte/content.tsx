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
import { ViewContentTracker } from "@/components/view-content-tracker"

const localJsonLd = {
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  name: "ElementSpa Roma Norte",
  url: "https://elementspa.mx/spa-para-hombres-roma-norte",
  image: "https://elementspa.mx/luxury-spa-interior-wood-stone-natural-elements-ma.jpg",
  description:
    "Spa para hombres en Roma Norte, CDMX. Masajes sensoriales, relajantes, descontracturantes y tántricos exclusivos para caballeros en un ambiente privado y discreto.",
  telephone: "+525516793129",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Roma Norte",
    addressRegion: "CDMX",
    addressCountry: "MX",
  },
  areaServed: ["Roma Norte", "Roma Sur", "Condesa", "Juárez", "Del Valle", "Polanco"],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "11:00",
      closes: "22:00",
    },
  ],
}

export default function SpaRomaNortePage() {
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState("")
  const [selectedServicio, setSelectedServicio] = useState("")

  const handleReservar = (servicio?: string, detalle?: string) => {
    setWhatsappMessage(buildWhatsAppMessage({ page: "spa en Roma Norte", servicio, detalle }))
    setSelectedServicio(servicio || "")
    setShowLocationSelector(true)
  }

  return (
    <main className="min-h-screen">
      <Header />
      <ViewContentTracker contentName="Spa Roma Norte" contentCategory="sucursales" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localJsonLd) }}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/luxury-spa-interior-wood-stone-natural-elements-ma.jpg"
            alt="ElementSpa Roma Norte — Spa para hombres en CDMX"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">Roma Norte, CDMX</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-6">
              Spa para Hombres en Roma Norte — ElementSpa
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              En el corazón de la colonia Roma Norte, ElementSpa ofrece un refugio exclusivo para caballeros
              que buscan relajación profunda, estimulación sensorial y un trato completamente personalizado.
              Nuestro espacio combina privacidad, elegancia y profesionalismo en cada visita.
            </p>
            <Button
              size="lg"
              onClick={() => handleReservar()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Reservar en Roma Norte
            </Button>
          </div>
        </div>
      </section>

      {/* About the Location */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Tu espacio de bienestar en la Roma Norte
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nuestra sucursal de Roma Norte está ubicada en una de las colonias más vibrantes y accesibles
                de la Ciudad de México. A minutos del Metrobús, rodeado de restaurantes y cafés, nuestro
                espacio ofrece un contraste perfecto: un oasis de calma y sensualidad en medio de la ciudad.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Las cabinas están diseñadas con iluminación ambiental, aromaterapia sutil y aislamiento
                acústico para que cada sesión sea una experiencia inmersiva. Desde el momento en que cruzas
                la puerta, todo está pensado para que te desconectes del mundo exterior.
              </p>
              <div className="flex flex-col gap-3">
                <span className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  Colonia Roma Norte, CDMX
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  Lunes a Domingo: 11:00 — 22:00
                </span>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/zen-spa-stone-arrangement-minimalist.jpg"
                alt="Ambiente relajante en ElementSpa Roma Norte"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Servicios disponibles en Roma Norte
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            En nuestra sucursal de Roma Norte puedes disfrutar de las 6 experiencias de masaje de
            ElementSpa. Cada servicio es atendido por terapeutas profesionales en un ambiente completamente
            privado.
          </p>
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
          <h2 className="text-3xl md:text-4xl font-serif mb-10">
            Ventajas de visitar ElementSpa Roma Norte
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Ubicación céntrica a minutos del Metrobús y Metro Insurgentes",
              "Zona segura con múltiples opciones de estacionamiento cercano",
              "Ambiente exclusivo diseñado para máxima privacidad",
              "Atención inmediata — reserva por WhatsApp y llega sin esperas",
              "Todas las experiencias de masaje disponibles en esta sucursal",
              "Horario amplio: 7 días a la semana de 11:00 a 22:00",
            ].map((benefit) => (
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
          <h2 className="text-3xl md:text-4xl font-serif mb-10 text-center">
            Preguntas sobre ElementSpa Roma Norte
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "¿Cómo llego a ElementSpa Roma Norte?",
                a: "Nuestra sucursal se encuentra en la colonia Roma Norte, una de las zonas más accesibles de la CDMX. Puedes llegar fácilmente en Metrobús (estación Sonora o Insurgentes), Metro (Insurgentes, Línea 1) o en auto particular con estacionamiento público cercano.",
              },
              {
                q: "¿Necesito cita previa para Roma Norte?",
                a: "Sí, recomendamos reservar con anticipación por WhatsApp para garantizar disponibilidad de horario y terapeuta. El proceso es rápido: envíanos un mensaje y te confirmamos en minutos.",
              },
              {
                q: "¿Qué formas de pago aceptan en esta sucursal?",
                a: "En nuestra sucursal de Roma Norte aceptamos efectivo y tarjetas de crédito o débito. El pago se realiza al finalizar tu servicio, sin cargos adicionales ni propinas obligatorias.",
              },
            ].map((faq) => (
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
            Reserva tu experiencia en Roma Norte
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Descubre por qué ElementSpa Roma Norte es el spa favorito de cientos de caballeros en la
            Ciudad de México. Agenda tu cita hoy por WhatsApp.
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
