import { NextRequest, NextResponse } from "next/server"
import { getUserId, getSessionUser } from "@/lib/auth-helpers"
import { findServices, createService, updateService, deleteService } from "@/lib/service-catalog-service"

export async function GET(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const servicos = await findServices(userId)
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
    const servico = await createService({ userId: user.id, ...body })
    return NextResponse.json(servico, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/servicos]", error)
    if (error?.statusCode) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Erro ao criar serviço" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const { id, ...data } = body
    const servico = await updateService(id, user.id, data)
    return NextResponse.json(servico)
  } catch (error: any) {
    console.error("[PATCH /api/servicos]", error)
    if (error?.statusCode) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Erro ao atualizar serviço" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const id = Number(request.nextUrl.searchParams.get("id"))
    await deleteService(id, user.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[DELETE /api/servicos]", error)
    if (error?.statusCode) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Erro ao deletar serviço" }, { status: 500 })
  }
}
