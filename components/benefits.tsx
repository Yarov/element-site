import { Shield, Users, MapPin } from "lucide-react"

const benefits = [
  {
    icon: Shield,
    title: "Experiencia exclusiva para hombres",
    description:
      "Un espacio diseñado 100% para caballeros. Privacidad, discreción y un ambiente pensado para que te relajes sin preocupaciones.",
  },
  {
    icon: Users,
    title: "Terapeutas profesionales",
    description:
      "Nuestras terapeutas combinan técnica profesional con sensibilidad para ofrecerte una experiencia única e inolvidable.",
  },
  {
    icon: MapPin,
    title: "Sucursales en zonas premium",
    description:
      "Ubicados en Roma Norte y Coyoacán, dos de las zonas más accesibles y seguras de la Ciudad de México.",
  },
]

export function Benefits() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="text-center">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-5">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-serif mb-3">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
