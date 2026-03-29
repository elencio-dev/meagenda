import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/auth-helpers"
import { z } from "zod"

const bloqueioSchema = z.object({
  date: z.string(),
  time: z.string(),
  profissionalId: z.number().optional().nullable(),
  reason: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const dateParam = searchParams.get("date")

  try {
    const where: Record<string, unknown> = { userId }
    if (dateParam) {
      const date = new Date(dateParam)
      const nextDay = new Date(date); nextDay.setDate(nextDay.getDate() + 1)
      where.date = { gte: date, lt: nextDay }
    }

    const bloqueios = await prisma.bloqueio.findMany({
      where,
      include: {
        profissional: { select: { name: true } }
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    })

    return NextResponse.json(bloqueios)
  } catch (error) {
    console.error("[GET /api/bloqueios]", error)
    return NextResponse.json({ error: "Erro ao buscar bloqueios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const parsed = bloqueioSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.format() }, { status: 400 })
    }

    const { date, time, profissionalId, reason } = parsed.data
    const bookingDate = new Date(date)

    const dataPayload: any = {
      userId,
      date: bookingDate,
      time,
      reason: reason || "Motivo interno",
    }
    if (profissionalId) dataPayload.profissionalId = profissionalId

    const bloqueio = await prisma.bloqueio.create({ data: dataPayload })
    return NextResponse.json(bloqueio, { status: 201 })
  } catch (error) {
    console.error("[POST /api/bloqueios]", error)
    return NextResponse.json({ error: "Erro ao criar bloqueio" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })

    await prisma.bloqueio.delete({
      where: { id: Number(id), userId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/bloqueios]", error)
    return NextResponse.json({ error: "Erro ao remover bloqueio" }, { status: 500 })
  }
}
