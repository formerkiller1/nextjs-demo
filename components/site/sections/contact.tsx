import { Mail } from "lucide-react"
import { resumeData } from "@/lib/resume-data"
import { SectionWrapper } from "@/components/site/sections/section-wrapper"
import { SocialIcon } from "@/components/site/social-icons"

export function Contact() {
  const { profile, socials } = resumeData

  return (
    <SectionWrapper id="contact" title="联系我">
      <p className="text-lg text-gray-600 dark:text-gray-300">
        欢迎交流合作，或者只是打个招呼。
      </p>
      <a
        href={`mailto:${profile.email}`}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-blue-600 px-6 font-medium text-white transition-colors hover:bg-blue-700"
      >
        <Mail className="h-4 w-4" />
        {profile.email}
      </a>
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
    </SectionWrapper>
  )
}
