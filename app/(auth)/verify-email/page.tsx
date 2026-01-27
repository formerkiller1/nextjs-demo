"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("缺少验证令牌")
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/verify-email?token=${token}`)
        const result = await response.json()

        if (!response.ok) {
          setStatus("error")
          setMessage(result.error || "验证失败")
          return
        }

        setStatus("success")
        setMessage(result.message || "邮箱验证成功！")
        
        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } catch (error) {
        setStatus("error")
        setMessage("验证失败，请稍后重试")
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="mt-8 rounded-lg bg-white px-8 py-8 shadow text-center">
          {status === "loading" && (
            <div>
              <div className="mb-4 text-2xl">⏳</div>
              <p className="text-gray-600">正在验证邮箱...</p>
            </div>
          )}

          {status === "success" && (
            <div>
              <div className="mb-4 text-4xl">✅</div>
              <p className="mb-4 text-green-600">{message}</p>
              <p className="text-sm text-gray-500">正在跳转到登录页面...</p>
            </div>
          )}

          {status === "error" && (
            <div>
              <div className="mb-4 text-4xl">❌</div>
              <p className="mb-4 text-red-600">{message}</p>
              <Link href="/register">
                <Button variant="outline">返回注册</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

