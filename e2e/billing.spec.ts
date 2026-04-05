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
      const upgradeButton = page.locator('text=Fazer Upgrade para o Pro');
      await expect(upgradeButton).toBeVisible();

      // Interceptar a API de subscription para não tentar acionar o Mercado Pago e simular o upgrade local
      await page.route('**/api/billing/subscribe', async route => {
         // Fazer chamada para o Next.js ou atualizar direto pode ser pesado no ambiente de E2E, 
         // então podemos usar um mock e fazer uma request pra uma Rota Oculta, MAS para evitar rotas ocultas,
         // simplesmente respondemos uma URL que o frontend redireciona
         await route.fulfill({
           status: 200,
           contentType: 'application/json',
           body: JSON.stringify({ initPoint: '/admin?upgrade=success' })
         });
      });

      // E como precisamos que o plano mude no BD para a aplicação ver quando redirecionar:
      // Executaremos um eval na página para mudar o status como bypass temporário chamando
      // algo, ou nós podemos fazer bypass da lógica do componente.
      // O admin Dashboard bate api/dashboard. Mockando o dashboard tbm:
      await page.route('**/api/dashboard', async route => {
        const response = await route.fetch();
        const json = await response.json();
        json.billing = {
           plan: "PRO",
           planName: "Profissional",
           maxAppointments: "Ilimitado",
           currentAppointments: null,
           usagePercentage: 0,
           hasReminders: true,
           remindersEnabled: true,
           subscriptionStatus: "authorized"
        };
        await route.fulfill({ response, json });
      });

      // 3. Simular o Clique no Botão de Upgrade
      await upgradeButton.click();

      // O front vai setar loading true, chamar a API mockada (que retorna /admin?upgrade=success),
      // E então altera window.location para lá fazendo reload.
      await page.waitForURL("**/admin?upgrade=success", { timeout: 15_000 });

      // Aguardar recarregar a API Dashboard
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
