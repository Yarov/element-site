"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageCircle, CheckCircle } from "lucide-react"
import { LocationSelector } from "@/components/location-selector"
import { buildWhatsAppMessage } from "@/lib/data"
import type { MarketingComponent } from "@/lib/marketing/model"
import { getActiveComponent, trackMarketingEvent, type ActiveComponent } from "@/lib/marketing/client"

export function Hero() {
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [campaign, setCampaign] = useState<MarketingComponent | null>(null)
  const [activeCampaign, setActiveCampaign] = useState<ActiveComponent | null>(null)

  useEffect(() => {
    void getActiveComponent("home.hero").then((active) => {
      if (!active) return
      setCampaign(active.component)
      setActiveCampaign(active)
      trackMarketingEvent(active, "impression")
    })
  }, [])

  const handleReservar = () => {
    if (campaign?.ctaHref) {
      if (activeCampaign) trackMarketingEvent(activeCampaign, "click")
      window.location.assign(campaign.ctaHref)
      return
    }
    setShowLocationSelector(true)
  }

  return (
    <>
      <section id="inicio" className="relative min-h-screen flex items-center pt-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={campaign?.imageUrl || "/dark-luxury-spa-massage-room-with-candles-ambient-.jpg"}
            alt="ElementSpa — Spa exclusivo para hombres en CDMX con ambiente de lujo"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-2xl">
            <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">
              {campaign ? "Experiencia personalizada" : "Experiencias exclusivas para caballeros"}
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-tight text-balance mb-6">
              {campaign?.title ?? "Spa Exclusivo para Hombres en CDMX"}
              <span className="sr-only"> — Masajes Sensuales y Relajantes en Roma Norte y Coyoacán</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed mb-6">
              {campaign?.body ?? "Déjate llevar por una experiencia donde el placer, la relajación y la conexión con tu cuerpo se convierten en un solo momento. Terapeutas profesionales, ambiente discreto y atención personalizada en cada visita."}
            </p>

            {/* Microbeneficios */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                Atención inmediata
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                Horarios extendidos
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                Privacidad 100%
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleReservar}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                {campaign?.ctaLabel ?? "Reservar por WhatsApp"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-base border-foreground/20 hover:bg-secondary bg-transparent"
                asChild
              >
                <a href="#servicios">Ver todos los servicios</a>
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
        message={buildWhatsAppMessage({ page: "spa para hombres en CDMX" })}
      />
    </>
  )
}
