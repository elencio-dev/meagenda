gh issue create --repo elencio-dev/meagenda `
  --title "refactor: extract generateTimeSlots to lib/scheduling.ts" `
  --body-file ".github/issues/01-scheduling.md"

gh issue create --repo elencio-dev/meagenda `
  --title "refactor: extract email/PDF delivery to lib/email.ts" `
  --body-file ".github/issues/02-email.md"

gh issue create --repo elencio-dev/meagenda `
  --title "refactor: deduplicate billing DB queries in lib/billing.ts" `
  --body-file ".github/issues/03-billing.md"

gh issue create --repo elencio-dev/meagenda `
  --title "fix: replace any casts with proper Prisma types" `
  --body-file ".github/issues/04-types.md"
