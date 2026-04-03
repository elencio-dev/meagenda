"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { signOut, useSession } from "@/lib/auth-client"
import type { AuthUser } from "@/lib/auth-client"
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserPlus,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Scissors,
  ExternalLink,
  Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/agendamentos", label: "Agendamentos", icon: Calendar },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/profissionais", label: "Profissionais", icon: UserPlus },
  { href: "/admin/servicos", label: "Serviços", icon: Scissors },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const empresa = session?.user as AuthUser | undefined
  const initials = empresa?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "M"
  const slug = empresa?.slug

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-[var(--ink)]/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-[var(--white)] border-r border-[var(--ink-10)] transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-[var(--ink-10)]">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--coral)] flex items-center justify-center">
                <span className="text-white font-semibold text-sm">M</span>
              </div>
              <span className="font-sans text-xl text-[var(--ink)]">MeAgenda</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Empresa name */}
          {empresa && (
            <div className="px-4 py-3 border-b border-[var(--ink-10)]">
              <div className="flex items-center gap-2 px-2">
                <Building2 className="h-4 w-4 text-[var(--ink-60)]" />
                <span className="text-sm font-medium text-[var(--ink)] truncate">{empresa.name}</span>
              </div>
              {slug && (
                <Link
                  href={`/${slug}`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-2 mt-1 text-xs text-[var(--coral)] hover:text-[var(--coral-dark)] transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  /{slug}
                </Link>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-[var(--coral)] text-white shadow-sm"
                          : "text-[var(--ink-60)] hover:bg-[var(--coral-pale)] hover:text-[var(--coral-dark)]"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-[var(--ink-10)]">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--paper)]">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-[var(--coral-pale)] text-[var(--coral-dark)]">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--ink)] truncate">{empresa?.name ?? "Carregando..."}</p>
                <p className="text-xs text-[var(--ink-60)] truncate">{empresa?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--white)]/80 backdrop-blur-sm border-b border-[var(--ink-10)]">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1 lg:flex-none" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-[var(--ink-60)]" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[var(--coral-pale)] text-[var(--coral-dark)]">{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {slug && (
                    <DropdownMenuItem asChild>
                      <Link href={`/${slug}`} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Página pública
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/admin/configuracoes">
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[var(--error)]" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
