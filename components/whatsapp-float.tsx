"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { LocationSelector } from "@/components/location-selector"
import { buildWhatsAppMessage, getLocationKeyFromPath } from "@/lib/data"

export function WhatsAppFloat() {
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        onClick={() => setShowLocationSelector(true)}
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20BD5A] transition-all hover:scale-105 active:scale-95"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <LocationSelector
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        message={buildWhatsAppMessage()}
        defaultLocation={getLocationKeyFromPath(pathname)}
      />
    </>
  )
}
