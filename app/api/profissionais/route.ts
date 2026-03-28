import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, getSessionUser } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const profissionais = await prisma.profissional.findMany({
      where: { userId, available: true },
      orderBy: { name: "asc" },
    })
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
    const profissional = await prisma.profissional.create({
      data: { userId: user.id, name: body.name, role: body.role },
    })
    return NextResponse.json(profissional, { status: 201 })
  } catch (error) {
    console.error("[POST /api/profissionais]", error)
    return NextResponse.json({ error: "Erro ao criar profissional" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const { id, ...data } = body
    const profissional = await prisma.profissional.update({
      where: { id, userId: user.id },
      data,
    })
    return NextResponse.json(profissional)
  } catch (error) {
    console.error("[PATCH /api/profissionais]", error)
    return NextResponse.json({ error: "Erro ao atualizar profissional" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const id = Number(request.nextUrl.searchParams.get("id"))
    await prisma.profissional.delete({ where: { id, userId: user.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/profissionais]", error)
    return NextResponse.json({ error: "Erro ao deletar profissional" }, { status: 500 })
  }
}
