import { CheckCircle } from "lucide-react"

const reasons = [
  "Ambiente 100% privado y discreto en cada sucursal",
  "Terapeutas capacitadas en técnicas sensoriales y relajantes",
  "Horario extendido: abierto los 7 días de 11:00 a 22:00",
  "Reserva fácil y rápida por WhatsApp, sin intermediarios",
  "Dos sucursales bien ubicadas en CDMX: Roma Norte y Coyoacán",
  "Más de 6 experiencias de masaje para elegir según tu estado de ánimo",
]

export function WhyChoose() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-sm tracking-[0.3em] text-primary uppercase mb-4">Nuestras Ventajas</p>
          <h2 className="text-4xl md:text-5xl font-serif leading-tight text-balance">
            Por qué elegir ElementSpa
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason) => (
            <div key={reason} className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed">{reason}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
