## Context

`app/api/agendamentos/route.ts` is 256 lines. Lines 155–215 are entirely about email and PDF: creating a nodemailer transport, building an HTML body, generating a PDF attachment, and sending it. The reminders cron at `app/api/cron/reminders/route.ts` duplicates the same nodemailer setup inline.

This inline code makes the POST handler impossible to test in isolation and will make a future provider swap (e.g. Resend, SES) require editing two files.

## Tasks

- [ ] Create `lib/email.ts` with two exported functions:
  - `sendBookingConfirmationEmail(payload: BookingConfirmationPayload): Promise<void>`
  - `sendReminderEmail(payload: ReminderPayload): Promise<void>`
- [ ] Write unit tests in `lib/__tests__/email.test.ts` (mock nodemailer + pdf-lib)
- [ ] Move all nodemailer and PDF logic from `agendamentos/route.ts` into `lib/email.ts`
- [ ] Replace the 60-line email block in the booking route with a 4-line fire-and-forget call
- [ ] Replace the inline transport setup in `cron/reminders/route.ts` with `sendReminderEmail()`
- [ ] Env guard (`EMAIL_USER` / `EMAIL_PASS`) lives inside `lib/email.ts` only

## Error Handling Contract

| Scenario | Behaviour |
|---|---|
| SMTP not configured | Silent no-op |
| PDF generation fails | Caller decides (not swallowed) |
| SMTP send fails | Caught internally, logged |

## Definition of Done

- `npm run test:unit` — all tests green
- `npx tsc --noEmit` — no new errors
- Neither caller imports `nodemailer` directly
- POST handler in `agendamentos/route.ts` is under 90 lines
- Cron handler is under 75 lines
