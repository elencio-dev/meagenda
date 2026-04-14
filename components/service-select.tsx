"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Check, Sparkles, Clock } from "lucide-react"

type Servico = { id: number; name: string; price: number; duration: number; category: string; popular: boolean; imageUrl?: string | null }

interface ServiceSelectProps {
  servicos: Servico[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function ServiceSelect({ servicos, selectedId, onSelect }: ServiceSelectProps) {
  const t = useTranslations("Booking")

  const categories = Array.from(new Set(servicos.map(s => s.category)))

  const formatDuration = (min: number) => {
    if (min >= 60) { const h = Math.floor(min / 60); const m = min % 60; return m > 0 ? `${h}h ${m}min` : `${h}h` }
    return `${min}min`
  }

  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <div key={cat}>
          <p className="text-xs font-semibold text-[var(--ink-60)] uppercase tracking-wider mb-2">{cat}</p>
          <div className="space-y-2">
            {servicos.filter(s => s.category === cat).map(servico => (
              <button
                key={servico.id}
                data-testid="service-card"
                onClick={() => onSelect(servico.id)}
                className={cn(
                  "relative w-full flex items-center justify-between gap-4 p-4 lg:p-5 rounded-2xl border text-left transition-all duration-300 ease-out active:scale-[0.98]",
                  selectedId === servico.id
                    ? "border-[var(--coral)] bg-[var(--coral-pale)] shadow-md ring-1 ring-[var(--coral)]/50 z-10"
                    : "border-[var(--ink-10)] bg-[var(--card)] hover:border-[var(--coral-light)] hover:shadow-sm"
                )}
              >
                <div className="flex flex-1 items-center gap-4 pr-4">
                  {servico.imageUrl && (
                    <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-[var(--ink-10)] shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={servico.imageUrl} alt={servico.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={cn("font-semibold text-[15px] transition-colors", selectedId === servico.id ? "text-[var(--ink)]" : "text-[var(--ink)]")}>
                        {servico.name}
                      </p>
                      {servico.popular && (
                        <span className="inline-flex flex-shrink-0 items-center gap-1 px-2.5 py-0.5 bg-[var(--coral)] text-white rounded-full text-[10px] font-bold tracking-wide uppercase">
                          <Sparkles className="w-3 h-3" /> {t("service_popular_badge")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-[var(--ink-60)] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(servico.duration)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className={cn("font-bold text-base", selectedId === servico.id ? "text-[var(--coral)]" : "text-[var(--ink)]")}>
                      R$ {servico.price}
                    </p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                    selectedId === servico.id
                      ? "border-[var(--coral)] bg-[var(--coral)] shadow-sm scale-110"
                      : "border-[var(--ink-20)] bg-transparent"
                  )}>
                    {selectedId === servico.id && <Check className="w-3.5 h-3.5 text-white animate-in zoom-in" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      {servicos.length === 0 && (
        <p className="text-center text-ink-60 py-8">{t("no_services")}</p>
      )}
    </div>
  )
}
