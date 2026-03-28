import { MapPin, Clock, Scissors } from "lucide-react"

type Business = { name: string; address: string; phone: string; description: string } | undefined

export function BusinessInfo({ business }: { business: Business }) {
  const name = business?.name ?? "Studio"
  const address = business?.address ?? ""
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="bg-coral-pale rounded-xl p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center">
          <span className="text-white font-serif text-2xl">{initials}</span>
        </div>
        <div>
          <h1 className="font-serif text-2xl text-ink">{name}</h1>
          {business?.description && (
            <p className="text-sm text-ink-60 mt-1 line-clamp-2">{business.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-coral mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-ink">Localização</p>
              <p className="text-sm text-ink-60">{address}</p>
            </div>
          </div>
        )}
        {business?.phone && (
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-coral mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-ink">Contato</p>
              <p className="text-sm text-ink-60">{business.phone}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-coral-light/30">
        <h3 className="text-xs font-semibold text-ink-60 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Scissors className="w-3 h-3" />
          Agendamento online
        </h3>
        <p className="text-sm text-ink-60">Escolha o serviço, profissional, data e horário. Rápido e fácil.</p>
      </div>
    </div>
  )
}
