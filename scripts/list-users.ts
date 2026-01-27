/**
 * 列出所有用户脚本
 * 使用方法: npx tsx scripts/list-users.ts
 */

import { db } from "../lib/db"

async function listUsers() {
  try {
    console.log("正在获取用户列表...\n")

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (users.length === 0) {
      console.log("📭 数据库中没有用户")
      return
    }

    console.log(`📋 找到 ${users.length} 个用户:\n`)
    console.log("ID".padEnd(40) + "邮箱".padEnd(30) + "姓名".padEnd(20) + "已验证".padEnd(10) + "创建时间")
    console.log("-".repeat(120))

    users.forEach((user) => {
      const verified = user.emailVerified ? "✅" : "❌"
      const name = user.name || "-"
      const date = user.createdAt.toLocaleString("zh-CN")
      console.log(
        user.id.substring(0, 38).padEnd(40) +
          user.email.padEnd(30) +
          name.padEnd(20) +
          verified.padEnd(10) +
          date
      )
    })

    console.log("\n💡 提示: 使用以下命令删除用户")
    console.log("   npx tsx scripts/delete-user.ts <email>")
  } catch (error) {
    console.error("❌ 获取用户列表时出错:", error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

listUsers()

