/**
 * 删除用户脚本
 * 使用方法: npx tsx scripts/delete-user.ts <email>
 * 例如: npx tsx scripts/delete-user.ts test@example.com
 */

import { db } from "../lib/db"

async function deleteUser(email: string) {
  try {
    console.log(`正在查找用户: ${email}...`)

    // 查找用户
    const user = await db.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        sessions: true,
        verificationTokens: true,
        resetTokens: true,
        loginAttempts: true,
      },
    })

    if (!user) {
      console.log(`❌ 用户 ${email} 不存在`)
      return
    }

    console.log(`找到用户: ${user.email}`)
    console.log(`  - 账户数: ${user.accounts.length}`)
    console.log(`  - 会话数: ${user.sessions.length}`)
    console.log(`  - 验证Token数: ${user.verificationTokens.length}`)
    console.log(`  - 重置Token数: ${user.resetTokens.length}`)
    console.log(`  - 登录尝试记录数: ${user.loginAttempts.length}`)

    // 删除用户（由于设置了 onDelete: Cascade，相关记录会自动删除）
    await db.user.delete({
      where: { id: user.id },
    })

    console.log(`✅ 用户 ${email} 及其所有相关数据已删除`)
  } catch (error) {
    console.error("❌ 删除用户时出错:", error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// 从命令行参数获取邮箱
const email = process.argv[2]

if (!email) {
  console.error("❌ 请提供邮箱地址")
  console.log("使用方法: npx tsx scripts/delete-user.ts <email>")
  console.log("例如: npx tsx scripts/delete-user.ts test@example.com")
  process.exit(1)
}

deleteUser(email)

