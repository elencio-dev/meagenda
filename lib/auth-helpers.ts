import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

/**
 * Gets the userId for a request.
 * - For admin API calls (with session): reads from better-auth session
 * - For public API calls (with ?slug=): looks up user by slug
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  // Try session first (logged-in admin)
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (session?.user?.id) return session.user.id
  } catch { /* no session */ }

  // Try slug param (public booking page)
  const slug = request.nextUrl.searchParams.get("slug")
  if (slug) {
    const user = await prisma.user.findUnique({
      where: { slug },
      select: { id: true },
    })
    return user?.id ?? null
  }

  return null
}

/**
 * Gets session user for admin-only routes (returns null if not authenticated)
 */
export async function getSessionUser(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    return session?.user ?? null
  } catch {
    return null
  }
}
