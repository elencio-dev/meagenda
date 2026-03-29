const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient();

async function debug() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) { console.log("Sem user!"); return; }
    
    // cria um cliente qualquer pra testar
    let cli = await prisma.cliente.findFirst({ where: { userId: user.id }});
    let srv = await prisma.servico.findFirst({ where: { userId: user.id }});
    
    if (!cli) cli = await prisma.cliente.create({ data: { userId: user.id, name: "Teste", email: "test@test.com", phone: "123" } });
    if (!srv) srv = await prisma.servico.create({ data: { userId: user.id, name: "Corte", category: "Cabelo", duration: 30, price: 50, active: true } });
    
    const dataPayload = {
      date: new Date("2026-03-30"),
      time: "10:00",
      status: "confirmed",
      price: srv.price,
      notes: "Teste",
      empresa: { connect: { id: user.id } },
      cliente: { connect: { id: cli.id } },
      servico: { connect: { id: srv.id } }
    };
    
    console.log("Tentando criar payload:", JSON.stringify(dataPayload, null, 2));
    const created = await prisma.agendamento.create({ data: dataPayload });
    console.log("NOVO ID:", created.id);
  } catch (err) {
    console.error("ERRO DETECTADO:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}
debug();
