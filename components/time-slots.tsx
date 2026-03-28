"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface TimeSlotsProps {
  selectedDate: Date | null
  profissionalId: number | null
  selectedTime: string | null
  onSelectTime: (time: string) => void
  slug?: string // for public booking pages
}

type Slot = { time: string; available: boolean }

export function TimeSlots({ selectedDate, profissionalId, selectedTime, onSelectTime, slug }: TimeSlotsProps) {
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
            onClick={() => available && onSelectTime(time)}
            disabled={!available}
            className={cn(
              "px-4 py-2.5 rounded-md text-sm font-medium border transition-all duration-200",
              selectedTime === time
                ? "bg-coral text-white border-coral shadow-[0_8px_24px_rgba(232,80,58,0.22)]"
                : available
                ? "bg-card text-ink border-ink-10 hover:border-coral hover:text-coral hover:bg-coral-pale"
                : "bg-ink-10 text-ink-30 border-ink-10 cursor-not-allowed line-through"
            )}
          >
            {time}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-ink-60 pt-2">
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-4 rounded bg-card border border-ink-10" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-4 rounded bg-coral" />
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-4 rounded bg-ink-10" />
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  )
}
