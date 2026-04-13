"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock, Eye, EyeOff } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push("/admin")
        router.refresh()
      } else {
        setError("Senha incorreta. Tente novamente.")
      }
    } catch {
      setError("Erro ao conectar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--coral)] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-sans text-2xl">M</span>
          </div>
          <h1 className="font-sans text-3xl text-[var(--ink)]">MeAgenda</h1>
          <p className="text-[var(--ink-60)] text-sm mt-1">Painel Administrativo</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[var(--ink-10)] shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--coral-pale)] flex items-center justify-center">
              <Lock className="h-5 w-5 text-[var(--coral)]" />
            </div>
            <div>
              <h2 className="font-medium text-[var(--ink)]">Acesso restrito</h2>
              <p className="text-xs text-[var(--ink-60)]">Digite sua senha de administrador</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--ink)]">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoFocus
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--ink-10)] bg-[var(--paper)] text-[var(--ink)] outline-none transition-all focus:border-[var(--coral)] focus:ring-2 focus:ring-[var(--coral)]/10 placeholder:text-[var(--ink-30)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ink-30)] hover:text-[var(--ink-60)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-[var(--error-bg)] text-[var(--error)] text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 px-6 rounded-xl bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(232,80,58,0.25)]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--ink-30)] mt-6">
          Acesso exclusivo para administradores
        </p>
      </div>
    </div>
  )
}
