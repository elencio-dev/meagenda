"use client"

import { cn } from "@/lib/utils"

interface BookingStepsProps {
  currentStep: number
}

const steps = [
  { number: 1, label: "Serviço" },
  { number: 2, label: "Profissional" },
  { number: 3, label: "Data" },
  { number: 4, label: "Horário" },
  { number: 5, label: "Dados" },
]

export function BookingSteps({ currentStep }: BookingStepsProps) {
  if (currentStep === 6) return null

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                currentStep === step.number
                  ? "bg-coral text-white shadow-[0_4px_12px_rgba(232,80,58,0.35)]"
                  : currentStep > step.number
                  ? "bg-coral text-white opacity-60"
                  : "bg-ink-10 text-ink-30"
              )}
            >
              {currentStep > step.number ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : step.number}
            </div>
            <span className={cn(
              "text-[10px] mt-1 font-medium hidden sm:block",
              currentStep >= step.number ? "text-coral" : "text-ink-30"
            )}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              "flex-1 h-0.5 mx-1 transition-all duration-300",
              currentStep > step.number ? "bg-coral opacity-60" : "bg-ink-10"
            )} />
          )}
        </div>
      ))}
    </div>
  )
}
