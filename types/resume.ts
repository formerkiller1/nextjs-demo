// 个人履历网站数据类型定义
// 所有对外展示内容的结构都收敛在这里，实际内容见 lib/resume-data.ts

// 社交/联系入口，platform 用于在组件里映射对应图标
export type SocialPlatform =
  | "github"
  | "email"
  | "wechat"
  | "juejin"
  | "zhihu"
  | "xiaohongshu"
  | "website"

export interface SocialLink {
  platform: SocialPlatform
  label: string
  url: string
}

// 技能分组
export interface SkillGroup {
  category: string
  items: string[]
}

// 工作/项目经历
export interface Experience {
  company: string
  role: string
  period: string
  location?: string
  highlights: string[]
}

// 作品/项目，点击直接跳外链（GitHub 或线上地址）
export interface Project {
  name: string
  description: string
  tags: string[]
  url: string
  featured?: boolean
}

// 顶部个人信息
export interface Profile {
  name: string
  title: string
  tagline: string
  location: string
  email: string
  bio: string[]
}

// 整站数据
export interface ResumeData {
  profile: Profile
  socials: SocialLink[]
  skills: SkillGroup[]
  experiences: Experience[]
  projects: Project[]
}
