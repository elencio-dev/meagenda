"use client"

import { useState, useEffect } from "react"
import { Loader2, Building, Clock, Save, Image as ImageIcon, CreditCard } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"

export default function ConfiguracoesPage() {
  const t = useTranslations("Admin")
  const locale = useLocale()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [billing, setBilling] = useState<any>(null)
  const [loadingBilling, setLoadingBilling] = useState(false)
  const [profile, setProfile] = useState({ name: "", slug: "", phone: "", address: "", description: "", image: "", remindersEnabled: true })
  const [hours, setHours] = useState({ start: "08:00", end: "19:00", interval: "60" })

  useEffect(() => {
    fetch("/api/configuracoes")
      .then(r => r.json())
      .then(data => {
        if (data.profile) setProfile(data.profile)
        if (data.configs) setHours(h => ({ ...h, start: data.configs.workHourStart || h.start, end: data.configs.workHourEnd || h.end, interval: data.configs.workInterval || h.interval }))
        if (data.billing) setBilling(data.billing)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true); setError(""); setSuccess("")
    try {
      const res = await fetch("/api/configuracoes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile }) })
      if (!res.ok) { const errorData = await res.json(); setError(errorData.error || t("settings_save_error")) }
      else { setSuccess(t("settings_save_success")); setTimeout(() => setSuccess(""), 3000) }
    } catch { setError(t("settings_unexpected_error")) } finally { setSaving(false) }
  }

  const handleSaveHours = async () => {
    setSaving(true); setError(""); setSuccess("")
    try {
      await fetch("/api/configuracoes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ configs: { workHourStart: hours.start, workHourEnd: hours.end, workInterval: hours.interval } }) })
      setSuccess(t("settings_hours_save_success")); setTimeout(() => setSuccess(""), 3000)
    } catch { setError(t("settings_hours_error")) } finally { setSaving(false) }
  }

  const handleSubscribe = async () => {
    setLoadingBilling(true)
    try {
      const res = await fetch("/api/billing/subscribe", { method: "POST" })
      if (!res.ok) throw new Error("Falha ao iniciar assinatura")
      const { initPoint } = await res.json()
      window.location.href = initPoint
    } catch { alert(t("billing_upgrade_start_error")); setLoadingBilling(false) }
  }

  const handleCancelSubscription = async () => {
    if (!confirm(t("billing_cancel_confirm"))) return
    setLoadingBilling(true)
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" })
      if (!res.ok) throw new Error("Erros ao cancelar no Mercado Pago")
      alert(t("billing_cancel_success"))
      const freshData = await fetch("/api/configuracoes").then(r => r.json())
      if (freshData.billing) setBilling(freshData.billing)
    } catch { alert(t("billing_cancel_error")) } finally { setLoadingBilling(false) }
  }

  const intervalOptions = [
    { value: "15", label: t("interval_15min") },
    { value: "30", label: t("interval_30min") },
    { value: "45", label: t("interval_45min") },
    { value: "60", label: t("interval_1h") },
    { value: "90", label: t("interval_1h30") },
    { value: "120", label: t("interval_2h") },
  ]

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-[var(--coral)]" /></div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-sans text-3xl text-[var(--ink)]">{t("settings_title")}</h1>
        <p className="text-sm text-[var(--ink-60)] mt-1">{t("settings_subtitle")}</p>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-xl text-sm font-medium ${error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>{error || success}</div>
      )}

      {/* Company Profile */}
      <Card className="border-[var(--ink-10)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-[var(--coral)]" />
            <CardTitle className="font-sans text-xl">{t("settings_company_title")}</CardTitle>
          </div>
          <CardDescription>{t("settings_company_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--ink)]">{t("settings_company_name")}</label>
              <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--ink)]">{t("settings_public_link")}</label>
              <div className="flex">
                <span className="px-3 py-2 bg-[var(--ink-10)] text-[var(--ink-60)] text-sm rounded-l-xl border border-r-0 border-[var(--ink-10)]">meagenda.com/</span>
                <input type="text" value={profile.slug} readOnly disabled
                  className="w-full px-4 py-2 rounded-r-xl border border-[var(--ink-10)] bg-[var(--ink-5)] text-[var(--ink-60)] outline-none cursor-not-allowed" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--ink)]">{t("settings_contact_phone")}</label>
              <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})}
                placeholder="(11) 99999-9999" className="w-full px-4 py-2 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--ink)]">{t("settings_address")}</label>
              <input type="text" value={profile.address || ""} onChange={e => setProfile({...profile, address: e.target.value})}
                placeholder={t("settings_address_placeholder")} className="w-full px-4 py-2 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)]" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--ink)]">{t("settings_short_desc")}</label>
            <textarea value={profile.description || ""} onChange={e => setProfile({...profile, description: e.target.value})}
              placeholder={t("settings_short_desc_placeholder")} rows={3}
              className="w-full px-4 py-2 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)] resize-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--ink)] flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> {t("settings_logo_url")}
            </label>
            <input type="text" value={profile.image || ""} onChange={e => setProfile({...profile, image: e.target.value})}
              placeholder={t("settings_logo_placeholder")} className="w-full px-4 py-2 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)]" />
          </div>
          <div className="space-y-2 pb-2">
            <label className="text-sm font-medium text-[var(--ink)] flex items-center gap-2">{t("settings_automations")}</label>
            <div className="flex items-center gap-3 p-4 bg-[var(--ink-5)] rounded-xl border border-[var(--ink-10)]">
              <input type="checkbox" id="remindersEnabled" checked={profile.remindersEnabled}
                onChange={e => setProfile({...profile, remindersEnabled: e.target.checked})}
                className="w-5 h-5 accent-[var(--coral)] cursor-pointer" />
              <label htmlFor="remindersEnabled" className="text-sm text-[var(--ink-80)] cursor-pointer select-none">
                {t("settings_reminders_label")}
                <span className="block text-xs text-[var(--ink-60)] mt-0.5">{t("settings_reminders_note")}</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveProfile} disabled={saving} className="rounded-xl bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("btn_save_profile")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card className="border-[var(--ink-10)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--coral)]" />
            <CardTitle className="font-sans text-xl">{t("settings_hours_title")}</CardTitle>
          </div>
          <CardDescription>{t("settings_hours_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-5 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-[var(--ink)]">{t("settings_open")}</label>
              <input type="time" value={hours.start} onChange={e => setHours({...hours, start: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)]" />
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-[var(--ink)]">{t("settings_close")}</label>
              <input type="time" value={hours.end} onChange={e => setHours({...hours, end: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)]" />
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-[var(--ink)]">{t("settings_interval")}</label>
              <select value={hours.interval} onChange={e => setHours({...hours, interval: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--ink-10)] outline-none focus:border-[var(--coral)] bg-[var(--paper)]">
                {intervalOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveHours} disabled={saving} className="rounded-xl bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("btn_save_hours")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan & Billing */}
      {billing && (
        <Card className="border-[var(--ink-10)]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[var(--coral)]" />
              <CardTitle className="font-sans text-xl">{t("billing_title")}</CardTitle>
            </div>
            <CardDescription>{t("billing_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="p-5 border border-[var(--ink-10)] rounded-xl bg-[var(--ink-5)] space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-medium text-[var(--ink)] text-lg">{t("billing_my_plan", { name: billing.planName })}</h3>
                  <p className="text-sm text-[var(--ink-60)]">
                    {billing.plan === "FREE" ? t("billing_free_desc") : t("billing_pro_desc")}
                  </p>
                </div>
                {billing.plan === "PRO" && billing.subscriptionStatus === "authorized" && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{t("billing_status_active")}</span>
                )}
                {billing.plan === "PRO" && billing.subscriptionStatus === "paused" && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{t("billing_status_pending")}</span>
                )}
                {billing.plan === "PRO" && billing.subscriptionStatus === "cancelled" && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{t("billing_status_cancelled")}</span>
                )}
              </div>

              {billing.plan === "FREE" && (
                <div className="pt-2 border-t border-[var(--ink-10)]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[var(--ink)]">{t("billing_monthly_usage")}</span>
                    <span className="text-sm text-[var(--ink-60)]">{billing.currentAppointments} / 30</span>
                  </div>
                  <div className="w-full bg-[var(--ink-10)] rounded-full h-2 mb-4">
                    <div className="bg-[var(--coral)] h-2 rounded-full" style={{ width: `${billing.usagePercentage}%` }} />
                  </div>
                  <Button onClick={handleSubscribe} disabled={loadingBilling} className="w-full sm:w-auto bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-medium shadow-sm transition-all gap-2">
                    {loadingBilling ? <Loader2 className="h-4 w-4 animate-spin" /> : t("billing_subscribe_btn")}
                  </Button>
                </div>
              )}

              {billing.plan === "PRO" && billing.planExpiresAt && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 text-sm font-medium">
                    {t("billing_expires_warning", { date: new Date(billing.planExpiresAt).toLocaleDateString(locale) })}
                  </p>
                </div>
              )}

              {billing.plan === "PRO" && billing.subscriptionStatus === "authorized" && (
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleCancelSubscription} disabled={loadingBilling} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
                    {loadingBilling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {t("billing_cancel_btn")}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
