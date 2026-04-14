"use client"

import { useState, useEffect } from "react"
import { Search, Plus, MoreHorizontal, Mail, Phone, Calendar, User, Loader2 } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

type Cliente = {
  id: number; name: string; email: string; phone: string
  status: string; totalAppointments: number; lastVisit: string | null; totalSpent: number
}

export default function ClientesPage() {
  const t = useTranslations("Admin")
  const locale = useLocale()
  const [clients, setClients] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formBirth, setFormBirth] = useState("")
  const [formError, setFormError] = useState("")

  const fetchClients = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/clientes")
      const data = await res.json()
      setClients(Array.isArray(data) ? data : [])
    } catch { setClients([]) } finally { setLoading(false) }
  }

  useEffect(() => { fetchClients() }, [])

  const handleCreate = async () => {
    setFormError("")
    if (!formName || !formEmail || !formPhone) { setFormError(t("client_form_required")); return }
    setSubmitting(true)
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, email: formEmail, phone: formPhone, birthDate: formBirth || undefined }),
      })
      if (!res.ok) { const err = await res.json(); setFormError(err.error ?? t("client_form_error")); return }
      setDialogOpen(false)
      setFormName(""); setFormEmail(""); setFormPhone(""); setFormBirth("")
      fetchClients()
    } finally { setSubmitting(false) }
  }

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  )

  const totalClients = clients.length
  const vipClients = clients.filter(c => c.status === "vip").length
  const avgTicket = clients.length > 0
    ? Math.round(clients.reduce((a, c) => a + c.totalSpent, 0) / clients.length) : 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vip": return <Badge className="bg-[var(--coral-pale)] text-[var(--coral)] hover:bg-[var(--coral-pale)] border-0">VIP</Badge>
      case "inactive": return <Badge className="bg-[var(--ink-10)] text-[var(--ink-60)] hover:bg-[var(--ink-10)] border-0">{t("status_inactive")}</Badge>
      default: return <Badge className="bg-[var(--success-bg)] text-[var(--success)] hover:bg-[var(--success-bg)] border-0">{t("status_active")}</Badge>
    }
  }

  const formatLastVisit = (date: string | null) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl text-[var(--ink)]">{t("clients_title")}</h1>
          <p className="text-[var(--ink-60)] mt-1">{t("clients_subtitle")}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white">
              <Plus className="h-4 w-4 mr-2" /> {t("btn_new_client")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-sans text-xl">{t("new_client_dialog_title")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {formError && <p className="text-sm text-[var(--error)] bg-[var(--error-bg)] px-3 py-2 rounded-lg">{formError}</p>}
              <div className="space-y-2">
                <Label>{t("client_name")}</Label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder={t("client_name_placeholder")} className="border-[var(--ink-10)]" />
              </div>
              <div className="space-y-2">
                <Label>{t("client_email")}</Label>
                <Input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder={t("client_email_placeholder")} className="border-[var(--ink-10)]" />
              </div>
              <div className="space-y-2">
                <Label>{t("client_phone")}</Label>
                <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder={t("client_phone_placeholder")} className="border-[var(--ink-10)]" />
              </div>
              <div className="space-y-2">
                <Label>{t("client_birthdate")}</Label>
                <Input type="date" value={formBirth} onChange={e => setFormBirth(e.target.value)} className="border-[var(--ink-10)]" />
              </div>
              <Button className="w-full bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white" onClick={handleCreate} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t("client_register_btn")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[var(--ink-10)] shadow-sm"><CardContent className="p-4">
          <p className="text-sm text-[var(--ink-60)]">{t("stat_total_clients")}</p>
          <p className="text-2xl font-semibold text-[var(--ink)] mt-1">{totalClients}</p>
        </CardContent></Card>
        <Card className="border-[var(--ink-10)] shadow-sm"><CardContent className="p-4">
          <p className="text-sm text-[var(--ink-60)]">{t("stat_vip_clients")}</p>
          <p className="text-2xl font-semibold text-[var(--coral)] mt-1">{vipClients}</p>
        </CardContent></Card>
        <Card className="border-[var(--ink-10)] shadow-sm"><CardContent className="p-4">
          <p className="text-sm text-[var(--ink-60)]">{t("stat_new_this_month")}</p>
          <p className="text-2xl font-semibold text-[var(--success)] mt-1">+{clients.filter(c => {
            const d = new Date(c.lastVisit ?? 0); const now = new Date()
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          }).length}</p>
        </CardContent></Card>
        <Card className="border-[var(--ink-10)] shadow-sm"><CardContent className="p-4">
          <p className="text-sm text-[var(--ink-60)]">{t("stat_avg_ticket")}</p>
          <p className="text-2xl font-semibold text-[var(--ink)] mt-1">R$ {avgTicket}</p>
        </CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-30)]" />
        <Input placeholder={t("search_clients_placeholder")} className="pl-10 border-[var(--ink-10)]"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[var(--coral)]" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="border-[var(--ink-10)] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-[var(--ink-10)]">
                      <AvatarFallback className="bg-[var(--coral-pale)] text-[var(--coral-dark)]">
                        {client.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-medium text-[var(--ink)]">{client.name}</CardTitle>
                      {getStatusBadge(client.status)}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4 text-[var(--ink-60)]" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><User className="mr-2 h-4 w-4" />{t("client_view_profile")}</DropdownMenuItem>
                      <DropdownMenuItem><Calendar className="mr-2 h-4 w-4" />{t("client_schedule")}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />{t("client_send_email")}</DropdownMenuItem>
                      <DropdownMenuItem><Phone className="mr-2 h-4 w-4" />{t("client_call")}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-[var(--ink-60)]"><Mail className="h-4 w-4" /><span className="truncate">{client.email}</span></div>
                  <div className="flex items-center gap-2 text-[var(--ink-60)]"><Phone className="h-4 w-4" /><span>{client.phone}</span></div>
                </div>
                <div className="pt-3 border-t border-[var(--ink-10)] grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-semibold text-[var(--ink)]">{client.totalAppointments}</p>
                    <p className="text-xs text-[var(--ink-60)]">{t("client_visits")}</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[var(--ink)]">R$ {client.totalSpent}</p>
                    <p className="text-xs text-[var(--ink-60)]">{t("client_total")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--ink)]">{formatLastVisit(client.lastVisit)}</p>
                    <p className="text-xs text-[var(--ink-60)]">{t("client_last_visit")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredClients.length === 0 && (
        <Card className="border-[var(--ink-10)]">
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 mx-auto text-[var(--ink-30)] mb-4" />
            <p className="text-[var(--ink-60)]">{t("no_client_found")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
