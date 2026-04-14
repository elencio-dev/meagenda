"use client"

import { useTranslations } from "next-intl"
import { MapPin, Clock, Scissors } from "lucide-react"

type Business = { name: string; address: string; phone: string; description: string; image?: string | null } | undefined

export function BusinessInfo({ business }: { business: Business }) {
  const t = useTranslations("Booking")
  const name = business?.name ?? "Studio"
  const address = business?.address ?? ""
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="bg-[var(--coral-pale)] rounded-2xl p-6 lg:p-8">
      <div className="flex items-start gap-4 mb-6">
        {business?.image ? (
          <img src={business.image} alt={name} className="w-16 h-16 rounded-full object-cover flex-shrink-0 shadow-sm border border-[var(--ink-10)]" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--coral)] to-[var(--coral-dark)] flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-serif text-2xl">{initials}</span>
          </div>
        )}
        <div className="flex-1 min-w-0 pt-1">
          <h1 className="font-serif text-2xl text-[var(--ink)] truncate">{name}</h1>
          {business?.description && (
            <p className="text-sm text-[var(--ink-60)] mt-1.5 line-clamp-2">{business.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[var(--coral)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">{t("biz_location")}</p>
              <p className="text-sm text-[var(--ink-60)]">{address}</p>
            </div>
          </div>
        )}
        {business?.phone && (
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[var(--coral)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">{t("biz_contact")}</p>
              <p className="text-sm text-[var(--ink-60)]">{business.phone}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--coral-light)]/30">
        <h3 className="text-xs font-semibold text-[var(--ink-60)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <Scissors className="w-3 h-3" />
          {t("biz_online_booking")}
        </h3>
        <p className="text-sm text-[var(--ink-60)]">{t("biz_online_booking_desc")}</p>
      </div>
    </div>
  )
}
