import type { ReactNode } from "react"

// 首页各区块统一容器：锚点 id + 标题 + 内容
export function SectionWrapper({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-gray-100 dark:border-gray-900">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-gray-50">
          {title}
        </h2>
        {children}
      </div>
    </section>
  )
}
