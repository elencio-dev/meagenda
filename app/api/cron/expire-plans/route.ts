import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const minGracePeriodDate = new Date()

    const { count } = await prisma.user.updateMany({
      where: {
        planId: "PRO",
        planExpiresAt: {
          not: null, // possesses an active grace period
          lt: minGracePeriodDate // elapsed time
        }
      },
      data: {
        planId: "FREE",
        planExpiresAt: null,
        subscriptionId: null,
        subscriptionStatus: null
      }
    })

    return NextResponse.json({ success: true, downgradedUsersCount: count })
  } catch (error) {
    console.error("[CRON /api/cron/expire-plans]", error)
    return NextResponse.json({ error: "Erro ao varrer planos." }, { status: 500 })
  }
}
