import { NextRequest, NextResponse } from "next/server"
import { getUserId, getSessionUser } from "@/lib/auth-helpers"
import { findProfessionals, createProfessional, updateProfessional, deleteProfessional } from "@/lib/professional-service"

export async function GET(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const profissionais = await findProfessionals(userId)
    return NextResponse.json(profissionais)
  } catch (error) {
    console.error("[GET /api/profissionais]", error)
    return NextResponse.json({ error: "Erro ao buscar profissionais" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const profissional = await createProfessional({ userId: user.id, ...body })
    return NextResponse.json(profissional, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/profissionais]", error)
    if (error?.statusCode) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Erro ao criar profissional" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const { id, ...data } = body
    const profissional = await updateProfessional(id, user.id, data)
    return NextResponse.json(profissional)
  } catch (error: any) {
    console.error("[PATCH /api/profissionais]", error)
    if (error?.statusCode) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Erro ao atualizar profissional" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const id = Number(request.nextUrl.searchParams.get("id"))
    await deleteProfessional(id, user.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[DELETE /api/profissionais]", error)
    if (error?.statusCode) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Erro ao deletar profissional" }, { status: 500 })
  }
}
