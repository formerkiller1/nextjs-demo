import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { forgotPasswordSchema } from "@/lib/validations"
import { sendPasswordResetEmail } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // 查找用户
    const user = await db.user.findUnique({
      where: { email },
    })

    // 即使用户不存在，也返回成功（防止邮箱枚举攻击）
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: "如果该邮箱已注册，您将收到密码重置邮件。",
        },
        { status: 200 }
      )
    }

    // 检查是否已有未使用的重置Token
    const existingToken = await db.resetToken.findFirst({
      where: {
        userId: user.id,
        used: false,
        expires: {
          gt: new Date(),
        },
      },
    })

    let token: string
    if (existingToken) {
      token = existingToken.token
    } else {
      // 生成新的重置Token
      token = uuidv4()
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1小时后过期

      await db.resetToken.create({
        data: {
          token,
          userId: user.id,
          expires,
          used: false,
        },
      })
    }

    // 发送密码重置邮件
    try {
      await sendPasswordResetEmail(email, token)
    } catch (emailError) {
      console.error("发送密码重置邮件失败:", emailError)
      return NextResponse.json(
        { error: "发送邮件失败，请稍后重试" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "如果该邮箱已注册，您将收到密码重置邮件。",
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("忘记密码错误:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "输入数据验证失败", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "请求失败，请稍后重试" },
      { status: 500 }
    )
  }
}

