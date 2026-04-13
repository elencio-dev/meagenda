import { prisma } from "@/lib/prisma"
import { getPlanLimits } from "@/lib/billing"

export interface UpdateProfilePayload {
  name?: string;
  phone?: string | null;
  address?: string | null;
  description?: string | null;
  image?: string | null;
  remindersEnabled?: boolean;
}

/**
 * Aggregates user profile, configurations, and billing info.
 */
export async function getUserSettings(userId: string) {
  const [dbUser, configs, billing] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        slug: true,
        phone: true,
        address: true,
        description: true,
        image: true,
        remindersEnabled: true,
      },
    }),
    prisma.configuracao.findMany({
      where: { userId },
    }),
    getPlanLimits(userId)
  ])

  return {
    profile: dbUser,
    billing,
    configs: configs.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, string>),
  }
}

/**
 * Updates user profile and upserts any key-value configurations.
 */
export async function updateUserSettings(userId: string, data: { profile?: UpdateProfilePayload, configs?: Record<string, any> }) {
  const { profile, configs } = data

  if (profile) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(profile.name !== undefined && { name: profile.name || "" }),
        ...(profile.phone !== undefined && { phone: profile.phone || "" }),
        ...(profile.address !== undefined && { address: profile.address || "" }),
        ...(profile.description !== undefined && { description: profile.description || "" }),
        ...(profile.image !== undefined && { image: profile.image }),
        ...(profile.remindersEnabled !== undefined && { remindersEnabled: profile.remindersEnabled }),
      },
    })
  }

  if (configs) {
    // Upsert configurations sequentially to avoid deadlocks
    for (const [key, value] of Object.entries(configs)) {
      await prisma.configuracao.upsert({
        where: { key_userId: { key, userId } },
        update: { value: String(value) },
        create: { userId, key, value: String(value) },
      })
    }
  }

  return { success: true }
}
