import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, MessageCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacidad, Seguridad y Reservas",
  description:
    "Cómo funciona la reserva privada de ElementSpa, por qué compartimos la ubicación por WhatsApp y qué puedes esperar antes de tu cita.",
  alternates: {
    canonical: "/privacidad-seguridad-y-reservas",
  },
}

export default function PrivacySecurityPage() {
  return (
    <main className="min-h-screen bg-background py-24 px-6">
      <article className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">ElementSpa</p>
        <h1 className="text-4xl md:text-5xl font-serif mb-6">Privacidad, seguridad y reservas</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-12">
          ElementSpa es un espacio privado de masajes para hombres adultos en Ciudad de México. Operamos desde hace
          más de cinco años y atendemos con reserva previa en Roma Norte y Coyoacán.
        </p>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Por qué la ubicación es privada</h2>
            <p>
              No publicamos la dirección exacta para proteger la discreción y seguridad de nuestros clientes. Primero
              confirmamos el servicio, la sucursal y el horario por el WhatsApp oficial; después compartimos las
              indicaciones necesarias para llegar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Cómo reservar</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Escribe al WhatsApp oficial +52 56 4711 4561.</li>
              <li>Indica la sucursal que prefieres y el servicio que te interesa.</li>
              <li>Confirma disponibilidad, horario, precio y las indicaciones de llegada.</li>
              <li>Antes de comenzar, comunica tus expectativas y cualquier límite o preferencia.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Qué puedes esperar</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Atención exclusiva para hombres adultos.</li>
              <li>Cabinas privadas y atención discreta.</li>
              <li>Servicios y precios informados antes de confirmar.</li>
              <li>Pago en la sucursal con efectivo o tarjeta.</li>
              <li>Respeto mutuo, consentimiento y límites comunicados durante la experiencia.</li>
              <li>Sin necesidad de crear una cuenta ni entregar una identificación.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Datos y comunicación</h2>
            <p>
              Para gestionar una cita usamos la información que compartes voluntariamente por WhatsApp, como tu nombre,
              teléfono, sucursal, servicio y horario. La conversación de WhatsApp puede permanecer en los sistemas de
              WhatsApp conforme a sus propias políticas. Consulta nuestro{" "}
              <Link href="/aviso-de-privacidad" className="text-primary hover:underline">
                Aviso de Privacidad
              </Link>{" "}
              para conocer el tratamiento de datos del sitio y tus derechos ARCO.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Canal oficial</h2>
            <p>
              El único número oficial para reservas es <strong className="text-foreground">+52 56 4711 4561</strong>.
              No envíes anticipos ni información personal a otros números que utilicen el nombre ElementSpa sin
              confirmarlo directamente.
            </p>
          </section>
        </div>

        <a
          href="https://wa.me/525647114561"
          className="mt-12 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <MessageCircle className="h-4 w-4" />
          Consultar por WhatsApp
        </a>
      </article>
    </main>
  )
}
