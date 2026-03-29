/**
 * MeAgenda E2E — Test constants
 * These values must match the seeded test salon created in global-setup.ts
 */
export const TEST_SLUG = process.env.E2E_TEST_SLUG || "salao-teste-e2e"
export const TEST_BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3000"

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "teste@meagenda.com.br"
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || "Teste@1234"

export const CLIENT_DATA = {
  name: "João Playwright",
  email: "joao.playwright@email.com",
  phone: "(11) 99999-0000",
}

export const TEST_SERVICE_NAME = "Corte Simples"
