import { test, expect } from "@playwright/test"
import { TEST_SLUG, CLIENT_DATA, TEST_SERVICE_NAME } from "./fixtures/test-data"

/**
 * Fluxo 1 — Cliente agenda SEM escolher profissional
 *
 * Cenário:
 *   - Salão sem profissionais cadastrados (step 2 é pulado automaticamente)
 *   - Cliente escolhe serviço → data → horário → preenche dados → confirma
 *   - Assertion: tela de confirmação exibe "Agendamento confirmado!"
 */
test.describe("Fluxo de Agendamento do Cliente", () => {
  test("cliente agenda sem profissional e vê confirmação", async ({ page }) => {
    // ── Passo 0: Acessar a página pública do salão ─────────────────────────
    await page.goto(`/${TEST_SLUG}`)

    // Aguardar header da página de agendamento
    await expect(page.locator("header")).toBeVisible({ timeout: 12_000 })

    // Aguardar carregamento dos serviços (pelo menos 1 card visível)
    await expect(page.locator("[data-testid='service-card']").first()).toBeVisible({
      timeout: 12_000,
    })

    // ── Passo 1: Escolher o serviço pelo nome ──────────────────────────────
    const targetService = page
      .locator("[data-testid='service-card']")
      .filter({ hasText: TEST_SERVICE_NAME })
    await expect(targetService).toBeVisible({ timeout: 8_000 })
    await targetService.click()

    // Step 2 (profissional) é pulado automaticamente quando não há profissionais

    // ── Passo 2: Escolher a data (primeira data disponível) ────────────────
    await expect(page.locator("h2").filter({ hasText: "Escolha a data" })).toBeVisible({
      timeout: 8_000,
    })

    // Clica no primeiro dia habilitado do calendário (não disabled, não domingo)
    const availableDay = page
      .locator("[data-testid='calendar-day']:not([disabled])")
      .first()
    await expect(availableDay).toBeVisible({ timeout: 8_000 })
    await availableDay.click()

    // ── Passo 3: Escolher o primeiro horário disponível ────────────────────
    await expect(page.locator("h2").filter({ hasText: "Escolha o horário" })).toBeVisible({
      timeout: 8_000,
    })

    // Aguardar slots carregarem (skeleton desaparece)
    await page.waitForSelector("[data-testid='time-slot']", { timeout: 12_000 })

    const availableSlot = page
      .locator("[data-testid='time-slot']:not([disabled])")
      .first()
    await expect(availableSlot).toBeVisible({ timeout: 10_000 })
    await availableSlot.click()

    // ── Passo 4: Preencher dados do cliente ────────────────────────────────
    await expect(page.locator("h2").filter({ hasText: "Seus dados" })).toBeVisible({
      timeout: 8_000,
    })

    // Usa IDs definidos no BookingForm (id="name", id="email", id="phone")
    await page.locator("#name").fill(CLIENT_DATA.name)
    await page.locator("#email").fill(CLIENT_DATA.email)
    await page.locator("#phone").fill(CLIENT_DATA.phone)

    // ── Passo 5: Submeter o formulário ─────────────────────────────────────
    await page.locator('button[type="submit"]').click()

    // ── Passo 6: Verificar tela de confirmação ─────────────────────────────
    await expect(
      page.locator("h2").filter({ hasText: /agendamento confirmado/i })
    ).toBeVisible({ timeout: 20_000 })

    // Verificar que o número de protocolo está visível  (formato: Nº 000001)
    await expect(page.locator("text=/Nº \\d+/")).toBeVisible()

    // Verificar botão de baixar PDF/comprovante
    await expect(
      page.locator("button, a").filter({ hasText: /baixar|pdf|comprovante/i }).first()
    ).toBeVisible()
  })
})
