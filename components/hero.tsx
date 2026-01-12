"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { LocationSelector } from "@/components/location-selector"

export function Hero() {
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState("")

  const handleReservar = () => {
    setWhatsappMessage("Hola, me gustaría conocer más sobre los servicios de ElementSpa.")
    setShowLocationSelector(true)
  }

  return (
    <>
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/dark-luxury-spa-massage-room-with-candles-ambient-.jpg"
            alt="ElementSpa ambiente"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-2xl">
            <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">
              Experiencias exclusivas para caballeros
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-tight text-balance mb-6">
              Despierta tus sentidos
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed mb-8">
              Sumérgete en un mundo de sensaciones donde el placer y la relajación se fusionan. Masajes exclusivos en un
              ambiente discreto y sofisticado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleReservar}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Reservar por WhatsApp
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-base border-foreground/20 hover:bg-secondary bg-transparent"
                asChild
              >
                <a href="#servicios">Ver Servicios</a>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-12 mt-16 pt-8 border-t border-border">
              <div>
                <p className="text-3xl font-serif text-primary">2</p>
                <p className="text-sm text-muted-foreground mt-1">Sucursales CDMX</p>
              </div>
              <div>
                <p className="text-3xl font-serif text-primary">6</p>
                <p className="text-sm text-muted-foreground mt-1">Experiencias Únicas</p>
              </div>
              <div>
                <p className="text-3xl font-serif text-primary">100%</p>
                <p className="text-sm text-muted-foreground mt-1">Discreción</p>
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
