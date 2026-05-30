import { StoryPortfolio } from "@/components/StoryPortfolio"
import { readPortfolioSnapshot } from "@/lib/portfolio-manifest"

export const dynamic = "force-dynamic"

export default async function Home() {
  const { contentByLocale } = await readPortfolioSnapshot()

  return <StoryPortfolio contentByLocale={contentByLocale} />
}
