"use client"

import { X, MapPin, MessageCircle } from "lucide-react"
import { locations, getWhatsAppLink } from "@/lib/data"

interface LocationSelectorProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

export function LocationSelector({ isOpen, onClose, message }: LocationSelectorProps) {
  if (!isOpen) return null

  const handleSelectLocation = (whatsapp: string) => {
    window.open(getWhatsAppLink(whatsapp, message), "_blank")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-2xl w-full max-w-md mx-4 p-6">
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

        {/* Location options */}
        <div className="space-y-3">
          {Object.entries(locations).map(([key, location]) => (
            <button
              key={key}
              onClick={() => handleSelectLocation(location.whatsapp)}
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
