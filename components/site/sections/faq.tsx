import { resumeData } from "@/lib/resume-data"
import { SectionWrapper } from "@/components/site/sections/section-wrapper"

export function FAQ() {
  const { faqs } = resumeData

  if (faqs.length === 0) return null

  return (
    <SectionWrapper
      id="faq"
      title="常见问题"
      subtitle="合作前你可能关心的问题，都在这里；其它疑问欢迎直接加微信问我。"
    >
      <div className="space-y-3">
        {faqs.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-blue-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-gray-900 dark:text-gray-50">
              {item.q}
              <span className="shrink-0 text-xl leading-none text-blue-600 transition-transform group-open:rotate-45 dark:text-blue-400">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </SectionWrapper>
  )
}
