/**
 * MeAgenda E2E — Global Setup
 *
 * Runs ONCE before all test specs.
 * Creates a test salon (user + service) via the real app APIs.
 * Idempotent: if the salon already exists, setup is skipped.
 */
import { test as setup, expect } from "@playwright/test"
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  TEST_SLUG,
  TEST_SERVICE_NAME,
  TEST_BASE_URL,
} from "../fixtures/test-data"

setup("seed test salon", async ({ request, page }) => {
  console.log("\n🌱 [E2E Setup] Verificando salão de teste...")

  // ── 1. Check if account already exists via login page (browser context) ──
  // We use the browser page here to avoid cookie/session issues with raw API
  await page.goto(`${TEST_BASE_URL}/login`)

  await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
  await page.locator('button[type="submit"]').click()

  // Wait a bit to see if login succeeded
  await page.waitForTimeout(3000)

  if (page.url().includes("/admin")) {
    console.log("✅ [E2E Setup] Salão de teste já existe — pulando seed.")
    // Still need to create service if it doesn't exist
    await createServiceIfMissing(page, TEST_BASE_URL, TEST_SERVICE_NAME)
    return
  }

  // ── 2. Register via the real /register page (browser flow) ────────────────
  console.log("📝 [E2E Setup] Criando salão de teste via /register...")
  await page.goto(`${TEST_BASE_URL}/register`)

  // Fill in register form
  const nameInput = page.locator('input[type="text"]').first()
  await nameInput.fill("Salão Teste E2E")

  // After typing name, slug is auto-populated. Override it with our test slug.
  const slugInput = page.locator('input[placeholder="meu-salao"]')
  await slugInput.clear()
  await slugInput.fill(TEST_SLUG)

  await page.locator('input[type="tel"]').fill("(11) 99900-0000")
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)

  await page.locator('button[type="submit"]').click()

  // Wait for redirect to /admin after successful registration
  await page.waitForURL("**/admin", { timeout: 30_000 }).catch(() => {
    // Check for error message on page
    console.warn("⚠️  [E2E Setup] Registro pode ter falhado — verifique se o slug já está em uso.")
  })

  if (!page.url().includes("/admin")) {
    throw new Error(
      `[E2E Setup] Registro falhou ou não redirecionou para /admin. URL atual: ${page.url()}`
    )
  }

  console.log("✅ [E2E Setup] Salão criado e logado.")

  // ── 3. Create a test service via API (already authenticated via browser context) ─
  await createServiceIfMissing(page, TEST_BASE_URL, TEST_SERVICE_NAME)

  console.log("🎉 [E2E Setup] Seed concluído!\n")
})

async function createServiceIfMissing(
  page: import("@playwright/test").Page,
  baseUrl: string,
  serviceName: string
) {
  console.log("✂️  [E2E Setup] Verificando serviços existentes...")

  // Use page.evaluate to make a fetch with the browser's session cookies
  const result = await page.evaluate(
    async ({ baseUrl, serviceName }) => {
      // Check existing services
      const getRes = await fetch(`${baseUrl}/api/servicos`)
      if (getRes.ok) {
        const services = await getRes.json()
        if (services.some((s: { name: string }) => s.name === serviceName)) {
          return { status: "already_exists" }
        }
      }

      // Create the service
      const postRes = await fetch(`${baseUrl}/api/servicos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serviceName,
          category: "Corte",
          price: 35,
          duration: 30,
          description: "Corte masculino simples",
          active: true,
          popular: true,
        }),
      })
      return { status: postRes.ok ? "created" : "error", httpStatus: postRes.status }
    },
    { baseUrl, serviceName }
  )

  if (result.status === "already_exists") {
    console.log("✅ [E2E Setup] Serviço já existe.")
  } else if (result.status === "created") {
    console.log("✅ [E2E Setup] Serviço criado.")
  } else {
    console.warn(`⚠️  [E2E Setup] Serviço não criado (HTTP ${result.httpStatus}).`)
  }
}
