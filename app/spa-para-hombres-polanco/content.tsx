"use client"

import { ZonePage, buildZoneBusinessJsonLd, buildZoneFaqJsonLd, type ZoneFaq } from "@/components/zone-page"
import { buildOffersForServices, buildBreadcrumb } from "@/lib/schema"

const faqs: ZoneFaq[] = [
  {
    q: "¿ElementSpa tiene sucursal en Polanco?",
    a: "Nuestra sucursal más cercana a Polanco está en Roma Norte, a unos 15 minutos en auto por Circuito Interior o Reforma. Muchos de nuestros clientes frecuentes vienen de Polanco, Anzures y Lomas: la discreción y calidad del servicio hacen que el trayecto valga la pena.",
  },
  {
    q: "¿Por qué no hay spas de este tipo en Polanco?",
    a: "Los spas tradicionales de Polanco ofrecen tratamientos estéticos generales. ElementSpa es diferente: experiencias de masaje diseñadas exclusivamente para hombres, que van desde lo relajante hasta lo sensorial y tántrico, siempre en cabinas privadas y con total discreción.",
  },
  {
    q: "¿Cómo reservo desde Polanco?",
    a: "Todo por WhatsApp: eliges tu servicio, confirmas horario y te compartimos la ubicación exacta en Roma Norte. Recomendamos reservar con 1-2 horas de anticipación para garantizar disponibilidad, sobre todo entre semana por la tarde.",
  },
]

const jsonLd = [
  buildZoneBusinessJsonLd({
    name: "ElementSpa — Spa para Hombres cerca de Polanco",
    url: "https://elementspa.mx/spa-para-hombres-polanco",
    image: "https://elementspa.mx/dark-luxury-spa-massage-room-with-candles-ambient-.jpg",
    description:
      "Spa masculino que atiende Polanco y alrededores desde Roma Norte, CDMX. Masajes sensoriales, relajantes, descontracturantes y tántricos exclusivos para hombres.",
    branchLocality: "Roma Norte",
    areaServed: ["Polanco", "Anzures", "Lomas de Chapultepec", "Granada", "Verónica Anzures"],
    makesOffer: buildOffersForServices(),
  }),
  buildZoneFaqJsonLd(faqs),
  buildBreadcrumb([
    { name: "Inicio", path: "/" },
    { name: "Spa para Hombres en Polanco", path: "/spa-para-hombres-polanco" },
  ]),
]

export default function SpaPolancoPage() {
  return (
    <ZonePage
      trackerName="Spa Polanco"
      waPage="spa cerca de Polanco"
      jsonLd={jsonLd}
      eyebrow="Polanco · Roma Norte, CDMX"
      h1="Spa para Hombres en Polanco — La Experiencia que Tu Zona No Ofrece"
      heroText="En Polanco hay de todo, menos esto. A 15 minutos, en Roma Norte, ElementSpa te espera con masajes sensoriales y tántricos diseñados exclusivamente para hombres: cabinas privadas, terapeutas profesionales y una discreción absoluta que nuestros clientes de Polanco valoran más que nada."
      heroImage="/dark-luxury-spa-massage-room-with-candles-ambient-.jpg"
      heroImageAlt="ElementSpa — Spa masculino cerca de Polanco, CDMX"
      heroCtaLabel="Reservar desde Polanco"
      aboutTitle="El secreto mejor guardado de los caballeros de Polanco"
      aboutParagraphs={[
        "Trabajas en Polanco, tienes reuniones todo el día y el estrés se acumula. Lo que necesitas no es otro spa de hotel: es un espacio pensado para ti. Nuestra sucursal de Roma Norte está a un viaje corto por Reforma o Circuito Interior, lejos de las miradas conocidas de tu zona.",
        "Cabinas privadas, aromaterapia, iluminación tenue y seis experiencias de masaje que van de lo relajante a lo intensamente sensorial. Sin registros, sin membresías, sin complicaciones.",
      ]}
      aboutImage="/luxury-grooming-tools-razor-brush-masculine.jpg"
      aboutImageAlt="Detalles masculinos de lujo en ElementSpa, cerca de Polanco"
      locationLine="Roma Norte, CDMX — a 15 min de Polanco"
      servicesTitle="Nuestros servicios para clientes de Polanco"
      servicesIntro="Las 6 experiencias de masaje de ElementSpa, a un trayecto corto de Polanco. Elige la tuya y reserva por WhatsApp."
      benefitsTitle="Por qué los ejecutivos de Polanco nos eligen"
      benefits={[
        "A 15 minutos de Polanco por Reforma o Circuito Interior",
        "Discreción total: lejos de tu zona, sin registros ni membresías",
        "Cabinas 100% privadas con aromaterapia e iluminación ambiental",
        "Terapeutas experimentadas que combinan técnica y sensibilidad",
        "Reserva rápida por WhatsApp sin intermediarios ni esperas",
        "Horario de 11:00 a 19:00 ideal para escaparse de la oficina",
      ]}
      faqTitle="Preguntas de clientes de Polanco"
      faqs={faqs}
      finalTitle="Date el escape que Polanco no te puede dar"
      finalText="Reserva por WhatsApp en nuestra sucursal de Roma Norte. Quince minutos de trayecto, una hora de desconexión total."
    />
  )
}
