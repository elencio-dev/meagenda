import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")

  try {
    let user
    if (slug) {
      user = await prisma.user.findUnique({ where: { slug } })
    } else {
      return NextResponse.json({ error: "Slug obrigatório" }, { status: 400 })
    }

    if (!user) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })

    const servicos = await prisma.servico.findMany({
      where: { userId: user.id, active: true },
      orderBy: { category: "asc" },
      select: { id: true, name: true, price: true, duration: true, category: true, popular: true },
    })

    const profissionais = await prisma.profissional.findMany({
      where: { userId: user.id, available: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    })

    return NextResponse.json({
      business: {
        name: user.name,
        address: user.address || "",
        phone: user.phone || "",
        description: user.description || "",
        image: user.image || null,
      },
      servicos,
      profissionais,
    })
  } catch (error) {
    console.error("[GET /api/booking]", error)
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
  }
}
