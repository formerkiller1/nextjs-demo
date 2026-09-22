import type { SocialPlatform } from "@/types/resume"
import { Github, Mail, Globe, Link as LinkIcon, type LucideIcon } from "lucide-react"

// 平台 -> 图标映射，掘金/知乎/小红书等无专属图标的统一用通用图标兜底
const iconMap: Record<SocialPlatform, LucideIcon> = {
  github: Github,
  email: Mail,
  website: Globe,
  juejin: LinkIcon,
  zhihu: LinkIcon,
  xiaohongshu: LinkIcon,
  wechat: LinkIcon,
}

export function SocialIcon({
  platform,
  className,
}: {
  platform: SocialPlatform
  className?: string
}) {
  const Icon = iconMap[platform] ?? Globe
  return <Icon className={className} />
}
