import { prisma } from "@/lib/prisma"

// ─── Plan limits ─────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  FREE: { professionals: 1, appointments: 30 },
  PRO:  { professionals: 10, appointments: Infinity },
} as const

// ─── Private helpers ─────────────────────────────────────────────────────────

/**
 * Returns start/end boundaries for the current calendar month.
 * Extracted to eliminate duplicated date arithmetic across billing functions.
 */
function getMonthBoundaries(): { start: Date; end: Date } {
  const today = new Date()
  return {
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999),
  }
}

/**
 * Counts non-cancelled appointments for a user in the current calendar month.
 */
async function getMonthlyCount(userId: string): Promise<number> {
  const { start, end } = getMonthBoundaries()
  return prisma.agendamento.count({
    where: {
      userId,
      createdAt: { gte: start, lte: end },
      status: { not: "cancelled" },
    },
  })
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Verifica se a empresa tem acesso aos recursos do plano Pro
 */
export async function hasProFeatures(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planId: true },
  })
  return user?.planId === "PRO"
}

/**
 * Verifica se a empresa / link de agendamento ainda aceita agendamentos.
 * Baseado no reset do mês calendário atual e limite de 30 agendamentos.
 */
export async function canCreateAppointment(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planId: true, planExpiresAt: true },
  })

  if (user?.planId === "PRO") {
    if (user.planExpiresAt && user.planExpiresAt < new Date()) {
      return false
    }
    return true
  }

  const count = await getMonthlyCount(userId)
  return count < 30
}

/**
 * Verifica se o usuário pode adicionar mais profissionais com base no plano.
 * FREE → máximo 1 profissional ativo
 * PRO  → máximo 10 profissionais
 */
export async function canAddProfessional(userId: string): Promise<{ allowed: boolean; limit: number; current: number; plan: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planId: true },
  })

  const plan = (user?.planId ?? "FREE") as "FREE" | "PRO"
  const limit = PLAN_LIMITS[plan].professionals

  const current = await prisma.profissional.count({ where: { userId } })

  return { allowed: current < limit, limit, current, plan }
}

/**
 * Retorna os detalhes de faturamento e consumo do usuário para a Dashboard.
 */
export async function getPlanLimits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planId: true, remindersEnabled: true, subscriptionStatus: true, planExpiresAt: true },
  })

  if (user?.planId === "PRO") {
    return {
      plan: "PRO",
      planName: "Profissional",
      maxAppointments: "Ilimitado",
      currentAppointments: null,
      usagePercentage: 0,
      hasReminders: true,
      remindersEnabled: user.remindersEnabled,
      subscriptionStatus: user.subscriptionStatus,
      planExpiresAt: user.planExpiresAt,
    }
  }

  const appointmentsCount = await getMonthlyCount(userId)

  return {
    plan: "FREE",
    planName: "Grátis",
    maxAppointments: 30,
    currentAppointments: appointmentsCount,
    usagePercentage: Math.min((appointmentsCount / 30) * 100, 100),
    hasReminders: false,
    remindersEnabled: user?.remindersEnabled ?? true,
    subscriptionStatus: user?.subscriptionStatus,
    planExpiresAt: user?.planExpiresAt,
  }
}
