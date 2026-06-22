"use client"

import type { Locale } from "@/data/portfolio"

export function LocaleToggle({
  locale: _locale,
  ariaLabel: _ariaLabel,
  className: _className,
  onLocaleChange: _onLocaleChange,
}: {
  locale: Locale
  ariaLabel: string
  className?: string
  onLocaleChange: (locale: Locale) => void
}) {
  return null
}
