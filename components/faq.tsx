"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "¿Qué tipo de masajes ofrecen en ElementSpa?",
    answer:
      "Ofrecemos 6 experiencias de masaje exclusivas para hombres: desde caricias sensoriales suaves hasta masajes descontracturantes profundos, experiencias tántricas piel a piel, masajes interactivos y sesiones a cuatro manos con dos terapeutas. Cada servicio está diseñado para combinar relajación, técnica profesional y estimulación sensorial.",
  },
  {
    question: "¿Es necesario hacer cita previa?",
    answer:
      "Sí, recomendamos agendar tu cita por WhatsApp para garantizar disponibilidad y brindarte la mejor atención. El proceso es rápido: elige tu sucursal, envíanos un mensaje y te confirmamos en minutos. Atendemos los 7 días de la semana de 11:00 a 22:00.",
  },
  {
    question: "¿Dónde están ubicados?",
    answer:
      "Contamos con dos sucursales en la Ciudad de México: una en la colonia Roma Norte y otra en Coyoacán. Ambas están ubicadas en zonas céntricas, seguras y de fácil acceso en transporte público o auto particular.",
  },
  {
    question: "¿Cómo garantizan la privacidad?",
    answer:
      "La discreción es uno de nuestros pilares. Nuestras instalaciones están diseñadas para ofrecer privacidad total: cabinas individuales, acceso discreto y atención personalizada. No compartimos información de nuestros clientes bajo ninguna circunstancia.",
  },
  {
    question: "¿Cuáles son los métodos de pago?",
    answer:
      "Aceptamos efectivo y tarjetas de crédito/débito. El pago se realiza directamente en la sucursal al finalizar tu servicio. Los precios incluyen todos los elementos de la experiencia sin cargos adicionales ocultos.",
  },
]

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-serif leading-tight">Preguntas Frecuentes</h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
