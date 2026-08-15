"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MessageCircle, CheckCircle, MapPin, Clock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { LocationSelector } from "@/components/location-selector"
import { services, getServiceDetail } from "@/lib/data"
import { buildOffersForServices, buildBreadcrumb } from "@/lib/schema"
import { ViewContentTracker } from "@/components/view-content-tracker"

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Massage for Men in Mexico City",
  description:
    "Men-only massage service in Mexico City: sensual, relaxing, deep-tissue and tantric sessions in private rooms in Roma Norte and Coyoacán. Booking by WhatsApp, no membership required.",
  url: "https://elementspa.mx/en/massage-for-men-mexico-city",
  inLanguage: "en",
  provider: {
    "@type": "HealthAndBeautyBusiness",
    name: "ElementSpa",
    url: "https://elementspa.mx",
  },
  areaServed: {
    "@type": "City",
    name: "Mexico City",
  },
  offers: buildOffersForServices(),
}

const breadcrumbJsonLd = buildBreadcrumb([
  { name: "Home", path: "/" },
  { name: "Massage for Men in Mexico City", path: "/en/massage-for-men-mexico-city" },
])

/**
 * NOTA PARA EL EQUIPO: la respuesta sobre idioma asume que alguien puede
 * atender mensajes en inglés por WhatsApp. Confirmar y ajustar si no es así.
 */
const faqs = [
  {
    q: "Where exactly are you located?",
    a: "We have two locations in Mexico City: Roma Norte and Coyoacán. Both are in quiet residential areas rather than shopping malls, which is part of how we keep things discreet. For privacy reasons we share the exact address when you confirm your appointment on WhatsApp.",
  },
  {
    q: "Do I need to speak Spanish to book?",
    a: "No. You can send your message in English on WhatsApp — just tell us the service you want, your preferred location and a time, and we'll confirm availability.",
  },
  {
    q: "What does it cost?",
    a: "Sessions start at $1,100 MXN for 30 minutes and go up to $5,000 MXN for our 70-minute four-hands experience. Prices are final, with no hidden fees or service charges. You can add 10 extra minutes for $300 MXN.",
  },
  {
    q: "Is this a legitimate massage business?",
    a: "Yes. ElementSpa is a men-only spa with professional therapists, private treatment rooms and set pricing published on our site. Every session is a massage experience with a sensual component, clearly described in advance so there are no surprises.",
  },
  {
    q: "How do I pay?",
    a: "Payment is made at the location. We'll confirm the accepted payment methods when you book on WhatsApp, so you know exactly what to bring.",
  },
  {
    q: "Do I need an appointment?",
    a: "We strongly recommend booking ahead, especially in the afternoon. Message us on WhatsApp one or two hours before and we'll have a room ready. We're open every day from 11:00 to 19:00 (Mexico City time).",
  },
]

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "en",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}

/** Mensaje de WhatsApp en inglés. {sucursal} lo reemplaza LocationSelector. */
function buildEnglishMessage(service?: string, detail?: string): string {
  const lines = ["Hi, I found ElementSpa online and I'd like to book a massage."]
  lines.push("I'd like the {sucursal} location.")
  if (service) {
    lines.push(`I'm interested in: ${service}${detail ? ` (${detail})` : ""}.`)
  }
  lines.push("Do you have availability today or tomorrow?")
  return lines.join("\n")
}

