import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { publicBookingRequestSchema } from "@/lib/validations"
import { findOrCreateClient } from "@/lib/client-service"
import { createAgendamento } from "@/lib/booking-service"
import { rateLimit, clientIp } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")

  try {
    let user
    if (slug) {
      user = await prisma.user.findUnique({ where: { slug } })
    } else {
      return NextResponse.json({ error: "Slug obrigatório" }, { status: 400 })
    }

    if (!user) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })

    const servicos = await prisma.servico.findMany({
      where: { userId: user.id, active: true },
      orderBy: { category: "asc" },
      select: { id: true, name: true, price: true, duration: true, category: true, popular: true },
    })

    const profissionais = await prisma.profissional.findMany({
      where: { userId: user.id, available: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    })

    return NextResponse.json({
      business: {
        name: user.name,
        address: user.address || "",
        phone: user.phone || "",
        description: user.description || "",
        image: user.image || null,
      },
      servicos,
      profissionais,
    })
  } catch (error) {
    console.error("[GET /api/booking]", error)
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
  }
}

/**
 * Public booking submission.
 * Resolves the tenant from `slug` (never from a session), finds-or-creates the
 * client internally, and creates the appointment. The tenant's client list is
 * never exposed to the public caller — only the resulting appointment is returned.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request.headers)
    if (!rateLimit(`booking:${ip}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = publicBookingRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos fornecidos no agendamento.", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { slug, name, email, phone, servicoId, profissionalId, date, time, notes } = parsed.data

    const empresa = await prisma.user.findUnique({ where: { slug }, select: { id: true } })
    if (!empresa) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
    }

    const cliente = await findOrCreateClient({ userId: empresa.id, name, email, phone })

    const agendamento = await createAgendamento({
      userId: empresa.id,
      clienteId: cliente.id,
      servicoId,
      profissionalId,
      date,
      time,
      notes,
    })

    return NextResponse.json({ id: agendamento.id }, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/booking]", error)
    if (error?.statusCode) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Erro ao processar agendamento" }, { status: 500 })
  }
}
