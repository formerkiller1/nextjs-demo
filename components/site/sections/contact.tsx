import Image from "next/image"
import { Mail } from "lucide-react"
import { resumeData } from "@/lib/resume-data"
import { SectionWrapper } from "@/components/site/sections/section-wrapper"

export function Contact() {
  const { profile } = resumeData

  return (
    <SectionWrapper id="contact" title="联系我" muted>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        有建站需求？扫码加我微信，把想要的效果发我，免费出方案和报价。
      </p>

      <div className="mt-8 flex flex-col items-start gap-8 sm:flex-row sm:items-center">
        {/* 微信二维码 */}
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <Image
            src="/wechat-xr.jpeg"
            alt="微信二维码 · 扫码添加咨询"
            width={264}
            height={336}
            className="rounded-lg"
            priority
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            微信：Lofty.D
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            添加时可备注「建站」，回复更快。
          </p>

          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-md border border-gray-300 px-6 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
            >
              <Mail className="h-4 w-4" />
              {profile.email}
            </a>
          )}
        </div>
      </div>
    </SectionWrapper>
  )
}
