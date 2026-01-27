import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { registerSchema } from "@/lib/validations"
import { sendVerificationEmail } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // 检查邮箱是否已注册
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // 创建用户
    const user = await db.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name || null,
        isActive: true,
        emailVerified: null,
      },
    })

    // 生成验证Token
    const token = uuidv4()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

    await db.verificationToken.create({
      data: {
        identifier: validatedData.email,
        token,
        expires,
        userId: user.id,
      },
    })

    // 发送验证邮件
    try {
      await sendVerificationEmail(validatedData.email, token)
    } catch (emailError) {
      console.error("发送验证邮件失败:", emailError)
      // 即使邮件发送失败，也返回成功，但提示用户检查邮箱
    }

    return NextResponse.json(
      {
        success: true,
        message: "注册成功！请查收邮件验证您的邮箱地址。",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("注册错误:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "输入数据验证失败", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "注册失败，请稍后重试" },
      { status: 500 }
    )
  }
}

