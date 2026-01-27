import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { resetPasswordSchema } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token) {
      return NextResponse.json(
        { error: "缺少重置令牌" },
        { status: 400 }
      )
    }

    const validatedData = resetPasswordSchema.parse({ password, confirmPassword: password })

    // 查找重置Token
    const resetToken = await db.resetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "无效的重置令牌" },
        { status: 400 }
      )
    }

    // 检查是否已使用
    if (resetToken.used) {
      return NextResponse.json(
        { error: "该重置链接已被使用，请重新申请" },
        { status: 400 }
      )
    }

    // 检查是否过期
    if (new Date() > resetToken.expires) {
      await db.resetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      })
      return NextResponse.json(
        { error: "重置令牌已过期，请重新申请" },
        { status: 400 }
      )
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // 更新密码
    await db.user.update({
      where: { id: resetToken.userId },
      data: {
        password: hashedPassword,
      },
    })

    // 标记Token为已使用
    await db.resetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    })

    // 可选：使该用户的所有Session失效（通过删除所有Session记录）
    await db.session.deleteMany({
      where: { userId: resetToken.userId },
    })

    return NextResponse.json(
      {
        success: true,
        message: "密码重置成功！请使用新密码登录。",
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("重置密码错误:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "输入数据验证失败", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "重置密码失败，请稍后重试" },
      { status: 500 }
    )
  }
}

