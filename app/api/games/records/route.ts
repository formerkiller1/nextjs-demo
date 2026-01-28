import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { GameDifficulty } from "@/types/game"

// GET: 获取排行榜
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gameType = searchParams.get("gameType")

    if (!gameType) {
      return NextResponse.json({ error: "缺少 gameType 参数" }, { status: 400 })
    }

    // 获取所有游戏记录，按难度分组，按时间升序排序
    const records = await db.gameRecord.findMany({
      where: {
        gameType,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: [
        { difficulty: "asc" },
        { time: "asc" },
        { createdAt: "asc" },
      ],
    })

    // 转换为前端需要的格式
    const formattedRecords = records.map((record) => ({
      id: record.id,
      userId: record.userId,
      userName: record.user.name,
      userEmail: record.user.email,
      gameType: record.gameType,
      difficulty: record.difficulty as GameDifficulty,
      time: record.time,
      createdAt: record.createdAt,
    }))

    return NextResponse.json(formattedRecords)
  } catch (error: any) {
    console.error("获取排行榜错误:", error)
    return NextResponse.json(
      { error: error.message || "获取排行榜失败" },
      { status: 500 }
    )
  }
}

// POST: 保存游戏记录
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await request.json()
    const { gameType, difficulty, time } = body

    if (!gameType || !difficulty || typeof time !== "number") {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      )
    }

    // 验证难度值
    const validDifficulties: GameDifficulty[] = [
      "beginner",
      "intermediate",
      "expert",
    ]
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json({ error: "无效的难度值" }, { status: 400 })
    }

    // 保存记录
    const record = await db.gameRecord.create({
      data: {
        userId: session.user.id,
        gameType,
        difficulty,
        time,
      },
    })

    return NextResponse.json({ success: true, record }, { status: 201 })
  } catch (error: any) {
    console.error("保存游戏记录错误:", error)
    return NextResponse.json(
      { error: error.message || "保存记录失败" },
      { status: 500 }
    )
  }
}

