import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SnakeGame } from "@/components/games/snake/snake-game"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function SnakePage() {
  const session = await auth()

  // 暂时禁用登录检查
  // if (!session) {
  //   redirect("/login")
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-2 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
        <div className="mb-2 sm:mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-sm sm:text-base">
              <ArrowLeft className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              返回 Dashboard
            </Button>
          </Link>
        </div>
        <div className="rounded-lg bg-white px-2 py-4 shadow sm:px-4 sm:py-6 lg:px-8 lg:py-8">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:mb-6 sm:text-3xl">贪吃蛇</h1>
          <SnakeGame userId={session?.user?.id} />
        </div>
      </div>
    </div>
  )
}
