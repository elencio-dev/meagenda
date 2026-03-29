import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as nodemailer from "nodemailer"

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

    // Configuração Nodemailer (Gmail SMTP / Vercel Env)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Loop de envios
    for (const agendamento of agendamentos) {
      // Prioridade: Email. Fallback: Log
      if (agendamento.cliente.email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          await transporter.sendMail({
            from: `"MeAgenda Lembretes" <${process.env.EMAIL_USER}>`,
            to: agendamento.cliente.email,
            subject: `Lembrete: Seu agendamento na ${agendamento.empresa.name}`,
            html: `
              <div style="font-family: sans-serif; color: #333; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #2F9E73;">Olá, ${agendamento.cliente.name}!</h2>
                <p>Este é um lembrete automático do seu compromisso na <b>${agendamento.empresa.name}</b>.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 16px;">📅 <b>Data:</b> ${new Date(agendamento.date).toLocaleDateString("pt-BR")}</p>
                  <p style="margin: 5px 0 0 0; font-size: 16px;">⏰ <b>Horário:</b> ${agendamento.time}</p>
                </div>
                <p>Pedimos que chegue com 10 minutos de antecedência. Caso haja imprevistos, contate o local pelo número: ${agendamento.empresa.phone}</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b;">Este é um e-mail automático gerado pelo sistema MeAgenda. Por favor, não responda.</p>
              </div>
            `
          })
          console.log(`[LEMBRETE] Email Real (Nodemailer) enviado para ${agendamento.cliente.email}`)
        } catch (err) {
          console.error(`[CRON_ERROR] Falha no Nodemailer para ${agendamento.cliente.email}`, err)
        }
      } else {
         console.log(`[LEMBRETE] Simulando WhatsApp... Lembrete dia ${new Date(agendamento.date).toLocaleDateString("pt-BR")} às ${agendamento.time} na ${agendamento.empresa.name} [Destino: ${agendamento.cliente.phone}]. Email SMTP não configurado ou cliente sem e-mail.`)
      }

      // Marca o agendamento como lembrete enviado
      await prisma.agendamento.update({
        where: { id: agendamento.id },
        data: { reminderSent: true }
      })

      sentCount++
    }

    return NextResponse.json({ success: true, count: sentCount, message: "Lembretes enviados com sucesso." })
  } catch (error) {
    console.error("[CRON_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
