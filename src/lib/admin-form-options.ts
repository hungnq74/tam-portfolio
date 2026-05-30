import { PORTFOLIO_CONTENT, type Locale } from "@/data/portfolio"

export function getAdminFieldOptions() {
  return PORTFOLIO_CONTENT.en.fields.map((field) => {
    const filters = (["en", "vi"] as const).reduce(
      (acc, locale) => {
        acc[locale] =
          PORTFOLIO_CONTENT[locale].fields.find((item) => item.id === field.id)?.filters ??
          field.filters
        return acc
      },
      {} as Record<Locale, string[]>,
    )

    return {
      id: field.id,
      title: field.title,
      filters,
    }
  })
}
