import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateWebhookSignature, getSubscription } from "@/lib/mercadopago"

export async function POST(request: NextRequest) {
  try {
    const xSignature = request.headers.get("x-signature") || ""
    const xRequestId = request.headers.get("x-request-id") || ""
    
    const url = new URL(request.url)
    const topic = url.searchParams.get("topic") || url.searchParams.get("type")
    
    // Fallback safe read in case MP only sends text or we fail to parse json
    let payload: any = {}
    try {
      payload = await request.json()
    } catch (e) {
      // ignorar error de parse, usaremos defaults
    }
    
    const type = payload.type || topic
    const dataId = payload.data?.id || url.searchParams.get("data.id") || payload.id

    if (!dataId) {
       // Acknowledge imediatly pra MP ignorar notifications sem dataId validos
       return NextResponse.json({ error: "Missing data ID" }, { status: 200 })
    }

    if (!xSignature || !xRequestId || !validateWebhookSignature(dataId, xRequestId, xSignature)) {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
    }

    if (type === "subscription_preapproval") {
      const sub = await getSubscription(dataId as string)

      const userId = sub.externalReference
      if (!userId) {
        return NextResponse.json({ error: "Subscription sem external reference" }, { status: 200 })
      }

      const gracePeriod = new Date()
      gracePeriod.setDate(gracePeriod.getDate() + 3)

      if (sub.status === "authorized") {
        await prisma.user.update({
          where: { id: userId },
          data: {
            planId: "PRO",
            subscriptionId: dataId as string,
            subscriptionStatus: "authorized",
            planExpiresAt: null,
          }
        })
      } else if (sub.status === "paused" || sub.status === "cancelled") {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: sub.status,
            planExpiresAt: gracePeriod,
          }
        })
      }
    }

    // Always 200 to acknowledge success
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error("[POST /api/billing/webhook]", error)
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
