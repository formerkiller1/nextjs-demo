import { resumeData } from "@/lib/resume-data"
import { SectionWrapper } from "@/components/site/sections/section-wrapper"

export function Experience() {
  const { experiences } = resumeData

  return (
    <SectionWrapper id="experience" title="经历" muted>
      <div className="space-y-8">
        {experiences.map((exp, i) => (
          <div
            key={i}
            className="border-l-2 border-gray-200 pl-6 dark:border-gray-800"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {exp.role}
                <span className="text-gray-400"> · </span>
                <span className="text-blue-600 dark:text-blue-400">{exp.company}</span>
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {exp.period}
                {exp.location ? ` · ${exp.location}` : ""}
              </span>
            </div>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-gray-600 dark:text-gray-300">
              {exp.highlights.map((h, j) => (
                <li key={j}>{h}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}
