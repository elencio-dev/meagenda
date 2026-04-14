"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface BookingFormProps {
  formData: {
    name: string
    email: string
    phone: string
    notes: string
  }
  onFormChange: (data: BookingFormProps["formData"]) => void
  onSubmit: () => void
}

export function BookingForm({ formData, onFormChange, onSubmit }: BookingFormProps) {
  const t = useTranslations("Booking")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-ink">
          {t("form_name")}
        </label>
        <input
          id="name"
          type="text"
          required
          placeholder={t("form_name_placeholder")}
          value={formData.name}
          onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
          className={cn(
            "w-full px-4 py-3 rounded-xl border border-ink-10 bg-card text-ink",
            "placeholder:text-ink-30 outline-none transition-all duration-150",
            "focus:border-coral focus:ring-3 focus:ring-coral/10"
          )}
        />
        <p className="text-xs text-ink-60">{t("form_name_hint")}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          {t("form_email")}
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder={t("form_email_placeholder")}
          value={formData.email}
          onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
          className={cn(
            "w-full px-4 py-3 rounded-xl border border-ink-10 bg-card text-ink",
            "placeholder:text-ink-30 outline-none transition-all duration-150",
            "focus:border-coral focus:ring-3 focus:ring-coral/10"
          )}
        />
        <p className="text-xs text-ink-60">{t("form_email_hint")}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium text-ink">
          {t("form_phone")}
        </label>
        <input
          id="phone"
          type="tel"
          required
          placeholder={t("form_phone_placeholder")}
          value={formData.phone}
          onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
          className={cn(
            "w-full px-4 py-3 rounded-xl border border-ink-10 bg-card text-ink",
            "placeholder:text-ink-30 outline-none transition-all duration-150",
            "focus:border-coral focus:ring-3 focus:ring-coral/10"
          )}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium text-ink">
          {t("form_notes")} <span className="text-ink-30">{t("form_notes_optional")}</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder={t("form_notes_placeholder")}
          value={formData.notes}
          onChange={(e) => onFormChange({ ...formData, notes: e.target.value })}
          className={cn(
            "w-full px-4 py-3 rounded-xl border border-ink-10 bg-card text-ink resize-none",
            "placeholder:text-ink-30 outline-none transition-all duration-150",
            "focus:border-coral focus:ring-3 focus:ring-coral/10"
          )}
        />
      </div>

      <button
        type="submit"
        className={cn(
          "w-full py-3.5 px-6 rounded-xl text-white font-medium",
          "bg-coral hover:bg-coral-dark transition-all duration-250",
          "shadow-[0_8px_24px_rgba(232,80,58,0.22)]",
          "hover:shadow-[0_12px_28px_rgba(232,80,58,0.30)]",
          "hover:-translate-y-0.5 active:translate-y-0"
        )}
      >
        {t("form_submit")}
      </button>
    </form>
  )
}
