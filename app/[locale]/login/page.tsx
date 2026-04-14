"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { signIn } from "@/lib/auth-client"
import { Loader2, Lock, Eye, EyeOff, Calendar } from "lucide-react"

export default function LoginPage() {
  const t = useTranslations("Auth")
  const locale = useLocale()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await signIn.email({ email, password })
      if (result.error) {
        setError(t("error_credentials"))
      } else {
        router.push(`/${locale}/admin`)
        router.refresh()
      }
    } catch {
      setError(t("error_connect"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-coral flex items-center justify-center mx-auto mb-4 shadow-lg shadow-coral/25">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-sans text-3xl text-ink">MeAgenda</h1>
          <p className="text-ink-60 text-sm mt-1">{t("tagline")}</p>
        </div>

        <div className="bg-card rounded-2xl border border-ink-10 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-coral-pale flex items-center justify-center">
              <Lock className="h-5 w-5 text-coral" />
            </div>
            <div>
              <h2 className="font-medium text-ink">{t("login_title")}</h2>
              <p className="text-xs text-ink-60">{t("login_subtitle")}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">{t("email")}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder={t("email_placeholder")} required autoFocus
                className="w-full px-4 py-3 rounded-xl border border-ink-10 bg-paper text-ink outline-none transition-all focus:border-coral focus:ring-2 focus:ring-coral/10 placeholder:text-ink-30" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">{t("password")}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-ink-10 bg-paper text-ink outline-none transition-all focus:border-coral focus:ring-2 focus:ring-coral/10 placeholder:text-ink-30" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-30 hover:text-ink-60">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

            <button type="submit" disabled={loading || !email || !password}
              className="w-full py-3 px-6 rounded-xl bg-coral hover:bg-coral-dark text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(232,80,58,0.25)]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {loading ? t("logging_in") : t("login_btn")}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-60 mt-6">
          {t("no_account")}{" "}
          <Link href={`/${locale}/register`} className="text-coral hover:text-coral-dark font-medium">
            {t("register_link")}
          </Link>
        </p>
      </div>
    </div>
  )
}
