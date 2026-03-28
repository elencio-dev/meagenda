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
            "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
            selectedId === p.id
              ? "border-coral bg-coral-pale shadow-sm"
              : "border-ink-10 bg-card hover:border-coral hover:shadow-sm"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center font-serif text-lg text-white flex-shrink-0">
            {getInitials(p.name)}
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm text-ink">{p.name}</p>
            <p className="text-xs text-ink-60 mt-0.5">{p.role}</p>
          </div>
          <div className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
            selectedId === p.id ? "border-coral bg-coral" : "border-ink-10"
          )}>
            {selectedId === p.id && <Check className="w-3.5 h-3.5 text-white" />}
          </div>
        </button>
      ))}
      {profissionais.length === 0 && (
        <p className="text-center text-ink-60 py-8">Nenhum profissional disponível</p>
      )}
    </div>
  )
}
