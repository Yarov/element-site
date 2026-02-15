import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Aviso de Privacidad",
  description:
    "Aviso de Privacidad Integral de ElementSpa. Conoce cómo protegemos tus datos personales conforme a la Ley Federal de Protección de Datos Personales.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AvisoDePrivacidad() {
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

        <h1 className="text-4xl md:text-5xl font-serif mb-4">Aviso de Privacidad Integral</h1>
        <p className="text-sm text-muted-foreground mb-12">Última actualización: Febrero de 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">ElementSpa</strong>, con domicilio en las zonas de Roma Norte y
            Coyoacán, Ciudad de México, es el responsable del tratamiento de los datos personales que usted nos
            proporcione, los cuales serán protegidos conforme a lo dispuesto por la Ley Federal de Protección de Datos
            Personales en Posesión de los Particulares y demás normatividad aplicable.
          </p>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">1. Datos Personales que recabamos</h2>
            <p>
              Para llevar a cabo las finalidades descritas en el presente aviso, utilizaremos los siguientes datos:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong className="text-foreground">Datos de contacto:</strong> Nombre completo, número de teléfono
                (WhatsApp) y correo electrónico.
              </li>
              <li>
                <strong className="text-foreground">Datos de navegación:</strong> Dirección IP, cookies y datos
                analíticos de Google Analytics (para fines estadísticos y de mejora del sitio).
              </li>
              <li>
                <strong className="text-foreground">Información de preferencias:</strong> Preferencias de servicios de
                masaje y horarios de cita.
              </li>
            </ul>
            <p className="mt-4 border-l-2 border-primary pl-4">
              <strong className="text-foreground">Importante:</strong> ElementSpa no solicita ni almacena datos
              personales sensibles (como origen racial, estado de salud presente o futuro, información genética,
              creencias religiosas, filosóficas y morales, afiliación sindical, opiniones políticas o preferencia
              sexual).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">2. Finalidades del tratamiento</h2>
            <p>Los datos recabados serán utilizados para las siguientes finalidades necesarias para el servicio:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Agendar, confirmar y gestionar sus citas de masaje.</li>
              <li>Brindar atención personalizada a través de WhatsApp o medios electrónicos.</li>
              <li>Informar sobre cambios en los servicios o sucursales.</li>
            </ul>
            <p className="mt-4">
              De manera adicional, utilizaremos su información para finalidades secundarias que nos permiten brindarle
              una mejor atención (usted puede oponerse a estas):
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Enviar promociones exclusivas y actualizaciones de servicios.</li>
              <li>
                Realizar encuestas de satisfacción para mejorar la experiencia en nuestras sucursales de Roma Norte y
                Coyoacán.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">3. Transferencia de Datos</h2>
            <p>
              ElementSpa se compromete a no transferir su información personal a terceros ajenos a la empresa, salvo en
              los casos previstos por la Ley o por requerimiento de autoridad competente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">
              4. Derechos ARCO (Acceso, Rectificación, Cancelación u Oposición)
            </h2>
            <p>
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las
              condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su
              información (Rectificación), que la eliminemos de nuestros registros (Cancelación) u oponerse al uso de
              sus datos para fines específicos (Oposición).
            </p>
            <p className="mt-3">
              Para el ejercicio de cualquiera de los derechos ARCO, usted deberá enviar una solicitud a través de
              nuestro WhatsApp oficial o al correo electrónico de contacto disponible en nuestro sitio web,
              especificando su nombre y el derecho que desea ejercer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">5. Uso de Cookies</h2>
            <p>
              Le informamos que en nuestra página de internet utilizamos cookies y otras tecnologías para monitorear su
              comportamiento como usuario, brindarle un mejor servicio y experiencia al navegar en nuestra página. Los
              datos personales que obtenemos de estas tecnologías son: identificadores de sesión, región desde donde nos
              visita y tipo de navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">6. Cambios al Aviso de Privacidad</h2>
            <p>
              Nos reservamos el derecho de efectuar en cualquier momento modificaciones o actualizaciones al presente
              aviso de privacidad, para la atención de novedades legislativas o políticas internas. Estas modificaciones
              estarán disponibles al público a través de nuestro sitio web.
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
