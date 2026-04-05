import crypto from "crypto"

export interface CreateSubscriptionResult {
  initPoint: string;
  subscriptionId: string;
}

export interface SubscriptionStatusResult {
  status: string;
  payerEmail: string;
  externalReference: string;
}

const MP_API_BASE = "https://api.mercadopago.com"

function getHeaders() {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) throw new Error("MP_ACCESS_TOKEN is not defined in env variables")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }
}

/**
 * Cria uma nova assinatura associada ao plano especificado
 */
export async function createSubscription(planId: string, payerEmail: string, userId: string): Promise<CreateSubscriptionResult> {
  const res = await fetch(`${MP_API_BASE}/preapproval`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      preapproval_plan_id: planId,
      payer_email: payerEmail,
      external_reference: userId,
      reason: "MeAgenda PRO",
      back_url: "https://meagendaqui.shop/admin?upgrade=success"
    })
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Errou ao criar assinatura no MP: ${JSON.stringify(data)}`)
  }

  return {
    initPoint: data.init_point,
    subscriptionId: data.id
  }
}

/**
 * Cancela (encerra) uma assinatura ativa no Mercado Pago
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const res = await fetch(`${MP_API_BASE}/preapproval/${subscriptionId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      status: "cancelled"
    })
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(`Erro ao cancelar assinatura no MP: ${JSON.stringify(data)}`)
  }
}

/**
 * Consulta o status de uma assinatura específica no Mercado Pago
 */
export async function getSubscription(subscriptionId: string): Promise<SubscriptionStatusResult> {
  const res = await fetch(`${MP_API_BASE}/preapproval/${subscriptionId}`, {
    method: "GET",
    headers: getHeaders()
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Erro ao buscar assinatura no MP: ${JSON.stringify(data)}`)
  }

  return {
    status: data.status,
    payerEmail: data.payer_email,
    externalReference: data.external_reference
  }
}

/**
 * Valida o Webhook recebido garantindo que veio nativamente do MP através do x-signature
 */
export function validateWebhookSignature(
  dataId: string,
  xRequestId: string,
  xSignature: string
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return false

  const parts = xSignature.split(',')
  let ts = ''
  let v1 = ''

  for (const part of parts) {
    const [key, value] = part.split('=')
    if (key?.trim() === 'ts') ts = value?.trim()
    if (key?.trim() === 'v1') v1 = value?.trim()
  }

  if (!ts || !v1) return false

  // Formato padrao de manifestação do MP
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(manifest)
  const generatedHash = hmac.digest('hex')

  return generatedHash === v1
}
