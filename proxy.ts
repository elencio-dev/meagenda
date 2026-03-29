import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/upload")) {
    const contentLength = request.headers.get("content-length")
    if (contentLength && Number(contentLength) > 4.5 * 1024 * 1024) {
      return NextResponse.json({ error: "Payload Too Large" }, { status: 413 })
    }
  }

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    // Check for better-auth session cookie
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value ??
      request.cookies.get("__Secure-better-auth.session_token")?.value

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/upload/:path*"],
}
