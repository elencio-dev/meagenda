import { test, expect } from "@playwright/test"
import { ADMIN_EMAIL, ADMIN_PASSWORD, CLIENT_DATA } from "./fixtures/test-data"

/**
 * Fluxo 2 — Dono do salão faz login e vê agendamento no Dashboard
 *
 * Pré-condição: o fluxo de agendamento (booking-flow.spec.ts) deve ter
 * rodado antes (garantido pela ordem de execução e workers: 1).
 *
 * Cenário:
 *   - Admin acessa /login
 *   - Preenche email e senha do salão de teste
 *   - É redirecionado para /admin
 *   - Dashboard exibe pelo menos 1 agendamento com o nome do cliente de teste
 */
test.describe("Fluxo do Admin - Login e Dashboard", () => {
  test("dono do salão faz login e vê o agendamento no dashboard", async ({ page }) => {
    // ── Passo 1: Acessar a página de login ────────────────────────────────
    await page.goto("/login")

    await expect(page.locator("h1").filter({ hasText: "MeAgenda" })).toBeVisible({
      timeout: 10_000,
    })

    // ── Passo 2: Preencher credenciais ────────────────────────────────────
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)

    // ── Passo 3: Submeter o formulário de login ────────────────────────────
    await page.locator('button[type="submit"]').click()

    // ── Passo 4: Verificar redirecionamento para /admin ────────────────────
    await page.waitForURL("**/admin", { timeout: 15_000 })
    expect(page.url()).toContain("/admin")

    // ── Passo 5: Verificar que o dashboard carregou ────────────────────────
    await expect(
      page.locator("h1").filter({ hasText: /dashboard/i })
    ).toBeVisible({ timeout: 10_000 })

    // ── Passo 6: Verificar que há pelo menos 1 agendamento listado ─────────
    // O agendamento criado pelo booking-flow.spec.ts deve aparecer aqui
    // (se était criado no mesmo dia de hoje)

    // Aguardar o carregamento dos dados (loading spinner desaparece)
    await page.waitForSelector("[class*='animate-spin']", { state: "detached", timeout: 10_000 })

    // Verificar que a seção "Agendamentos de Hoje" existe
    await expect(
      page.locator("text=/Agendamentos de Hoje/i")
    ).toBeVisible({ timeout: 8_000 })

    // Verificar que o nome do cliente fictício aparece na lista
    // Nota: isso só funciona se o booking-flow rodou hoje (mesmo dia)
    const clientName = page.locator("text=" + CLIENT_DATA.name)
    await expect(clientName).toBeVisible({ timeout: 8_000 })
  })

  test("admin não consegue acessar /admin sem login", async ({ page }) => {
    // Tentar acessar diretamente sem sessão
    await page.goto("/admin")

    // Deve ser redirecionado para /login
    await page.waitForURL("**/login", { timeout: 10_000 })
    expect(page.url()).toContain("/login")
  })
})
