"use client"

import { useEffect, useMemo, useState } from "react"
import { X, MapPin, MessageCircle, Clock } from "lucide-react"
import { locations, services, getWhatsAppLink, trackWhatsAppClick, getSuggestedTimeSlots } from "@/lib/data"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"

interface LocationSelectorProps {
  isOpen: boolean
  onClose: () => void
  message: string
  servicio?: string
}

export function LocationSelector({ isOpen, onClose, message, servicio }: LocationSelectorProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedServicio, setSelectedServicio] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recalcular "ahora" cada vez que se abre el modal
  const schedule = useMemo(() => getSuggestedTimeSlots(), [isOpen])

  useEffect(() => {
    if (isOpen) {
      setSelectedSlot(null)
      setSelectedServicio(null)
    }
  }, [isOpen])

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)")
    const update = () => setIsMobile(mql.matches)
    update()
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [])

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

  const servicioPicker = askServicio && (
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
  )

  const horarioPicker = schedule.slots.length > 0 && (
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
  )

  const locationButtons = (
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
  )

  // Mobile: bottom sheet nativo (vaul) — el picker de servicio/horario
  // vive en una zona con scroll propio; los botones de sucursal (la acción
  // real) quedan fijos en un footer que nunca se va con el scroll.
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DrawerTitle className="font-serif text-xl font-normal">Selecciona tu Sucursal</DrawerTitle>
                <DrawerDescription>Elige la ubicación más conveniente para ti</DrawerDescription>
              </div>
              <DrawerClose className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1">
                <X className="h-5 w-5" />
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="flex-1 min-h-0 overflow-y-auto px-4">
            {servicioPicker}
            {horarioPicker}
          </div>
          <DrawerFooter className="border-t border-border pt-4">
            {locationButtons}
            <p className="text-xs text-center text-muted-foreground pt-2">Serás redirigido a WhatsApp para continuar</p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  // Desktop: tarjeta centrada, como antes.
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-serif mb-2">Selecciona tu Sucursal</h3>
          <p className="text-sm text-muted-foreground">Elige la ubicación más conveniente para ti</p>
        </div>

        {servicioPicker}
        {horarioPicker}
        {locationButtons}

        <p className="text-xs text-center text-muted-foreground mt-6">Serás redirigido a WhatsApp para continuar</p>
      </div>
    </div>
  )
}
