"use client"

import { useState } from "react"
import Image from "next/image"
import { MessageCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { LocationSelector } from "@/components/location-selector"
import { buildWhatsAppMessage } from "@/lib/data"

const localJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Masaje Tántrico para Hombres en CDMX",
  description:
    "Experiencia de masaje tántrico exclusivo para hombres en la Ciudad de México. Contacto corporal completo, estimulación sensorial y técnicas profesionales.",
  url: "https://elementspa.mx/masaje-tantrico-hombres-cdmx",
  provider: {
    "@type": "HealthAndBeautyBusiness",
    name: "ElementSpa",
    url: "https://elementspa.mx",
  },
  areaServed: {
    "@type": "City",
    name: "Ciudad de México",
  },
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué es un masaje tántrico?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El masaje tántrico es una técnica que combina contacto corporal completo, respiración consciente y estimulación sensorial para despertar la energía del cuerpo. En ElementSpa, nuestras terapeutas utilizan su cuerpo para crear una conexión íntima que lleva a un estado profundo de relajación y placer.",
      },
    },
    {
      "@type": "Question",
      name: "¿El masaje tántrico incluye contacto piel a piel?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Nuestros servicios de masaje tántrico, como Piel a Piel y Fantasía Compartida, incluyen contacto corporal directo donde la terapeuta utiliza su torso, brazos y piernas para deslizarse sobre tu cuerpo, creando una experiencia sensorial completa.",
      },
    },
    {
      "@type": "Question",
      name: "¿Es mi primera vez, qué servicio tántrico me recomiendan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Si es tu primera experiencia tántrica, te recomendamos el servicio Piel a Piel en su opción de 50 minutos. Es la introducción perfecta al contacto corporal completo, con un ritmo progresivo que te permite disfrutar sin prisas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo debo prepararme para un masaje tántrico?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Recomendamos llegar con al menos 5 minutos de anticipación, tomar una ducha antes de la sesión (disponible en nuestras instalaciones) y simplemente dejarte llevar. No necesitas experiencia previa — nuestras terapeutas te guiarán durante toda la sesión.",
      },
    },
  ],
}

