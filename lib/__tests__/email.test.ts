import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// ─── Hoist mocks so they are available when vi.mock factory runs ─────────────
const { mockSendMail, mockCreateTransport } = vi.hoisted(() => {
  const mockSendMail = vi.fn().mockResolvedValue({ messageId: "test-id" })
  const mockCreateTransport = vi.fn(() => ({ sendMail: mockSendMail }))
  return { mockSendMail, mockCreateTransport }
})

vi.mock("nodemailer", () => ({
  default: { createTransport: mockCreateTransport },
  createTransport: mockCreateTransport,
}))

vi.mock("@/lib/pdf", () => ({
  generateReceiptPDF: vi.fn().mockResolvedValue(Buffer.from("fake-pdf")),
}))

// Import module AFTER mocks are wired
import {
  sendBookingConfirmationEmail,
  sendReminderEmail,
  type BookingConfirmationPayload,
  type ReminderPayload,
} from "@/lib/email"

// ─── Test data ───────────────────────────────────────────────────────────────
const confirmationPayload: BookingConfirmationPayload = {
  appointmentId: 42,
  clientName: "Ana Lima",
  clientEmail: "ana@example.com",
  clientPhone: "11999999999",
  serviceName: "Corte Feminino",
  professionalName: "Carla",
  date: new Date("2026-04-10"),
  time: "14:00",
  servicePrice: 80,
  notes: "",
  businessName: "Studio Bela",
}

const reminderPayload: ReminderPayload = {
  clientName: "Pedro Souza",
  clientEmail: "pedro@example.com",
  businessName: "Studio Bela",
  businessPhone: "1130001234",
  date: new Date("2026-04-11"),
  time: "10:00",
}

// ─── sendBookingConfirmationEmail ────────────────────────────────────────────
describe("sendBookingConfirmationEmail", () => {
  beforeEach(() => vi.clearAllMocks())

  afterEach(() => {
    delete process.env.EMAIL_USER
    delete process.env.EMAIL_PASS
  })

  it("no-ops silently when SMTP is not configured", async () => {
    await sendBookingConfirmationEmail(confirmationPayload)
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it("calls sendMail with the client email as recipient", async () => {
    process.env.EMAIL_USER = "noreply@test.com"
    process.env.EMAIL_PASS = "secret"

    await sendBookingConfirmationEmail(confirmationPayload)

    expect(mockSendMail).toHaveBeenCalledOnce()
    expect(mockSendMail.mock.calls[0][0].to).toBe("ana@example.com")
  })

  it("includes the business name in the subject", async () => {
    process.env.EMAIL_USER = "noreply@test.com"
    process.env.EMAIL_PASS = "secret"

    await sendBookingConfirmationEmail(confirmationPayload)

    expect(mockSendMail.mock.calls[0][0].subject).toContain("Studio Bela")
  })

  it("attaches a PDF with the correct filename and content type", async () => {
    process.env.EMAIL_USER = "noreply@test.com"
    process.env.EMAIL_PASS = "secret"

    await sendBookingConfirmationEmail(confirmationPayload)

    const attachments = mockSendMail.mock.calls[0][0].attachments
    expect(attachments).toHaveLength(1)
    expect(attachments[0].filename).toBe("comprovante-agendamento.pdf")
    expect(attachments[0].contentType).toBe("application/pdf")
  })

  it("does NOT throw when sendMail rejects (SMTP failure is swallowed)", async () => {
    process.env.EMAIL_USER = "noreply@test.com"
    process.env.EMAIL_PASS = "secret"
    mockSendMail.mockRejectedValueOnce(new Error("SMTP connection refused"))

    await expect(
      sendBookingConfirmationEmail(confirmationPayload)
    ).resolves.toBeUndefined()
  })
})

// ─── sendReminderEmail ───────────────────────────────────────────────────────
describe("sendReminderEmail", () => {
  beforeEach(() => vi.clearAllMocks())

  afterEach(() => {
    delete process.env.EMAIL_USER
    delete process.env.EMAIL_PASS
  })

  it("no-ops silently when SMTP is not configured", async () => {
    await sendReminderEmail(reminderPayload)
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it("calls sendMail with the client email as recipient", async () => {
    process.env.EMAIL_USER = "noreply@test.com"
    process.env.EMAIL_PASS = "secret"

    await sendReminderEmail(reminderPayload)

    expect(mockSendMail).toHaveBeenCalledOnce()
    expect(mockSendMail.mock.calls[0][0].to).toBe("pedro@example.com")
  })

  it("includes the business name in the subject", async () => {
    process.env.EMAIL_USER = "noreply@test.com"
    process.env.EMAIL_PASS = "secret"

    await sendReminderEmail(reminderPayload)

    expect(mockSendMail.mock.calls[0][0].subject).toContain("Studio Bela")
  })

  it("sends NO attachment (reminder is text only)", async () => {
    process.env.EMAIL_USER = "noreply@test.com"
    process.env.EMAIL_PASS = "secret"

    await sendReminderEmail(reminderPayload)

    const call = mockSendMail.mock.calls[0][0]
    expect(call.attachments ?? []).toHaveLength(0)
  })

  it("does NOT throw when sendMail rejects (SMTP failure is swallowed)", async () => {
    process.env.EMAIL_USER = "noreply@test.com"
    process.env.EMAIL_PASS = "secret"
    mockSendMail.mockRejectedValueOnce(new Error("SMTP timeout"))

    await expect(sendReminderEmail(reminderPayload)).resolves.toBeUndefined()
  })
})
