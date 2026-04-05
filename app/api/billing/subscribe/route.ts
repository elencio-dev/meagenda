import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-helpers"
import { createSubscription } from "@/lib/mercadopago"

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const planId = process.env.MP_PLAN_ID
    if (!planId) throw new Error("MP_PLAN_ID não está configurado no .env")

    const { initPoint } = await createSubscription(planId, user.email, user.id)

    return NextResponse.json({ initPoint })
  } catch (error) {
    console.error("[POST /api/billing/subscribe]", error)
    return NextResponse.json({ error: "Erro ao criar assinatura no Mercado Pago." }, { status: 500 })
  }
}
