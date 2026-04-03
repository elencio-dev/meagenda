import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendReminderEmail } from "@/lib/email"

// Forçamos que essa rota seja dinâmica, pois o Vercel Cron a chamará sem cache.
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  // 1. Verificação de segurança: 
  // Na Vercel, o VERCEL_CRON_SECRET é enviado automaticamente nos headers.
  // Em dev, ignoramos se bater nela, ou você pode exigir um "secret" fixo.
  const authHeader = request.headers.get("authorization")
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // 2. Definir o que é "amanhã"
  const now = new Date()
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const endOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59, 999)

  try {
    // Buscar todos os agendamentos de amanhã que ainda NÃO tenham aviso enviado
    // de empresas com o planId === 'PRO'
    // Status deve ser confirmado ('confirmed') ou 'pending' dependendo da regra, usaremos todos não cancelados
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        date: {
          gte: startOfTomorrow,
          lte: endOfTomorrow
        },
        reminderSent: false,
        status: {
          in: ["pending", "confirmed"]
        },
        empresa: {
          planId: "PRO",
          remindersEnabled: true
        }
      },
      include: {
        empresa: true, // Para pegar o nome da empresa e slug
        cliente: true // Para enviar email/whatsapp pro cliente
      }
    })

    if (agendamentos.length === 0) {
      return NextResponse.json({ success: true, message: "Nenhum lembrete pendente para amanhã." })
    }

    let sentCount = 0

    for (const agendamento of agendamentos) {
      if (agendamento.cliente.email) {
        await sendReminderEmail({
          clientName: agendamento.cliente.name,
          clientEmail: agendamento.cliente.email,
          businessName: agendamento.empresa.name,
          businessPhone: agendamento.empresa.phone,
          date: new Date(agendamento.date),
          time: agendamento.time,
        })
      } else {
        console.log(`[LEMBRETE] Cliente sem e-mail. Destino: ${agendamento.cliente.phone}`)
      }

      await prisma.agendamento.update({
        where: { id: agendamento.id },
        data: { reminderSent: true },
      })

      sentCount++
    }

    return NextResponse.json({ success: true, count: sentCount, message: "Lembretes enviados com sucesso." })
  } catch (error) {
    console.error("[CRON_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
