import "server-only"

const VERCEL_ANALYTICS_API = "https://api.vercel.com/v1/query/web-analytics"
const PROJECT_ID = process.env.VERCEL_PROJECT_ID ?? "prj_oMMwXKUSXSHAGeyMRaMS1MdMDqkC"
const TEAM_ID = process.env.VERCEL_TEAM_ID ?? "team_NSbkMmfur2RFNvwg9rJqbzUU"

export type StatsRange = "24h" | "7d" | "30d"
export type StatsEnvironment = "all" | "production" | "preview"

export type AnalyticsPoint = {
  timestamp: string
  visitors: number
  pageviews: number
}

export type AnalyticsBreakdown = {
  key: string
  visitors: number
  pageviews: number
}

export type PublicAnalyticsData = {
  connected: boolean
  visitors: number
  pageviews: number
  bounceRate: number | null
  timeline: AnalyticsPoint[]
  pages: AnalyticsBreakdown[]
  routes: AnalyticsBreakdown[]
  referrers: AnalyticsBreakdown[]
  countries: AnalyticsBreakdown[]
  devices: AnalyticsBreakdown[]
  browsers: AnalyticsBreakdown[]
  operatingSystems: AnalyticsBreakdown[]
  generatedAt: string
}

type CountResponse = {
  data?: {
    visitors?: number
    pageviews?: number
  }
}

type AggregateResponse = {
  data?: Array<Record<string, string | number>>
}

const RANGE_CONFIG: Record<
  StatsRange,
  {
    durationMs: number
    groupBy: "hour" | "day"
  }
> = {
  "24h": {
    durationMs: 24 * 60 * 60 * 1000,
    groupBy: "hour",
  },
  "7d": {
    durationMs: 7 * 24 * 60 * 60 * 1000,
    groupBy: "day",
  },
  "30d": {
    durationMs: 30 * 24 * 60 * 60 * 1000,
    groupBy: "day",
  },
}

function createFallbackData(range: StatsRange): PublicAnalyticsData {
  const now = new Date()
  const { durationMs, groupBy } = RANGE_CONFIG[range]
  const pointCount = groupBy === "hour" ? 24 : range === "7d" ? 7 : 30
  const stepMs = durationMs / pointCount

  const timeline = Array.from({ length: pointCount }, (_, index) => {
    const timestamp = new Date(now.getTime() - durationMs + stepMs * (index + 1))
    const isLast = index === pointCount - 1

    return {
      timestamp: timestamp.toISOString(),
      visitors: isLast ? 1 : 0,
      pageviews: isLast ? 3 : 0,
    }
  })

  return {
    connected: false,
    visitors: 1,
    pageviews: 3,
    bounceRate: 0,
    timeline,
    pages: [
      { key: "/", visitors: 1, pageviews: 2 },
      { key: "/myth", visitors: 1, pageviews: 1 },
    ],
    routes: [
      { key: "/", visitors: 1, pageviews: 2 },
      { key: "/myth", visitors: 1, pageviews: 1 },
    ],
    referrers: [],
    countries: [{ key: "VN", visitors: 1, pageviews: 3 }],
    devices: [{ key: "desktop", visitors: 1, pageviews: 3 }],
    browsers: [{ key: "Chrome", visitors: 1, pageviews: 3 }],
    operatingSystems: [{ key: "Mac", visitors: 1, pageviews: 3 }],
    generatedAt: now.toISOString(),
  }
}

function getDateWindow(range: StatsRange) {
  const now = new Date()
  const since = new Date(now.getTime() - RANGE_CONFIG[range].durationMs)
  const until = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  )

  return {
    since: since.toISOString(),
    until: until.toISOString(),
  }
}

