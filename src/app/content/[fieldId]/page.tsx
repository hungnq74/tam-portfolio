import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { PortfolioContentPage } from "@/components/StoryPortfolio"
import { DEFAULT_LOCALE } from "@/data/portfolio"
import { getContentHref } from "@/lib/portfolio-route-state"
import { readPortfolioSnapshot } from "@/lib/portfolio-manifest"

type FieldContentPageProps = {
  params: Promise<{
    fieldId: string
  }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Content - Minh Tam Portfolio",
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function FieldContentPage({
  params,
  searchParams,
}: FieldContentPageProps) {
  const { fieldId } = await params
  const query = searchParams ? await searchParams : {}
  const { contentByLocale } = await readPortfolioSnapshot()
  const fields = contentByLocale[DEFAULT_LOCALE].fields
  const field = fields.find((item) => item.id === fieldId)

  if (!field) {
    redirect(getContentHref())
  }

  return (
    <PortfolioContentPage
      contentByLocale={contentByLocale}
      route={{
        fieldId: field.id,
        projectId: getSingleParam(query.project),
      }}
    />
  )
}
