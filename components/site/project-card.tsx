import { ExternalLink } from "lucide-react"
import type { Project } from "@/types/resume"

// 可复用项目卡片：首页预览与 /projects 列表共用，点击整卡跳外链
export function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-50 dark:group-hover:text-blue-400">
          {project.name}
        </h3>
        <ExternalLink className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400" />
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  )
}
