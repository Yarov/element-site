"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MessageCircle, CheckCircle, Clock, ShieldCheck, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { LocationSelector } from "@/components/location-selector"
import { services, buildWhatsAppMessage, getServiceDetail } from "@/lib/data"
import { buildOffersForServices, buildBreadcrumb } from "@/lib/schema"
import { ViewContentTracker } from "@/components/view-content-tracker"

/** Servicios que encajan en una agenda laboral: 30-50 min. */
const EXECUTIVE_SERVICE_IDS = [1, 2, 3]

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Masaje Ejecutivo para Hombres en CDMX",
  description:
    "Masaje ejecutivo para hombres en la Ciudad de México: sesiones de 30 a 50 minutos diseñadas para liberar la tensión de cuello, hombros y espalda acumulada por la jornada de oficina, con total discreción.",
  url: "https://elementspa.mx/masaje-ejecutivo-hombres-cdmx",
  provider: {
    "@type": "HealthAndBeautyBusiness",
    name: "ElementSpa",
    url: "https://elementspa.mx",
  },
  areaServed: {
    "@type": "City",
    name: "Ciudad de México",
  },
  offers: buildOffersForServices(EXECUTIVE_SERVICE_IDS),
}

const breadcrumbJsonLd = buildBreadcrumb([
  { name: "Inicio", path: "/" },
  { name: "Masaje Ejecutivo para Hombres en CDMX", path: "/masaje-ejecutivo-hombres-cdmx" },
])

const faqs = [
  {
    q: "¿Qué es un masaje ejecutivo?",
    a: "Es un masaje pensado para hombres que pasan la mayor parte del día sentados frente a una computadora o en reuniones. Se concentra en las zonas donde ese estilo de vida acumula tensión —cuello, hombros, espalda alta y baja— y en sesiones que caben dentro de una jornada laboral. En ElementSpa lo trabajamos con nuestras experiencias de 30 a 50 minutos.",
  },
  {
    q: "¿Cuánto dura y cuánto cuesta?",
    a: "Las opciones que mejor se ajustan a una agenda de oficina van de 30 a 50 minutos, desde $1,100 hasta $1,550 MXN. Caricias del Alma dura 30 minutos ($1,100), Conexión Esencial 50 minutos ($1,350) y Energía Vital 50 minutos ($1,550). Puedes agregar 10 minutos extra por $300.",
  },
  {
    q: "¿Puedo ir en mi hora de comida?",
    a: "Sí, es uno de los horarios más solicitados. Abrimos de 11:00 a 19:00 todos los días. Con la sesión de 30 minutos alcanzas de sobra en una hora de comida. Te recomendamos avisarnos por WhatsApp con una o dos horas de anticipación para tener tu cabina lista al llegar.",
  },
  {
    q: "¿Qué tan discreto es?",
    a: "Total. No pedimos registro, membresía ni datos personales: la reserva se hace por WhatsApp y la ubicación exacta se comparte al confirmar. Cada sesión ocurre en cabina privada y nuestras sucursales están en zonas residenciales, no en plazas comerciales.",
  },
  {
    q: "¿Cuál es la diferencia con un masaje descontracturante normal?",
    a: "La técnica base es la misma, pero el enfoque cambia: priorizamos las zonas afectadas por el trabajo de escritorio y ajustamos la duración a tu tiempo real disponible. Además, todas nuestras experiencias incluyen un componente sensorial que un masaje clínico no ofrece.",
  },
]

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}

