import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, getSessionUser } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const servicos = await prisma.servico.findMany({
      where: { userId, active: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(servicos)
  } catch (error) {
    console.error("[GET /api/servicos]", error)
    return NextResponse.json({ error: "Erro ao buscar serviços" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const servico = await prisma.servico.create({
      data: { userId: user.id, ...body },
    })
    return NextResponse.json(servico, { status: 201 })
  } catch (error) {
    console.error("[POST /api/servicos]", error)
    return NextResponse.json({ error: "Erro ao criar serviço" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const { id, ...data } = body
    const servico = await prisma.servico.update({
      where: { id, userId: user.id },
      data,
    })
    return NextResponse.json(servico)
  } catch (error) {
    console.error("[PATCH /api/servicos]", error)
    return NextResponse.json({ error: "Erro ao atualizar serviço" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const id = Number(request.nextUrl.searchParams.get("id"))
    await prisma.servico.delete({ where: { id, userId: user.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/servicos]", error)
    return NextResponse.json({ error: "Erro ao deletar serviço" }, { status: 500 })
  }
}
