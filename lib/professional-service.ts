import { prisma } from "@/lib/prisma"

export interface CreateProfessionalPayload {
  userId: string;
  name: string;
  role?: string;
  available?: boolean;
}

export interface UpdateProfessionalPayload {
  name?: string;
  role?: string;
  available?: boolean;
}

/**
 * Retrieves all available professionals for a given user.
 */
export async function findProfessionals(userId: string) {
  return await prisma.profissional.findMany({
    where: { userId, available: true },
    orderBy: { name: "asc" },
  })
}

/**
 * Creates a new professional.
 */
export async function createProfessional(payload: CreateProfessionalPayload) {
  return await prisma.profissional.create({
    data: {
      userId: payload.userId,
      name: payload.name,
      role: payload.role ?? "",
      available: payload.available,
    },
  })
}

/**
 * Updates an existing professional.
 */
export async function updateProfessional(id: number, userId: string, data: UpdateProfessionalPayload) {
  return await prisma.profissional.update({
    where: { id, userId },
    data: {
      name: data.name,
      role: data.role,
      available: data.available,
    },
  })
}

/**
 * Deletes a professional.
 */
export async function deleteProfessional(id: number, userId: string) {
  return await prisma.profissional.delete({
    where: { id, userId }
  })
}
