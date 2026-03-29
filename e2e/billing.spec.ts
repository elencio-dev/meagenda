import { test, expect } from '@playwright/test';

test.describe('Testes de Restrições de Plano (Billing)', () => {

  test('Deve permitir visualizar limite grátis e fazer upgrade na Dashboard', async ({ page }) => {
    // 1. Simular Login (assumindo que o Seed/Fixture de login criará o usuário)
    // Se a aplicação tiver uma tela de login em /login:
    await page.goto('/login');
    
    // Tentar logar caso a página de login exista, pularemos condicionalmente ou usaremos o flow nativo:
    // Pelo workflow E2E, o login está em '/login' com os envs definidos:
    const adminEmail = process.env.E2E_ADMIN_EMAIL || 'teste@meagenda.com.br';
    const adminPass = process.env.E2E_ADMIN_PASSWORD || 'Teste@1234';
    
    // Em preenchimentos reais:
    try {
       await page.fill('input[type="email"]', adminEmail);
       await page.fill('input[type="password"]', adminPass);
       await page.click('button[type="submit"]');
    } catch(e) { /* Ignora se ja tiver logado ou falhar o seletor padrão no boilerplate puro */ }

    // 2. Ir para o Dashboard e verificar o Banner Grátis
    await page.goto('/admin');
    
    // Espera o card carregar e verifica texto de Free
    await expect(page.locator('text=Plano Atual: Grátis')).toBeVisible({ timeout: 10000 });
    
    // O botão de upgrade deve existir
    const upgradeButton = page.locator('text=Fazer Upgrade para o Pro');
    await expect(upgradeButton).toBeVisible();

    // 3. Simular o Clique no Botão de Upgrade
    // Playwright precisa aceitar (accept) o window.confirm automaticamente 
    page.on('dialog', dialog => dialog.accept());
    await upgradeButton.click();

    // 4. Aguardar o recarregamento do painel validando o badge verde
    await expect(page.locator('text=Premium Ativo')).toBeVisible({ timeout: 10000 });
    
    // 5. Validar que o botão grátis desapareceu e a UI mudou para ilimitado
    await expect(upgradeButton).toBeHidden();
    await expect(page.locator('text=ilimitados e lembretes automáticos ativados')).toBeVisible();
  });

});
