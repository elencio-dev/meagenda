import { prisma } from "@/lib/prisma"

export interface CreateServicePayload {
  userId: string;
  name: string;
  duration: number;
  price?: number;
  category?: string;
  popular?: boolean;
  imageUrl?: string;
  active?: boolean;
}

export interface UpdateServicePayload {
  name?: string;
  duration?: number;
  price?: number;
  category?: string;
  popular?: boolean;
  imageUrl?: string;
  active?: boolean;
}

/**
 * Retrieves all active services for a user.
 */
export async function findServices(userId: string) {
  return await prisma.servico.findMany({
    where: { userId, active: true },
    orderBy: { name: "asc" },
  })
}

/**
 * Creates a new service.
 */
export async function createService(payload: CreateServicePayload) {
  return await prisma.servico.create({
    data: {
      ...payload,
      price: payload.price ?? 0,
      category: payload.category ?? "",
      imageUrl: payload.imageUrl ?? "",
    },
  })
}

/**
 * Updates an existing service.
 */
export async function updateService(id: number, userId: string, data: UpdateServicePayload) {
  return await prisma.servico.update({
    where: { id, userId },
    data,
  })
}

/**
 * Deletes a service (or could soft delete by setting active = false).
 * Currently does a hard delete.
 */
export async function deleteService(id: number, userId: string) {
  return await prisma.servico.delete({
    where: { id, userId },
  })
}
