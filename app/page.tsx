import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Benefits } from "@/components/benefits"
import { Services } from "@/components/services"
import { WhyChoose } from "@/components/why-choose"
import { Locations } from "@/components/locations"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { CTAFinal } from "@/components/cta-final"
import { Footer } from "@/components/footer"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { MarketingSlot } from "@/components/marketing-runtime"

export default function Home() {
  return (
      <main className="min-h-screen">
       <Header />
       <Hero />
       <MarketingSlot slot="home.banner" />
      <Benefits />
       <Services />
       <MarketingSlot slot="home.promo" />
      <WhyChoose />
      <Locations />
      <Testimonials />
      <FAQ />
      <CTAFinal />
      <Footer />
      <WhatsAppFloat />
    </main>
  )
}
