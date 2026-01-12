"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { locations, getWhatsAppLink } from "@/lib/data"
import { useGtagEvent } from "@/hooks/use-gtag-event"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const track = useGtagEvent()

  const handleReservar = () => {
    track("cta_reserve_click", {
      source: "header",
    })
    window.open(
      getWhatsAppLink(locations.condesa.whatsapp, "Hola, me gustaría agendar una cita en ElementSpa."),
      "_blank",
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif tracking-wide text-foreground">
            Element<span className="text-primary">Spa</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#servicios"
              className="text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Servicios
            </Link>
            <Link
              href="#sucursales"
              className="text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Sucursales
            </Link>
            <Link
              href="#testimonios"
              className="text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonios
            </Link>
          </nav>

          <div className="hidden md:block">
            <Button onClick={handleReservar} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6">
              Reservar Cita
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden py-4 flex flex-col gap-4">
            <Link
              href="#servicios"
              className="text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Servicios
            </Link>
            <Link
              href="#sucursales"
              className="text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Sucursales
            </Link>
            <Link
              href="#testimonios"
              className="text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Testimonios
            </Link>
            <Button
              onClick={handleReservar}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full mt-2"
            >
              Reservar Cita
            </Button>
          </nav>
        )}
      </div>
    </header>
  )
}
