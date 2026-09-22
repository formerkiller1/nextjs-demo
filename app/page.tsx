import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"
import { Hero } from "@/components/site/sections/hero"
import { About } from "@/components/site/sections/about"
import { Skills } from "@/components/site/sections/skills"
import { Experience } from "@/components/site/sections/experience"
import { ProjectsPreview } from "@/components/site/sections/projects-preview"
import { Contact } from "@/components/site/sections/contact"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <ProjectsPreview />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
