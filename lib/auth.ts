import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Adapter } from "next-auth/adapters"
import { env } from "./env"

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days (for remember me)
  },
  pages: {
    signIn: "/login",
    signOut: "/",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码")
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // 检查登录尝试次数（防暴力破解）
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const recentAttempts = await db.loginAttempt.count({
          where: {
            email,
            success: false,
            createdAt: {
              gte: oneHourAgo,
            },
          },
        })

        if (recentAttempts >= 5) {
          throw new Error("登录尝试次数过多，请1小时后再试")
        }

        const user = await db.user.findUnique({
          where: { email },
        })

        if (!user) {
          // 记录失败的登录尝试
          await db.loginAttempt.create({
            data: {
              email,
              success: false,
            },
          })
          throw new Error("邮箱或密码错误")
        }

        if (!user.isActive) {
          throw new Error("账户已被禁用")
        }

        // 检查邮箱是否已验证
        if (!user.emailVerified) {
          throw new Error("请先验证您的邮箱")
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password
        )

        if (!isPasswordValid) {
          // 记录失败的登录尝试
          await db.loginAttempt.create({
            data: {
              email,
              userId: user.id,
              success: false,
            },
          })
          throw new Error("邮箱或密码错误")
        }

        // 记录成功的登录尝试
        await db.loginAttempt.create({
          data: {
            email,
            userId: user.id,
            success: true,
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.emailVerified = user.emailVerified
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string | null
        session.user.emailVerified = token.emailVerified as Date | null
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: env.NEXTAUTH_SECRET || undefined,
})
