"use client"

import { useState, useEffect, Suspense } from "react"
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  ChevronRight,
  MoreHorizontal,
  Check,
  X as XIcon,
  Phone,
  Loader2,
  CheckCircle2
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type DashboardData = {
  billing?: {
    plan: string
    planName: string
    maxAppointments: number | "Ilimitado"
    currentAppointments: number | null
    usagePercentage: number
    hasReminders: boolean
    remindersEnabled: boolean
  }
  stats: {
    todayCount: number
    totalClients: number
    newClientsThisMonth: number
  }
  upcomingAppointments: Array<{
    id: number
    client: string
    clientPhone: string
    service: string
    date: string
    time: string
    duration: string
    professional: string
    status: string
  }>
  professionals: Array<{
    id: number
    name: string
    role: string
    available: boolean
    appointments: number
  }>
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-[400px] gap-4"><Loader2 className="h-10 w-10 animate-spin text-[var(--coral)]" /><p className="text-[var(--ink-60)]">Carregando dashboard...</p></div>}>
      <AdminDashboardContent />
    </Suspense>
  )
}

function AdminDashboardContent() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const isUpgradeSuccess = searchParams.get("upgrade") === "success"

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/dashboard")
      const json = await res.json()
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  const handleUpgrade = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/billing/subscribe", { method: "POST" })
      if (!res.ok) throw new Error("Falha no upgrade")
      const { initPoint } = await res.json()
      window.location.href = initPoint
    } catch(err) {
      console.error(err)
      alert("Erro ao realizar upgrade.")
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/agendamentos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    fetchDashboard()
  }

  const getStatusBadge = (status: string) => {
    if (status === "confirmed") {
      return <Badge className="bg-[var(--success-bg)] text-[var(--success)] hover:bg-[var(--success-bg)] border-0">Confirmado</Badge>
    }
    if (status === "completed") {
      return <Badge className="bg-[var(--ink-10)] text-[var(--ink-60)] hover:bg-[var(--ink-10)] border-0">Concluído</Badge>
    }
    return <Badge className="bg-[var(--warning-bg)] text-[var(--warning)] hover:bg-[var(--warning-bg)] border-0">Pendente</Badge>
  }

  const stats = data ? [
    {
      title: "Próximos Agendamentos",
      value: String(data.stats.todayCount),
      change: `+${data.stats.todayCount}`,
      changeLabel: "hoje",
      icon: Calendar,
      color: "coral"
    },
    {
      title: "Clientes Ativos",
      value: String(data.stats.totalClients),
      change: `+${data.stats.newClientsThisMonth}`,
      changeLabel: "este mês",
      icon: Users,
      color: "success"
    },
    {
      title: "Taxa de Ocupação",
      value: data.stats.todayCount > 0 ? `${Math.min(Math.round((data.stats.todayCount / 10) * 100), 100)}%` : "0%",
      change: "—",
      changeLabel: "capacidade",
      icon: TrendingUp,
      color: "warning"
    },
    {
      title: "Profissionais",
      value: String((data.professionals ?? []).filter(p => p.available).length),
      change: "disponíveis",
      changeLabel: "agora",
      icon: Clock,
      color: "ink"
    }
  ] : []

  const getStatColor = (color: string) => {
    switch (color) {
      case "coral": return "bg-[var(--coral-pale)] text-[var(--coral)]"
      case "success": return "bg-[var(--success-bg)] text-[var(--success)]"
      case "warning": return "bg-[var(--warning-bg)] text-[var(--warning)]"
      default: return "bg-[var(--ink-10)] text-[var(--ink)]"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--coral)]" />
        <p className="text-[var(--ink-60)]">Carregando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-sans text-3xl text-[var(--ink)]">Dashboard</h1>
        <p className="text-[var(--ink-60)] mt-1">Visão geral do seu negócio</p>
      </div>

      {isUpgradeSuccess && (
        <div className="bg-emerald-50 border border-emerald-400 text-emerald-800 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" /> Parabéns!
          </strong>
          <span className="block sm:inline mt-1">Sua conta MeAgenda PRO foi ativada com sucesso. Obrigado por assinar!</span>
        </div>
      )}

      {/* Banner de Plano */}
      {data?.billing && (
        <Card className={cn("border-2 shadow-sm", data.billing.plan === "PRO" ? "border-emerald-500 bg-emerald-50" : "border-amber-400 bg-amber-50")}>
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-[var(--ink)]">
                  Plano Atual: {data.billing.planName}
                </h3>
                {data.billing.plan === "PRO" && <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">Premium Ativo</Badge>}
              </div>
              <p className="text-sm text-[var(--ink-60)]">
                {data.billing.plan === "FREE" 
                  ? `Você já utilizou ${data.billing.currentAppointments} de ${data.billing.maxAppointments} agendamentos gratuitos neste mês.`
                  : "Você tem agendamentos ilimitados e lembretes automáticos ativados!"}
              </p>
            </div>
            {data.billing.plan === "FREE" && (
              <Button onClick={handleUpgrade} className="w-full sm:w-auto bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-bold shadow-md transition-all">
                Fazer Upgrade para o Pro
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-[var(--ink-10)] shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--ink-60)]">{stat.title}</p>
                  <p className="text-3xl font-semibold text-[var(--ink)] mt-2">{stat.value}</p>
                  <p className="text-xs text-[var(--ink-60)] mt-1">
                    <span className="text-[var(--success)] font-medium">{stat.change}</span> {stat.changeLabel}
                  </p>
                </div>
                <div className={cn("p-3 rounded-xl", getStatColor(stat.color))}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's appointments */}
        <div className="lg:col-span-2">
          <Card className="border-[var(--ink-10)] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-sans text-xl text-[var(--ink)]">Próximos Agendamentos</CardTitle>
              <Button variant="ghost" className="text-[var(--coral)] hover:text-[var(--coral-dark)] hover:bg-[var(--coral-pale)]">
                Ver todos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {(data?.upcomingAppointments ?? []).length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-[var(--ink-30)] mb-4" />
                  <p className="text-[var(--ink-60)]">Nenhum agendamento futuro</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--ink-10)]">
                  {(data?.upcomingAppointments ?? []).map((appointment) => (
                    <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-[var(--paper)] transition-colors">
                      <div className="flex sm:block justify-between items-center sm:text-center min-w-[70px]">
                        <div className="flex gap-2 sm:block">
                          <p className="text-sm font-medium text-[var(--coral)]">{appointment.date}</p>
                          <p className="text-lg font-semibold text-[var(--ink)]">{appointment.time}</p>
                        </div>
                        <p className="text-xs text-[var(--ink-60)]">{appointment.duration}</p>
                        <div className="sm:hidden block">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 border-2 border-[var(--ink-10)]">
                          <AvatarFallback className="bg-[var(--coral-pale)] text-[var(--coral-dark)]">
                            {appointment.client.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--ink)] truncate">{appointment.client}</p>
                          <p className="text-sm text-[var(--ink-60)]">{appointment.service} com {appointment.professional}</p>
                        </div>
                      </div>

                      <div className="hidden sm:block">
                        {getStatusBadge(appointment.status)}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4 text-[var(--ink-60)]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {appointment.status === "pending" && (
                            <DropdownMenuItem onClick={() => updateStatus(appointment.id, "confirmed")}>
                              <Check className="mr-2 h-4 w-4" />
                              Confirmar
                            </DropdownMenuItem>
                          )}
                          {appointment.status === "confirmed" && (
                            <DropdownMenuItem onClick={() => updateStatus(appointment.id, "completed")}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Concluir Atendimento
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => window.open(`https://wa.me/55${appointment.clientPhone.replace(/\D/g, '')}`, '_blank')}>
                            <Phone className="mr-2 h-4 w-4" />
                            Ligar / WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-[var(--error)]" onClick={() => updateStatus(appointment.id, "cancelled")}>
                            <XIcon className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick actions */}
          <Card className="border-[var(--ink-10)] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-sans text-xl text-[var(--ink)]">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/agendamentos" className="block">
                <Button className="w-full justify-start bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white">
                  <Calendar className="mr-2 h-4 w-4" />
                  Gerenciar Agendamentos
                </Button>
              </Link>
              <Link href="/admin/clientes" className="block">
                <Button variant="outline" className="w-full justify-start border-[var(--ink-10)] text-[var(--ink)] hover:bg-[var(--coral-pale)] hover:text-[var(--coral-dark)] hover:border-[var(--coral-light)]">
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Clientes
                </Button>
              </Link>
              <Link href="/admin/agendamentos?block=true" className="block">
                <Button variant="outline" className="w-full justify-start border-[var(--ink-10)] text-[var(--ink)] hover:bg-[var(--coral-pale)] hover:text-[var(--coral-dark)] hover:border-[var(--coral-light)]">
                  <Clock className="mr-2 h-4 w-4" />
                  Bloquear Horário
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Professionals availability */}
          <Card className="border-[var(--ink-10)] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-sans text-xl text-[var(--ink)]">Profissionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(data?.professionals ?? []).length === 0 ? (
                <p className="text-sm text-[var(--ink-60)] text-center py-4">Nenhum profissional cadastrado</p>
              ) : (
                (data?.professionals ?? []).map((professional) => (
                  <div key={professional.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[var(--coral-pale)] text-[var(--coral-dark)]">
                          {professional.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                        professional.available ? "bg-[var(--success)]" : "bg-[var(--ink-30)]"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--ink)] truncate">{professional.name}</p>
                      <p className="text-xs text-[var(--ink-60)]">{professional.role}</p>
                    </div>
                    <Badge variant="secondary" className="bg-[var(--ink-10)] text-[var(--ink-60)]">
                      {professional.appointments} hoje
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
