import { createAuthClient } from "better-auth/react"

const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
})

export const { signIn, signUp, signOut, useSession } = authClient

// Expose the inferred session user type for consumers that need additional fields
export type AuthUser = typeof authClient.$Infer.Session.user & {
  slug?: string
  phone?: string
  address?: string
  description?: string
}