export default function MasajeTantricoPage() {
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState("")
  const [selectedServicio, setSelectedServicio] = useState("")

  const handleReservar = (servicio?: string, detalle?: string) => {
    setWhatsappMessage(buildWhatsAppMessage({ page: "masaje tántrico", servicio, detalle }))
    setSelectedServicio(servicio || "")
    setShowLocationSelector(true)
  }

  return (
    <main className="min-h-screen">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/masaje-piel-a-piel-premium.jpg"
            alt="Masaje tántrico para hombres en CDMX — ElementSpa"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">Masaje Tántrico</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-6">
              Masaje Tántrico para Hombres en CDMX — Experiencia Premium
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Descubre una de las experiencias más intensas y placenteras que puedes vivir. El masaje
              tántrico en ElementSpa combina contacto corporal completo, técnicas sensoriales avanzadas y un
              ambiente diseñado para despertar cada fibra de tu cuerpo.
            </p>
            <Button
              size="lg"
              onClick={() => handleReservar()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Reservar masaje tántrico
            </Button>
          </div>
        </div>
      </section>

      {/* What is Tantric Massage */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                ¿Qué es el masaje tántrico y por qué es tan especial?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                El masaje tántrico es una práctica ancestral que busca despertar la energía vital del cuerpo
                a través del contacto consciente y la estimulación sensorial progresiva. A diferencia de un
                masaje convencional, el tántrico involucra todo el cuerpo — tanto el tuyo como el de la
                terapeuta — creando una conexión que va más allá de lo físico.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                En ElementSpa, hemos perfeccionado esta técnica para ofrecer una experiencia que combina la
                tradición del tantra con un enfoque moderno, sensual y completamente profesional. Nuestras
                terapeutas están entrenadas para guiarte a través de un viaje de sensaciones que comienza con
                relajación y culmina en un estado de placer profundo.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                No necesitas experiencia previa ni conocimientos especiales. Solo necesitas estar dispuesto a
                soltar el control y dejarte llevar por las manos — y el cuerpo — de una profesional que sabe
                exactamente cómo despertar tu energía.
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/dark-luxury-spa-massage-room-with-candles-ambient-.jpg"
                alt="Cabina de masaje tántrico con velas y ambiente íntimo"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tantric Services */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Nuestras experiencias tántricas
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            En ElementSpa ofrecemos distintos niveles de experiencia tántrica, desde el primer contacto
            sensorial hasta sesiones intensas con dos terapeutas.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-card rounded-lg border border-border flex flex-col">
              <h3 className="font-serif text-xl mb-3">Piel a Piel</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                La experiencia tántrica esencial. La terapeuta se desliza sobre tu cuerpo en topless,
                utilizando su torso, pecho y piernas para un masaje íntimo que despierta todos tus sentidos.
                Comienza con estímulos suaves boca abajo y evoluciona hacia una estimulación completa.
              </p>
              <p className="text-sm text-primary font-medium mb-4">Desde $2,250 · 50-60 min</p>
              <Button size="sm" onClick={() => handleReservar("PIEL A PIEL", "Desde $2,250")} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 mt-auto">
                <MessageCircle className="h-4 w-4" />
                Reservar PIEL A PIEL
              </Button>
            </div>

            <div className="p-6 bg-card rounded-lg border border-border flex flex-col">
              <h3 className="font-serif text-xl mb-3">Fantasía Compartida</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                El siguiente nivel de conexión tántrica. Tú también participas: comienzas dando un masaje a
                tu terapeuta mientras ella te guía, creando una conexión bidireccional única. Después, ella
                toma el control para llevarte a un estado de éxtasis completo.
              </p>
              <p className="text-sm text-primary font-medium mb-4">Desde $3,000 · 50-65 min</p>
              <Button size="sm" onClick={() => handleReservar("FANTASÍA COMPARTIDA", "Desde $3,000")} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 mt-auto">
                <MessageCircle className="h-4 w-4" />
                Reservar FANTASÍA COMPARTIDA
              </Button>
            </div>

            <div className="p-6 bg-card rounded-lg border border-border flex flex-col">
              <h3 className="font-serif text-xl mb-3">Masaje 4 Manos</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                La experiencia tántrica definitiva. Dos terapeutas sincronizan sus cuerpos para despertar
                todos tus sentidos simultáneamente. Cuatro manos, dos cuerpos y una estimulación coordinada
                que te lleva a un estado de placer absoluto.
              </p>
              <p className="text-sm text-primary font-medium mb-4">Desde $4,000 · 50-70 min</p>
              <Button size="sm" onClick={() => handleReservar("MASAJE 4 MANOS", "Desde $4,000")} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 mt-auto">
                <MessageCircle className="h-4 w-4" />
                Reservar MASAJE 4 MANOS
              </Button>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Button
              size="lg"
              onClick={() => handleReservar()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Reservar experiencia tántrica
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-10">
            Beneficios del masaje tántrico
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Libera tensión acumulada en el cuerpo y la mente de forma natural",
              "Despierta la energía vital y aumenta la sensibilidad corporal",
              "Mejora la conexión con tu propio cuerpo y tus sensaciones",
              "Reduce el estrés y la ansiedad con efectos duraderos",
              "Experiencia de placer profundo en un ambiente seguro y privado",
              "Terapeutas profesionales que respetan tu ritmo y límites",
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 p-4 bg-background rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Prepare */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-6 text-center">
            Cómo prepararte para tu masaje tántrico
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6 text-center">
            Para aprovechar al máximo tu experiencia tántrica, te compartimos algunas recomendaciones:
          </p>
          <div className="space-y-4">
            {[
              { step: "1", text: "Reserva con anticipación por WhatsApp para elegir el horario ideal y la terapeuta disponible." },
              { step: "2", text: "Llega 5-10 minutos antes de tu cita para relajarte y tomar una ducha en nuestras instalaciones." },
              { step: "3", text: "Comunica tus expectativas y preferencias a tu terapeuta antes de iniciar — ella te guiará." },
              { step: "4", text: "Respira profundo, suelta el control y permite que tu cuerpo responda naturalmente a cada estímulo." },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium shrink-0">
                  {item.step}
                </span>
                <p className="text-sm leading-relaxed pt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-card">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-10 text-center">
            Preguntas frecuentes sobre masaje tántrico
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "¿Qué es un masaje tántrico?",
                a: "El masaje tántrico es una técnica que combina contacto corporal completo, respiración consciente y estimulación sensorial para despertar la energía del cuerpo. En ElementSpa, nuestras terapeutas utilizan su cuerpo para crear una conexión íntima que lleva a un estado profundo de relajación y placer.",
              },
              {
                q: "¿El masaje tántrico incluye contacto piel a piel?",
                a: "Sí. Nuestros servicios de masaje tántrico, como Piel a Piel y Fantasía Compartida, incluyen contacto corporal directo donde la terapeuta utiliza su torso, brazos y piernas para deslizarse sobre tu cuerpo, creando una experiencia sensorial completa.",
              },
              {
                q: "¿Es mi primera vez, qué servicio tántrico me recomiendan?",
                a: "Si es tu primera experiencia tántrica, te recomendamos el servicio Piel a Piel en su opción de 50 minutos. Es la introducción perfecta al contacto corporal completo, con un ritmo progresivo que te permite disfrutar sin prisas.",
              },
              {
                q: "¿Cómo debo prepararme para un masaje tántrico?",
                a: "Recomendamos llegar con al menos 5 minutos de anticipación, tomar una ducha antes de la sesión (disponible en nuestras instalaciones) y simplemente dejarte llevar. No necesitas experiencia previa — nuestras terapeutas te guiarán durante toda la sesión.",
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
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">
            Reserva tu masaje tántrico en CDMX
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Disponible en nuestras dos sucursales: Roma Norte y Coyoacán. Elige tu ubicación y vive una
            experiencia que transformará tu concepto del placer y la relajación.
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
