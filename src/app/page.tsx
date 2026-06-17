import { StoryPortfolio } from "@/components/StoryPortfolio"
import { DEFAULT_LOCALE } from "@/data/portfolio"
import { getLegacyPortfolioTargetHref } from "@/lib/portfolio-route-state"
import { readPortfolioSnapshot } from "@/lib/portfolio-manifest"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

type HomeProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function stringifySearchParams(params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, item))
      return
    }

    if (value !== undefined) {
      search.set(key, value)
    }
  })

  const serialized = search.toString()

  return serialized ? `?${serialized}` : ""
}

export default async function Home({ searchParams }: HomeProps) {
  const { contentByLocale } = await readPortfolioSnapshot()
  const params = searchParams ? await searchParams : {}
  const legacySearch = stringifySearchParams(params)
  const defaultContent = contentByLocale[DEFAULT_LOCALE]
  const legacyTarget = getLegacyPortfolioTargetHref({
    allFilter: defaultContent.ui.allFilter,
    fields: defaultContent.fields,
    projects: defaultContent.projects,
    search: legacySearch,
  })

  if (legacyTarget) {
    redirect(legacyTarget)
  }

  return <StoryPortfolio contentByLocale={contentByLocale} />
}
