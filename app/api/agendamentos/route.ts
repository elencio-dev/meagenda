import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { getUserId, getSessionUser } from "@/lib/auth-helpers"
import { publicBookingSchema, updateBookingSchema } from "@/lib/validations"
import { canCreateAppointment } from "@/lib/billing"
import { sendBookingConfirmationEmail } from "@/lib/email"

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
    const canCreate = await canCreateAppointment(userId)
    if (!canCreate) {
      return NextResponse.json(
        { error: "Este link não aceita mais agendamentos no momento." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parseRes = publicBookingSchema.safeParse(body)
    
    if (!parseRes.success) {
      return NextResponse.json(
        { error: "Dados inválidos fornecidos no agendamento.", details: parseRes.error.format() },
        { status: 400 }
      )
    }

    const { clienteId, servicoId, profissionalId, date, time, notes } = parseRes.data

    const bookingDate = new Date(date)
    const nextDay = new Date(bookingDate); nextDay.setDate(nextDay.getDate() + 1)

    // ─── Verificação de conflito de vaga (Agendamentos) ─────────────
    // Se tem profissional: verifica se o profissional está ocupado
    // Se não tem profissional: verifica se a empresa já está com horário ocupado
    const conflictWhere: Prisma.AgendamentoWhereInput = profissionalId
      ? { userId, profissionalId: Number(profissionalId), date: { gte: bookingDate, lt: nextDay }, time, NOT: { status: "cancelled" } }
      : { userId, date: { gte: bookingDate, lt: nextDay }, time, NOT: { status: "cancelled" } }

    const conflict = await prisma.agendamento.findFirst({
      where: conflictWhere
    })

    if (conflict) {
      return NextResponse.json(
        { error: "Este horário já está ocupado. Por favor, escolha outro." },
        { status: 409 }
      )
    }
    // ────────────────────────────────────────────────────────────────

    // ─── Verificação de Bloqueio Manual ─────────────────────────────
    const blockWhere: Prisma.BloqueioWhereInput = {
      userId,
      date: { gte: bookingDate, lt: nextDay },
      time,
      OR: [{ profissionalId: null }, ...(profissionalId ? [{ profissionalId: Number(profissionalId) }] : [])]
    }

    const blockConflict = await prisma.bloqueio.findFirst({
      where: blockWhere
    })

    if (blockConflict) {
      return NextResponse.json(
        { error: "Este horário está bloqueado e indisponível para agendamento." },
        { status: 409 }
      )
    }
    // ────────────────────────────────────────────────────────────────


    const servico = await prisma.servico.findUnique({ where: { id: servicoId } })
    if (!servico) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 })

    const dataPayload: Prisma.AgendamentoUncheckedCreateInput = {
      date: bookingDate,
      time,
      status: "confirmed",
      price: servico.price,
      notes: notes ?? "",
      userId,
      clienteId,
      servicoId,
      ...(profissionalId ? { profissionalId: Number(profissionalId) } : {})
    }

    const agendamento = await prisma.agendamento.create({
      data: dataPayload,
      include: {
        cliente: true,
        profissional: true,
        servico: true,
        empresa: true
      }
    })

    // ─── Disparo do Recibo em PDF ─────────────────────────────────────────
    if (agendamento.cliente.email) {
      sendBookingConfirmationEmail({
        appointmentId: agendamento.id,
        clientName: agendamento.cliente.name,
        clientEmail: agendamento.cliente.email,
        clientPhone: agendamento.cliente.phone || "",
        serviceName: agendamento.servico.name,
        professionalName: agendamento.profissional?.name || "Sem profissional",
        date: bookingDate,
        time,
        servicePrice: agendamento.servico.price,
        notes: agendamento.notes || "",
        businessName: agendamento.empresa.name || "Studio",
      }).catch(err => console.error("[BOOKING] Email pipeline failed:", err))
    }
    // ─────────────────────────────────────────────────────────────────────

    return NextResponse.json(agendamento, { status: 201 })
  } catch (error) {
    console.error("[POST /api/agendamentos]", error)
    return NextResponse.json({ 
      error: "Erro do Banco de Dados", 
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