function createQuery(
  range: StatsRange,
  environment: StatsEnvironment,
  groupBy?: string,
) {
  const { since, until } = getDateWindow(range)
  const query = new URLSearchParams({
    teamId: TEAM_ID,
    projectId: PROJECT_ID,
    since,
    until,
  })

  if (groupBy) {
    query.set("by", groupBy)
    query.set("limit", groupBy === "day" || groupBy === "hour" ? "100" : "10")
  }

  if (environment !== "all") {
    query.set("filter", `environment eq '${environment}'`)
  }

  return query
}

async function requestAnalytics<T>(
  endpoint: string,
  query: URLSearchParams,
  token: string,
) {
  const response = await fetch(`${VERCEL_ANALYTICS_API}/${endpoint}?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      revalidate: 300,
    },
  })

  if (!response.ok) {
    throw new Error(`Vercel Analytics request failed with ${response.status}`)
  }

  return (await response.json()) as T
}

function normalizeTimeline(response: AggregateResponse) {
  return (response.data ?? []).map((item) => ({
    timestamp: String(item.timestamp ?? ""),
    visitors: Number(item.visitors ?? 0),
    pageviews: Number(item.pageviews ?? 0),
  }))
}

function normalizeBreakdown(response: AggregateResponse, dimension: string) {
  return (response.data ?? []).map((item) => ({
    key: String(item[dimension] ?? ""),
    visitors: Number(item.visitors ?? 0),
    pageviews: Number(item.pageviews ?? 0),
  }))
}

export async function getPublicAnalytics(
  range: StatsRange,
  environment: StatsEnvironment,
): Promise<PublicAnalyticsData> {
  const token = process.env.VERCEL_ANALYTICS_READ_TOKEN

  if (!token) {
    return createFallbackData(range)
  }

  const groupBy = RANGE_CONFIG[range].groupBy

  try {
    const [
      count,
      timeline,
      pages,
      routes,
      referrers,
      countries,
      devices,
      browsers,
      operatingSystems,
    ] = await Promise.all([
      requestAnalytics<CountResponse>("visits/count", createQuery(range, environment), token),
      requestAnalytics<AggregateResponse>(
        "visits/aggregate",
        createQuery(range, environment, groupBy),
        token,
      ),
      requestAnalytics<AggregateResponse>(
        "visits/aggregate",
        createQuery(range, environment, "requestPath"),
        token,
      ),
      requestAnalytics<AggregateResponse>(
        "visits/aggregate",
        createQuery(range, environment, "route"),
        token,
      ),
      requestAnalytics<AggregateResponse>(
        "visits/aggregate",
        createQuery(range, environment, "referrerHostname"),
        token,
      ),
      requestAnalytics<AggregateResponse>(
        "visits/aggregate",
        createQuery(range, environment, "country"),
        token,
      ),
      requestAnalytics<AggregateResponse>(
        "visits/aggregate",
        createQuery(range, environment, "deviceType"),
        token,
      ),
      requestAnalytics<AggregateResponse>(
        "visits/aggregate",
        createQuery(range, environment, "browserName"),
        token,
      ),
      requestAnalytics<AggregateResponse>(
        "visits/aggregate",
        createQuery(range, environment, "osName"),
        token,
      ),
    ])

    return {
      connected: true,
      visitors: Number(count.data?.visitors ?? 0),
      pageviews: Number(count.data?.pageviews ?? 0),
      bounceRate: null,
      timeline: normalizeTimeline(timeline),
      pages: normalizeBreakdown(pages, "requestPath"),
      routes: normalizeBreakdown(routes, "route"),
      referrers: normalizeBreakdown(referrers, "referrerHostname").filter(
        (item) => item.key.length > 0,
      ),
      countries: normalizeBreakdown(countries, "country"),
      devices: normalizeBreakdown(devices, "deviceType"),
      browsers: normalizeBreakdown(browsers, "browserName"),
      operatingSystems: normalizeBreakdown(operatingSystems, "osName"),
      generatedAt: new Date().toISOString(),
    }
  } catch {
    return createFallbackData(range)
  }
}
