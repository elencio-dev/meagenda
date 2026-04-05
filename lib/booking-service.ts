import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { canCreateAppointment } from "@/lib/billing"
import { sendBookingConfirmationEmail } from "@/lib/email"
import { 
  ForbiddenError, 
  ConflictError, 
  NotFoundError, 
  ValidationError 
} from "@/lib/errors"

export interface CreateBookingPayload {
  userId: string;
  clienteId: number;
  servicoId: number;
  profissionalId?: number | null;
  date: string | Date;
  time: string;
  notes?: string | null;
}

/**
 * Creates a new appointment after checking billing limits, conflicts, and blocks.
 * Orchestrates sending the confirmation email.
 */
export async function createAgendamento(payload: CreateBookingPayload) {
  const { userId, clienteId, servicoId, profissionalId, date, time, notes } = payload;

  const canCreate = await canCreateAppointment(userId)
  if (!canCreate) {
    throw new ForbiddenError("Este link não aceita mais agendamentos no momento.")
  }

  const bookingDate = new Date(date)
  const nextDay = new Date(bookingDate)
  nextDay.setDate(nextDay.getDate() + 1)

  // ─── Conflict Check: Agendamentos ─────────────
  const conflictWhere: Prisma.AgendamentoWhereInput = profissionalId
    ? { userId, profissionalId: Number(profissionalId), date: { gte: bookingDate, lt: nextDay }, time, NOT: { status: "cancelled" } }
    : { userId, date: { gte: bookingDate, lt: nextDay }, time, NOT: { status: "cancelled" } }

  const conflict = await prisma.agendamento.findFirst({
    where: conflictWhere
  })

  if (conflict) {
    throw new ConflictError("Este horário já está ocupado. Por favor, escolha outro.")
  }

  // ─── Conflict Check: Bloqueio Manual ─────────────
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
    throw new ConflictError("Este horário está bloqueado e indisponível para agendamento.")
  }

  // ─── Validate Servico ─────────────
  const servico = await prisma.servico.findUnique({ where: { id: servicoId } })
  if (!servico) {
    throw new NotFoundError("Serviço não encontrado")
  }

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

  // ─── Side Effect: Email ─────────────────────────────────────────
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
    }).catch(err => console.error("[BOOKING SERVICE] Email pipeline failed:", err))
  }

  return agendamento
}
