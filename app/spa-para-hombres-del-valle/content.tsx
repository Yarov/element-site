"use client"

import { ZonePage, buildZoneBusinessJsonLd, buildZoneFaqJsonLd, type ZoneFaq } from "@/components/zone-page"
import { buildOffersForServices, buildBreadcrumb } from "@/lib/schema"

const faqs: ZoneFaq[] = [
  {
    q: "¿Cuál sucursal me queda más cerca si vivo en Del Valle?",
    a: "Del Valle tiene la ventaja de estar entre nuestras dos sucursales: Roma Norte al norte (10-15 minutos por Insurgentes) y Coyoacán al sur (10-15 minutos por División del Norte o Universidad). Al reservar por WhatsApp te ayudamos a elegir la que mejor te convenga según tu horario.",
  },
  {
    q: "¿Los servicios son iguales en ambas sucursales?",
    a: "Sí, en Roma Norte y Coyoacán ofrecemos exactamente las mismas 6 experiencias de masaje con el mismo nivel de calidad, privacidad y profesionalismo. Solo cambia la ubicación.",
  },
  {
    q: "¿Atienden a clientes de Nápoles y Narvarte?",
    a: "Por supuesto. Del Valle, Nápoles, Narvarte y Portales son zonas que atendemos todos los días — ambas sucursales les quedan a un trayecto corto. Reserva por WhatsApp y te compartimos la ubicación exacta.",
  },
]

const jsonLd = [
  buildZoneBusinessJsonLd({
    name: "ElementSpa — Spa para Hombres cerca de Del Valle",
    url: "https://elementspa.mx/spa-para-hombres-del-valle",
    image: "https://elementspa.mx/man-relaxing-spa-treatment-massage.jpg",
    description:
      "Spa masculino que atiende Del Valle, Nápoles y Narvarte desde sus dos sucursales cercanas en Roma Norte y Coyoacán, CDMX. Masajes sensoriales, relajantes, descontracturantes y tántricos exclusivos para hombres.",
    branchLocality: "Coyoacán",
    areaServed: ["Del Valle", "Nápoles", "Narvarte", "Portales", "San José Insurgentes"],
    makesOffer: buildOffersForServices(),
  }),
  buildZoneFaqJsonLd(faqs),
  buildBreadcrumb([
    { name: "Inicio", path: "/" },
    { name: "Spa para Hombres en Del Valle", path: "/spa-para-hombres-del-valle" },
  ]),
]

export default function SpaDelVallePage() {
  return (
    <ZonePage
      trackerName="Spa Del Valle"
      waPage="spa cerca de Del Valle"
      jsonLd={jsonLd}
      eyebrow="Del Valle · Nápoles · Narvarte, CDMX"
      h1="Spa para Hombres en Del Valle — Dos Sucursales a Minutos de Ti"
      heroText="Vivir en Del Valle tiene una ventaja que pocos conocen: estás exactamente entre nuestras dos sucursales. Roma Norte al norte, Coyoacán al sur — ambas a unos 15 minutos. Masajes sensoriales, relajantes y tántricos exclusivos para hombres, en cabinas privadas y con total discreción."
      heroImage="/man-relaxing-spa-treatment-massage.jpg"
      heroImageAlt="ElementSpa — Spa masculino cerca de Del Valle, CDMX"
      heroCtaLabel="Reservar cerca de Del Valle"
      aboutTitle="La mejor ubicación de CDMX para relajarte"
      aboutParagraphs={[
        "Del Valle, Nápoles y Narvarte son de las zonas mejor conectadas de la ciudad — y eso juega a tu favor. Por Insurgentes llegas a nuestra sucursal de Roma Norte; por División del Norte o Universidad, a la de Coyoacán. Elige la que te acomode según tu día.",
        "En ambas te espera lo mismo: cabinas privadas con aromaterapia, iluminación tenue y terapeutas profesionales especializadas en experiencias de masaje para hombres, desde lo relajante hasta lo intensamente sensorial.",
      ]}
      aboutImage="/zen-spa-stone-arrangement-minimalist.jpg"
      aboutImageAlt="Ambiente zen en ElementSpa, cerca de Del Valle"
      locationLine="Roma Norte y Coyoacán — ambas a ~15 min de Del Valle"
      servicesTitle="Nuestros servicios cerca de Del Valle"
      servicesIntro="Las 6 experiencias de masaje de ElementSpa disponibles en las dos sucursales cercanas a Del Valle. Elige la tuya y reserva por WhatsApp."
      benefitsTitle="Por qué los caballeros de Del Valle nos eligen"
      benefits={[
        "Dos sucursales cercanas: Roma Norte y Coyoacán, tú eliges",
        "Trayectos de 10-15 minutos por Insurgentes, División del Norte o Universidad",
        "Cabinas 100% privadas con aromaterapia e iluminación ambiental",
        "Terapeutas experimentadas que combinan técnica y sensibilidad",
        "Reserva rápida por WhatsApp sin intermediarios ni esperas",
        "Total discreción: sin registros ni membresías",
      ]}
      faqTitle="Preguntas de clientes de Del Valle"
      faqs={faqs}
      finalTitle="Elige tu sucursal y reserva hoy"
      finalText="Roma Norte o Coyoacán — cualquiera de las dos te queda a minutos. Reserva por WhatsApp y vive la experiencia ElementSpa hoy mismo."
    />
  )
}
