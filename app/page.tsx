import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"
import { Hero } from "@/components/site/sections/hero"
import { Services } from "@/components/site/sections/services"
import { ProjectsPreview } from "@/components/site/sections/projects-preview"
import { Process } from "@/components/site/sections/process"
import { Testimonials } from "@/components/site/sections/testimonials"
import { Skills } from "@/components/site/sections/skills"
import { About } from "@/components/site/sections/about"
import { Experience } from "@/components/site/sections/experience"
import { FAQ } from "@/components/site/sections/faq"
import { Contact } from "@/components/site/sections/contact"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main>
        <Hero />
        <ProjectsPreview />
        <Services />
        <Process />
        <Testimonials />
        <Skills />
        <About />
        <Experience />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
