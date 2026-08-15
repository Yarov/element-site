"use client"

import Link from "next/link"
import { Instagram, MessageCircle } from "lucide-react"

export function Footer() {

  return (
    <footer className="bg-secondary py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-12 mb-12">
          <div className="sm:col-span-2">
            <Link href="/" className="text-3xl font-serif tracking-wide mb-4 block">
              Element<span className="text-primary">Spa</span>
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Experiencias exclusivas de masajes para caballeros en CDMX. Discreción, profesionalismo y placer en cada
              visita.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-foreground">Servicios</h4>
            <div className="flex flex-col gap-3">
              <Link href="/masajes-para-hombres-cdmx" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Masajes para Hombres
              </Link>
              <Link href="/masaje-sensorial-hombres" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Masaje Sensorial
              </Link>
              <Link href="/masaje-tantrico-hombres-cdmx" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Masaje Tántrico
              </Link>
              <Link href="/masaje-ejecutivo-hombres-cdmx" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Masaje Ejecutivo
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-foreground">Sucursales y zonas</h4>
            <div className="flex flex-col gap-3">
              <Link href="/spa-para-hombres-roma-norte" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Roma Norte
              </Link>
              <Link href="/spa-para-hombres-coyoacan" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Coyoacán
              </Link>
              <Link href="/spa-para-hombres-condesa" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Condesa
              </Link>
              <Link href="/spa-para-hombres-polanco" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Polanco
              </Link>
              <Link href="/spa-para-hombres-del-valle" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Del Valle
              </Link>
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
            <Link href="/aviso-de-privacidad" className="text-muted-foreground hover:text-foreground transition-colors">
              Aviso de Privacidad
            </Link>
          </div>
        </div>

        <p className="text-muted-foreground/60 text-xs text-center mt-6">
          Atendiendo caballeros en:{" "}
          <Link href="/spa-para-hombres-roma-norte" className="hover:text-primary transition-colors">Roma Norte</Link>, Roma Sur,{" "}
          <Link href="/spa-para-hombres-condesa" className="hover:text-primary transition-colors">Condesa</Link>,{" "}
          <Link href="/spa-para-hombres-coyoacan" className="hover:text-primary transition-colors">Coyoacán</Link>,{" "}
          <Link href="/spa-para-hombres-del-valle" className="hover:text-primary transition-colors">Del Valle</Link>,{" "}
          <Link href="/spa-para-hombres-polanco" className="hover:text-primary transition-colors">Polanco</Link> y San Ángel.
        </p>
      </div>
    </footer>
  )
}
