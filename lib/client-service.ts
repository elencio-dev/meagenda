import { prisma } from "@/lib/prisma"
import { ConflictError } from "@/lib/errors"
import { ClienteStatus } from "@/generated/prisma/client"

export interface CreateClientPayload {
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  birthDate?: string | Date | null;
}

/**
 * Retreives clients for a given user, including derived metrics 
 * such as total appointments and total spent.
 */
export async function findClientsByUserId(userId: string) {
  const clientes = await prisma.cliente.findMany({
    where: { userId },
    include: {
      _count: { select: { agendamentos: true } },
      agendamentos: {
        orderBy: { date: "desc" },
        take: 1,
        select: { date: true, price: true },
      },
    },
    orderBy: { name: "asc" },
  })

  return clientes.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    status: c.status,
    totalAppointments: c._count.agendamentos,
    lastVisit: c.agendamentos[0]?.date ?? null,
    totalSpent: c.agendamentos.reduce((sum, a) => sum + a.price, 0),
  }))
}

/**
 * Creates a new client. Throws ConflictError if a client with the same email already exists for this user.
 */
export async function createClient(payload: CreateClientPayload) {
  const { userId, name, email, phone, birthDate } = payload

  const existing = await prisma.cliente.findUnique({
    where: { email_userId: { email, userId } },
  })
  
  if (existing) {
    // If we wanted to just return the existing: return existing. 
    // The previous implementation returned 409 Conflict.
    throw new ConflictError("Cliente já existe com este email.")
  }

  const cliente = await prisma.cliente.create({
    data: {
      userId,
      name,
      email,
      phone: phone ?? "",
      birthDate: birthDate ? new Date(birthDate) : undefined,
    },
  })

  return cliente
}

/**
 * Updates a client's status (active/inactive, etc).
 */
export async function updateClientStatus(id: number, userId: string, status: string | ClienteStatus) {
  const cliente = await prisma.cliente.update({
    where: { id, userId },
    data: { status: status as ClienteStatus },
  })
  return cliente
}
