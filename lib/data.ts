export const locations = {
  condesa: {
    name: "Roma Norte",
    whatsapp: "+525516793129",
  },
  coyoacan: {
    name: "Coyoacán",
    whatsapp: "+525645886177",
  },
}

export const extraServices = {
  extra_10_min: {
    name: "10 min. extra",
    price: 300,
  },
  extra_stimulation: {
    name: "1 estimulación extra",
    price: 350,
  },
}

export interface ServiceOption {
  name: string
  time: string
  price: string
  estimulations: number
  description?: string
}

export interface Service {
  id: number
  title: string
  price?: string
  time?: string
  description: string
  estimulations?: number
  iconType: string
  options?: ServiceOption[]
}

export const services: Service[] = [
  {
    id: 1,
    title: "CARICIAS DEL ALMA",
    price: "$1,100",
    time: "30 min",
    description:
      "Una experiencia rápida pero profundamente provocativa. Caricias muy suaves con las yemas de los dedos y uñas que recorren todo tu cuerpo y despiertan cada fibra de tu piel. Perfecto para encender tus sentidos en pocos minutos.\n\n*Este servicio no es un masaje, si esperas recibir un masaje te recomiendo elegir la siguiente opción.",
    estimulations: 1,
    iconType: "feather",
  },
  {
    id: 2,
    title: "CONEXIÓN ESENCIAL",
    price: "$1,350",
    time: "50 min",
    description:
      "Comienza como un masaje relajante de cuerpo completo y termina como una fantasía cumplida. Este masaje evoluciona con delicadeza, una presión perfecta y un ritmo envolvente hacia un toque final que libera mucho más que tensión.",
    estimulations: 1,
    iconType: "infinity",
  },
  {
    id: 3,
    title: "ENERGÍA VITAL",
    price: "$1,550",
    time: "50 min",
    description:
      "Es un masaje descontracturante que mediante movimientos firmes, profundos y liberadores recorren todo tu cuerpo liberando el estrés, aflojando tus músculos y poco a poco despertando deseos. Es la combinación perfecta entre fuerza, técnica y un final estimulante.",
    estimulations: 1,
    iconType: "flame",
  },
  {
    id: 4,
    title: "PIEL A PIEL",
    iconType: "heart",
    description:
      "La experiencia que despierta cada rincón de tu cuerpo comienza con suaves estímulos mientras estas boca abajo; son objetos delicados que recorren tu piel provocando despertar tus sentidos y preparando tu cuerpo para lo que viene. Una vez listo, la terapeuta se deslizará sobre de ti en topless utilizando todo su cuerpo (torso, pecho, brazos y piernas) para darte un masaje íntimo, intenso y muy sensual. Después de unos minutos, la terapeuta te pedirá que gires para continuar con tu masaje piel a piel hasta provocar tu erección y estimularte con sus manos.",
    options: [
      {
        name: "Opción 50 min",
        time: "50 min",
        price: "$2,250",
        estimulations: 1,
        description: "Experiencia completa de 50 minutos.",
      },
      {
        name: "Opción 60 min",
        time: "60 min",
        price: "$2,500",
        estimulations: 1,
        description: "Disfruta de 10 minutos adicionales para mayor placer.",
      },
    ],
  },
  {
    id: 5,
    title: "FANTASÍA COMPARTIDA",
    iconType: "stars",
    description:
      "Cumple uno de los deseos más prohibidos. Comienza dándole un masaje a tu terapeuta mientras ella te guía con el cuerpo semi desnudo (topless), creando una conexión íntima y única. Después, te relajarás por completo mientras ella toma el control y te brinda un masaje piel a piel caracterizado por la sensualidad y lo estimulante que transformará el momento hasta llevarte a un completo estado de éxtasis y terminando con tu eyaculación.",
    options: [
      {
        name: "Opción 50 min",
        time: "50 min",
        price: "$3,000",
        estimulations: 1,
      },
      {
        name: "Opción 65 min",
        time: "65 min",
        price: "$3,500",
        estimulations: 1,
      },
    ],
  },
  {
    id: 6,
    title: "MASAJE 4 MANOS",
    iconType: "lotus",
    description:
      "Doble contacto, doble placer. Déjate llevar por una experiencia incomparable donde dos terapeutas en topless sincronizan sus cuerpos para despertar todos tus sentidos. En este masaje ambas recorrerán cada parte de tu cuerpo con el suyo dejándote tocar y echando a andar tu imaginación para mantener tu erección el mayor tiempo posible hasta llegar a una estimulación coordinada para que puedas disfrutar de un estado de placer absoluto.",
    options: [
      {
        name: "Opción 50 min",
        time: "50 min",
        price: "$4,000",
        estimulations: 1,
      },
      {
        name: "Opción 70 min",
        time: "70 min",
        price: "$5,000",
        estimulations: 1,
      },
    ],
  },
]

export function getWhatsAppLink(phone: string, message: string) {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phone.replace(/\+/g, "")}?text=${encodedMessage}`
}
