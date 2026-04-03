## Context

`generateTimeSlots` was a pure utility function defined inline inside `app/api/slots/route.ts`. It used `new Date()` objects with `.setHours()` for comparisons — timezone-fragile around midnight and DST transitions. It also could not be unit tested while buried in a route file.

## Tasks

- [x] Create `lib/scheduling.ts`
- [x] Implement `generateTimeSlots(start, end, intervalMin)` using minutes-since-midnight arithmetic (no `Date` objects needed)
- [x] Write unit tests in `lib/__tests__/scheduling.test.ts` (8 tests, all green)
- [x] Delete the inline implementation from `app/api/slots/route.ts`
- [x] Import and use the new function in the route

## Definition of Done

- `npx tsc --noEmit` passes
- `npm run test:unit` passes (8 tests)
- Slot API behaviour is unchanged

## Status

✅ **Shipped** — implemented via TDD red/green/refactor loop.
