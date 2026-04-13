import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-helpers"
import { configSchema } from "@/lib/validations"
import * as z from "zod"
import { getUserSettings, updateUserSettings } from "@/lib/settings-service"

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const settings = await getUserSettings(user.id)
    return NextResponse.json(settings)
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

    await updateUserSettings(user.id, parseRes.data)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[PATCH /api/configuracoes]", error)
    if (error?.statusCode) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 })
  }
}
