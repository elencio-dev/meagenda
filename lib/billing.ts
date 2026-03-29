import { prisma } from "@/lib/prisma"

/**
 * Verifica se a empresa tem acesso aos recursos do plano Pro
 */
export async function hasProFeatures(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planId: true }
  })
  return user?.planId === "PRO"
}

/**
 * Verifica se a empresa / link de agendamento ainda aceita agendamentos
 * Baseado no reset do mês calendário atual e limite de 30 agendamentos
 */
export async function canCreateAppointment(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planId: true }
  })

  // Se for PRO, ilimitado
  if (user?.planId === "PRO") return true

  // Verificação do plano FREE
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)

  const count = await prisma.agendamento.count({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      },
      status: {
        not: "cancelled"
      }
    }
  })

  return count < 30
}

/**
 * Retorna os detalhes de faturamento e consumo do usuário para a Dashboard
 */
export async function getPlanLimits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planId: true, remindersEnabled: true }
  })

  // Retorno se for PRO
  if (user?.planId === "PRO") {
     return {
       plan: "PRO",
       planName: "Profissional",
       maxAppointments: "Ilimitado",
       currentAppointments: null, // N/A
       usagePercentage: 0,
       hasReminders: true,
       remindersEnabled: user.remindersEnabled
     }
  }

  // Verificação de consumo do Plano FREE
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)

  const appointmentsCount = await prisma.agendamento.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth, lte: endOfMonth },
      status: { not: "cancelled" }
    }
  })

  return {
    plan: "FREE",
    planName: "Grátis",
    maxAppointments: 30,
    currentAppointments: appointmentsCount,
    usagePercentage: Math.min((appointmentsCount / 30) * 100, 100),
    hasReminders: false,
    remindersEnabled: user?.remindersEnabled ?? true
  }
}
