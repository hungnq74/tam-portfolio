"use client"

import { useEffect, useState } from "react"
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type Locale,
  isLocale,
} from "@/data/portfolio"

function syncLocale(locale: Locale) {
  document.documentElement.lang = locale
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    const nextLocale = isLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE

    setLocaleState(nextLocale)
    syncLocale(nextLocale)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return

    syncLocale(locale)
  }, [loaded, locale])

  return {
    locale,
    setLocale: setLocaleState,
  }
}
