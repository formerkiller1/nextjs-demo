import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "缺少验证令牌" },
        { status: 400 }
      )
    }

    // 查找验证Token
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "无效的验证令牌" },
        { status: 400 }
      )
    }

    // 检查是否过期
    if (new Date() > verificationToken.expires) {
      // 删除过期的Token
      await db.verificationToken.delete({
        where: { id: verificationToken.id },
      })
      return NextResponse.json(
        { error: "验证令牌已过期，请重新注册或请求新的验证邮件" },
        { status: 400 }
      )
    }

    // 验证邮箱
    await db.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: new Date(),
      },
    })

    // 删除已使用的Token
    await db.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    return NextResponse.json(
      {
        success: true,
        message: "邮箱验证成功！您现在可以登录了。",
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("邮箱验证错误:", error)
    return NextResponse.json(
      { error: error.message || "验证失败，请稍后重试" },
      { status: 500 }
    )
  }
}

