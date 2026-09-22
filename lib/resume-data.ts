import type { ResumeData } from "@/types/resume"

// ⚠️ 占位内容：后续只需修改本文件即可更新整站展示，无需改动组件。
export const resumeData: ResumeData = {
  profile: {
    name: "你的名字",
    title: "全栈工程师 / Full-Stack Engineer",
    tagline: "用代码把想法快速变成产品。",
    location: "北京, 中国",
    email: "your@email.com",
    bio: [
      "这里写一段自我介绍：你是谁、擅长什么、正在专注做什么。",
      "第二段可以补充你的技术偏好、职业目标，或者对某个领域的热情。",
    ],
  },

  socials: [
    { platform: "github", label: "GitHub", url: "https://github.com/yourname" },
    { platform: "email", label: "Email", url: "mailto:your@email.com" },
    { platform: "juejin", label: "掘金", url: "https://juejin.cn/user/yourid" },
    { platform: "xiaohongshu", label: "小红书", url: "https://www.xiaohongshu.com/user/profile/yourid" },
  ],

  skills: [
    {
      category: "前端",
      items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue"],
    },
    {
      category: "后端",
      items: ["Node.js", "Prisma", "PostgreSQL", "Go", "REST / GraphQL"],
    },
    {
      category: "工程化 & 其他",
      items: ["Git", "Docker", "CI/CD", "Vercel", "AI 提效工具"],
    },
  ],

  experiences: [
    {
      company: "某某公司",
      role: "前端工程师",
      period: "2024.07 - 至今",
      location: "北京",
      highlights: [
        "负责核心业务模块的前端架构设计与落地。",
        "推动工程化改造，构建效率提升 XX%。",
        "从 0 到 1 主导某功能上线，服务 XX 万用户。",
      ],
    },
    {
      company: "某某实习 / 项目",
      role: "全栈开发",
      period: "2023.06 - 2024.06",
      location: "远程",
      highlights: [
        "独立完成产品从设计到部署的全流程。",
        "使用 Next.js + Prisma 搭建全栈应用。",
      ],
    },
  ],

  projects: [
    {
      name: "个人履历网站",
      description: "基于 Next.js 16 + Tailwind CSS 的个人履历站点，支持多页面与暗色主题。",
      tags: ["Next.js", "TypeScript", "Tailwind"],
      url: "https://github.com/yourname/portfolio",
      featured: true,
    },
    {
      name: "项目二",
      description: "一句话描述这个项目解决了什么问题、你在其中做了什么。",
      tags: ["React", "Node.js"],
      url: "https://github.com/yourname/project-two",
      featured: true,
    },
    {
      name: "项目三",
      description: "一句话描述这个项目的亮点与技术栈。",
      tags: ["Go", "Docker"],
      url: "https://github.com/yourname/project-three",
    },
  ],
}
