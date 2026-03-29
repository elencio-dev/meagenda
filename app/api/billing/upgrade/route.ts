import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth-helpers"

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    // Altera o plano do BD diretamente (Simulação de pagamento do Stripe)
    await prisma.user.update({
      where: { id: user.id },
      data: { planId: "PRO" }
    })

    return NextResponse.json({ success: true, message: "Plano atualizado com sucesso!" })
  } catch (error) {
    console.error("[POST /api/billing/upgrade]", error)
    return NextResponse.json({ error: "Erro ao atualizar plano." }, { status: 500 })
  }
}
