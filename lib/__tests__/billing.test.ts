import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Mock prisma before imports ───────────────────────────────────────────────
const { mockFindUnique, mockCount } = vi.hoisted(() => {
  const mockFindUnique = vi.fn()
  const mockCount = vi.fn()
  return { mockFindUnique, mockCount }
})

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mockFindUnique },
    agendamento: { count: mockCount },
  },
}))

import { canCreateAppointment, getPlanLimits } from "@/lib/billing"

const FREE_USER = { id: "user-free", planId: "FREE", remindersEnabled: true }
const PRO_USER = { id: "user-pro", planId: "PRO", remindersEnabled: false }

// ─── canCreateAppointment ────────────────────────────────────────────────────
describe("canCreateAppointment", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns true immediately for PRO users without querying agendamentos", async () => {
    mockFindUnique.mockResolvedValue(PRO_USER)

    const result = await canCreateAppointment(PRO_USER.id)

    expect(result).toBe(true)
    expect(mockCount).not.toHaveBeenCalled()
  })

  it("returns true for PRO user with planExpiresAt in the future", async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 3)
    mockFindUnique.mockResolvedValue({ ...PRO_USER, planExpiresAt: futureDate })
    
    const result = await canCreateAppointment(PRO_USER.id)
    expect(result).toBe(true)
  })

  it("returns false for PRO user with planExpiresAt in the past", async () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)
    mockFindUnique.mockResolvedValue({ ...PRO_USER, planExpiresAt: pastDate })
    
    const result = await canCreateAppointment(PRO_USER.id)
    expect(result).toBe(false)
  })


  it("returns true for FREE users below the 30-appointment limit", async () => {
    mockFindUnique.mockResolvedValue(FREE_USER)
    mockCount.mockResolvedValue(15)

    const result = await canCreateAppointment(FREE_USER.id)

    expect(result).toBe(true)
  })

  it("returns false for FREE users at exactly 30 appointments", async () => {
    mockFindUnique.mockResolvedValue(FREE_USER)
    mockCount.mockResolvedValue(30)

    const result = await canCreateAppointment(FREE_USER.id)

    expect(result).toBe(false)
  })

  it("queries agendamento.count with the same month boundaries for FREE users", async () => {
    mockFindUnique.mockResolvedValue(FREE_USER)
    mockCount.mockResolvedValue(0)

    await canCreateAppointment(FREE_USER.id)

    expect(mockCount).toHaveBeenCalledOnce()
    const { where } = mockCount.mock.calls[0][0]
    expect(where.userId).toBe(FREE_USER.id)
    expect(where.createdAt.gte).toBeInstanceOf(Date)
    expect(where.createdAt.lte).toBeInstanceOf(Date)
    // start must be day 1 of current month
    expect(where.createdAt.gte.getDate()).toBe(1)
  })
})

// ─── getPlanLimits ───────────────────────────────────────────────────────────
describe("getPlanLimits", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns PRO plan data without querying agendamentos", async () => {
    mockFindUnique.mockResolvedValue(PRO_USER)

    const limits = await getPlanLimits(PRO_USER.id)

    expect(limits.plan).toBe("PRO")
    expect(limits.maxAppointments).toBe("Ilimitado")
    expect(mockCount).not.toHaveBeenCalled()
  })

  it("returns FREE plan data with correct usage percentage", async () => {
    mockFindUnique.mockResolvedValue(FREE_USER)
    mockCount.mockResolvedValue(12)

    const limits = await getPlanLimits(FREE_USER.id)

    expect(limits.plan).toBe("FREE")
    expect(limits.currentAppointments).toBe(12)
    expect(limits.usagePercentage).toBe(40) // (12/30)*100
  })

  it("caps usagePercentage at 100 even if over limit", async () => {
    mockFindUnique.mockResolvedValue(FREE_USER)
    mockCount.mockResolvedValue(35)

    const limits = await getPlanLimits(FREE_USER.id)

    expect(limits.usagePercentage).toBe(100)
  })

  it("queries agendamento.count exactly once for FREE users", async () => {
    mockFindUnique.mockResolvedValue(FREE_USER)
    mockCount.mockResolvedValue(5)

    await getPlanLimits(FREE_USER.id)

    expect(mockCount).toHaveBeenCalledOnce()
  })
})
