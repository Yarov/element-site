"use client"

import { useEffect, useMemo, useState } from "react"
import { X, MapPin, MessageCircle, Clock, Check } from "lucide-react"
import { locations, services, getWhatsAppLink, trackWhatsAppClick, getSuggestedTimeSlots, getServiceDetail } from "@/lib/data"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

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

  // Mobile: chips compactos (poco espacio vertical). Desktop: tarjetas
  // completas con duración y precio — hay espacio de sobra y el precio
  // ayuda a decidir, no solo a filtrar.
  const servicioPickerMobile = askServicio && (
    <div className="mb-6">
      <p className="text-xs text-muted-foreground mb-2">Elige tu experiencia ideal (opcional)</p>
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

  const servicioPickerDesktop = askServicio && (
    <div className="mb-6">
      <p className="text-xs text-muted-foreground mb-3">Elige tu experiencia ideal (opcional)</p>
      <div className="grid grid-cols-2 gap-2">
        {services.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedServicio((prev) => (prev === s.title ? null : s.title))}
            className={`p-3 rounded-lg border text-left transition-all flex items-start justify-between gap-2 ${
              selectedServicio === s.title
                ? "bg-primary/10 border-primary"
                : "bg-secondary/50 border-border hover:border-primary/50"
            }`}
          >
            <div>
              <p className="text-sm font-medium leading-tight">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{getServiceDetail(s)}</p>
            </div>
            {selectedServicio === s.title && <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
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
          ? "Hoy ya cerramos, pero mañana con gusto te esperamos — elige tu horario (opcional)"
          : "Elige el horario que más te acomode (opcional)"}
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
              <p className="text-xs text-muted-foreground">{location.area}</p>
            </div>
          </div>
          <MessageCircle className="h-5 w-5 text-primary shrink-0" />
        </button>
      ))}
    </div>
  )

  // Sucursal va primero y siempre visible sin scroll — es la única acción
  // que de verdad completa el flujo. Servicio y horario son refinamiento
  // opcional debajo; validado con 3 revisiones de UX independientes.
  const reassurance = (
    <p className="text-xs text-center text-muted-foreground">Te responderemos al instante por WhatsApp</p>
  )

  // Mobile: bottom sheet nativo (vaul). Sucursal queda fuera de la zona con
  // scroll, así que siempre está a la vista sin depender de cuánto crezca
  // el contenido opcional de abajo.
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DrawerTitle className="font-serif text-xl font-normal">Vive tu Experiencia ElementSpa</DrawerTitle>
                <DrawerDescription>Elige la sucursal donde quieres reservar</DrawerDescription>
              </div>
              <DrawerClose className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1">
                <X className="h-5 w-5" />
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="px-4 space-y-3">
            {locationButtons}
            {reassurance}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 mt-4 border-t border-border pt-4">
            {servicioPickerMobile}
            {horarioPicker}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  // Desktop: Dialog de Radix (ya usado en el resto del proyecto). Bloqueo de
  // scroll del body, trampa de foco, cierre con Escape y aria-* vienen
  // resueltos por la librería en vez de reinventados a mano.
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="font-serif text-xl font-normal">Vive tu Experiencia ElementSpa</DialogTitle>
          <DialogDescription>Elige la sucursal donde quieres reservar</DialogDescription>
        </DialogHeader>

        {locationButtons}
        {reassurance}

        <div className="border-t border-border pt-4 space-y-4">
          {servicioPickerDesktop}
          {horarioPicker}
        </div>
      </DialogContent>
    </Dialog>
  )
}
