import type { Metadata } from "next"
import { StatsDashboard } from "@/components/stats/StatsDashboard"
import {
  getPublicAnalytics,
  type StatsRange,
} from "@/lib/vercel-web-analytics"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Analytics | Tâm Sắc Bén",
  description: "Public traffic overview for the Tâm Sắc Bén portfolio.",
  robots: {
    index: false,
    follow: false,
  },
}

type StatsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function getRange(value: string | string[] | undefined): StatsRange {
  const candidate = Array.isArray(value) ? value[0] : value

  return candidate === "24h" || candidate === "30d" ? candidate : "7d"
}

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const params = searchParams ? await searchParams : {}
  const range = getRange(params.range)
  const data = await getPublicAnalytics(range, "production")

  return <StatsDashboard data={data} range={range} />
}
