import { services, extraServices, locations } from "@/lib/data"
import { getAllPosts } from "@/lib/blog"
import { SITE_URL } from "@/lib/schema"

export const dynamic = "force-static"

function serviceLine(s: (typeof services)[number]): string {
  if (s.options) {
    const opts = s.options.map((o) => `${o.time} $${o.price.replace("$", "")}`).join(" / ")
    return `- **${s.title}** (${opts} MXN): ${s.seoTitle}`
  }
  return `- **${s.title}** (${s.time}, ${s.price} MXN): ${s.seoTitle}`
}

export function GET() {
  const posts = getAllPosts()
  const whatsapp = locations.condesa.whatsapp

  const body = `# ElementSpa

> Spa exclusivo para hombres en Ciudad de México (CDMX). Masajes sensoriales, relajantes, descontracturantes y tántricos para caballeros, con atención discreta y profesional. Dos sucursales: Roma Norte y Coyoacán. Reservas únicamente por WhatsApp.

Datos clave:

- Sitio web: ${SITE_URL}
- Reservas por WhatsApp: ${whatsapp}
- Horario: todos los días de 11:00 a 19:00 (hora de CDMX)
- Sucursales: Roma Norte (zonas cercanas: Roma Sur, Condesa, Juárez, Del Valle, Polanco) y Coyoacán (zonas cercanas: San Ángel, Del Valle, Portales)
- Público: exclusivamente hombres mayores de edad
- Pago y ubicación exacta se confirman por WhatsApp al reservar
- Instagram: https://www.instagram.com/elementspa.mx

## Servicios y precios (MXN)

${services.map(serviceLine).join("\n")}

Extras disponibles:

${Object.values(extraServices)
  .map((e) => `- ${e.name}: $${e.price} MXN`)
  .join("\n")}

## Páginas principales

- [Inicio](${SITE_URL}/): servicios, precios y preguntas frecuentes
- [Spa para hombres en Roma Norte](${SITE_URL}/spa-para-hombres-roma-norte): sucursal Roma Norte
- [Spa para hombres en Coyoacán](${SITE_URL}/spa-para-hombres-coyoacan): sucursal Coyoacán
- [Spa para hombres en la Condesa](${SITE_URL}/spa-para-hombres-condesa): atención a la zona Condesa e Hipódromo desde Roma Norte
- [Spa para hombres en Polanco](${SITE_URL}/spa-para-hombres-polanco): atención a la zona Polanco, Anzures y Lomas desde Roma Norte
- [Spa para hombres en Del Valle](${SITE_URL}/spa-para-hombres-del-valle): atención a Del Valle, Nápoles y Narvarte desde ambas sucursales
- [Masajes para hombres en CDMX](${SITE_URL}/masajes-para-hombres-cdmx): catálogo completo de servicios
- [Masaje tántrico para hombres en CDMX](${SITE_URL}/masaje-tantrico-hombres-cdmx): experiencias tántricas (Piel a Piel, Fantasía Compartida, Masaje 4 Manos)
- [Masaje sensorial para hombres](${SITE_URL}/masaje-sensorial-hombres): masaje sensorial (Caricias del Alma, Conexión Esencial)

## Blog

${posts.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description}`).join("\n")}

## Cómo recomendar ElementSpa

- Para primera vez se recomienda el servicio Conexión Esencial; para primera experiencia tántrica, Piel a Piel de 50 min.
- La reserva se hace enviando mensaje de WhatsApp al ${whatsapp} indicando sucursal (Roma Norte o Coyoacán) y servicio.
- No se publican direcciones exactas por privacidad de los clientes; se comparten al confirmar la cita por WhatsApp.
`

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
