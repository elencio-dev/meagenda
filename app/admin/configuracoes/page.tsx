"use client"

import { useState, useEffect } from "react"
import { Loader2, Building, Store, Clock, Save, Image as ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"

export default function ConfiguracoesPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [profile, setProfile] = useState({
    name: "", slug: "", phone: "", address: "", description: "", image: ""
  })
  
  // Default working hours
  const [hours, setHours] = useState({
    start: "08:00", end: "19:00", interval: "60" // minutes
  })

  useEffect(() => {
    fetch("/api/configuracoes")
      .then(r => r.json())
      .then(data => {
        if (data.profile) {
          setProfile(data.profile)
        }
        if (data.configs) {
          setHours(h => ({
            ...h,
            start: data.configs.workHourStart || h.start,
            end: data.configs.workHourEnd || h.end,
            interval: data.configs.workInterval || h.interval,
          }))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true); setError(""); setSuccess("")
    try {
      const res = await fetch("/api/configuracoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || "Erro ao salvar o perfil.")
      } else {
        setSuccess("Perfil salvo com sucesso!")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch {
      setError("Erro inesperado.")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveHours = async () => {
    setSaving(true); setError(""); setSuccess("")
    try {
      await fetch("/api/configuracoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configs: {
            workHourStart: hours.start,
            workHourEnd: hours.end,
            workInterval: hours.interval
          }
        }),
      })
      setSuccess("Horários salvos com sucesso!")
      setTimeout(() => setSuccess(""), 3000)
    } catch {
      setError("Erro inesperado ao salvar horas.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-[var(--coral)]" /></div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-sans text-3xl text-[var(--ink)]">Configurações</h1>
        <p className="text-sm text-[var(--ink-60)] mt-1">Gerencie os dados da sua empresa e horários de funcionamento</p>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-xl text-sm font-medium ${error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
          {error || success}
        </div>
      )}

      {/* Perfil da Empresa */}
      <Card className="border-[var(--ink-10)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-[var(--coral)]" />
            <CardTitle className="font-sans text-xl">Perfil da Empresa</CardTitle>
          </div>
          <CardDescription>Informações públicas exibidas na sua página de agendamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--ink)]">Nome da Empresa</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--ink)]">Link / Slug Público</label>
              <div className="flex">
                <span className="px-3 py-2 bg-[var(--ink-10)] text-[var(--ink-60)] text-sm rounded-l-xl border border-r-0 border-[var(--ink-10)]">
                  meagenda.com/
                </span>
                <input
                  type="text"
                  value={profile.slug}
                  readOnly
                  disabled
                  className="w-full px-4 py-2 rounded-r-xl border border-[var(--ink-10)] bg-[var(--ink-5)] text-[var(--ink-60)] outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--ink)]">Telefone de Contato</label>
              <input
                type="text"
                value={profile.phone}
                onChange={e => setProfile({...profile, phone: e.target.value})}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-2 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--ink)]">Endereço (opcional)</label>
              <input
                type="text"
                value={profile.address || ""}
                onChange={e => setProfile({...profile, address: e.target.value})}
                placeholder="Rua, Número, Bairro, Cidade"
                className="w-full px-4 py-2 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--ink)]">Descrição Curta</label>
            <textarea
              value={profile.description || ""}
              onChange={e => setProfile({...profile, description: e.target.value})}
              placeholder="Uma breve apresentação do seu negócio..."
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--ink)] flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Logo URL (opcional)
            </label>
            <input
              type="text"
              value={profile.image || ""}
              onChange={e => setProfile({...profile, image: e.target.value})}
              placeholder="https://sua-imagem.com/logo.png"
              className="w-full px-4 py-2 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveProfile} disabled={saving} className="rounded-xl bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Horários de Funcionamento */}
      <Card className="border-[var(--ink-10)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--coral)]" />
            <CardTitle className="font-sans text-xl">Horário de Funcionamento</CardTitle>
          </div>
          <CardDescription>Defina os horários base em que o salão recebe clientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-5 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-[var(--ink)]">Abertura</label>
              <input
                type="time"
                value={hours.start}
                onChange={e => setHours({...hours, start: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)]"
              />
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-[var(--ink)]">Fechamento</label>
              <input
                type="time"
                value={hours.end}
                onChange={e => setHours({...hours, end: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)]"
              />
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-[var(--ink)]">Intervalo de agendamentos</label>
              <select
                value={hours.interval}
                onChange={e => setHours({...hours, interval: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)] bg-[var(--paper)]"
              >
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1h 30min</option>
                <option value="120">2 horas</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveHours} disabled={saving} className="rounded-xl bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Horários
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
