"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarProps {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"]
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

// Mock data for days with available slots
const DAYS_WITH_SLOTS = [2, 3, 4, 8, 9, 10, 11, 15, 17, 18, 23, 24, 25]

export function Calendar({ selectedDate, onSelectDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const today = new Date()
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }
  
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }
  
  const isToday = (day: number) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear()
  }
  
  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return day === selectedDate.getDate() && 
           month === selectedDate.getMonth() && 
           year === selectedDate.getFullYear()
  }
  
  const isPastDay = (day: number) => {
    const date = new Date(year, month, day)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return date < todayStart
  }
  
  const isSunday = (dayIndex: number) => {
    return dayIndex === 0
  }
  
  const hasSlots = (day: number) => DAYS_WITH_SLOTS.includes(day)
  
  const handleDateClick = (day: number) => {
    if (isPastDay(day)) return
    const dayOfWeek = new Date(year, month, day).getDay()
    if (isSunday(dayOfWeek)) return
    
    onSelectDate(new Date(year, month, day))
  }
  
  const days = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    days.push(
      <div key={`empty-${i}`} className="aspect-square flex items-center justify-center text-sm text-ink-10">
        {prevMonthLastDay - startingDayOfWeek + i + 1}
      </div>
    )
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = new Date(year, month, day).getDay()
    const disabled = isPastDay(day) || isSunday(dayOfWeek)
    
    days.push(
      <button
        key={day}
        data-testid="calendar-day"
        data-day={day}
        onClick={() => handleDateClick(day)}
        disabled={disabled}
        className={cn(
          "aspect-square flex flex-col items-center justify-center text-sm rounded-md relative transition-all duration-150",
          isSelected(day) 
            ? "bg-coral text-white" 
            : isToday(day)
            ? "font-bold text-coral"
            : disabled
            ? "text-ink-30 cursor-not-allowed"
            : "text-ink hover:bg-coral-pale hover:text-coral",
          hasSlots(day) && !disabled && !isSelected(day) && "pb-1.5"
        )}
      >
        {day}
        {hasSlots(day) && !disabled && !isSelected(day) && (
          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-coral" />
        )}
      </button>
    )
  }
  
  return (
    <div className="bg-card rounded-xl border border-ink-10 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-ink-10">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-md border border-ink-10 flex items-center justify-center text-ink-60 hover:border-coral hover:text-coral transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-ink">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-md border border-ink-10 flex items-center justify-center text-ink-60 hover:border-coral hover:text-coral transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {WEEKDAYS.map((day, index) => (
            <div key={index} className="text-center text-xs font-semibold text-ink-30 uppercase py-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-0.5">
          {days}
        </div>
      </div>
      
      <div className="px-4 pb-4 flex items-center gap-4 text-xs text-ink-60">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-coral" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-ink-30" />
          <span>Indisponível</span>
        </div>
      </div>
    </div>
  )
}
