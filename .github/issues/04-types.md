## Context

There are four unsafe type suppressions in production code that mask real type errors:

| Location | Issue |
|---|---|
| `app/api/agendamentos/route.ts:94` | `// @ts-expect-error - Prisma conditional WhereInput` |
| `app/api/agendamentos/route.ts:107` | `blockWhere: any` |
| `app/api/agendamentos/route.ts:133` | `dataPayload: any` |
| `app/admin/layout.tsx:51` | `(empresa as any)?.slug` |

## Tasks

**In `app/api/agendamentos/route.ts`:**
- [ ] Import `Prisma` namespace from the generated client
- [ ] Replace `blockWhere: any` with `Prisma.BloqueioWhereInput`
- [ ] Replace `dataPayload: any` with `Prisma.AgendamentoUncheckedCreateInput`
- [ ] Remove `@ts-expect-error` by using the correct `Prisma.AgendamentoWhereInput` type

**In `app/admin/layout.tsx`:**
- [ ] Augment the Better Auth session type in `lib/auth-client.ts` to expose `slug: string`
- [ ] Remove `(empresa as any)?.slug` — access `empresa?.slug` directly with the correct type

## Definition of Done

- `npx tsc --noEmit` passes with **zero** `@ts-expect-error` or explicit `any` in these files
- No runtime behaviour changes

> **Note:** Do this after Issue #2 (email extraction) since the booking route will be smaller and easier to edit.
