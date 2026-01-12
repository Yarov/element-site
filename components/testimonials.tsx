"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "La experiencia en ElementSpa superó todas mis expectativas. El ambiente es increíblemente discreto y las terapeutas son verdaderas profesionales. Definitivamente mi lugar favorito.",
    author: "Carlos M.",
    location: "Roma Norte",
  },
  {
    quote:
      "He probado varios lugares en CDMX y ninguno se compara. La atención al detalle, el ambiente y la calidad del servicio son de otro nivel. 100% recomendado.",
    author: "Roberto L.",
    location: "Coyoacán",
  },
  {
    quote:
      "El masaje Piel a Piel fue una experiencia que nunca olvidaré. La discreción y profesionalismo me hicieron sentir completamente cómodo desde el primer momento.",
    author: "Andrés G.",
    location: "Roma Norte",
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length)
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section id="testimonios" className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          <div className="lg:w-1/3">
            <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">Testimonios</p>
            <h2 className="text-4xl md:text-5xl font-serif leading-tight">Lo que dicen nuestros clientes</h2>
          </div>

          <div className="lg:w-2/3">
            <div className="relative">
              <Quote className="h-12 w-12 text-primary/30 mb-6" />
              <blockquote className="text-2xl md:text-3xl font-serif leading-relaxed mb-8 text-balance">
                {testimonials[current].quote}
              </blockquote>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{testimonials[current].author}</p>
                  <p className="text-sm text-muted-foreground">Sucursal {testimonials[current].location}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={prev}
                    className="p-3 border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
                    aria-label="Testimonio anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={next}
                    className="p-3 border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
                    aria-label="Siguiente testimonio"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
