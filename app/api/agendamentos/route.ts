import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, getSessionUser } from "@/lib/auth-helpers"
import { publicBookingSchema, updateBookingSchema } from "@/lib/validations"
import { createAgendamento } from "@/lib/booking-service"

export async function GET(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const dateParam = searchParams.get("date")
  const status = searchParams.get("status")

  try {
    const where: Record<string, unknown> = { userId }
    if (dateParam) {
      const date = new Date(dateParam)
      const nextDay = new Date(date); nextDay.setDate(nextDay.getDate() + 1)
      where.date = { gte: date, lt: nextDay }
    }
    if (status) where.status = status

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        cliente: { select: { name: true, phone: true, email: true } },
        servico: { select: { name: true, duration: true } },
        profissional: { select: { name: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    })

    return NextResponse.json(
      agendamentos.map(a => ({
        id: a.id,
        client: a.cliente.name,
        clientPhone: a.cliente.phone,
        clientEmail: a.cliente.email,
        service: a.servico.name,
        professional: a.profissional?.name ?? "Sem profissional",
        date: a.date,
        time: a.time,
        duration: `${a.servico.duration}min`,
        status: a.status,
        price: a.price,
        notes: a.notes,
      }))
    )
  } catch (error) {
    console.error("[GET /api/agendamentos]", error)
    return NextResponse.json({ error: "Erro ao buscar agendamentos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const parseRes = publicBookingSchema.safeParse(body)
    
    if (!parseRes.success) {
      return NextResponse.json(
        { error: "Dados inválidos fornecidos no agendamento.", details: parseRes.error.format() },
        { status: 400 }
      )
    }

    const agendamento = await createAgendamento({
      userId,
      ...parseRes.data
    })

    return NextResponse.json(agendamento, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/agendamentos]", error)
    if (error?.statusCode) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode })
    }
    return NextResponse.json({ 
      error: "Erro do Banco de Dados ou Sistema", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const parseRes = updateBookingSchema.safeParse(body)

    if (!parseRes.success) {
      return NextResponse.json(
        { error: "Dados de atualização inválidos.", details: parseRes.error.format() },
        { status: 400 }
      )
    }

    const { id, status, time } = parseRes.data

    const agendamento = await prisma.agendamento.update({
      where: { id, userId: user.id },
      data: { ...(status && { status }), ...(time && { time }) },
    })

    return NextResponse.json(agendamento)
  } catch (error) {
    console.error("[PATCH /api/agendamentos]", error)
    return NextResponse.json({ error: "Erro ao atualizar agendamento" }, { status: 500 })
  }
}
