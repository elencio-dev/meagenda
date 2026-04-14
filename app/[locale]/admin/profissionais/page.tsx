"use client"

import { useState, useEffect } from "react"
import { UserPlus, Trash2, Loader2, Pencil, CheckCircle, XCircle, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Profissional = { id: number; name: string; role: string; available: boolean }

export default function ProfissionaisPage() {
  const t = useTranslations("Admin")
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<Profissional | null>(null)
  const [form, setForm] = useState({ name: "", role: "" })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const load = () => {
    fetch("/api/profissionais")
      .then(r => r.json())
      .then(data => setProfissionais(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditItem(null); setForm({ name: "", role: "" }); setSaveError(""); setOpen(true) }
  const openEdit = (p: Profissional) => { setEditItem(p); setForm({ name: p.name, role: p.role }); setSaveError(""); setOpen(true) }

  const handleSave = async () => {
    if (!form.name.trim() || !form.role.trim()) return
    setSaving(true); setSaveError("")
    try {
      if (editItem) {
        await fetch("/api/profissionais", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editItem.id, name: form.name, role: form.role }) })
        setOpen(false); load()
      } else {
        const res = await fetch("/api/profissionais", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        if (!res.ok) {
          const data = await res.json()
          setSaveError(data.error ?? t("prof_save_error"))
          return
        }
        setOpen(false); load()
      }
    } finally { setSaving(false) }
  }

  const handleToggleAvailable = async (p: Profissional) => {
    await fetch("/api/profissionais", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, available: !p.available }) })
    setProfissionais(prev => prev.map(x => x.id === p.id ? { ...x, available: !x.available } : x))
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t("prof_delete_confirm"))) return
    await fetch(`/api/profissionais?id=${id}`, { method: "DELETE" })
    setProfissionais(prev => prev.filter(p => p.id !== id))
  }

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-3xl text-[var(--ink)]">{t("prof_title")}</h1>
          <p className="text-sm text-[var(--ink-60)] mt-1">{t("prof_count", { count: profissionais.length })}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white gap-2 rounded-xl shadow-[0_4px_12px_rgba(232,80,58,0.25)]">
              <UserPlus className="h-4 w-4" /> {t("btn_new_professional")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-sans text-xl">{editItem ? t("prof_dialog_edit") : t("prof_dialog_create")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {saveError && (
                <div className="bg-[var(--coral-pale)] border border-[var(--coral)]/30 rounded-xl p-4">
                  <p className="text-sm text-[var(--coral-dark)] font-medium mb-2">{saveError}</p>
                  <a
                    href="/admin/configuracoes"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[var(--coral)] hover:bg-[var(--coral-dark)] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ⭐ {t("prof_upgrade_cta")}
                  </a>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--ink)]">{t("prof_name")}</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={t("prof_name_placeholder")}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--ink-10)] bg-[var(--paper)] text-[var(--ink)] outline-none focus:border-[var(--coral)] focus:ring-2 focus:ring-[var(--coral)]/10 placeholder:text-[var(--ink-30)]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--ink)]">{t("prof_role")}</label>
                <input type="text" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  placeholder={t("prof_role_placeholder")}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--ink-10)] bg-[var(--paper)] text-[var(--ink)] outline-none focus:border-[var(--coral)] focus:ring-2 focus:ring-[var(--coral)]/10 placeholder:text-[var(--ink-30)]" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>{t("btn_cancel")}</Button>
                <Button className="flex-1 rounded-xl bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white" onClick={handleSave} disabled={saving || !form.name.trim() || !form.role.trim()}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editItem ? t("btn_save") : t("btn_add")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[var(--coral)]" /></div>
      ) : profissionais.length === 0 ? (
        <Card className="border-dashed border-[var(--ink-10)]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--coral-pale)] flex items-center justify-center">
              <Users className="h-8 w-8 text-[var(--coral)]" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-[var(--ink)] mb-1">{t("prof_empty_title")}</h3>
              <p className="text-sm text-[var(--ink-60)]">{t("prof_empty_desc")}</p>
              <p className="text-xs text-[var(--ink-30)] mt-1">{t("prof_empty_note")}</p>
            </div>
            <Button onClick={openCreate} className="bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white gap-2 rounded-xl mt-2">
              <UserPlus className="h-4 w-4" />{t("btn_add_first_professional")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profissionais.map(p => (
            <Card key={p.id} className="border-[var(--ink-10)] hover:border-[var(--coral)] transition-colors duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--coral)] to-[var(--coral-dark)] flex items-center justify-center text-white font-sans text-lg">
                    {getInitials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="font-medium text-[var(--ink)] text-base truncate">{p.name}</CardTitle>
                    <p className="text-sm text-[var(--ink-60)]">{p.role}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.available ? "bg-[var(--success)]" : "bg-[var(--ink-30)]"}`} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 rounded-lg text-xs gap-1" onClick={() => handleToggleAvailable(p)}>
                    {p.available
                      ? <><XCircle className="h-3 w-3 text-[var(--ink-60)]" />{t("prof_deactivate")}</>
                      : <><CheckCircle className="h-3 w-3 text-[var(--success)]" />{t("prof_activate")}</>
                    }
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg" onClick={() => openEdit(p)}><Pencil className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" className="rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
