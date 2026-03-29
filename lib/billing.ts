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
