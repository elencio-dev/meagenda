"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/lib/auth-client"
import { Loader2, Building2, Eye, EyeOff, Calendar } from "lucide-react"

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")

  const handleNameChange = (val: string) => {
    setName(val)
    setSlug(slugify(val))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!slug) { setError("Nome inválido para gerar o link."); return }
    if (password.length < 8) { setError("A senha deve ter pelo menos 8 caracteres."); return }
    setLoading(true)
    try {
      const result = await signUp.email({
        name,
        email,
        password,
        callbackURL: "/admin",
        // @ts-expect-error - additional fields
        slug,
        phone,
      })
      if (result.error) {
        setError(result.error.message ?? "Erro ao criar conta.")
      } else {
        router.push("/admin")
        router.refresh()
      }
    } catch {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-coral flex items-center justify-center mx-auto mb-4 shadow-lg shadow-coral/25">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-sans text-3xl text-ink">MeAgenda</h1>
          <p className="text-ink-60 text-sm mt-1">Crie a agenda da sua empresa</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-ink-10 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-coral-pale flex items-center justify-center">
              <Building2 className="h-5 w-5 text-coral" />
            </div>
            <div>
              <h2 className="font-medium text-ink">Cadastrar empresa</h2>
              <p className="text-xs text-ink-60">Gratuitamente, em menos de 1 minuto</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Nome da empresa</label>
              <input
                type="text"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="Ex: Salão da Maria"
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-ink-10 bg-paper text-ink outline-none transition-all focus:border-coral focus:ring-2 focus:ring-coral/10 placeholder:text-ink-30"
              />
            </div>

            {slug && (
              <div className="px-4 py-2.5 rounded-xl bg-coral-pale border border-coral/20 text-sm">
                <span className="text-ink-60">Seu link público: </span>
                <span className="text-coral font-medium">meagenda.com/<strong>{slug}</strong></span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Link personalizado</label>
              <div className="flex">
                <span className="px-3 py-3 bg-ink-10 border border-r-0 border-ink-10 rounded-l-xl text-ink-60 text-sm">meagenda.com/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="meu-salao"
                  required
                  className="flex-1 px-4 py-3 rounded-r-xl border border-ink-10 bg-paper text-ink outline-none transition-all focus:border-coral focus:ring-2 focus:ring-coral/10 placeholder:text-ink-30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Telefone / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 rounded-xl border border-ink-10 bg-paper text-ink outline-none transition-all focus:border-coral focus:ring-2 focus:ring-coral/10 placeholder:text-ink-30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-ink-10 bg-paper text-ink outline-none transition-all focus:border-coral focus:ring-2 focus:ring-coral/10 placeholder:text-ink-30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-ink-10 bg-paper text-ink outline-none transition-all focus:border-coral focus:ring-2 focus:ring-coral/10 placeholder:text-ink-30"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-30 hover:text-ink-60">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !name || !email || !password || !slug}
              className="w-full py-3.5 px-6 rounded-xl bg-coral hover:bg-coral-dark text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(232,80,58,0.25)]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
              {loading ? "Criando conta..." : "Criar minha agenda"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-60 mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-coral hover:text-coral-dark font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
