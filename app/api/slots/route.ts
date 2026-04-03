import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/auth-helpers"
import { generateTimeSlots } from "@/lib/scheduling"

export async function GET(request: NextRequest) {
  const userId = await getUserId(request)
  const defaultSlots = generateTimeSlots("08:00", "19:00", 60)
  if (!userId) return NextResponse.json({ slots: defaultSlots.map(t => ({ time: t, available: true })) })

  const { searchParams } = request.nextUrl
  const dateParam = searchParams.get("date")
  const profissionalId = searchParams.get("profissionalId")

  try {
    // Buscar configurações de horário do tenant
    const configs = await prisma.configuracao.findMany({
      where: { userId, key: { in: ["workHourStart", "workHourEnd", "workInterval"] } }
    })
    const map = new Map(configs.map(c => [c.key, c.value]))
    
    const start = map.get("workHourStart") || "08:00"
    const end = map.get("workHourEnd") || "19:00"
    const interval = Number(map.get("workInterval")) || 60
    
    const allSlots = generateTimeSlots(start, end, interval)

    if (!dateParam) {
      return NextResponse.json({ slots: allSlots.map(t => ({ time: t, available: true })) })
    }

    const date = new Date(dateParam)
    const nextDay = new Date(date); nextDay.setDate(nextDay.getDate() + 1)

    // Agendamentos bloqueando horário geral da empresa OU do profissional específico
    // Agendamentos bloqueando horário geral da empresa OU do profissional específico E Bloqueios manuais do Admin
    const [generalBookings, professionalBookings, generalBlocks, professionalBlocks] = await Promise.all([
      // Vagas ocupadas no geral (clientes marcaram "sem profissional")
      prisma.agendamento.findMany({
        where: { userId, date: { gte: date, lt: nextDay }, status: { not: "cancelled" } },
        select: { time: true, profissionalId: true },
      }).then(res => res.filter((a: { time: string; profissionalId: number | null }) => a.profissionalId === null)),
      
      // Vagas ocupadas pelo profissional específico
      profissionalId ? prisma.agendamento.findMany({
        where: { userId, profissionalId: Number(profissionalId), date: { gte: date, lt: nextDay }, status: { not: "cancelled" } },
        select: { time: true },
      }) : Promise.resolve([]),

      // Bloqueios Manuais (Gerais - profissionalId nulo)
      prisma.bloqueio.findMany({
        where: { userId, date: { gte: date, lt: nextDay } },
        select: { time: true, profissionalId: true },
      }).then(res => res.filter((b: { time: string; profissionalId: number | null }) => b.profissionalId === null)),

      // Bloqueios Manuais do Profissional
      profissionalId ? prisma.bloqueio.findMany({
        where: { userId, profissionalId: Number(profissionalId), date: { gte: date, lt: nextDay } },
        select: { time: true },
      }) : Promise.resolve([])
    ])

    const bookedTimes = new Set([
      ...generalBookings.map((a: { time: string }) => a.time),
      ...professionalBookings.map((a: { time: string }) => a.time),
      ...generalBlocks.map((b: { time: string }) => b.time),
      ...professionalBlocks.map((b: { time: string }) => b.time)
    ])
    return NextResponse.json({
      slots: allSlots.map(time => ({ time, available: !bookedTimes.has(time) })),
    })
  } catch (error) {
    console.error("[GET /api/slots]", error)
    return NextResponse.json({ error: "Erro ao buscar slots" }, { status: 500 })
  }
}
