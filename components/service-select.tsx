"use client"

import { cn } from "@/lib/utils"
import { Check, Sparkles } from "lucide-react"

type Servico = { id: number; name: string; price: number; duration: number; category: string; popular: boolean }

interface ServiceSelectProps {
  servicos: Servico[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function ServiceSelect({ servicos, selectedId, onSelect }: ServiceSelectProps) {
  // Agrupar por categoria
  const categories = Array.from(new Set(servicos.map(s => s.category)))

  const formatDuration = (min: number) => {
    if (min >= 60) {
      const h = Math.floor(min / 60)
      const m = min % 60
      return m > 0 ? `${h}h ${m}min` : `${h}h`
    }
    return `${min}min`
  }

  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <div key={cat}>
          <p className="text-xs font-semibold text-ink-60 uppercase tracking-wider mb-2">{cat}</p>
          <div className="space-y-2">
            {servicos.filter(s => s.category === cat).map(servico => (
              <button
                key={servico.id}
                onClick={() => onSelect(servico.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200",
                  selectedId === servico.id
                    ? "border-coral bg-coral-pale shadow-sm"
                    : "border-ink-10 bg-card hover:border-coral hover:shadow-sm"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-ink">{servico.name}</p>
                    {servico.popular && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-coral-pale text-coral rounded-full text-[11px] font-medium">
                        <Sparkles className="w-3 h-3" />Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-60 mt-0.5">{formatDuration(servico.duration)}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-semibold text-ink">R$ {servico.price}</p>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  selectedId === servico.id ? "border-coral bg-coral" : "border-ink-10"
                )}>
                  {selectedId === servico.id && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      {servicos.length === 0 && (
        <p className="text-center text-ink-60 py-8">Nenhum serviço disponível</p>
      )}
    </div>
  )
}
