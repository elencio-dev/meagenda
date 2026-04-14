"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"

interface LanguageSwitcherProps {
  variant?: "light" | "dark"
}

export function LanguageSwitcher({ variant = "dark" }: LanguageSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const switchTo = (newLocale: string) => {
    if (newLocale === locale) return
    // Replace the current locale segment in the URL
    const segments = pathname.split("/")
    segments[1] = newLocale
    const newPath = segments.join("/")
    startTransition(() => {
      router.push(newPath)
    })
  }

  const isLight = variant === "light"

  return (
    <div
      className={`flex items-center gap-0.5 rounded-full p-0.5 ${
        isLight
          ? "bg-white/20 backdrop-blur-sm border border-white/30"
          : "bg-[var(--ink-10)] border border-[var(--ink-10)]"
      }`}
    >
      {(["pt", "en"] as const).map((lang) => {
        const isActive = locale === lang
        return (
          <button
            key={lang}
            onClick={() => switchTo(lang)}
            disabled={isPending}
            aria-label={lang === "pt" ? "Português" : "English"}
            className={`
              px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200
              ${isActive
                ? isLight
                  ? "bg-white text-[var(--coral)] shadow-sm"
                  : "bg-[var(--coral)] text-white shadow-sm"
                : isLight
                  ? "text-white/80 hover:text-white"
                  : "text-[var(--ink-60)] hover:text-[var(--ink)]"
              }
              ${isPending ? "opacity-50 cursor-wait" : "cursor-pointer"}
            `}
          >
            {lang.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
