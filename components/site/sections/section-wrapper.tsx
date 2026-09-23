import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// 首页各区块统一容器：锚点 id + 标题 +（可选）副标题 + 内容
// muted=true 时使用浅底色，用于相邻区块之间形成节奏对比
export function SectionWrapper({
  id,
  title,
  subtitle,
  muted = false,
  children,
}: {
  id: string
  title: string
  subtitle?: string
  muted?: boolean
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-16 border-t border-gray-100 dark:border-gray-900",
        muted && "bg-gray-50/70 dark:bg-gray-900/30"
      )}
    >
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-gray-50">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-300">
            {subtitle}
          </p>
        )}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  )
}
