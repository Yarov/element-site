"use client"

import { useEffect, useMemo, useState } from "react"
import { X, MapPin, MessageCircle, Clock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  locations,
  services,
  getWhatsAppLink,
  trackWhatsAppClick,
  getSuggestedTimeSlots,
  getServiceDetail,
} from "@/lib/data"

export type LocationKey = keyof typeof locations

interface LocationSelectorProps {
  isOpen: boolean
  onClose: () => void
  message: string
  servicio?: string
  servicioDetalle?: string
  defaultLocation?: LocationKey
}

export function LocationSelector({
  isOpen,
  onClose,
  message,
  servicio,
  servicioDetalle,
  defaultLocation,
}: LocationSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationKey | null>(defaultLocation ?? null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedServicio, setSelectedServicio] = useState<string | null>(null)
  const [selectedOpcion, setSelectedOpcion] = useState<string | null>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recalcular "ahora" cada vez que se abre el modal
  const schedule = useMemo(() => getSuggestedTimeSlots(), [isOpen])

  useEffect(() => {
    if (isOpen) {
      setSelectedLocation(defaultLocation ?? null)
      setSelectedSlot(null)
      setSelectedServicio(null)
      setSelectedOpcion(null)
    }
  }, [isOpen, defaultLocation])

  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Si quien abrió el modal ya sabe el servicio (ej. desde el acordeón de
  // servicios), no lo volvemos a preguntar.
  const askServicio = !servicio

  const handleSelectServicio = (title: string) => {
    setSelectedServicio((prev) => (prev === title ? null : title))
    setSelectedOpcion(null)
  }

  const handleContinue = () => {
    if (!selectedLocation) return
    const location = locations[selectedLocation]

    let finalMessage = message.replace("{sucursal}", location.name)
    if (askServicio && selectedServicio) {
      const servicioData = services.find((s) => s.title === selectedServicio)
      const detalle = selectedOpcion || (servicioData ? getServiceDetail(servicioData) : "")
      finalMessage += `\nServicio: ${selectedServicio}${detalle ? ` (${detalle})` : ""}`
    }
    // "mañana" ya comunica que hoy cerró — no hace falta disculparse por la hora.
    const dia = schedule.day === "mañana" ? "mañana" : "hoy"
    if (selectedSlot) {
      finalMessage += `\nHorario: ${dia} cerca de las ${selectedSlot} (o el que tengan disponible)`
    } else {
      finalMessage += `\nHorario: ${dia}, ¿qué disponibilidad tienen?`
    }
    const waUrl = getWhatsAppLink(location.whatsapp, finalMessage)
    trackWhatsAppClick(location.name, waUrl, servicio || selectedServicio || undefined)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Reserva tu cita"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Sheet en mobile, modal centrado en desktop */}
      <div className="relative bg-card border border-border shadow-2xl w-full sm:max-w-md sm:mx-4 rounded-t-2xl sm:rounded-lg flex flex-col max-h-[90dvh] sm:max-h-[85vh] animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 fade-in-0 duration-300">
        {/* Drag handle (solo mobile) */}
        <div className="sm:hidden pt-3 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div>
            <h3 className="text-xl font-serif">Reserva tu cita</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Te confirmamos de inmediato por WhatsApp</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 -m-2 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-6">
          {/* Sucursal — requerida */}
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              ¿En qué sucursal?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(locations).map(([key, location]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedLocation(key as LocationKey)}
                  className={`min-h-14 p-3 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                    selectedLocation === key
                      ? "bg-primary/10 border-primary"
                      : "bg-secondary/50 border-border hover:border-primary/50"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{location.name}</p>
                    <p className="text-xs text-muted-foreground">CDMX</p>
                  </div>
                  {selectedLocation === key && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Horario sugerido */}
          {schedule.slots.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                {schedule.day === "mañana" ? "Horario para mañana" : "Horario para hoy"}
                <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
              </p>
              {schedule.day === "mañana" && (
                <p className="text-xs text-muted-foreground mb-2">Ya cerramos por hoy — estos son para mañana</p>
              )}
              <div className="flex flex-wrap gap-2">
                {schedule.slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot((prev) => (prev === slot ? null : slot))}
                    className={`min-h-11 px-4 rounded-full text-sm border transition-colors ${
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

          {/* Servicio ya elegido desde el CTA que abrió el modal — se muestra
              como resumen, solo queda completar lo demás. */}
          {!askServicio && (
            <div>
              <p className="text-sm font-medium mb-2">Tu servicio</p>
              <div className="p-3 rounded-lg border bg-primary/10 border-primary flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{servicio}</p>
                  {servicioDetalle && <p className="text-xs text-muted-foreground">{servicioDetalle}</p>}
                </div>
                <Check className="h-4 w-4 text-primary shrink-0" />
              </div>
            </div>
          )}

          {/* Servicio de interés — solo si el CTA que abrió el modal no traía ya
              un servicio elegido. */}
          {askServicio && (
            <div>
              <p className="text-sm font-medium mb-1">¿Qué servicio te interesa?</p>
              <p className="text-xs text-muted-foreground mb-3">Nos ayuda a confirmar tu cita más rápido (opcional)</p>
              <div className="space-y-2">
                {services.map((s) => (
                  <div key={s.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectServicio(s.title)}
                      className={`w-full min-h-14 p-3 rounded-lg border text-left transition-all flex items-center justify-between gap-3 ${
                        selectedServicio === s.title
                          ? "bg-primary/10 border-primary"
                          : "bg-secondary/50 border-border hover:border-primary/50"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{getServiceDetail(s)}</p>
                      </div>
                      {selectedServicio === s.title && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>

                    {/* Duración/precio para servicios con opciones */}
                    {selectedServicio === s.title && s.options && (
                      <div className="grid grid-cols-2 gap-2 mt-2 pl-3">
                        {s.options.map((option) => {
                          const value = `${option.time} - ${option.price}`
                          return (
                            <button
                              key={option.name}
                              type="button"
                              onClick={() => setSelectedOpcion((prev) => (prev === value ? null : value))}
                              className={`min-h-11 px-3 rounded-lg border text-sm transition-colors ${
                                selectedOpcion === value
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/50"
                              }`}
                            >
                              {option.time} · {option.price}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA sticky */}
        <div className="border-t border-border px-5 sm:px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
          <Button
            onClick={handleContinue}
            disabled={!selectedLocation}
            className="w-full h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            Continuar a WhatsApp
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            {selectedLocation ? "Serás redirigido a WhatsApp para confirmar" : "Elige una sucursal para continuar"}
          </p>
        </div>
      </div>
    </div>
  )
}
