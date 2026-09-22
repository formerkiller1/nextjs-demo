import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { resumeData } from "@/lib/resume-data"
import { SocialIcon } from "@/components/site/social-icons"

export function Hero() {
  const { profile, socials } = resumeData

  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <MapPin className="h-4 w-4" />
        {profile.location}
      </div>

      <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-gray-50">
        {profile.name}
      </h1>
      <p className="mt-3 text-xl font-medium text-blue-600 sm:text-2xl dark:text-blue-400">
        {profile.title}
      </p>
      <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
        {profile.tagline}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/projects"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-blue-600 px-6 font-medium text-white transition-colors hover:bg-blue-700"
        >
          查看项目
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/#contact"
          className="inline-flex h-11 items-center rounded-md border border-gray-300 px-6 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
        >
          联系我
        </Link>
      </div>

      <div className="mt-8 flex gap-4">
        {socials.map((social) => (
          <a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className="text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <SocialIcon platform={social.platform} className="h-6 w-6" />
          </a>
        ))}
      </div>
    </section>
  )
}
