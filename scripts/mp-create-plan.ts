import "dotenv/config"

async function main() {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) {
    console.error("ERRO: MP_ACCESS_TOKEN no configurado no .env")
    process.exit(1)
  }

  const payload = {
    reason: "MeAgenda PRO",
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: 49.90,
      currency_id: "BRL"
    },
    back_url: "https://meagendaqui.shop/admin"
  }

  try {
    const res = await fetch("https://api.mercadopago.com/preapproval_plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      console.error("Falha ao criar plano:", JSON.stringify(data, null, 2))
      process.exit(1)
    }

    console.log(" Plano criado com sucesso!")
    console.log("ID do Plano:", data.id)
    console.log(" Adicione esse ID na varivel MP_PLAN_ID do seu arquivo .env")
  } catch (error) {
    console.error("Erro inesperado:", error)
    process.exit(1)
  }
}

main()
