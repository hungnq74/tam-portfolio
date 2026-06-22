"use client"

import { useCallback, useEffect, useState } from "react"
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from "@/data/portfolio"

function syncEnglishLocale() {
  document.documentElement.lang = DEFAULT_LOCALE
  window.localStorage.setItem(LOCALE_STORAGE_KEY, DEFAULT_LOCALE)
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  useEffect(() => {
    setLocaleState(DEFAULT_LOCALE)
    syncEnglishLocale()
  }, [])

  const setLocale = useCallback((_locale: Locale) => {
    setLocaleState(DEFAULT_LOCALE)
    syncEnglishLocale()
  }, [])

  return {
    locale,
    setLocale,
  }
}
