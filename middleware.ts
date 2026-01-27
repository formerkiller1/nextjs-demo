import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req: NextRequest & { auth?: any }) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // 如果用户已登录，访问登录/注册页面时重定向到dashboard
  if (
    (pathname.startsWith("/login") || pathname.startsWith("/register")) &&
    isLoggedIn
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 保护 /dashboard 路由
  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
}

