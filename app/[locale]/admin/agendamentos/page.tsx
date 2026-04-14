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
  Loader2,
  Lock,
  Trash2
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
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
  id: string | number
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
  isBlock?: boolean
  dbId?: number
}

type Servico = { id: number; name: string; price: number }
type Profissional = { id: number; name: string }
type Cliente = { id: number; name: string }

export default function AgendamentosPage() {
  const t = useTranslations("Admin")
  const locale = useLocale()

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

  // Form state agendamento
  const [formClienteId, setFormClienteId] = useState("")
  const [formServicoId, setFormServicoId] = useState("")
  const [formProfissionalId, setFormProfissionalId] = useState("")
  const [formDate, setFormDate] = useState("")
  const [formTime, setFormTime] = useState("")

  // Form state bloqueio
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [blockProfId, setBlockProfId] = useState("all")
  const [blockDate, setBlockDate] = useState("")
  const [blockTime, setBlockTime] = useState("")
  const [blockReason, setBlockReason] = useState("")

  const dateStr = currentDate.toISOString().split("T")[0]

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ date: dateStr })
      if (statusFilter !== "all" && statusFilter !== "blocked") params.set("status", statusFilter)
      
      const [resAg, resBl] = await Promise.all([
        fetch(`/api/agendamentos?${params}`),
        fetch(`/api/bloqueios?${params}`)
      ])
      
      const dataAg = await resAg.json()
      const dataBl = await resBl.json()
      
      let combined: Appointment[] = Array.isArray(dataAg) ? dataAg.map((a: any) => ({ ...a, dbId: a.id })) : []
      if (Array.isArray(dataBl)) {
        const blocks: Appointment[] = dataBl.map(b => ({
          id: `block-${b.id}`,
          dbId: b.id,
          client: t("blocked_slot"),
          email: "",
          phone: "",
          service: b.reason || t("unavailable"),
          price: 0,
          date: b.date,
          time: b.time,
          duration: "—",
          professional: b.profissional?.name || t("all_professionals"),
          status: "blocked",
          isBlock: true
        }))
        combined = [...combined, ...blocks]
      }
      
      if (statusFilter === "blocked") {
        combined = combined.filter(a => a.isBlock)
      }
      
      // Sort by time
      combined.sort((a, b) => a.time.localeCompare(b.time))
      setAppointments(combined)
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [dateStr, statusFilter, t])

  useEffect(() => {
    fetchAppointments()
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search)
      if (p.get("block") === "true") {
        setBlockDialogOpen(true)
      }
    }
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

  const handleCreateBlock = async () => {
    if (!blockDate || !blockTime) return
    setSubmitting(true)
    try {
      await fetch("/api/bloqueios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: blockDate,
          time: blockTime,
          profissionalId: blockProfId === "all" ? null : Number(blockProfId),
          reason: blockReason
        }),
      })
      setBlockDialogOpen(false)
      setBlockDate(""); setBlockTime(""); setBlockReason(""); setBlockProfId("all")
      fetchAppointments()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBlock = async (id: number) => {
    if (!confirm(t("block_delete_confirm"))) return
    await fetch("/api/bloqueios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchAppointments()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-[var(--success-bg)] text-[var(--success)] hover:bg-[var(--success-bg)] border-0">{t("status_confirmed")}</Badge>
      case "pending":
        return <Badge className="bg-[var(--warning-bg)] text-[var(--warning)] hover:bg-[var(--warning-bg)] border-0">{t("status_pending")}</Badge>
      case "cancelled":
        return <Badge className="bg-[var(--error-bg)] text-[var(--error)] hover:bg-[var(--error-bg)] border-0">{t("status_cancelled")}</Badge>
      case "completed":
        return <Badge className="bg-[var(--success-bg)] text-[var(--success)] hover:bg-[var(--success-bg)] border-0">{t("status_completed")}</Badge>
      case "blocked":
        return <Badge variant="secondary" className="bg-[var(--ink-10)] text-[var(--ink-60)] hover:bg-[var(--ink-10)] border-0"><Lock className="w-3 h-3 mr-1" /> {t("status_blocked")}</Badge>
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
    return date.toLocaleDateString(locale, { 
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
          <h1 className="font-sans text-3xl text-[var(--ink)]">{t("page_appointments")}</h1>
          <p className="text-[var(--ink-60)] mt-1">{t("page_appointments_subtitle")}</p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[var(--ink-10)] text-[var(--ink)] hover:bg-[var(--ink-10)]">
                <Lock className="h-4 w-4 mr-2" />
                {t("btn_block")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-sans text-xl">{t("block_dialog_title")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t("block_professional")}</Label>
                  <Select value={blockProfId} onValueChange={setBlockProfId}>
                    <SelectTrigger className="border-[var(--ink-10)]">
                      <SelectValue placeholder={t("block_professional")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("block_all_professionals")}</SelectItem>
                      {profissionais.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("block_date")}</Label>
                    <Input 
                      type="date" 
                      value={blockDate}
                      onChange={e => setBlockDate(e.target.value)}
                      className="border-[var(--ink-10)]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("block_time")}</Label>
                    <Input 
                      type="time" 
                      value={blockTime}
                      onChange={e => setBlockTime(e.target.value)}
                      className="border-[var(--ink-10)]" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("block_reason")}</Label>
                  <Input 
                    value={blockReason}
                    onChange={e => setBlockReason(e.target.value)}
                    placeholder={t("block_reason_placeholder")} 
                    className="border-[var(--ink-10)]"
                  />
                </div>
                <Button 
                  className="w-full bg-[var(--ink)] hover:bg-black text-white mt-2"
                  onClick={handleCreateBlock}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {t("block_confirm_btn")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white">
                <Plus className="h-4 w-4 mr-2" />
                {t("btn_new_appointment")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-sans text-xl">{t("new_appt_dialog_title")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("appt_client")}</Label>
                <Select value={formClienteId} onValueChange={setFormClienteId}>
                  <SelectTrigger className="border-[var(--ink-10)]">
                    <SelectValue placeholder={t("appt_client_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("appt_service")}</Label>
                <Select value={formServicoId} onValueChange={setFormServicoId}>
                  <SelectTrigger className="border-[var(--ink-10)]">
                    <SelectValue placeholder={t("appt_service_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {servicos.filter(s => (s as { active?: boolean }).active !== false).map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name} — R$ {s.price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("appt_professional")}</Label>
                <Select value={formProfissionalId} onValueChange={setFormProfissionalId}>
                  <SelectTrigger className="border-[var(--ink-10)]">
                    <SelectValue placeholder={t("appt_professional_placeholder")} />
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
                  <Label>{t("appt_date")}</Label>
                  <Input 
                    type="date" 
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="border-[var(--ink-10)]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("appt_time")}</Label>
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
                {t("appt_create_btn")}
              </Button>
            </div>
          </DialogContent>
          </Dialog>
        </div>
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
            placeholder={t("search_placeholder")} 
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
            <SelectItem value="all">{t("filter_all")}</SelectItem>
            <SelectItem value="confirmed">{t("filter_confirmed")}</SelectItem>
            <SelectItem value="pending">{t("filter_pending")}</SelectItem>
            <SelectItem value="completed">{t("filter_completed")}</SelectItem>
            <SelectItem value="blocked">{t("filter_blocked")}</SelectItem>
            <SelectItem value="cancelled">{t("filter_cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments list */}
      <Card className="border-[var(--ink-10)] shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="font-sans text-xl text-[var(--ink)]">
            {loading ? t("loading") : t("appointments_count", { count: filteredAppointments.length })}
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
                      <p className="text-xs text-[var(--ink-30)]">{t("with_professional", { name: appointment.professional })}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      {appointment.isBlock ? (
                        <p className="font-semibold text-[var(--ink-30)]">—</p>
                      ) : (
                        <p className="font-semibold text-[var(--ink)]">R$ {appointment.price}</p>
                      )}
                      {getStatusBadge(appointment.status)}
                    </div>

                    {appointment.isBlock ? (
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="text-[var(--error)] hover:bg-[var(--error-bg)]"
                         onClick={() => appointment.dbId && handleDeleteBlock(appointment.dbId)}
                         title={t("block_delete_confirm")}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4 text-[var(--ink-60)]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => appointment.dbId && updateStatus(appointment.dbId, "confirmed")}>
                            <Check className="mr-2 h-4 w-4" />
                            {t("action_confirm")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            {t("action_call", { phone: appointment.phone })}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-[var(--error)]"
                            onClick={() => appointment.dbId && updateStatus(appointment.dbId, "cancelled")}
                          >
                            <XIcon className="mr-2 h-4 w-4" />
                            {t("action_cancel")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredAppointments.length === 0 && (
            <div className="p-12 text-center">
              <CalendarIcon className="h-12 w-12 mx-auto text-[var(--ink-30)] mb-4" />
              <p className="text-[var(--ink-60)]">{t("no_appointments_found")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
