import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { resumeData } from "@/lib/resume-data"
import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"
import { ProjectCard } from "@/components/site/project-card"

export const metadata: Metadata = {
  title: `项目 · ${resumeData.profile.name}`,
  description: "我参与和主导的项目作品集。",
}

export default function ProjectsPage() {
  const { projects } = resumeData

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-50">
          项目作品
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
          共 {projects.length} 个项目，点击卡片查看详情。
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
