"use client"

import { Check, Calendar as CalendarIcon, Clock, User, Mail, Phone, Scissors } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { cn } from "@/lib/utils"
import type { BookingResult } from "@/lib/types"

interface BookingConfirmationProps {
  bookingResult: BookingResult | null
  businessName?: string
}

export function BookingConfirmation({ bookingResult, businessName = "Studio" }: BookingConfirmationProps) {
  const t = useTranslations("Booking")
  const locale = useLocale()

  if (!bookingResult) return null

  const dateStr = bookingResult.date.toLocaleDateString(locale, {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
  })

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-success-bg mx-auto flex items-center justify-center mb-6">
        <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
          <Check className="w-6 h-6 text-white" strokeWidth={3} />
        </div>
      </div>
      <h2 className="font-serif text-2xl text-[var(--ink)] mb-2">{t("confirmation_title")}</h2>
      <p className="text-sm text-[var(--ink-60)] mb-8">
        {t("confirmation_subtitle")}
      </p>

      {/* Receipt Card */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--ink-10)] overflow-hidden shadow-sm text-left mb-6">
        <div className="bg-[var(--coral)] px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl text-white">{t("confirmation_receipt")}</h3>
            <p className="text-sm text-white/75 mt-0.5">{businessName}</p>
          </div>
          <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center">
            <span className="font-serif text-xl text-[var(--coral)]">{businessName[0]?.toUpperCase()}</span>
          </div>
        </div>

        <div className="p-6 space-y-0">
          {[
            { icon: <User className="w-4 h-4" />, label: t("confirmation_name"), value: bookingResult.clientName },
            { icon: <Mail className="w-4 h-4" />, label: t("confirmation_email"), value: bookingResult.clientEmail },
            { icon: <Phone className="w-4 h-4" />, label: t("confirmation_phone"), value: bookingResult.clientPhone },
            { icon: <Scissors className="w-4 h-4" />, label: t("confirmation_service"), value: bookingResult.serviceName },
            { icon: <User className="w-4 h-4" />, label: t("confirmation_professional"), value: bookingResult.professionalName },
            { icon: <CalendarIcon className="w-4 h-4" />, label: t("confirmation_date"), value: dateStr },
            { icon: <Clock className="w-4 h-4" />, label: t("confirmation_time"), value: bookingResult.time, highlight: true },
          ].map(({ icon, label, value, highlight }) => (
            <div key={label} className="flex justify-between py-3 border-b border-[var(--ink-10)] last:border-0">
              <div className="flex items-center gap-2 text-sm text-[var(--ink-60)]">
                {icon}<span>{label}</span>
              </div>
              <span className={cn("text-sm font-semibold", highlight ? "text-[var(--coral)]" : "text-[var(--ink)]")}>{value}</span>
            </div>
          ))}
          <div className="flex justify-between py-3 border-b border-[var(--ink-10)]">
            <span className="text-sm text-[var(--ink-60)]">{t("confirmation_price")}</span>
            <span className="text-sm font-semibold text-[var(--coral)]">R$ {bookingResult.servicePrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          const d = bookingResult.date
          const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`
          const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(bookingResult.serviceName + " - " + businessName)}&dates=${dateStr}T${bookingResult.time.replace(":","0")}00/${dateStr}T${bookingResult.time.replace(":","0")}00&details=${encodeURIComponent(t("confirmation_professional_detail", { name: bookingResult.professionalName }))}`
          window.open(url, "_blank")
        }}
        className={cn(
          "w-full py-4 px-4 rounded-xl text-white font-medium",
          "bg-[var(--coral)] hover:bg-[var(--coral-dark)] transition-all duration-200",
          "shadow-[0_8px_24px_rgba(232,80,58,0.22)]",
          "flex items-center justify-center gap-2"
        )}
      >
        <CalendarIcon className="w-5 h-5" />
        {t("confirmation_add_calendar")}
      </button>

      <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-bg rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        <span className="text-xs font-semibold text-success uppercase tracking-wider">Nº {String(bookingResult.id).padStart(6,"0")}</span>
      </div>
    </div>
  )
}
