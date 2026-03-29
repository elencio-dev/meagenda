import { test, expect } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./fixtures/test-data"

test.describe('Testes de Restrições de Plano (Billing)', () => {

  test('Deve permitir visualizar limite grátis e fazer upgrade na Dashboard', async ({ page }) => {
    // 1. Simular Login
    await page.goto('/login');
    
    await expect(page.locator("h1").filter({ hasText: "MeAgenda" })).toBeVisible({
      timeout: 10_000,
    })

    await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
    await page.locator('button[type="submit"]').click()

    await page.waitForURL("**/admin", { timeout: 15_000 })
    expect(page.url()).toContain("/admin")
    
    // Aguardar o carregamento dos dados da API Dashboard (spinner)
    await page.waitForSelector("[class*='animate-spin']", { state: "detached", timeout: 10_000 })
    
    // Aguardar o banner de billing carregar no DOM
    await expect(page.locator('text=/Plano Atual: (Grátis|Profissional)/')).toBeVisible({ timeout: 10000 });

    const isFree = await page.locator('text=Plano Atual: Grátis').isVisible();

    if (isFree) {
      // O botão de upgrade deve existir
      const upgradeButton = page.locator('text=Fazer Upgrade para o Pro');
      await expect(upgradeButton).toBeVisible();

      // 3. Simular o Clique no Botão de Upgrade
      // Playwright precisa aceitar (accept) o window.confirm automaticamente 
      page.on('dialog', dialog => dialog.accept());
      await upgradeButton.click();

      // Aguardar recarregar novamente a API Dashboard
      await page.waitForSelector("[class*='animate-spin']", { state: "detached", timeout: 15_000 })

      // 4. Aguardar o recarregamento do painel validando o badge verde
      await expect(page.locator('text=Premium Ativo')).toBeVisible({ timeout: 10000 });
      
      // 5. Validar que o botão grátis desapareceu e a UI mudou para ilimitado
      await expect(upgradeButton).toBeHidden();
      await expect(page.locator('text=ilimitados e lembretes automáticos')).toBeVisible();
    } else {
      // Se não for 'Grátis', já deve ser PRO (útil para testes locais seguidos)
      console.log('✅ Usuário de teste já é PRO no banco local. Verificando as tags premium...');
      await expect(page.locator('text=Premium Ativo')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=ilimitados e lembretes automáticos')).toBeVisible();
    }
  });

});
