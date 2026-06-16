import { PORTFOLIO_CONTENT, type Locale } from "@/data/portfolio"
import { getFieldFilters, isAdminManagedFieldId } from "@/lib/admin-projects"

export function getAdminFieldOptions() {
  return PORTFOLIO_CONTENT.en.fields
    .filter((field) => isAdminManagedFieldId(field.id))
    .map((field) => {
      const filters = (["en", "vi"] as const).reduce(
        (acc, locale) => {
          acc[locale] = getFieldFilters(locale, field.id)
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
