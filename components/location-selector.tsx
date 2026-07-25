"use client"

import { useEffect, useMemo, useState } from "react"
import { X, MapPin, MessageCircle, Clock } from "lucide-react"
import { locations, services, getWhatsAppLink, trackWhatsAppClick, getSuggestedTimeSlots } from "@/lib/data"

interface LocationSelectorProps {
  isOpen: boolean
  onClose: () => void
  message: string
  servicio?: string
}

export function LocationSelector({ isOpen, onClose, message, servicio }: LocationSelectorProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedServicio, setSelectedServicio] = useState<string | null>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recalcular "ahora" cada vez que se abre el modal
  const schedule = useMemo(() => getSuggestedTimeSlots(), [isOpen])

  useEffect(() => {
    if (isOpen) {
      setSelectedSlot(null)
      setSelectedServicio(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Si quien abrió el modal ya sabe el servicio (ej. desde el acordeón de
  // servicios), no lo volvemos a preguntar.
  const askServicio = !servicio

  const handleSelectLocation = (whatsapp: string, locationName: string) => {
    let finalMessage = message.replace("{sucursal}", locationName)
    if (askServicio && selectedServicio) {
      finalMessage += `\nMe interesa: ${selectedServicio}.`
    }
    if (selectedSlot) {
      const cuando = schedule.day === "mañana" ? " mañana" : ""
      finalMessage += `\nMe gustaría un horario cerca de las ${selectedSlot}${cuando} (o el que tengan disponible).`
    } else if (schedule.day === "mañana") {
      // Ya no hay horario hoy — no preguntamos "hoy o mañana", ya sabemos la respuesta.
      finalMessage += "\nSé que ya es tarde por hoy, ¿tienen disponibilidad mañana?"
    } else {
      finalMessage += "\n¿Tienen disponibilidad hoy?"
    }
    const waUrl = getWhatsAppLink(whatsapp, finalMessage)
    trackWhatsAppClick(locationName, waUrl, servicio || selectedServicio || undefined)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 max-h-[85vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-serif mb-2">Selecciona tu Sucursal</h3>
          <p className="text-sm text-muted-foreground">Elige la ubicación más conveniente para ti</p>
        </div>

        {/* Servicio de interés — opcional. Mismo lenguaje visual que el
            horario de abajo (chips), no un acordeón. Solo si el CTA que
            abrió el modal no traía ya un servicio elegido. */}
        {askServicio && (
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2">¿Qué servicio te interesa? (opcional)</p>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedServicio((prev) => (prev === s.title ? null : s.title))}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    selectedServicio === s.title
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Horario sugerido */}
        {schedule.slots.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {schedule.day === "mañana"
                ? "Ya cerramos por hoy — horario sugerido para mañana (opcional)"
                : "Horario sugerido para hoy (opcional)"}
            </p>
            <div className="flex flex-wrap gap-2">
              {schedule.slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot((prev) => (prev === slot ? null : slot))}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    selectedSlot === slot
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Location options */}
        <div className="space-y-3">
          {Object.entries(locations).map(([key, location]) => (
            <button
              key={key}
              onClick={() => handleSelectLocation(location.whatsapp, location.name)}
              className="w-full p-4 bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/50 rounded-lg transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium group-hover:text-primary transition-colors">{location.name}</p>
                  <p className="text-xs text-muted-foreground">CDMX</p>
                </div>
              </div>
              <MessageCircle className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground mt-6">Serás redirigido a WhatsApp para continuar</p>
      </div>
    </div>
  )
}