export default function MassageForMenPage() {
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState("")
  const [selectedServicio, setSelectedServicio] = useState("")

  const handleBook = (service?: string, detail?: string) => {
    setWhatsappMessage(buildEnglishMessage(service, detail))
    setSelectedServicio(service || "")
    setShowLocationSelector(true)
  }

  return (
    <main className="min-h-screen" lang="en">
      <Header />
      <ViewContentTracker contentName="Massage for Men EN" contentCategory="servicios" />
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
            src="/dark-luxury-spa-massage-room-with-candles-ambient-.jpg"
            alt="Massage for men in Mexico City — ElementSpa"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">
              Roma Norte · Coyoacán · Mexico City
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-6">
              Massage for Men in Mexico City
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              A men-only spa in two of the city&apos;s best neighborhoods. Sensual, relaxing and
              tantric massage in private rooms, with published prices from $1,100 MXN and no
              membership or registration. Book in English on WhatsApp.
            </p>
            <Button
              size="lg"
              onClick={() => handleBook()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Book on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                What to expect if you&apos;re visiting or new in town
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Finding a place like this in an unfamiliar city usually means guesswork: unclear
                pricing, vague listings and no idea what you&apos;re walking into. We publish
                everything up front — what each experience includes, how long it lasts and exactly
                what it costs.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our two locations are in Roma Norte and Coyoacán, both safe, walkable neighborhoods
                that most visitors already know. Sessions take place in private rooms with ambient
                lighting and aromatherapy, and nothing is charged beyond the listed price.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                There&apos;s no registration, no membership and no personal information required.
                You message us on WhatsApp, we confirm a time, and we send the exact address.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                {
                  icon: <ShieldCheck className="h-5 w-5 text-primary" />,
                  t: "Transparent pricing",
                  d: "Every price is published on this page. No hidden fees, no pressure to upgrade once you arrive.",
                },
                {
                  icon: <MapPin className="h-5 w-5 text-primary" />,
                  t: "Roma Norte & Coyoacán",
                  d: "Two locations in residential areas well known to visitors and residents alike.",
                },
                {
                  icon: <Clock className="h-5 w-5 text-primary" />,
                  t: "Open every day, 11:00–19:00",
                  d: "Seven days a week, including weekends. Same-day bookings are often possible.",
                },
              ].map((item) => (
                <div
                  key={item.t}
                  className="flex items-start gap-4 p-5 bg-background rounded-lg border border-border"
                >
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

      {/* Services */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Our massage experiences</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Six experiences, from a short sensory session to full body-to-body tantric massage. All
            prices in Mexican pesos (MXN) and final.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="p-6 bg-card rounded-lg border border-border flex flex-col"
              >
                <h3 className="font-serif text-lg mb-3">{service.title}</h3>
                {service.price ? (
                  <p className="text-sm text-primary font-medium mb-4">
                    {service.time} · {service.price} MXN
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.options?.map((o) => (
                      <span key={o.name} className="text-xs bg-secondary/50 px-3 py-1.5 rounded">
                        {o.time} ·{" "}
                        <span className="text-primary font-semibold">{o.price}</span>
                      </span>
                    ))}
                  </div>
                )}
                <Button
                  size="sm"
                  onClick={() => handleBook(service.title, getServiceDetail(service))}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 mt-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  Book this
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-card rounded-lg border border-border">
            <h3 className="font-serif text-xl mb-4">Add-ons</h3>
            <div className="flex flex-wrap gap-6 text-sm">
              <span>
                <span className="text-primary">+</span> 10 extra minutes —{" "}
                <span className="text-primary font-semibold">$300 MXN</span>
              </span>
              <span>
                <span className="text-primary">+</span> One additional stimulation —{" "}
                <span className="text-primary font-semibold">$350 MXN</span>
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            Full details in Spanish:{" "}
            <Link href="/masajes-para-hombres-cdmx" className="text-primary hover:underline">
              catálogo completo de masajes
            </Link>
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-10">Why guests choose ElementSpa</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Men-only spa — every experience is designed for male guests",
              "Private treatment rooms with ambient lighting and aromatherapy",
              "Prices published up front, in pesos, with no hidden charges",
              "No membership, no registration, no personal data required",
              "Two locations in Roma Norte and Coyoacán, easy to reach",
              "Booking by WhatsApp in English or Spanish",
            ].map((b) => (
              <div key={b} className="flex items-start gap-3 p-4">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif mb-10 text-center">
            Frequently asked questions
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
          <h2 className="text-3xl md:text-4xl font-serif mb-6">Book your session</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Send us a message on WhatsApp with your preferred time and location. We&apos;ll confirm
            availability and share the exact address.
          </p>
          <Button
            size="lg"
            onClick={() => handleBook()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            Book on WhatsApp
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
        title="Choose your location"
        subtitle="Pick the one that works best for you"
        note="You'll be redirected to WhatsApp to continue"
      />
    </main>
  )
}
