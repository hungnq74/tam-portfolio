"use client"

import { LOCALES, type Locale } from "@/data/portfolio"
import { cn } from "@/lib/utils"

export function LocaleToggle({
  locale,
  ariaLabel,
  className,
  onLocaleChange,
}: {
  locale: Locale
  ariaLabel: string
  className?: string
  onLocaleChange: (locale: Locale) => void
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-[rgba(116,63,36,0.22)] bg-paper/88 p-1 shadow-story backdrop-blur-xl",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
      data-scroll-gate-ignore
    >
      {LOCALES.map((item) => {
        const active = item.id === locale

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onLocaleChange(item.id)}
            className={cn(
              "min-w-10 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] transition focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 focus:ring-offset-paper",
              active
                ? "bg-moss text-paper shadow-sm"
                : "text-ink/62 hover:bg-gold/18 hover:text-moss",
            )}
            aria-pressed={active}
            aria-label={item.name}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