export default function MasajeEjecutivoPage() {
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState("")
  const [selectedServicio, setSelectedServicio] = useState("")

  const handleReservar = (servicio?: string, detalle?: string) => {
    setWhatsappMessage(buildWhatsAppMessage({ page: "masaje ejecutivo en CDMX", servicio, detalle }))
    setSelectedServicio(servicio || "")
    setShowLocationSelector(true)
  }

  const executiveServices = services.filter((s) => EXECUTIVE_SERVICE_IDS.includes(s.id))

  return (
    <main className="min-h-screen">
      <Header />
      <ViewContentTracker contentName="Masaje Ejecutivo" contentCategory="servicios" />
      {[serviceJsonLd, faqJsonLd, breadcrumbJsonLd].map((schema, i) => (
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
            src="/luxury-grooming-tools-razor-brush-masculine.jpg"
            alt="Masaje ejecutivo para hombres en CDMX — ElementSpa"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">Spa Ejecutivo · CDMX</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-6">
              Masaje Ejecutivo para Hombres en CDMX
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Ocho horas frente a una pantalla, juntas encadenadas y tráfico de regreso. Tu cuerpo
              lleva la cuenta. Nuestras sesiones de 30 a 50 minutos están diseñadas para caber en tu
              día y devolverte el cuello, los hombros y la cabeza en orden. Desde $1,100, con total
              discreción.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => handleReservar()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Reservar mi sesión
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Por qué */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                El precio invisible del trabajo de escritorio
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                La postura sostenida frente a la computadora carga trapecio, cuello y espalda alta.
                Se acumula despacio: primero es una molestia al final del día, luego un dolor de
                cabeza recurrente, después un sueño que no descansa.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                El masaje ejecutivo ataca justo esas zonas. Pero a diferencia de un masaje clínico,
                aquí no sales solamente sin contracturas: sales desconectado del trabajo. Esa es la
                diferencia entre aliviar un músculo y realmente cortar con el día.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Todo en cabina privada, sin registros ni membresías, y con horarios que se ajustan a
                una agenda real.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                { icon: <Clock className="h-5 w-5 text-primary" />, t: "Cabe en tu jornada", d: "Sesiones de 30 a 50 minutos. La de 30 min alcanza de sobra en una hora de comida." },
                { icon: <ShieldCheck className="h-5 w-5 text-primary" />, t: "Discreción total", d: "Sin registro ni membresía. Reservas por WhatsApp y la ubicación llega al confirmar." },
                { icon: <MapPin className="h-5 w-5 text-primary" />, t: "Dos puntos en la ciudad", d: "Roma Norte y Coyoacán, ambos en zona residencial y no en plaza comercial." },
              ].map((item) => (
                <div key={item.t} className="flex items-start gap-4 p-5 bg-background rounded-lg border border-border">
                  <div className="p-2 bg-primary/10 rounded-full shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="font-medium mb-1">{item.t}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Las tres opciones que mejor funcionan entre semana
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Elegidas por duración y por el tipo de tensión que resuelven. Los precios son finales,
            sin cargos ocultos.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {executiveServices.map((service) => (
              <div key={service.id} className="p-6 bg-card rounded-lg border border-border flex flex-col">
                <h3 className="font-serif text-xl mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{service.seoTitle}</p>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm bg-secondary px-3 py-1 rounded">{service.time}</span>
                  <span className="text-primary font-semibold text-lg">{service.price}</span>
                </div>
                <Button
                  onClick={() => handleReservar(service.title, getServiceDetail(service))}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 mt-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  Reservar
                </Button>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            ¿Tienes más tiempo disponible? Revisa el{" "}
            <Link href="/masajes-para-hombres-cdmx" className="text-primary hover:underline">
              catálogo completo de masajes
            </Link>{" "}
            con experiencias de hasta 70 minutos.
          </p>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-10">
            Por qué los ejecutivos repiten
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Sesiones que caben en una hora de comida o al salir de la oficina",
              "Alivio directo en cuello, trapecio y espalda alta —lo que castiga el escritorio",
              "Sin registros ni membresías: reservas por WhatsApp y listo",
              "Cabinas privadas en zonas residenciales, no en plazas comerciales",
              "Precios cerrados desde $1,100, sin sorpresas al pagar",
              "Abierto los 7 días de 11:00 a 19:00, incluyendo fines de semana",
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 p-4">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zonas */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Cerca de tu oficina</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Nuestras dos sucursales dan servicio a las principales zonas de oficinas de la ciudad.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: "Roma Norte", href: "/spa-para-hombres-roma-norte", note: "Sucursal" },
              { name: "Polanco", href: "/spa-para-hombres-polanco", note: "A 15 min" },
              { name: "Condesa", href: "/spa-para-hombres-condesa", note: "A minutos" },
              { name: "Del Valle", href: "/spa-para-hombres-del-valle", note: "Entre ambas" },
              { name: "Coyoacán", href: "/spa-para-hombres-coyoacan", note: "Sucursal" },
            ].map((z) => (
              <Link
                key={z.href}
                href={z.href}
                className="p-5 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors group"
              >
                <MapPin className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-serif text-lg mb-1 group-hover:text-primary transition-colors">
                  {z.name}
                </h3>
                <p className="text-xs text-muted-foreground">{z.note}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-card">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-10 text-center">
            Preguntas frecuentes sobre el masaje ejecutivo
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
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">
            Agenda tu sesión para hoy o mañana
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Escríbenos por WhatsApp con el horario que te acomode. Te confirmamos disponibilidad al
            momento y te compartimos la ubicación de la sucursal que elijas.
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
