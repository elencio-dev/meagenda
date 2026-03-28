"use client"

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-ink">
          Nome completo
        </label>
        <input
          id="name"
          type="text"
          required
          placeholder="Maria da Silva"
          value={formData.name}
          onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
          className={cn(
            "w-full px-4 py-3 rounded-xl border border-ink-10 bg-card text-ink",
            "placeholder:text-ink-30 outline-none transition-all duration-150",
            "focus:border-coral focus:ring-3 focus:ring-coral/10"
          )}
        />
        <p className="text-xs text-ink-60">Como você prefere ser chamado(a)</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="maria@email.com"
          value={formData.email}
          onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
          className={cn(
            "w-full px-4 py-3 rounded-xl border border-ink-10 bg-card text-ink",
            "placeholder:text-ink-30 outline-none transition-all duration-150",
            "focus:border-coral focus:ring-3 focus:ring-coral/10"
          )}
        />
        <p className="text-xs text-ink-60">Para receber o comprovante em PDF</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium text-ink">
          Contato / WhatsApp
        </label>
        <input
          id="phone"
          type="tel"
          required
          placeholder="(11) 91234-5678"
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
          Observação <span className="text-ink-30">(opcional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Alguma preferência ou informação adicional..."
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
        Confirmar agendamento
      </button>
    </form>
  )
}
