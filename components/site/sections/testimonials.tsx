import { resumeData } from "@/lib/resume-data"
import { SectionWrapper } from "@/components/site/sections/section-wrapper"

export function Testimonials() {
  const { testimonials } = resumeData

  // 暂无真实评价时不渲染该板块，避免占位/造假影响信任
  if (testimonials.length === 0) return null

  return (
    <SectionWrapper id="testimonials" title="客户评价">
      <div className="grid gap-6 sm:grid-cols-2">
        {testimonials.map((t) => (
          <figure
            key={t.author}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          >
            <blockquote className="text-gray-700 dark:text-gray-200">
              “{t.content}”
            </blockquote>
            <figcaption className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              — {t.author}
              {t.meta ? ` · ${t.meta}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>
    </SectionWrapper>
  )
}
