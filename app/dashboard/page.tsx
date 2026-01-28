import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import LogoutButton from "@/components/auth/logout-button"
import { GameList } from "@/components/games/game-list"

export default async function DashboardPage() {
  const session = await auth()

  // 暂时禁用登录检查
  // if (!session) {
  //   redirect("/login")
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white px-8 py-8 shadow">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            {session && <LogoutButton />}
          </div>

          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 p-4">
              <h2 className="text-lg font-semibold text-blue-900">
                欢迎回来！
              </h2>
              <p className="mt-2 text-blue-700">
                您已成功登录到受保护的页面。
              </p>
            </div>

            {session && (
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">用户信息</h3>
                <div className="rounded-md border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">邮箱：</span>
                    {session.user.email}
                  </p>
                  {session.user.name && (
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">姓名：</span>
                      {session.user.name}
                    </p>
                  )}
                  {session.user.emailVerified && (
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">邮箱验证：</span>
                      <span className="text-green-600">已验证</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            <GameList />
          </div>
        </div>
      </div>
    </div>
  )
}

