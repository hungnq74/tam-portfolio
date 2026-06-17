import type { Metadata } from "next"
import { PortfolioContentPage } from "@/components/StoryPortfolio"
import { readPortfolioSnapshot } from "@/lib/portfolio-manifest"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Content - Minh Tam Portfolio",
  description: "Browse portfolio content by field and scope.",
}

export default async function ContentPage() {
  const { contentByLocale } = await readPortfolioSnapshot()

  return <PortfolioContentPage contentByLocale={contentByLocale} />
}
