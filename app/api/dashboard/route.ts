import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const userId = user.id

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

    const [todayAppointments, totalClients, profissionais, newClientsThisMonth] = await Promise.all([
      prisma.agendamento.findMany({
        where: { userId, date: { gte: today }, NOT: { status: "cancelled" } },
        take: 10,
        include: {
          cliente: { select: { name: true } },
          servico: { select: { name: true, duration: true } },
          profissional: { select: { name: true } },
        },
        orderBy: { time: "asc" },
      }),
      prisma.cliente.count({ where: { userId } }),
      prisma.profissional.findMany({
        where: { userId },
        include: { _count: { select: { agendamentos: { where: { date: { gte: today, lt: tomorrow } } } } } },
      }),
      prisma.cliente.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
          },
        },
      }),
    ])

    return NextResponse.json({
      stats: {
        todayCount: todayAppointments.length, // Usaremos para contar os próximos
        totalClients,
        newClientsThisMonth,
      },
      upcomingAppointments: todayAppointments.map(a => ({
        id: a.id,
        client: a.cliente.name,
        service: a.servico.name,
        time: a.time,
        duration: `${a.servico.duration}min`,
        professional: a.profissional?.name ?? "Sem profissional",
        status: a.status,
      })),
      professionals: profissionais.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        available: p.available,
        appointments: p._count.agendamentos,
      })),
    })
  } catch (error) {
    console.error("[GET /api/dashboard]", error)
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
  }
}
