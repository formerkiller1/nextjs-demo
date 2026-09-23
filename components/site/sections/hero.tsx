import Link from "next/link"
import { ArrowRight, Check, Code2, Headphones, MapPin, MessageCircle, ShieldCheck, Zap } from "lucide-react"
import { resumeData } from "@/lib/resume-data"

const badges = ["大厂程序员", "5 年经验", "亲自交付", "含上线部署"]

const guarantees = [
  { icon: ShieldCheck, title: "先款后尾", desc: "满意再付尾款" },
  { icon: Zap, title: "3-7 天交付", desc: "AI 提效不拖沓" },
  { icon: Code2, title: "交付源码", desc: "不锁死、可迁移" },
  { icon: Headphones, title: "7-15 天售后", desc: "上线后免费修" },
]

export function Hero() {
  const { profile } = resumeData

  return (
    <section className="relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[-120px] top-[-120px] h-[420px] w-[520px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[-160px] left-[-120px] h-[360px] w-[460px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* 左：文案 */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              接单中 · 全国远程
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-50">
              {profile.name}
            </h1>
            <p className="mt-3 text-xl font-medium text-blue-600 sm:text-2xl dark:text-blue-400">
              {profile.title}
            </p>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              {profile.tagline}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {badges.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  {b}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/#contact"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-blue-600 px-6 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                <MessageCircle className="h-4 w-4" />
                加微信咨询
              </Link>
              <Link
                href="/#services"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-gray-300 px-6 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                看服务报价
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              {profile.location}
            </div>
          </div>

          {/* 右：浏览器样机预览 */}
          <BrowserMock />
        </div>
        <div className="mt-16 grid grid-cols-2 gap-4 border-t border-gray-100 pt-8 sm:grid-cols-4 dark:border-gray-800">
          {guarantees.map((g) => (
            <div key={g.title} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <g.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{g.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// 纯 CSS 浏览器样机，直观展示「你能拿到什么样的网站」
function BrowserMock() {
  return (
    <div className="relative hidden lg:block">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/10 blur-2xl" />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* 顶部地址栏 */}
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1 text-xs text-gray-400 dark:bg-gray-900">
            https://yoursite.com
          </div>
        </div>
        {/* 页面内容 */}
        <div className="space-y-4 p-6">
          <div className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 p-6">
            <div className="h-2.5 w-20 rounded bg-white/70" />
            <div className="mt-3 h-5 w-40 rounded bg-white/90" />
            <div className="mt-2 h-2.5 w-28 rounded bg-white/50" />
            <div className="mt-4 h-7 w-24 rounded-md bg-white" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/40" />
                <div className="mt-2 h-2 w-full rounded bg-gray-100 dark:bg-gray-800" />
                <div className="mt-1 h-2 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
          <div className="h-2 w-full rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-2 w-4/5 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>

      {/* 浮动小标 */}
      <div className="absolute -left-5 top-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
        ✅ 已上线部署
      </div>
      <div className="absolute -right-5 bottom-16 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
        ⚡ 3-7 天交付
      </div>
    </div>
  )
}

