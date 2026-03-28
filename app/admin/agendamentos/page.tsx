"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Search, 
  Filter, 
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Check,
  X as XIcon,
  Phone,
  Calendar as CalendarIcon,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Appointment = {
  id: number
  client: string
  email: string
  phone: string
  service: string
  price: number
  date: string
  time: string
  duration: string
  professional: string
  status: string
}

type Servico = { id: number; name: string; price: number }
type Profissional = { id: number; name: string }
type Cliente = { id: number; name: string }

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formClienteId, setFormClienteId] = useState("")
  const [formServicoId, setFormServicoId] = useState("")
  const [formProfissionalId, setFormProfissionalId] = useState("")
  const [formDate, setFormDate] = useState("")
  const [formTime, setFormTime] = useState("")

  const dateStr = currentDate.toISOString().split("T")[0]

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ date: dateStr })
      if (statusFilter !== "all") params.set("status", statusFilter)
      const res = await fetch(`/api/agendamentos?${params}`)
      const data = await res.json()
      setAppointments(Array.isArray(data) ? data : [])
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [dateStr, statusFilter])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  useEffect(() => {
    Promise.all([
      fetch("/api/servicos").then(r => r.json()),
      fetch("/api/profissionais").then(r => r.json()),
      fetch("/api/clientes").then(r => r.json()),
    ]).then(([s, p, c]) => {
      setServicos(Array.isArray(s) ? s : [])
      setProfissionais(Array.isArray(p) ? p : [])
      setClientes(Array.isArray(c) ? c : [])
    })
  }, [])

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/agendamentos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    fetchAppointments()
  }

  const handleCreate = async () => {
    if (!formClienteId || !formServicoId || !formProfissionalId || !formDate || !formTime) return
    setSubmitting(true)
    try {
      await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: Number(formClienteId),
          servicoId: Number(formServicoId),
          profissionalId: Number(formProfissionalId),
          date: formDate,
          time: formTime,
        }),
      })
      setDialogOpen(false)
      setFormClienteId(""); setFormServicoId(""); setFormProfissionalId(""); setFormDate(""); setFormTime("")
      fetchAppointments()
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-[var(--success-bg)] text-[var(--success)] hover:bg-[var(--success-bg)] border-0">Confirmado</Badge>
      case "pending":
        return <Badge className="bg-[var(--warning-bg)] text-[var(--warning)] hover:bg-[var(--warning-bg)] border-0">Pendente</Badge>
      case "cancelled":
        return <Badge className="bg-[var(--error-bg)] text-[var(--error)] hover:bg-[var(--error-bg)] border-0">Cancelado</Badge>
      case "completed":
        return <Badge className="bg-[var(--success-bg)] text-[var(--success)] hover:bg-[var(--success-bg)] border-0">Concluído</Badge>
      default:
        return null
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.service.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { 
      weekday: "long", day: "numeric", month: "long", year: "numeric" 
    })
  }

  const navigateDate = (days: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + days)
    setCurrentDate(newDate)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl text-[var(--ink)]">Agendamentos</h1>
          <p className="text-[var(--ink-60)] mt-1">Gerencie todos os agendamentos</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-sans text-xl">Novo Agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={formClienteId} onValueChange={setFormClienteId}>
                  <SelectTrigger className="border-[var(--ink-10)]">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Serviço</Label>
                <Select value={formServicoId} onValueChange={setFormServicoId}>
                  <SelectTrigger className="border-[var(--ink-10)]">
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicos.filter(s => (s as { active?: boolean }).active !== false).map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name} — R$ {s.price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Profissional</Label>
                <Select value={formProfissionalId} onValueChange={setFormProfissionalId}>
                  <SelectTrigger className="border-[var(--ink-10)]">
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {profissionais.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input 
                    type="date" 
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="border-[var(--ink-10)]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input 
                    type="time" 
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="border-[var(--ink-10)]" 
                  />
                </div>
              </div>
              <Button 
                className="w-full bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white"
                onClick={handleCreate}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Agendamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date navigation */}
      <Card className="border-[var(--ink-10)] shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" size="icon"
              onClick={() => navigateDate(-1)}
              className="text-[var(--ink-60)] hover:text-[var(--coral)] hover:bg-[var(--coral-pale)]"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-[var(--coral)]" />
              <span className="font-medium text-[var(--ink)] capitalize">{formatDate(currentDate)}</span>
            </div>
            <Button 
              variant="ghost" size="icon"
              onClick={() => navigateDate(1)}
              className="text-[var(--ink-60)] hover:text-[var(--coral)] hover:bg-[var(--coral-pale)]"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-30)]" />
          <Input 
            placeholder="Buscar por cliente ou serviço..." 
            className="pl-10 border-[var(--ink-10)] focus:border-[var(--coral)] focus:ring-[var(--coral)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 border-[var(--ink-10)]">
            <Filter className="h-4 w-4 mr-2 text-[var(--ink-60)]" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="confirmed">Confirmados</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments list */}
      <Card className="border-[var(--ink-10)] shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="font-sans text-xl text-[var(--ink)]">
            {loading ? "Carregando..." : `${filteredAppointments.length} agendamentos`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--coral)]" />
            </div>
          ) : (
            <div className="divide-y divide-[var(--ink-10)]">
              {filteredAppointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-[var(--paper)] transition-colors",
                    appointment.status === "cancelled" && "opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-center min-w-[60px] hidden sm:block">
                      <p className="text-lg font-semibold text-[var(--ink)]">{appointment.time}</p>
                      <p className="text-xs text-[var(--ink-60)]">{appointment.duration}</p>
                    </div>
                    
                    <Avatar className="h-12 w-12 border-2 border-[var(--ink-10)]">
                      <AvatarFallback className="bg-[var(--coral-pale)] text-[var(--coral-dark)]">
                        {appointment.client.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-[var(--ink)]">{appointment.client}</p>
                        <span className="sm:hidden text-sm text-[var(--ink-60)]">{appointment.time}</span>
                      </div>
                      <p className="text-sm text-[var(--ink-60)]">{appointment.service}</p>
                      <p className="text-xs text-[var(--ink-30)]">com {appointment.professional}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-[var(--ink)]">R$ {appointment.price}</p>
                      {getStatusBadge(appointment.status)}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4 text-[var(--ink-60)]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateStatus(appointment.id, "confirmed")}>
                          <Check className="mr-2 h-4 w-4" />
                          Confirmar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          Ligar para {appointment.phone}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-[var(--error)]"
                          onClick={() => updateStatus(appointment.id, "cancelled")}
                        >
                          <XIcon className="mr-2 h-4 w-4" />
                          Cancelar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredAppointments.length === 0 && (
            <div className="p-12 text-center">
              <CalendarIcon className="h-12 w-12 mx-auto text-[var(--ink-30)] mb-4" />
              <p className="text-[var(--ink-60)]">Nenhum agendamento encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
