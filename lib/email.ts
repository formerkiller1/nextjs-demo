import nodemailer from "nodemailer"
import { env, isEmailConfigured } from "./env"

// 创建 QQ 邮箱传输器（仅在配置了邮件服务时创建）
const transporter = isEmailConfigured()
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    })
  : null

// 验证邮箱配置
export async function verifyEmailConfig() {
  if (!isEmailConfigured() || !transporter) {
    console.warn("⚠️  邮件服务未配置，邮件功能将不可用")
    return false
  }
  try {
    await transporter.verify()
    return true
  } catch (error) {
    console.error("邮件服务配置错误:", error)
    return false
  }
}

// 发送邮箱验证邮件
export async function sendVerificationEmail(email: string, token: string) {
  if (!isEmailConfigured() || !transporter) {
    console.warn("⚠️  邮件服务未配置，无法发送验证邮件")
    const fallbackUrl = env.NEXTAUTH_URL || "http://localhost:3000"
    console.warn(`验证链接: ${fallbackUrl}/verify-email?token=${token}`)
    throw new Error("邮件服务未配置，请联系管理员")
  }

  // 确保 NEXTAUTH_URL 有值，如果没有则使用默认值
  const baseUrl = env.NEXTAUTH_URL || "http://localhost:3000"
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`
  
  const mailOptions = {
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM}>`,
    to: email,
    subject: "验证您的邮箱地址",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>欢迎注册！</h2>
            <p>感谢您注册我们的服务。请点击下面的按钮验证您的邮箱地址：</p>
            <a href="${verifyUrl}" class="button">验证邮箱</a>
            <p>或者复制以下链接到浏览器中打开：</p>
            <p style="word-break: break-all; color: #0070f3;">${verifyUrl}</p>
            <p>此链接将在24小时后过期。</p>
            <div class="footer">
              <p>如果您没有注册此账户，请忽略此邮件。</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("验证邮件已发送:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("发送验证邮件失败:", error)
    throw new Error("发送验证邮件失败，请稍后重试")
  }
}

// 发送密码重置邮件
export async function sendPasswordResetEmail(email: string, token: string) {
  if (!isEmailConfigured() || !transporter) {
    console.warn("⚠️  邮件服务未配置，无法发送密码重置邮件")
    const fallbackUrl = env.NEXTAUTH_URL || "http://localhost:3000"
    console.warn(`重置链接: ${fallbackUrl}/reset-password?token=${token}`)
    throw new Error("邮件服务未配置，请联系管理员")
  }

  // 确保 NEXTAUTH_URL 有值，如果没有则使用默认值
  const baseUrl = env.NEXTAUTH_URL || "http://localhost:3000"
  const resetUrl = `${baseUrl}/reset-password?token=${token}`
  
  const mailOptions = {
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM}>`,
    to: email,
    subject: "重置您的密码",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
            .warning { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>重置密码</h2>
            <p>我们收到了您的密码重置请求。请点击下面的按钮重置您的密码：</p>
            <a href="${resetUrl}" class="button">重置密码</a>
            <p>或者复制以下链接到浏览器中打开：</p>
            <p style="word-break: break-all; color: #0070f3;">${resetUrl}</p>
            <div class="warning">
              <p><strong>重要提示：</strong></p>
              <ul>
                <li>此链接将在1小时后过期</li>
                <li>如果您没有请求重置密码，请忽略此邮件</li>
                <li>您的密码不会被更改，除非您点击上面的链接并设置新密码</li>
              </ul>
            </div>
            <div class="footer">
              <p>如果您没有请求重置密码，请忽略此邮件，您的账户仍然是安全的。</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("密码重置邮件已发送:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("发送密码重置邮件失败:", error)
    throw new Error("发送密码重置邮件失败，请稍后重试")
  }
}

