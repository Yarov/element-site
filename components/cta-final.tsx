"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LocationSelector } from "@/components/location-selector"
import { buildWhatsAppMessage } from "@/lib/data"

export function CTAFinal() {
  const [showLocationSelector, setShowLocationSelector] = useState(false)

  const handleReservar = () => {
    setShowLocationSelector(true)
  }

  return (
    <>
      <section className="py-24 bg-card">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif leading-tight mb-6 text-balance">
            Vive una experiencia de masaje exclusiva para hombres en CDMX
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
            Reserva hoy y descubre por qué cientos de caballeros eligen ElementSpa como su espacio de
            relajación y bienestar. Atención inmediata por WhatsApp.
          </p>
          <Button
            size="lg"
            onClick={handleReservar}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            Reservar por WhatsApp
          </Button>
        </div>
      </section>

      <LocationSelector
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        message={buildWhatsAppMessage({ page: "spa para hombres en CDMX" })}
      />
    </>
  )
}
