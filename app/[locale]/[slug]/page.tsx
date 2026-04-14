import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Calendar as CalendarIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { BookingClientFlow } from "./client"

export default async function PublicBookingPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: "Booking" })

  const user = await prisma.user.findUnique({
    where: { slug },
  })
  
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex flex-col items-center justify-center gap-4">
        <CalendarIcon className="h-16 w-16 text-[var(--ink-30)]" />
        <h1 className="font-sans text-2xl text-[var(--ink)]">{t("not_found_title")}</h1>
        <p className="text-[var(--ink-60)]">{t("not_found_desc", { slug })}</p>
      </div>
    )
  }

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

  const bookingData = {
    business: {
      name: user.name,
      address: user.address || "",
      phone: user.phone || "",
      description: user.description || "",
      image: user.image || null,
    },
    servicos,
    profissionais,
  }

  return <BookingClientFlow slug={slug} initialData={bookingData} />
}
