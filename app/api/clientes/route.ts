import { NextRequest, NextResponse } from "next/server"
import { getUserId, getSessionUser } from "@/lib/auth-helpers"
import { findClientsByUserId, createClient, updateClientStatus } from "@/lib/client-service"

export async function GET(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const clientes = await findClientsByUserId(userId)
    return NextResponse.json(clientes)
  } catch (error) {
    console.error("[GET /api/clientes]", error)
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const cliente = await createClient({ ...body, userId })
    return NextResponse.json(cliente, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/clientes]", error)
    if (error?.statusCode) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const { id, status } = body

    const cliente = await updateClientStatus(id, user.id, status)
    return NextResponse.json(cliente)
  } catch (error: any) {
    console.error("[PATCH /api/clientes]", error)
    if (error?.statusCode) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 })
  }
}
