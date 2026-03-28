"use client"

import { Check, Download, Calendar as CalendarIcon, Clock, User, Mail, Phone, Scissors } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BookingResult } from "@/lib/types"

interface BookingConfirmationProps {
  bookingResult: BookingResult | null
  businessName?: string
}

function generatePDF(result: BookingResult, businessName: string) {
  const dateStr = result.date.toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  })

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Comprovante de Agendamento</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #FAFAF8; color: #1A1A18; padding: 40px; }
    .card { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #E8503A; padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; }
    .header h1 { font-family: Georgia, serif; font-size: 22px; color: white; }
    .header p { font-size: 13px; color: rgba(255,255,255,0.75); margin-top: 4px; }
    .logo { width: 44px; height: 44px; background: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .logo span { color: #E8503A; font-family: Georgia, serif; font-size: 20px; font-weight: bold; }
    .body { padding: 28px 32px; }
    .status { display: flex; align-items: center; gap: 8px; background: #F0FDF4; border-radius: 8px; padding: 10px 16px; margin-bottom: 24px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #22C55E; }
    .status span { color: #16A34A; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #F0EFE8; }
    .row:last-child { border-bottom: none; }
    .label { font-size: 13px; color: #8A8A82; display: flex; align-items: center; gap: 8px; }
    .value { font-size: 13px; font-weight: 600; color: #1A1A18; text-align: right; max-width: 200px; }
    .value.highlight { color: #E8503A; }
    .footer { padding: 20px 32px; background: #FAFAF8; border-top: 1px solid #F0EFE8; text-align: center; }
    .footer p { font-size: 12px; color: #8A8A82; }
    .id { font-size: 11px; color: #BFBFBA; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1>Comprovante</h1>
        <p>${businessName}</p>
      </div>
      <div class="logo"><span>${businessName[0]?.toUpperCase() ?? "A"}</span></div>
    </div>
    <div class="body">
      <div class="status"><div class="status-dot"></div><span>Agendamento confirmado</span></div>
      <div class="row">
        <div class="label">👤 Nome</div>
        <div class="value">${result.clientName}</div>
      </div>
      <div class="row">
        <div class="label">✉️ E-mail</div>
        <div class="value">${result.clientEmail}</div>
      </div>
      <div class="row">
        <div class="label">📱 Telefone</div>
        <div class="value">${result.clientPhone}</div>
      </div>
      <div class="row">
        <div class="label">✂️ Serviço</div>
        <div class="value">${result.serviceName}</div>
      </div>
      <div class="row">
        <div class="label">👩 Profissional</div>
        <div class="value">${result.professionalName}</div>
      </div>
      <div class="row">
        <div class="label">📅 Data</div>
        <div class="value">${dateStr}</div>
      </div>
      <div class="row">
        <div class="label">🕐 Horário</div>
        <div class="value highlight">${result.time}</div>
      </div>
      <div class="row">
        <div class="label">💰 Valor</div>
        <div class="value highlight">R$ ${result.servicePrice.toFixed(2)}</div>
      </div>
      ${result.notes ? `<div class="row"><div class="label">📝 Obs.</div><div class="value">${result.notes}</div></div>` : ""}
    </div>
    <div class="footer">
      <p>Apresente este comprovante no dia do atendimento</p>
      <p class="id">Nº ${String(result.id).padStart(6, "0")}</p>
    </div>
  </div>
</body>
</html>`

  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, "_blank")
  if (win) {
    setTimeout(() => { win.print(); URL.revokeObjectURL(url) }, 800)
  }
}

export function BookingConfirmation({ bookingResult, businessName = "Studio" }: BookingConfirmationProps) {
  if (!bookingResult) return null

  const dateStr = bookingResult.date.toLocaleDateString("pt-BR", {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
  })

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-success-bg mx-auto flex items-center justify-center mb-6">
        <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
          <Check className="w-6 h-6 text-white" strokeWidth={3} />
        </div>
      </div>
      <h2 className="font-serif text-2xl text-ink mb-2">Agendamento confirmado!</h2>
      <p className="text-sm text-ink-60 mb-8">
        Você pode baixar o comprovante em PDF abaixo.
      </p>

      {/* Receipt Card */}
      <div className="bg-card rounded-xl border border-ink-10 overflow-hidden shadow-sm text-left">
        <div className="bg-coral px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl text-white">Comprovante</h3>
            <p className="text-sm text-white/75 mt-0.5">{businessName}</p>
          </div>
          <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center">
            <span className="font-serif text-xl text-coral">{businessName[0]?.toUpperCase()}</span>
          </div>
        </div>

        <div className="p-6 space-y-0">
          {[
            { icon: <User className="w-4 h-4" />, label: "Nome", value: bookingResult.clientName },
            { icon: <Mail className="w-4 h-4" />, label: "E-mail", value: bookingResult.clientEmail },
            { icon: <Phone className="w-4 h-4" />, label: "Telefone", value: bookingResult.clientPhone },
            { icon: <Scissors className="w-4 h-4" />, label: "Serviço", value: bookingResult.serviceName },
            { icon: <User className="w-4 h-4" />, label: "Profissional", value: bookingResult.professionalName },
            { icon: <CalendarIcon className="w-4 h-4" />, label: "Data", value: dateStr },
            { icon: <Clock className="w-4 h-4" />, label: "Horário", value: bookingResult.time, highlight: true },
          ].map(({ icon, label, value, highlight }) => (
            <div key={label} className="flex justify-between py-3 border-b border-ink-10 last:border-0">
              <div className="flex items-center gap-2 text-sm text-ink-60">
                {icon}<span>{label}</span>
              </div>
              <span className={cn("text-sm font-semibold", highlight ? "text-coral" : "text-ink")}>{value}</span>
            </div>
          ))}
          <div className="flex justify-between py-3 border-b border-ink-10">
            <span className="text-sm text-ink-60">Valor</span>
            <span className="text-sm font-semibold text-coral">R$ {bookingResult.servicePrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={() => generatePDF(bookingResult, businessName)}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl text-ink font-medium",
              "bg-card border border-ink-10 hover:border-ink-30 transition-colors duration-150",
              "flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            )}
          >
            <Download className="w-4 h-4" />
            Baixar PDF
          </button>
          <button
            onClick={() => {
              const d = bookingResult.date
              const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`
              const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(bookingResult.serviceName + " - " + businessName)}&dates=${dateStr}T${bookingResult.time.replace(":","0")}00/${dateStr}T${bookingResult.time.replace(":","0")}00&details=${encodeURIComponent("Profissional: " + bookingResult.professionalName)}`
              window.open(url, "_blank")
            }}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl text-white font-medium",
              "bg-coral hover:bg-coral-dark transition-all duration-200",
              "shadow-[0_8px_24px_rgba(232,80,58,0.22)]",
              "flex items-center justify-center gap-2"
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            Google Calendar
          </button>
        </div>
      </div>

      <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-bg rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        <span className="text-xs font-semibold text-success uppercase tracking-wider">Nº {String(bookingResult.id).padStart(6,"0")}</span>
      </div>
    </div>
  )
}
