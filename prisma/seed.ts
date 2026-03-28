// Seed is now a no-op for open data since all data is tenant-scoped.
// Each empresa creates their own data after registering.
// This script just confirms the DB is ready.

import { prisma } from "../lib/prisma"

async function main() {
  console.log("🌱 Seed multi-tenant: sem dados pré-criados.")
  console.log("   Cada empresa deve criar sua conta em /register")
  console.log("   e cadastrar seus serviços e profissionais no painel.")

  const count = await prisma.user.count()
  console.log(`\n📊 Empresas cadastradas: ${count}`)
  console.log("✨ DB pronto!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
