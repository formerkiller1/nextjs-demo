import { resumeData } from "@/lib/resume-data"
import { SectionWrapper } from "@/components/site/sections/section-wrapper"

export function Process() {
  const { process } = resumeData

  return (
    <SectionWrapper
      id="process"
      title="交付流程"
      subtitle="从沟通到上线全程我一个人对接，进度透明，先付定金再开工，双方都有保障。"
    >
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {process.map((step, i) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {i + 1}
            </span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {step.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </SectionWrapper>
  )
}
