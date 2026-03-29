"use client"

import { useState } from "react"
import { BookingSteps } from "@/components/booking-steps"
import { Calendar } from "@/components/calendar"
import { TimeSlots } from "@/components/time-slots"
import { ProfessionalSelect } from "@/components/professional-select"
import { ServiceSelect } from "@/components/service-select"
import { BookingForm } from "@/components/booking-form"
import { BookingConfirmation } from "@/components/booking-confirmation"
import { BusinessInfo } from "@/components/business-info"
import type { BookingData, BookingResult } from "@/lib/types"

export function BookingClientFlow({ slug, initialData }: { slug: string; initialData: BookingData }) {
  const [bookingData] = useState<BookingData>(initialData)
  
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", notes: "" })
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null)
  
  // Optimistic UI state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Se não há profissionais, pular o passo 2 (profissional)
  const hasProfissionais = (bookingData.profissionais?.length ?? 0) > 0

  // Mapeamento de step lógico para step real (quando não há profissionais, pula o 2)
  const getNextStep = (step: number) => {
    if (!hasProfissionais && step === 1) return 3 // pula step 2
    if (!hasProfissionais && step === 3) return 4
    if (!hasProfissionais && step === 4) return 5
    if (!hasProfissionais && step === 5) return 6
    return step + 1
  }
  const getPrevStep = (step: number) => {
    if (!hasProfissionais && step === 3) return 1 // volta do step 3 direto p/ 1
    if (!hasProfissionais && step === 4) return 3
    if (!hasProfissionais && step === 5) return 4
    if (!hasProfissionais && step === 6) return 5
    return step - 1
  }

  const handleNextStep = () => { if (currentStep < 6) setCurrentStep(getNextStep(currentStep)) }
  const handlePrevStep = () => { if (currentStep > 1) setCurrentStep(getPrevStep(currentStep)) }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedServiceId) return
    setIsSubmitting(true)

    try {
      const clientRes = await fetch(`/api/clientes?slug=${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, phone: formData.phone, slug }),
      })

      let clienteId: number
      if (clientRes.status === 409) {
        const allRes = await fetch(`/api/clientes?slug=${slug}`)
        const all = await allRes.json()
        const existing = all.find((c: { email: string; id: number }) => c.email === formData.email)
        clienteId = existing?.id
      } else {
        const client = await clientRes.json()
        clienteId = client.id
      }

      const dateStr = selectedDate.toISOString().split("T")[0]
      const agRes = await fetch(`/api/agendamentos?slug=${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          servicoId: selectedServiceId,
          profissionalId: selectedProfessionalId,
          date: dateStr,
          time: selectedTime,
          notes: formData.notes,
          slug,
        }),
      })

      if (agRes.ok) {
        const ag = await agRes.json()
        const servico = bookingData.servicos.find((s) => s.id === selectedServiceId)
        const profissional = bookingData.profissionais.find((p) => p.id === selectedProfessionalId)
        setBookingResult({
          id: ag.id,
          date: selectedDate,
          time: selectedTime,
          serviceName: servico?.name ?? "",
          servicePrice: servico?.price ?? 0,
          professionalName: profissional?.name ?? "",
          clientName: formData.name,
          clientEmail: formData.email,
          clientPhone: formData.phone,
          notes: formData.notes,
        })
        handleNextStep()
      } else {
        const err = await agRes.json()
        alert(err.error + (err.details ? "\n\nDetalhes do Erro: " + err.details : "") || "Este horário já não está mais disponível.")
      }
    } catch (e) {
      console.error(e)
      alert("Ocorreu um erro ao processar seu agendamento.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div><h2 className="font-sans text-2xl text-[var(--ink)] mb-2">Escolha o serviço</h2><p className="text-sm text-[var(--ink-60)]">Selecione o serviço desejado</p></div>
            <ServiceSelect servicos={bookingData.servicos} selectedId={selectedServiceId} onSelect={(id) => { setSelectedServiceId(id); handleNextStep() }} />
          </div>
        )
      case 2:
        if (!hasProfissionais) return null
        return (
          <div className="space-y-6">
            <div><h2 className="font-sans text-2xl text-[var(--ink)] mb-2">Escolha o profissional</h2><p className="text-sm text-[var(--ink-60)]">Selecione quem vai te atender</p></div>
            <ProfessionalSelect profissionais={bookingData.profissionais} selectedId={selectedProfessionalId} onSelect={(id) => { setSelectedProfessionalId(id); handleNextStep() }} />
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div><h2 className="font-sans text-2xl text-[var(--ink)] mb-2">Escolha a data</h2></div>
            <Calendar selectedDate={selectedDate} onSelectDate={(date) => { setSelectedDate(date); handleNextStep() }} />
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div><h2 className="font-sans text-2xl text-[var(--ink)] mb-2">Escolha o horário</h2><p className="text-sm text-[var(--ink-60)]">{selectedDate?.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p></div>
            <TimeSlots selectedDate={selectedDate} profissionalId={selectedProfessionalId} selectedTime={selectedTime} onSelectTime={(time) => { setSelectedTime(time); handleNextStep() }} slug={slug} />
          </div>
        )
      case 5:
        return (
          <div className="space-y-6 relative">
            {isSubmitting && (
              <div className="absolute inset-0 z-10 bg-[var(--paper)]/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                   <div className="w-8 h-8 border-4 border-[var(--coral)] border-t-transparent rounded-full animate-spin" />
                   <span className="text-sm text-[var(--ink)] font-semibold">Confirmando...</span>
                </div>
              </div>
            )}
            <div><h2 className="font-sans text-2xl text-[var(--ink)] mb-2">Seus dados</h2></div>
            <BookingForm formData={formData} onFormChange={setFormData} onSubmit={handleSubmit} />
          </div>
        )
      case 6:
        return <BookingConfirmation bookingResult={bookingResult} businessName={bookingData.business.name} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <header className="bg-[var(--card)] border-b border-[var(--ink-10)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          {bookingData.business.image ? (
            <img src={bookingData.business.image} alt="Logo" className="w-10 h-10 rounded-lg object-cover bg-[var(--ink-10)]" />
          ) : (
            <div className="w-10 h-10 bg-[var(--coral)] rounded-lg flex items-center justify-center">
              <span className="text-white font-sans text-lg">{bookingData.business.name?.[0]?.toUpperCase() || "M"}</span>
            </div>
          )}
          <div>
            <span className="font-sans text-xl text-[var(--ink)]">{bookingData.business.name}</span>
            <span className="text-[var(--ink-30)] text-sm ml-2">· powered by MeAgenda</span>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-[1fr_1.4fr] gap-8">
          <div className="lg:sticky lg:top-10 lg:self-start">
            <BusinessInfo business={bookingData.business} />
          </div>
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--ink-10)] p-5 sm:p-8 shadow-sm">
            <BookingSteps currentStep={currentStep} />
            <div className="mt-8 relative">{renderStepContent()}</div>
            {currentStep > 1 && currentStep < 6 && (
              <div className="mt-8">
                <button disabled={isSubmitting} onClick={handlePrevStep} className="inline-flex items-center gap-2 text-[var(--coral)] hover:bg-[var(--coral-pale)] disabled:opacity-50 px-4 py-2 rounded-lg transition-colors">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Passo anterior
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
