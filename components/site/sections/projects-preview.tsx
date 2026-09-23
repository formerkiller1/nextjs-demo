import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { resumeData } from "@/lib/resume-data"
import { SectionWrapper } from "@/components/site/sections/section-wrapper"
import { ProjectCard } from "@/components/site/project-card"

export function ProjectsPreview() {
  const featured = resumeData.projects.filter((p) => p.featured)
  const list = featured.length > 0 ? featured : resumeData.projects.slice(0, 2)

  return (
    <SectionWrapper
      id="projects"
      title="案例展示"
      subtitle="真实交付的作品。更多前后台成品案例正在陆续上线。"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {list.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
        {/* 案例较少时用占位卡片填充，并管理预期 */}
        <div className="flex min-h-[160px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            更多成品案例陆续上线
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            敬请期待，也欢迎加微信看更多在做的项目
          </p>
        </div>
      </div>
      <Link
        href="/projects"
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400"
      >
        查看全部案例
        <ArrowRight className="h-4 w-4" />
      </Link>
    </SectionWrapper>
  )
}
