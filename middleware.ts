import { type NextRequest, NextResponse } from "next/server"

const protectedRoots = ["/manager", "/contractor", "/vendor", "/admin"]

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isProtected = protectedRoots.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const isSignIn = pathname.endsWith("/sign-in") || pathname.includes("/auth") || pathname.includes("/admin/login")
  if (isSignIn) return NextResponse.next()

  const roleCookie = request.cookies.get("auth_role")?.value || ""

  if (!roleCookie) {
    if (pathname.startsWith("/admin")) return NextResponse.redirect(new URL("/admin/login", request.url))
    if (pathname.startsWith("/manager")) return NextResponse.redirect(new URL("/auth/sign-in", request.url))
    if (pathname.startsWith("/contractor")) return NextResponse.redirect(new URL("/contractor/sign-in", request.url))
    if (pathname.startsWith("/vendor")) return NextResponse.redirect(new URL("/vendor/sign-in", request.url))
    return NextResponse.redirect(new URL("/auth/sign-in", request.url))
  }

  if (pathname.startsWith("/admin") && roleCookie !== "admin") {
    // Admin routes are strictly for admins. Others get redirected to their dashboards.
    let target = "/auth/sign-in"
    if (roleCookie === "manager") target = "/manager/dashboard"
    if (roleCookie === "contractor") target = "/contractor/dashboard"
    if (roleCookie === "vendor") target = "/vendor/portal"
    return NextResponse.redirect(new URL(target, request.url))
  }

  if (pathname.startsWith("/manager") && roleCookie !== "manager") {
    const target = roleCookie === "contractor" ? "/contractor/dashboard" : "/vendor/portal"
    return NextResponse.redirect(new URL(target, request.url))
  }
  if (pathname.startsWith("/contractor") && roleCookie !== "contractor") {
    const target = roleCookie === "manager" ? "/manager/dashboard" : "/vendor/portal"
    return NextResponse.redirect(new URL(target, request.url))
  }
  if (pathname.startsWith("/vendor") && roleCookie !== "vendor") {
    const target = roleCookie === "manager" ? "/manager/dashboard" : "/contractor/dashboard"
    return NextResponse.redirect(new URL(target, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/manager/:path*", "/contractor/:path*", "/vendor/:path*", "/admin/:path*"],
}
