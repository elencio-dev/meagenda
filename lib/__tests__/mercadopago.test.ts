import { describe, test, expect, vi } from "vitest";
import crypto from "crypto";
import { validateWebhookSignature } from "../mercadopago";

describe("Mercado Pago - validateWebhookSignature", () => {
  const MOCK_SECRET = "super-secret-key-123";

  // Define uma variável de ambiente simulada antes dos testes
  vi.stubEnv("MP_WEBHOOK_SECRET", MOCK_SECRET);

  test("retorna true para assinatura correta (valid HMAC)", () => {
    const dataId = "data-999";
    const xRequestId = "req-abc";
    const ts = Date.now().toString();

    // Cria o manifest conforme regra interna
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const hmac = crypto.createHmac("sha256", MOCK_SECRET);
    hmac.update(manifest);
    const validHash = hmac.digest("hex");

    // Constrói o cabeçalho x-signature no formato do MP
    const xSignature = `ts=${ts},v1=${validHash}`;

    // A validação deve passar
    const isValid = validateWebhookSignature(dataId, xRequestId, xSignature);
    expect(isValid).toBe(true);
  });

  test("retorna false para assinatura incorreta", () => {
    const dataId = "data-999";
    const xRequestId = "req-abc";
    const ts = Date.now().toString();

    // Cria uma hash arbitrária falsa
    const fakeHash = "abcdef1234567890deadbeef";
    const xSignature = `ts=${ts},v1=${fakeHash}`;

    // A validação deve falhar
    const isValid = validateWebhookSignature(dataId, xRequestId, xSignature);
    expect(isValid).toBe(false);
  });

  test("retorna false se variavel secreta nao estiver definida", () => {
    // Removemos propositalmente a chave do ambiente para este teste
    vi.stubEnv("MP_WEBHOOK_SECRET", "");
    const isValid = validateWebhookSignature("1", "2", "ts=1,v1=hash");
    expect(isValid).toBe(false);
    
    // Restaura mock
    vi.stubEnv("MP_WEBHOOK_SECRET", MOCK_SECRET);
  });
});
