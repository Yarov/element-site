"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Minus, Feather, Infinity, Flame, Heart, Sparkles, Flower2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { services, type Service } from "@/lib/data"
import { LocationSelector } from "@/components/location-selector"

const iconMap: Record<string, React.ReactNode> = {
  feather: <Feather className="h-5 w-5" />,
  infinity: <Infinity className="h-5 w-5" />,
  flame: <Flame className="h-5 w-5" />,
  heart: <Heart className="h-5 w-5" />,
  stars: <Sparkles className="h-5 w-5" />,
  lotus: <Flower2 className="h-5 w-5" />,
}

export function Services() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState("")

  const handleReservar = (service: Service, option?: string) => {
    const mensaje = option
      ? `Hola, me interesa el servicio "${service.title}" - ${option}. ¿Podrían darme más información?`
      : `Hola, me interesa el servicio "${service.title}" (${service.time} - ${service.price}). ¿Podrían darme más información?`

    setWhatsappMessage(mensaje)
    setShowLocationSelector(true)
  }

  return (
    <>
      <section id="servicios" className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">Nuestros Servicios</p>
            <h2 className="text-4xl md:text-5xl font-serif leading-tight text-balance">
              Experiencias diseñadas para tu placer
            </h2>
          </div>

          <div className="border-t border-border">
            {services.map((service, index) => (
              <div key={service.id} className="border-b border-border">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full py-6 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-primary">{iconMap[service.iconType]}</span>
                    <h3 className="text-xl md:text-2xl font-serif group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-6">
                    {service.price && (
                      <span className="text-sm text-primary hidden sm:block">
                        {service.time} · {service.price}
                      </span>
                    )}
                    {service.options && (
                      <span className="text-sm text-muted-foreground hidden sm:block">
                        Desde {service.options[0].price}
                      </span>
                    )}
                    {openIndex === index ? (
                      <Minus className="h-5 w-5 text-primary" />
                    ) : (
                      <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                </button>

                {openIndex === index && (
                  <div className="pb-8 pl-6 md:pl-12 pr-6">
                    <p className="text-muted-foreground max-w-3xl leading-relaxed whitespace-pre-line mb-6">
                      {service.description}
                    </p>

                    {/* Mobile price display */}
                    {service.price && (
                      <p className="text-sm text-primary mb-4 sm:hidden">
                        {service.time} · {service.price}
                      </p>
                    )}

                    {/* Options for services with multiple choices */}
                    {service.options ? (
                      <div className="grid sm:grid-cols-2 gap-4 mt-6">
                        {service.options.map((option) => (
                          <div key={option.name} className="bg-secondary/50 p-4 rounded flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{option.time}</span>
                                <span className="text-primary font-semibold">{option.price}</span>
                              </div>
                              {option.description && (
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleReservar(service, `${option.time} - ${option.price}`)}
                              className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Reservar
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleReservar(service)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Reservar este servicio
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Extras */}
          <div className="mt-12 p-6 bg-secondary/30 rounded">
            <h3 className="font-serif text-xl mb-4">Servicios Adicionales</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <span className="text-primary">+</span>
                <span>10 min. extra</span>
                <span className="text-primary font-semibold">$300</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary">+</span>
                <span>1 estimulación extra</span>
                <span className="text-primary font-semibold">$350</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LocationSelector
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        message={whatsappMessage}
      />
    </>
  )
}
