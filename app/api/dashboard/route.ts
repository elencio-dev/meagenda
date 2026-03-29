import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const userId = user.id

  try {
    // Para evitar bugs de fuso horário onde o "hoje" do servidor Vercel é horas à frente,
    // pegamos sempre a string "YYYY-MM-DD" e zeramos como UTC, ficando igual ao banco de dados.
    const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }).split("T")[0]
    const startOfToday = new Date(todayStr)
    
    const tomorrow = new Date(startOfToday)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [todayAppointments, totalClients, profissionais, newClientsThisMonth] = await Promise.all([
      prisma.agendamento.findMany({
        where: { userId, date: { gte: startOfToday }, NOT: { status: "cancelled" } },
        take: 10,
        include: {
          cliente: { select: { name: true, phone: true } },
          servico: { select: { name: true, duration: true } },
          profissional: { select: { name: true } },
        },
        orderBy: [{ date: "asc" }, { time: "asc" }],
      }),
      prisma.cliente.count({ where: { userId } }),
      prisma.profissional.findMany({
        where: { userId },
        include: { _count: { select: { agendamentos: { where: { date: { gte: startOfToday, lt: tomorrow } } } } } },
      }),
      prisma.cliente.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1),
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
        clientPhone: a.cliente.phone,
        service: a.servico.name,
        date: new Date(a.date).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' }),
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
