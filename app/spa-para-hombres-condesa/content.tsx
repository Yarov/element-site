"use client"

import { ZonePage, buildZoneBusinessJsonLd, buildZoneFaqJsonLd, type ZoneFaq } from "@/components/zone-page"
import { buildOffersForServices, buildBreadcrumb } from "@/lib/schema"

const faqs: ZoneFaq[] = [
  {
    q: "¿ElementSpa tiene sucursal en la Condesa?",
    a: "Nuestra sucursal más cercana está en Roma Norte, la colonia vecina de la Condesa. Desde la mayoría de los puntos de la Condesa e Hipódromo llegas en 5 a 10 minutos en auto o caminando una distancia corta. Es prácticamente tu spa de barrio.",
  },
  {
    q: "¿Cómo llego desde la Condesa?",
    a: "Roma Norte está justo cruzando Avenida Insurgentes. Puedes llegar caminando desde la zona de Parque México / Parque España, en Metrobús (Línea 1) o en un viaje corto de app. Te compartimos la ubicación exacta por WhatsApp al reservar.",
  },
  {
    q: "¿Necesito reservar con anticipación?",
    a: "Recomendamos reservar por WhatsApp para garantizar tu horario, especialmente por las tardes. Si estás en la Condesa y quieres venir de inmediato, escríbenos: si hay cabina disponible te atendemos el mismo día.",
  },
]

const jsonLd = [
  buildZoneBusinessJsonLd({
    name: "ElementSpa — Spa para Hombres cerca de la Condesa",
    url: "https://elementspa.mx/spa-para-hombres-condesa",
    image: "https://elementspa.mx/luxury-spa-interior-wood-stone-natural-elements-ma.jpg",
    description:
      "Spa masculino a minutos de la Condesa, CDMX. Masajes sensoriales, relajantes, descontracturantes y tántricos exclusivos para hombres, en nuestra sucursal de Roma Norte.",
    branchLocality: "Roma Norte",
    areaServed: ["Condesa", "Hipódromo", "Hipódromo Condesa", "Escandón", "Roma Norte"],
    makesOffer: buildOffersForServices(),
  }),
  buildZoneFaqJsonLd(faqs),
  buildBreadcrumb([
    { name: "Inicio", path: "/" },
    { name: "Spa para Hombres en la Condesa", path: "/spa-para-hombres-condesa" },
  ]),
]

export default function SpaCondesaPage() {
  return (
    <ZonePage
      trackerName="Spa Condesa"
      waPage="spa cerca de la Condesa"
      jsonLd={jsonLd}
      eyebrow="Condesa · Roma Norte, CDMX"
      h1="Spa para Hombres en la Condesa — Masajes Exclusivos a Minutos de Ti"
      heroText="¿Vives o trabajas en la Condesa? Tu espacio de relajación está más cerca de lo que crees. ElementSpa Roma Norte, a unos minutos de Parque México, te ofrece masajes sensoriales y tántricos diseñados exclusivamente para hombres, en cabinas privadas y con total discreción."
      heroImage="/luxury-spa-interior-wood-stone-natural-elements-ma.jpg"
      heroImageAlt="ElementSpa — Spa masculino cerca de la Condesa, CDMX"
      heroCtaLabel="Reservar cerca de la Condesa"
      aboutTitle="Tu refugio a unas cuadras de la Condesa"
      aboutParagraphs={[
        "La Condesa es sinónimo de buen ritmo de vida: cafés, parques y calles arboladas. Lo único que le falta es un spa exclusivo para hombres — y para eso está nuestra sucursal de Roma Norte, cruzando Insurgentes, a 5-10 minutos de casi cualquier punto de la Condesa e Hipódromo.",
        "Cabinas privadas con iluminación tenue, aromaterapia y terapeutas profesionales. Llega caminando o en un viaje corto, desconéctate una hora y regresa renovado a tu rutina.",
      ]}
      aboutImage="/zen-spa-stone-arrangement-minimalist.jpg"
      aboutImageAlt="Ambiente zen en ElementSpa, cerca de la Condesa"
      locationLine="Roma Norte, CDMX — a minutos de la Condesa"
      servicesTitle="Nuestros servicios cerca de la Condesa"
      servicesIntro="Las 6 experiencias de masaje de ElementSpa disponibles en la sucursal más cercana a la Condesa. Elige la tuya y reserva por WhatsApp."
      benefitsTitle="Por qué los caballeros de la Condesa nos eligen"
      benefits={[
        "A 5-10 minutos de Parque México y Parque España",
        "Llega caminando o en Metrobús Línea 1 por Insurgentes",
        "Cabinas 100% privadas con aromaterapia e iluminación ambiental",
        "Terapeutas experimentadas que combinan técnica y sensibilidad",
        "Reserva rápida por WhatsApp sin intermediarios ni esperas",
        "Total discreción: sin registros ni membresías",
      ]}
      faqTitle="Preguntas de clientes de la Condesa"
      faqs={faqs}
      finalTitle="Tu masaje te espera a minutos de la Condesa"
      finalText="No dejes la relajación para después. Reserva por WhatsApp en nuestra sucursal de Roma Norte y vive la experiencia ElementSpa hoy mismo."
    />
  )
}
