import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth-helpers"
import { configSchema } from "@/lib/validations"
import * as z from "zod"

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
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
    })
    
    // Check for configurations like working hours
    const configs = await prisma.configuracao.findMany({
      where: { userId: user.id },
    })

    return NextResponse.json({
      profile: dbUser,
      configs: configs.reduce((acc, curr) => {
        acc[curr.key] = curr.value
        return acc
      }, {} as Record<string, string>),
    })
  } catch (error) {
    console.error("[GET /api/configuracoes]", error)
    return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const settingsUpdateSchema = z.object({
      profile: configSchema.optional(),
      configs: z.record(z.any()).optional()
    })

    const parseRes = settingsUpdateSchema.safeParse(body)
    if (!parseRes.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parseRes.error.format() }, { status: 400 })
    }

    const { profile, configs } = parseRes.data

    if (profile) {
      await prisma.user.update({
        where: { id: user.id },
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
      // Upsert configurations
      for (const [key, value] of Object.entries(configs)) {
        await prisma.configuracao.upsert({
          where: { key_userId: { key, userId: user.id } },
          update: { value: String(value) },
          create: { userId: user.id, key, value: String(value) },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PATCH /api/configuracoes]", error)
    return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 })
  }
}
