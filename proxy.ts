import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/upload")) {
    const contentLength = request.headers.get("content-length")
    if (contentLength && Number(contentLength) > 4.5 * 1024 * 1024) {
      return NextResponse.json({ error: "Payload Too Large" }, { status: 413 })
    }
  }

  // Protect /admin routes (accounting for locale prefixes)
  if (pathname.includes("/admin")) {
    // Check for better-auth session cookie
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value ??
      request.cookies.get("__Secure-better-auth.session_token")?.value

    if (!sessionToken) {
      // Redirect to login using current locale if possible, or root /login
      const locale = pathname.split("/")[1]
      const loginUrl = (locale === 'en' || locale === 'pt') ? `/${locale}/login` : "/login"
      return NextResponse.redirect(new URL(loginUrl, request.url))
    }
  }

  // Run next-intl middleware for internationalization routing
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
