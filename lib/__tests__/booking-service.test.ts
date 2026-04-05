import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock external systems
vi.mock("@/lib/email", () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue(undefined)
}))

const { mockFindFirst, mockCreate, mockFindUnique } = vi.hoisted(() => {
  return {
    mockFindFirst: vi.fn(),
    mockCreate: vi.fn(),
    mockFindUnique: vi.fn()
  }
})

vi.mock("@/lib/prisma", () => ({
  prisma: {
    agendamento: {
      findFirst: mockFindFirst,
      create: mockCreate
    },
    bloqueio: {
      findFirst: mockFindFirst
    },
    servico: {
      findUnique: mockFindUnique
    }
  }
}))

vi.mock("@/lib/billing", () => ({
  canCreateAppointment: vi.fn().mockResolvedValue(true)
}))

import { canCreateAppointment } from "@/lib/billing"
import { createAgendamento } from "@/lib/booking-service"
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors"

describe("booking-service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(canCreateAppointment).mockResolvedValue(true)
    mockFindUnique.mockResolvedValue({ id: 1, price: 100, name: "Corte" })
    mockFindFirst.mockResolvedValue(null) // No conflicts by default
    mockCreate.mockResolvedValue({
      id: 1,
      cliente: { email: "test@test.com", name: "Test Client" },
      servico: { name: "Corte", price: 100 },
      empresa: { name: "Test Studio" }
    })
  })

  it("throws ForbiddenError if billing check fails", async () => {
    vi.mocked(canCreateAppointment).mockResolvedValue(false)

    const act = () => createAgendamento({
      userId: "user-1",
      clienteId: 2,
      servicoId: 1,
      date: "2025-01-01",
      time: "10:00"
    })

    await expect(act()).rejects.toThrow(ForbiddenError)
  })

  it("throws ConflictError if an existing appointment occupies the precise slot", async () => {
    // Return something for the first findFirst (agendamento conflict check)
    mockFindFirst.mockImplementation((args: any) => {
      // Very naive mock discrimination based on presence of OR array (used in block check)
      if (args?.where?.OR) return null; 
      return { id: 999 };
    })
    
    const act = () => createAgendamento({
      userId: "user-1",
      clienteId: 2,
      servicoId: 1,
      date: "2025-01-01",
      time: "10:00"
    })

    await expect(act()).rejects.toThrow(ConflictError)
    await expect(act()).rejects.toThrow(/já está ocupado/)
  })

  it("throws ConflictError if a manual block occupies the precise slot", async () => {
    // Return something ONLY for the second findFirst (block check)
    mockFindFirst.mockImplementation((args: any) => {
      if (args?.where?.OR) return { id: 555 }; 
      return null;
    })
    
    const act = () => createAgendamento({
      userId: "user-1",
      clienteId: 2,
      servicoId: 1,
      date: "2025-01-01",
      time: "10:00"
    })

    await expect(act()).rejects.toThrow(ConflictError)
    await expect(act()).rejects.toThrow(/bloqueado e indisponível/)
  })

  it("throws NotFoundError if the service does not exist", async () => {
    mockFindUnique.mockResolvedValue(null)
    
    const act = () => createAgendamento({
      userId: "user-1",
      clienteId: 2,
      servicoId: 999,
      date: "2025-01-01",
      time: "10:00"
    })

    await expect(act()).rejects.toThrow(NotFoundError)
  })

  it("creates the appointment if all valid", async () => {
    const result = await createAgendamento({
      userId: "user-1",
      clienteId: 2,
      servicoId: 1,
      date: "2025-01-01",
      time: "10:00",
      notes: "Testing"
    })

    expect(result.id).toBe(1)
    expect(mockCreate).toHaveBeenCalledOnce()
  })
})
