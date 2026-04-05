import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth-helpers"
import { cancelSubscription } from "@/lib/mercadopago"

export async function POST(request: NextRequest) {
  const sessionUser = await getSessionUser(request)
  if (!sessionUser) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { subscriptionId: true }
    })

    if (!user?.subscriptionId) {
      return NextResponse.json({ error: "Assinatura não encontrada." }, { status: 400 })
    }

    // Cancela no Mercado Pago
    await cancelSubscription(user.subscriptionId)

    // Configura o grace period de 3 dias no BD
    const gracePeriod = new Date()
    gracePeriod.setDate(gracePeriod.getDate() + 3)

    await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        subscriptionStatus: "cancelled",
        planExpiresAt: gracePeriod
      }
    })

    return NextResponse.json({ success: true, message: "Assinatura cancelada com sucesso!" }, { status: 200 })
  } catch (error) {
    console.error("[POST /api/billing/cancel]", error)
    return NextResponse.json({ error: "Erro ao cancelar assinatura." }, { status: 500 })
  }
}
