## Contexto

O model `user` não possui campos para rastrear a assinatura do Mercado Pago.

## O que fazer

Adicionar ao model `user` em `prisma/schema.prisma`:

```prisma
subscriptionId     String?   // ID da preapproval no Mercado Pago
subscriptionStatus String?   // "authorized" | "paused" | "cancelled"
planExpiresAt      DateTime? // deadline do grace period (null = sem expiração pendente)
```

Rodar migration e gerar o client.

## Critério de aceite

- Migration gerada sem erro
- `npx prisma generate` sem erros
- Campos visíveis no model Prisma

## Parte da série
Implementação do Mercado Pago — Issue 1/13
