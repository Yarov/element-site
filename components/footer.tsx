"use client"

import Link from "next/link"
import { Instagram, MessageCircle } from "lucide-react"
import { locations, getWhatsAppLink } from "@/lib/data"

export function Footer() {
  return (
    <footer className="bg-secondary py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="text-3xl font-serif tracking-wide mb-4 block">
              Element<span className="text-primary">Spa</span>
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Experiencias exclusivas de masajes para caballeros en CDMX. Discreción, profesionalismo y placer en cada
              visita.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-foreground">Sucursales</h4>
            <div className="flex flex-col gap-3">
              <a
                href={getWhatsAppLink(locations.condesa.whatsapp, "Hola, quiero agendar en Roma Norte")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Roma Norte
              </a>
              <a
                href={getWhatsAppLink(locations.coyoacan.whatsapp, "Hola, quiero agendar en Coyoacán")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Coyoacán
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-foreground">Síguenos</h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/elementspamx/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">© 2026 ElementSpa. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Aviso de Privacidad
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
