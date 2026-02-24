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
  name: "Masaje Sensorial para Hombres",
  description:
    "Masaje sensorial exclusivo para hombres con técnicas suaves y profundas. Caricias envolventes que despiertan todos los sentidos.",
  url: "https://elementspa.mx/masaje-sensorial-hombres",
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
      name: "¿Qué es un masaje sensorial?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El masaje sensorial es una técnica que utiliza caricias suaves, yemas de los dedos y uñas para recorrer todo el cuerpo, despertando la sensibilidad de la piel y generando una experiencia de placer sutil pero profunda. No es un masaje de presión muscular, sino una exploración táctil.",
      },
    },
    {
      "@type": "Question",
      name: "¿Para quién es ideal el masaje sensorial?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Es perfecto para quienes buscan una experiencia diferente al masaje tradicional. Ideal si disfrutas las caricias suaves, si quieres despertar tus sentidos o si buscas una sesión corta pero intensamente placentera.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto dura el masaje sensorial?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nuestro servicio Caricias del Alma tiene una duración de 30 minutos por $1,100 MXN. También puedes agregar 10 minutos extra por $300 para extender la experiencia.",
      },
    },
  ],
}

export default function MasajeSensorialPage() {
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState("")
  const [selectedServicio, setSelectedServicio] = useState("")

  const handleReservar = (servicio?: string, detalle?: string) => {
    setWhatsappMessage(buildWhatsAppMessage({ page: "masaje sensorial", servicio, detalle }))
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
            src="/luxury-grooming-tools-razor-brush-masculine.jpg"
            alt="Masaje sensorial para hombres — ElementSpa"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">Masaje Sensorial</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-6">
              Masaje Sensorial para Hombres — Técnicas Suaves y Profundas
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Imagina caricias suaves recorriendo cada centímetro de tu piel, despertando sensaciones que
              no sabías que existían. El masaje sensorial de ElementSpa es una experiencia táctil diseñada
              para encender tus sentidos y llevarte a un estado de placer puro.
            </p>
            <Button
              size="lg"
              onClick={() => handleReservar()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Reservar masaje sensorial
            </Button>
          </div>
        </div>
      </section>

      {/* What is Sensorial Massage */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                ¿Qué hace único al masaje sensorial?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A diferencia del masaje tradicional que trabaja sobre los músculos con presión, el masaje
                sensorial se enfoca en la superficie de la piel. Utiliza caricias muy suaves con las yemas
                de los dedos, las uñas y técnicas de roce que activan las terminaciones nerviosas y generan
                una cascada de sensaciones placenteras.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Es una experiencia provocativa y delicada al mismo tiempo. No requiere fuerza — requiere
                precisión, ritmo y conocimiento de los puntos más sensibles del cuerpo masculino. Nuestras
                terapeutas dominan el arte de la caricia y saben exactamente cómo llevar tu cuerpo de la
                relajación a la excitación de forma gradual y natural.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                En ElementSpa, el masaje sensorial es perfecto como experiencia rápida e intensa, o como
                complemento previo a servicios más completos como Piel a Piel o Fantasía Compartida.
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/zen-spa-stone-arrangement-minimalist.jpg"
                alt="Ambiente sensorial en ElementSpa"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Sensorial Services */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Experiencias sensoriales en ElementSpa
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Nuestro servicio estrella de masaje sensorial y otras experiencias que incluyen elementos
            táctiles avanzados.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 md:p-8 bg-card rounded-lg border-2 border-primary">
              <span className="text-xs tracking-[0.2em] text-primary uppercase">Destacado</span>
              <h3 className="font-serif text-2xl mt-2 mb-3">Caricias del Alma</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Una experiencia rápida pero profundamente provocativa. Caricias muy suaves con las yemas
                de los dedos y uñas que recorren todo tu cuerpo y despiertan cada fibra de tu piel.
                Perfecto para encender tus sentidos en pocos minutos. Incluye estimulación final.
              </p>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm bg-secondary px-3 py-1 rounded">30 min</span>
                <span className="text-primary font-semibold text-lg">$1,100</span>
              </div>
              <Button
                onClick={() => handleReservar("CARICIAS DEL ALMA", "30 min - $1,100")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Reservar CARICIAS DEL ALMA
              </Button>
            </div>

            <div className="p-6 md:p-8 bg-card rounded-lg border border-border">
              <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">También sensorial</span>
              <h3 className="font-serif text-2xl mt-2 mb-3">Conexión Esencial</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Combina masaje relajante con elementos sensoriales. Comienza como un masaje de cuerpo
                completo y evoluciona con delicadeza hacia un toque final estimulante. La opción perfecta
                si buscas tanto relajación muscular como despertar sensorial.
              </p>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm bg-secondary px-3 py-1 rounded">50 min</span>
                <span className="text-primary font-semibold text-lg">$1,350</span>
              </div>
              <Button
                onClick={() => handleReservar("CONEXIÓN ESENCIAL", "50 min - $1,350")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Reservar CONEXIÓN ESENCIAL
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Techniques */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-10">
            Técnicas de nuestro masaje sensorial
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Caricias con yemas",
                desc: "Recorrido completo del cuerpo con las yemas de los dedos aplicando presión mínima para activar las terminaciones nerviosas superficiales.",
              },
              {
                title: "Trazos con uñas",
                desc: "Líneas suaves y lentas con las uñas sobre la piel que generan una sensación de cosquilleo placentero y excitación progresiva.",
              },
              {
                title: "Roce de palmas",
                desc: "Las palmas de las manos se deslizan con aceite tibio sobre grandes extensiones de piel, combinando calor y suavidad.",
              },
              {
                title: "Puntos de presión sutil",
                desc: "Estímulos puntuales en zonas de alta sensibilidad como cuello, espalda baja, muslos internos y pies.",
              },
              {
                title: "Ritmo envolvente",
                desc: "La velocidad y la cadencia de las caricias varían para mantener al cuerpo en un estado constante de anticipación y placer.",
              },
              {
                title: "Estimulación final",
                desc: "La sesión culmina con una estimulación manual que libera toda la tensión acumulada durante el masaje sensorial.",
              },
            ].map((technique) => (
              <div key={technique.title} className="p-5 bg-background rounded-lg">
                <h3 className="font-medium mb-2">{technique.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{technique.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-10">
            Beneficios del masaje sensorial
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Despierta la sensibilidad de toda la piel en pocos minutos",
              "Reduce el estrés y genera un estado de relajación inmediata",
              "Ideal como experiencia rápida cuando tienes poco tiempo",
              "Activa las endorfinas y mejora el estado de ánimo",
              "No requiere presión muscular — perfecto si prefieres el toque suave",
              "Se puede complementar con otros servicios más extensos",
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
      <section className="py-20 bg-card">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-10 text-center">
            Preguntas frecuentes sobre masaje sensorial
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "¿Qué es un masaje sensorial?",
                a: "El masaje sensorial es una técnica que utiliza caricias suaves, yemas de los dedos y uñas para recorrer todo el cuerpo, despertando la sensibilidad de la piel y generando una experiencia de placer sutil pero profunda. No es un masaje de presión muscular, sino una exploración táctil.",
              },
              {
                q: "¿Para quién es ideal el masaje sensorial?",
                a: "Es perfecto para quienes buscan una experiencia diferente al masaje tradicional. Ideal si disfrutas las caricias suaves, si quieres despertar tus sentidos o si buscas una sesión corta pero intensamente placentera.",
              },
              {
                q: "¿Cuánto dura el masaje sensorial?",
                a: "Nuestro servicio Caricias del Alma tiene una duración de 30 minutos por $1,100 MXN. También puedes agregar 10 minutos extra por $300 para extender la experiencia.",
              },
              {
                q: "¿Es lo mismo que un masaje relajante?",
                a: "No. El masaje relajante (como Conexión Esencial) trabaja con presión muscular sobre el cuerpo completo. El masaje sensorial se enfoca en estímulos superficiales muy suaves que activan las terminaciones nerviosas de la piel. Son experiencias complementarias pero distintas.",
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
            Reserva tu masaje sensorial hoy
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Disponible en Roma Norte y Coyoacán. Elige tu sucursal, envíanos un mensaje por WhatsApp y
            prepárate para una experiencia que despertará cada fibra de tu piel.
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
