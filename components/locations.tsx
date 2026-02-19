"use client"

import { MapPin, MessageCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { locations, getWhatsAppLink } from "@/lib/data"

const sucursales = [
  {
    id: "condesa",
    name: "Roma Norte",
    address: "Zona Roma Norte, CDMX",
    whatsapp: locations.condesa.whatsapp,
    hours: "Lun - Dom: 11:00 - 22:00",
  },
  {
    id: "coyoacan",
    name: "Coyoacán",
    address: "Zona Coyoacán, CDMX",
    whatsapp: locations.coyoacan.whatsapp,
    hours: "Lun - Dom: 11:00 - 22:00",
  },
]

export function Locations() {
  const handleContactar = (whatsapp: string, sucursal: string) => {
    window.open(getWhatsAppLink(whatsapp, `Hola, me gustaría agendar una cita en la sucursal ${sucursal}.`), "_blank")
  }

  return (
    <section id="sucursales" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">Nuestras Sucursales</p>
          <h2 className="text-4xl md:text-5xl font-serif leading-tight mb-4">Encuéntranos en CDMX</h2>
          <p className="text-muted-foreground">
            Dos ubicaciones exclusivas diseñadas para tu comodidad y discreción total.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {sucursales.map((sucursal) => (
            <div
              key={sucursal.id}
              className="bg-card border border-border p-8 rounded hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif mb-1">{sucursal.name}</h3>
                  <p className="text-muted-foreground">{sucursal.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{sucursal.hours}</span>
              </div>

              <Button
                onClick={() => handleContactar(sucursal.whatsapp, sucursal.name)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Contactar por WhatsApp
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
