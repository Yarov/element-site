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
  name: "ElementSpa Coyoacán",
  url: "https://elementspa.mx/spa-para-hombres-coyoacan",
  image: "https://elementspa.mx/man-relaxing-spa-treatment-massage.jpg",
  description:
    "Spa masculino en Coyoacán, CDMX. Masajes sensoriales, relajantes, descontracturantes y tántricos diseñados exclusivamente para hombres en un ambiente privado.",
  telephone: "+525647114561",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Coyoacán",
    addressRegion: "CDMX",
    addressCountry: "MX",
  },
  areaServed: ["Coyoacán", "San Ángel", "Del Valle", "Portales", "Anzures"],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "11:00",
      closes: "22:00",
    },
  ],
}

export default function SpaCoyoacanPage() {
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState("")
  const [selectedServicio, setSelectedServicio] = useState("")

  const handleReservar = (servicio?: string, detalle?: string) => {
    setWhatsappMessage(buildWhatsAppMessage({ page: "spa en Coyoacán", servicio, detalle }))
    setSelectedServicio(servicio || "")
    setShowLocationSelector(true)
  }

  return (
    <main className="min-h-screen">
      <Header />
      <ViewContentTracker contentName="Spa Coyoacán" contentCategory="sucursales" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localJsonLd) }}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/man-relaxing-spa-treatment-massage.jpg"
            alt="ElementSpa Coyoacán — Spa masculino exclusivo en CDMX"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">Coyoacán, CDMX</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-6">
              Spa Masculino en Coyoacán — Masajes Exclusivos para Caballeros
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              En una de las colonias más emblemáticas de la Ciudad de México, ElementSpa Coyoacán te ofrece
              un espacio exclusivo donde la relajación, la sensualidad y el bienestar se encuentran.
              Terapeutas profesionales, cabinas privadas y una experiencia diseñada 100% para hombres.
            </p>
            <Button
              size="lg"
              onClick={() => handleReservar()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Reservar en Coyoacán
            </Button>
          </div>
        </div>
      </section>

      {/* About the Location */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/zen-spa-stone-arrangement-minimalist.jpg"
                alt="Ambiente zen en ElementSpa Coyoacán"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Un refugio de bienestar en Coyoacán
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Coyoacán es conocida por su ambiente bohemio, sus calles arboladas y su tranquilidad. Nuestra
                sucursal aprovecha esa energía para ofrecerte un espacio donde puedes desconectarte por
                completo. A diferencia del ritmo acelerado del centro de la ciudad, aquí todo invita a la
                calma.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Las instalaciones cuentan con cabinas privadas con iluminación tenue, música ambiental y
                aromaterapia. Cada detalle está cuidado para que tu experiencia sea completa desde el momento
                en que llegas hasta que te despides.
              </p>
              <div className="flex flex-col gap-3">
                <span className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  Coyoacán, CDMX
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  Lunes a Domingo: 11:00 — 22:00
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Nuestros servicios en Coyoacán
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Todas las experiencias de masaje de ElementSpa están disponibles en nuestra sucursal de
            Coyoacán. Elige la que mejor se adapte a lo que buscas hoy.
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
            Por qué elegir ElementSpa Coyoacán
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Ambiente tranquilo en una de las zonas más arboladas y seguras de CDMX",
              "Fácil acceso en transporte público o auto con estacionamiento cercano",
              "Cabinas privadas con aromaterapia e iluminación ambiental",
              "Terapeutas experimentadas que combinan técnica y sensibilidad",
              "Reserva rápida por WhatsApp sin intermediarios ni esperas",
              "Ideal para quienes viven o trabajan en el sur de la ciudad",
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
            Preguntas sobre ElementSpa Coyoacán
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "¿Dónde exactamente se ubica ElementSpa Coyoacán?",
                a: "Nuestra sucursal está en la colonia Coyoacán, una zona tranquila y de fácil acceso en el sur de la Ciudad de México. Puedes llegar en Metro (estación Viveros o Coyoacán, Línea 3) o en auto con opciones de estacionamiento público cercano.",
              },
              {
                q: "¿Los servicios son los mismos que en Roma Norte?",
                a: "Sí, en ambas sucursales ofrecemos exactamente las mismas 6 experiencias de masaje con el mismo nivel de calidad, privacidad y profesionalismo. La única diferencia es la ubicación.",
              },
              {
                q: "¿Atienden sin cita en Coyoacán?",
                a: "Recomendamos siempre reservar por WhatsApp para garantizar disponibilidad. Sin embargo, si hay espacio disponible, podemos atenderte sin cita previa. Lo mejor es escribirnos antes de llegar.",
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
            Agenda tu cita en Coyoacán hoy
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Vive una experiencia de masaje exclusiva para hombres en el sur de la CDMX. Reserva por
            WhatsApp y disfruta del mejor servicio en Coyoacán.
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
