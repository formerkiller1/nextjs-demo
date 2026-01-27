import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const session = await auth()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Next.js 认证系统
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            一个完整的全栈认证解决方案
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link href="/login">
            <Button size="lg" className="w-full">
              登录
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="w-full">
              注册
            </Button>
          </Link>
        </div>

        <div className="mt-12 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">功能特性</h2>
          <ul className="space-y-2 text-left text-sm text-gray-600">
            <li>✅ 用户注册与登录</li>
            <li>✅ 邮箱验证</li>
            <li>✅ 密码重置</li>
            <li>✅ 记住我功能</li>
            <li>✅ 登录尝试限制</li>
            <li>✅ JWT Token 认证</li>
            <li>✅ 路由保护</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
