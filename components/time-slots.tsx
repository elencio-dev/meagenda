"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface TimeSlotsProps {
  selectedDate: Date | null
  profissionalId: number | null
  selectedTime: string | null
  onSelectTime: (time: string) => void
  slug?: string
}

type Slot = { time: string; available: boolean }

export function TimeSlots({ selectedDate, profissionalId, selectedTime, onSelectTime, slug }: TimeSlotsProps) {
  const t = useTranslations("Booking")
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedDate) return
    setLoading(true)
    const dateStr = selectedDate.toISOString().split("T")[0]
    const params = new URLSearchParams({ date: dateStr })
    if (profissionalId) params.set("profissionalId", String(profissionalId))
    if (slug) params.set("slug", slug)
    fetch(`/api/slots?${params}`)
      .then(r => r.json())
      .then(data => setSlots(data.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }, [selectedDate, profissionalId, slug])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-10 rounded-md bg-[var(--ink-10)] animate-pulse" />
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-transparent pt-2">
          <div className="h-4 w-20 bg-[var(--ink-10)] rounded animate-pulse" />
          <div className="h-4 w-20 bg-[var(--ink-10)] rounded animate-pulse" />
          <div className="h-4 w-20 bg-[var(--ink-10)] rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {slots.map(({ time, available }) => (
          <button
            key={time}
            data-testid="time-slot"
            onClick={() => available && onSelectTime(time)}
            disabled={!available}
            className={cn(
              "px-3 py-3 sm:px-4 sm:py-3.5 rounded-xl text-sm font-bold border transition-all duration-300 ease-out active:scale-[0.97]",
              selectedTime === time
                ? "bg-[var(--coral)] text-white border-[var(--coral)] shadow-md ring-1 ring-[var(--coral)]/50 z-10 scale-105"
                : available
                ? "bg-[var(--card)] text-[var(--ink)] border-[var(--ink-10)] hover:border-[var(--coral-light)] hover:text-[var(--coral)] hover:bg-[var(--coral-pale)] hover:shadow-sm"
                : "bg-[var(--ink-10)] text-[var(--ink-30)] border-[var(--ink-10)] cursor-not-allowed line-through opacity-70"
            )}
          >
            {time}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[var(--ink-60)] pt-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[var(--card)] border border-[var(--ink-10)] shadow-sm" />
          <span>{t("slot_available")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[var(--coral)] shadow-sm" />
          <span>{t("slot_selected")}</span>
        </div>
        <div className="flex items-center gap-2 opacity-70">
          <span className="w-5 h-5 rounded-md bg-[var(--ink-10)]" />
          <span>{t("slot_taken")}</span>
        </div>
      </div>
    </div>
  )
}
