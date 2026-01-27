/**
 * 环境变量配置，提供默认值和验证
 */

// 获取环境变量，提供默认值
export const env = {
  // 数据库配置
  DATABASE_URL: process.env.DATABASE_URL || "",

  // NextAuth 配置
  NEXTAUTH_URL:
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"),
  NEXTAUTH_SECRET:
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === "development"
      ? "dev-secret-key-change-in-production" // 开发环境默认密钥
      : ""),

  // 邮件服务配置
  SMTP_HOST: process.env.SMTP_HOST || "smtp.qq.com",
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || "",
  SMTP_FROM: process.env.SMTP_FROM || process.env.SMTP_USER || "",
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || "Next.js App",
}

// 验证必需的环境变量（仅生产环境）
export function validateEnv() {
  const errors: string[] = []

  if (process.env.NODE_ENV === "production") {
    if (!process.env.DATABASE_URL) {
      errors.push("DATABASE_URL 未配置")
    }
    if (!process.env.NEXTAUTH_SECRET) {
      errors.push("NEXTAUTH_SECRET 未配置")
    }
  }

  if (errors.length > 0) {
    console.warn("⚠️  环境变量警告:", errors.join(", "))
    console.warn("请配置 .env.local 文件")
  }

  return errors.length === 0
}

// 检查邮件服务是否配置
export function isEmailConfigured(): boolean {
  return !!(env.SMTP_USER && env.SMTP_PASSWORD)
}

