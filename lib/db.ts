import { PrismaClient } from '@prisma/client'
import { env } from './env'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 检查数据库 URL
if (!env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.error('❌ 错误: 生产环境必须配置 DATABASE_URL')
  throw new Error('DATABASE_URL 未配置')
}

if (!env.DATABASE_URL) {
  console.warn('⚠️  警告: DATABASE_URL 未配置')
  console.warn('   请在 .env.local 中配置 DATABASE_URL')
  console.warn('   例如: DATABASE_URL="postgresql://user:password@localhost:5432/dbname"')
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

