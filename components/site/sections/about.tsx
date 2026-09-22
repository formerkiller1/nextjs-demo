import { Mail, MapPin } from "lucide-react"
import { resumeData } from "@/lib/resume-data"
import { SectionWrapper } from "@/components/site/sections/section-wrapper"

export function About() {
  const { profile } = resumeData

  return (
    <SectionWrapper id="about" title="关于我">
      <div className="space-y-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
        {profile.bio.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          {profile.location}
        </span>
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Mail className="h-4 w-4" />
          {profile.email}
        </a>
      </div>
    </SectionWrapper>
  )
}
