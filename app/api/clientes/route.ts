import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId, getSessionUser } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const clientes = await prisma.cliente.findMany({
      where: { userId },
      include: {
        _count: { select: { agendamentos: true } },
        agendamentos: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true, price: true },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(
      clientes.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        status: c.status,
        totalAppointments: c._count.agendamentos,
        lastVisit: c.agendamentos[0]?.date ?? null,
        totalSpent: c.agendamentos.reduce((sum, a) => sum + a.price, 0),
      }))
    )
  } catch (error) {
    console.error("[GET /api/clientes]", error)
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Allow public creation (slug param) OR logged-in admin
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const { name, email, phone, birthDate } = body

    // Check if client already exists for this empresa
    const existing = await prisma.cliente.findUnique({
      where: { email_userId: { email, userId } },
    })
    if (existing) {
      return NextResponse.json(existing, { status: 409 })
    }

    const cliente = await prisma.cliente.create({
      data: {
        userId,
        name,
        email,
        phone,
        birthDate: birthDate ? new Date(birthDate) : undefined,
      },
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error("[POST /api/clientes]", error)
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const { id, status } = body

    const cliente = await prisma.cliente.update({
      where: { id, userId: user.id },
      data: { status },
    })
    return NextResponse.json(cliente)
  } catch (error) {
    console.error("[PATCH /api/clientes]", error)
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 })
  }
}
