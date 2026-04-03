## Context

`lib/billing.ts` has two exported functions — `canCreateAppointment` and `getPlanLimits` — that both independently query `prisma.user` for `planId` and (for FREE users) `prisma.agendamento.count` for the current month. This creates redundant DB round-trips on every booking POST.

## Tasks

- [ ] Extract a private helper `getMonthBoundaries()` returning `{ start, end }` (removes duplicated `new Date(year, month, ...)` math)
- [ ] Extract a private helper `getMonthlyCount(userId: string): Promise<number>` using the shared boundaries
- [ ] Refactor `canCreateAppointment` and `getPlanLimits` to use these shared helpers
- [ ] Write unit tests in `lib/__tests__/billing.test.ts` (mock `prisma`)

## Definition of Done

- `lib/billing.ts` has zero duplicated date boundary logic
- `npx tsc --noEmit` passes
- `/api/dashboard` and `/api/agendamentos` POST still work correctly
