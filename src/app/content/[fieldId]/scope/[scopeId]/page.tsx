import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { PortfolioContentPage } from "@/components/StoryPortfolio"
import { DEFAULT_LOCALE } from "@/data/portfolio"
import { getContentHref } from "@/lib/portfolio-route-state"
import { readPortfolioSnapshot } from "@/lib/portfolio-manifest"

type ScopeContentPageProps = {
  params: Promise<{
    fieldId: string
    scopeId: string
  }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Content Scope - Minh Tam Portfolio",
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ScopeContentPage({
  params,
  searchParams,
}: ScopeContentPageProps) {
  const { fieldId, scopeId } = await params
  const query = searchParams ? await searchParams : {}
  const { contentByLocale } = await readPortfolioSnapshot()
  const fields = contentByLocale[DEFAULT_LOCALE].fields
  const field = fields.find((item) => item.id === fieldId)

  if (!field) {
    redirect(getContentHref())
  }

  const scope = field.scopeCards?.find((item) => item.id === scopeId)

  if (!scope) {
    redirect(getContentHref(field))
  }

  return (
    <PortfolioContentPage
      contentByLocale={contentByLocale}
      route={{
        fieldId: field.id,
        scopeId: scope.id,
        projectId: getSingleParam(query.project),
      }}
    />
  )
}
