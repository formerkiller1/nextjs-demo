import Link from "next/link"
import { Check, MessageCircle } from "lucide-react"
import type { ServicePackage } from "@/types/resume"
import { resumeData } from "@/lib/resume-data"
import { SectionWrapper } from "@/components/site/sections/section-wrapper"

export function Services() {
  const { services, readyMades, addOns } = resumeData

  return (
    <SectionWrapper id="services" title="服务与报价" muted>
      {/* 定制 / 成品 两种方式说明 */}
      <div className="mb-8 flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center dark:border-blue-900 dark:bg-blue-950/40">
        <span className="inline-flex w-fit items-center rounded-md bg-blue-600 px-3 py-1 text-sm font-bold text-white shadow-sm">
          两种方式
        </span>
        <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-200">
          <span className="font-bold">成品站</span>套模板改内容即用，价格低、上线快；
          <span className="font-bold">定制开发</span>按你的需求一对一打造。预算有限选成品，要求高选定制。
        </p>
      </div>

      {/* 成品站 */}
      <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-50">
        <span className="h-4 w-1 rounded-full bg-amber-500" />
        成品站 · 预算有限之选
      </h3>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        套用现成模板、替换内容即可上线，价格远低于定制。
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {readyMades.map((s) => (
          <PackageCard key={s.name} pkg={s} kind="ready" />
        ))}
      </div>

      {/* 定制开发 */}
      <h3 className="mb-4 mt-12 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-50">
        <span className="h-4 w-1 rounded-full bg-blue-600" />
        定制开发 · 一对一按需求
      </h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <PackageCard key={s.name} pkg={s} kind="custom" />
        ))}
      </div>

      {/* 加购项 */}
      <h3 className="mb-4 mt-12 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-50">
        <span className="h-4 w-1 rounded-full bg-gray-400" />
        可选加购
      </h3>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        套餐已含「部署上线」服务；域名与服务器的费用由你承担，可自行购买，也可由我代购代配（收少量服务费）。
      </p>
      <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-2 sm:grid-cols-2 dark:border-gray-800 dark:bg-gray-900">
        {addOns.map((a) => (
          <div
            key={a.name}
            className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60"
          >
            <span className="text-sm text-gray-700 dark:text-gray-200">{a.name}</span>
            <span className="shrink-0 text-sm font-semibold text-blue-600 dark:text-blue-400">
              {a.price}
            </span>
          </div>
        ))}
      </div>

      {/* 底部 CTA */}
      <div className="mt-10 flex flex-col items-start gap-3 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-50">
            不确定选哪个 / 预算有限？
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            把需求发我，我帮你拆出最省钱的方案，报价透明、先付定金再开工。
          </p>
        </div>
        <Link
          href="/#contact"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-blue-600 px-6 font-medium text-white transition-colors hover:bg-blue-700"
        >
          <MessageCircle className="h-4 w-4" />
          加微信咨询报价
        </Link>
      </div>
    </SectionWrapper>
  )
}

function PackageCard({ pkg, kind }: { pkg: ServicePackage; kind: "custom" | "ready" }) {
  const isReady = kind === "ready"

  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-white p-6 dark:bg-gray-900 ${
        pkg.comingSoon
          ? "border-gray-200 opacity-80 dark:border-gray-800"
          : "transition-all hover:-translate-y-1 hover:shadow-lg"
      } ${
        pkg.featured
          ? "border-blue-500 shadow-md ring-1 ring-blue-500/40"
          : "border-gray-200 dark:border-gray-800"
      }`}
    >
      {pkg.featured && (
        <span className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
          推荐
        </span>
      )}
      {pkg.comingSoon && (
        <span className="absolute -top-3 right-6 rounded-full bg-gray-500 px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
          即将上线
        </span>
      )}
      <div className="flex items-center gap-2">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{pkg.name}</h4>
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
            isReady
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
          }`}
        >
          {isReady ? "成品" : "定制"}
        </span>
      </div>
      <p
        className={`mt-2 text-3xl font-bold ${
          isReady ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"
        }`}
      >
        {pkg.price}
      </p>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{pkg.tagline}</p>
      <ul className="mt-5 flex flex-1 flex-col gap-2.5 border-t border-gray-100 pt-5 dark:border-gray-800">
        {pkg.features.map((f) => (
          <li
            key={f}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
          >
            <Check
              className={`h-4 w-4 shrink-0 ${
                isReady ? "text-amber-500 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"
              }`}
            />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}
