"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type Profissional = { id: number; name: string; role: string }

interface ProfessionalSelectProps {
  profissionais: Profissional[]
  selectedId: number | null
  onSelect: (id: number) => void
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

export function ProfessionalSelect({ profissionais, selectedId, onSelect }: ProfessionalSelectProps) {
  return (
    <div className="space-y-3">
      {profissionais.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={cn(
            "relative w-full flex items-center gap-4 p-4 lg:p-5 rounded-2xl border text-left transition-all duration-300 ease-out active:scale-[0.98]",
            selectedId === p.id
              ? "border-[var(--coral)] bg-[var(--coral-pale)] shadow-md ring-1 ring-[var(--coral)]/50 z-10"
              : "border-[var(--ink-10)] bg-[var(--card)] hover:border-[var(--coral-light)] hover:shadow-sm"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--coral)] to-[var(--coral-dark)] flex items-center justify-center font-serif text-lg text-white flex-shrink-0 shadow-sm">
            {getInitials(p.name)}
          </div>
          <div className="flex-1 text-left min-w-0 pr-4">
            <p className={cn("font-semibold text-[15px] transition-colors", selectedId === p.id ? "text-[var(--ink)]" : "text-[var(--ink)]")}>{p.name}</p>
            <p className="text-xs font-medium text-[var(--ink-60)] mt-0.5 truncate">{p.role}</p>
          </div>
          
          <div className="flex items-center flex-shrink-0">
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
              selectedId === p.id 
                ? "border-[var(--coral)] bg-[var(--coral)] shadow-sm scale-110" 
                : "border-[var(--ink-20)] bg-transparent"
            )}>
              {selectedId === p.id && <Check className="w-3.5 h-3.5 text-white animate-in zoom-in" />}
            </div>
          </div>
        </button>
      ))}
      {profissionais.length === 0 && (
        <p className="text-center text-ink-60 py-8">Nenhum profissional disponível</p>
      )}
    </div>
  )
}
