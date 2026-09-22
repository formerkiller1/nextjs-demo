import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { resumeData } from "@/lib/resume-data"
import { SectionWrapper } from "@/components/site/sections/section-wrapper"
import { ProjectCard } from "@/components/site/project-card"

export function ProjectsPreview() {
  const featured = resumeData.projects.filter((p) => p.featured)
  const list = featured.length > 0 ? featured : resumeData.projects.slice(0, 2)

  return (
    <SectionWrapper id="projects" title="精选项目">
      <div className="grid gap-6 sm:grid-cols-2">
        {list.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
      <Link
        href="/projects"
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400"
      >
        查看全部项目
        <ArrowRight className="h-4 w-4" />
      </Link>
    </SectionWrapper>
  )
}
