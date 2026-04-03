/**
 * lib/email.ts — Centralized email delivery module
 *
 * All nodemailer setup, HTML templates, and PDF attachment logic lives here.
 * Route handlers and cron jobs call the exported functions and never touch nodemailer directly.
 *
 * Error contract:
 *   - SMTP not configured  → silent no-op (logged)
 *   - PDF generation error → rethrows (caller decides)
 *   - SMTP send error      → caught internally (booking must not fail because email failed)
 */

import nodemailer from "nodemailer"
import { generateReceiptPDF } from "@/lib/pdf"

// ─── Payload types ───────────────────────────────────────────────────────────

export type BookingConfirmationPayload = {
  appointmentId: number
  clientName: string
  clientEmail: string
  clientPhone: string
  serviceName: string
  professionalName: string
  date: Date
  time: string
  servicePrice: number
  notes: string
  businessName: string
}

export type ReminderPayload = {
  clientName: string
  clientEmail: string
  businessName: string
  businessPhone: string
  date: Date
  time: string
}

// ─── Private helpers ─────────────────────────────────────────────────────────

function isSmtpConfigured(): boolean {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS)
}

function getTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

function buildConfirmationHtml(payload: BookingConfirmationPayload): string {
  const dateLocal = payload.date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  return `
    <div style="font-family: sans-serif; color: #333; padding: 20px;">
      <h2>Olá, ${payload.clientName}!</h2>
      <p>O seu agendamento na <b>${payload.businessName}</b> foi processado com sucesso.</p>
      <p>Verifique o arquivo PDF em anexo contendo os detalhes do seu recibo.</p>
      <br/>
      <p>Data: <b>${dateLocal}</b> às <b>${payload.time}</b></p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">Esse é um e-mail automático do sistema MeAgenda.</p>
    </div>
  `
}

function buildReminderHtml(payload: ReminderPayload): string {
  const dateLocal = payload.date.toLocaleDateString("pt-BR")
  return `
    <div style="font-family: sans-serif; color: #333; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2F9E73;">Olá, ${payload.clientName}!</h2>
      <p>Este é um lembrete automático do seu compromisso na <b>${payload.businessName}</b>.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; font-size: 16px;">📅 <b>Data:</b> ${dateLocal}</p>
        <p style="margin: 5px 0 0 0; font-size: 16px;">⏰ <b>Horário:</b> ${payload.time}</p>
      </div>
      <p>Pedimos que chegue com 10 minutos de antecedência. Caso haja imprevistos, contate o local pelo número: ${payload.businessPhone}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">Este é um e-mail automático gerado pelo sistema MeAgenda. Por favor, não responda.</p>
    </div>
  `
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Sends the booking confirmation email with the PDF receipt attached.
 * Silently no-ops if SMTP credentials are not configured.
 * PDF generation errors are rethrown; SMTP errors are swallowed.
 */
export async function sendBookingConfirmationEmail(
  payload: BookingConfirmationPayload
): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log("[EMAIL] Skipping confirmation email — SMTP not configured.")
    return
  }

  const pdfBuffer = await generateReceiptPDF({
    id: payload.appointmentId,
    clientName: payload.clientName,
    clientEmail: payload.clientEmail,
    clientPhone: payload.clientPhone,
    serviceName: payload.serviceName,
    professionalName: payload.professionalName,
    date: payload.date,
    time: payload.time,
    servicePrice: payload.servicePrice,
    notes: payload.notes,
    businessName: payload.businessName,
  })

  const transporter = getTransporter()

  try {
    await transporter.sendMail({
      from: `"MeAgenda" <${process.env.EMAIL_USER}>`,
      to: payload.clientEmail,
      subject: `Recebemos seu Agendamento: ${payload.businessName}`,
      html: buildConfirmationHtml(payload),
      attachments: [
        {
          filename: "comprovante-agendamento.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    })
    console.log(`[EMAIL] Confirmation sent to ${payload.clientEmail}`)
  } catch (err) {
    console.error(`[EMAIL] Failed to send confirmation to ${payload.clientEmail}`, err)
  }
}

/**
 * Sends the appointment reminder email (text only, no attachment).
 * Silently no-ops if SMTP credentials are not configured.
 * Never throws — all errors are caught and logged internally.
 */
export async function sendReminderEmail(payload: ReminderPayload): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log("[EMAIL] Skipping reminder email — SMTP not configured.")
    return
  }

  const transporter = getTransporter()

  try {
    await transporter.sendMail({
      from: `"MeAgenda Lembretes" <${process.env.EMAIL_USER}>`,
      to: payload.clientEmail,
      subject: `Lembrete: Seu agendamento na ${payload.businessName}`,
      html: buildReminderHtml(payload),
    })
    console.log(`[EMAIL] Reminder sent to ${payload.clientEmail}`)
  } catch (err) {
    console.error(`[EMAIL] Failed to send reminder to ${payload.clientEmail}`, err)
  }
}
