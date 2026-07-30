"use client"

import {
  Activity,
  Box,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  CircleGauge,
  ExternalLink,
  Eye,
  Globe2,
  Home,
  List,
  MoreHorizontal,
  Plug,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import type {
  AnalyticsBreakdown,
  AnalyticsPoint,
  PublicAnalyticsData,
  StatsEnvironment,
  StatsRange,
} from "@/lib/vercel-web-analytics"
import styles from "./StatsDashboard.module.css"

type Metric = "visitors" | "pageviews" | "bounceRate"
type BreakdownView = "primary" | "secondary"

type StatsDashboardProps = {
  data: PublicAnalyticsData
  range: StatsRange
  environment: StatsEnvironment
}

const navItems = [
  { label: "Overview", icon: Home },
  { label: "Deployments", icon: Box },
  { label: "Logs", icon: List },
  { label: "Analytics", icon: ChartNoAxesCombined, active: true },
  { label: "Speed Insights", icon: CircleGauge },
  { label: "Observability", icon: Eye },
  { label: "Firewall", icon: ShieldCheck },
  { label: "CDN", icon: Globe2 },
  { label: "Connect", icon: Plug },
]

const rangeLabels: Record<StatsRange, string> = {
  "24h": "Last 24 Hours",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
}

const environmentLabels: Record<StatsEnvironment, string> = {
  all: "All environments",
  production: "Production",
  preview: "Preview",
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function formatTimestamp(timestamp: string, range: StatsRange) {
  const date = new Date(timestamp)

  if (range === "24h") {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: true,
    }).format(date)
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}

function getCountryName(countryCode: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) ?? countryCode
  } catch {
    return countryCode
  }
}

function getCountryFlag(countryCode: string) {
  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return "🌐"
  }

  return String.fromCodePoint(
    ...countryCode.split("").map((letter) => 127397 + letter.charCodeAt(0)),
  )
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ")
}

function getLinePath(points: AnalyticsPoint[], metric: Exclude<Metric, "bounceRate">) {
  if (points.length === 0) {
    return {
      line: "M 0 318 L 1000 318",
      area: "M 0 318 L 1000 318 L 1000 320 L 0 320 Z",
      max: 1,
    }
  }

  const values = points.map((point) => point[metric])
  const max = Math.max(1, ...values)
  const coordinates = points.map((point, index) => {
    const x = points.length === 1 ? 1000 : (index / (points.length - 1)) * 1000
    const y = 318 - (point[metric] / max) * 260

    return { x, y }
  })
  const line = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")
  const first = coordinates[0]
  const last = coordinates[coordinates.length - 1]
  const area = `${line} L ${last.x} 320 L ${first.x} 320 Z`

  return { line, area, max }
}

function Chart({
  points,
  metric,
  range,
}: {
  points: AnalyticsPoint[]
  metric: Exclude<Metric, "bounceRate">
  range: StatsRange
}) {
  const path = useMemo(() => getLinePath(points, metric), [metric, points])
  const maxLabels = range === "24h" ? 6 : 7
  const labelStep = Math.max(1, Math.ceil(points.length / maxLabels))

  return (
    <div className={styles.chartWrap}>
      <div className={styles.axisLabels} aria-hidden="true">
        <span>{formatNumber(path.max)}</span>
        <span>0</span>
      </div>
      <div className={styles.chartCanvas}>
        <svg
          aria-label={`${metric === "visitors" ? "Visitors" : "Page views"} over ${rangeLabels[range]}`}
          className={styles.chartSvg}
          preserveAspectRatio="none"
          role="img"
          viewBox="0 0 1000 340"
        >
          <line className={styles.gridLine} x1="0" x2="1000" y1="58" y2="58" />
          <line className={styles.gridLine} x1="0" x2="1000" y1="188" y2="188" />
          <line className={styles.gridLine} x1="0" x2="1000" y1="318" y2="318" />
          <path className={styles.chartArea} d={path.area} />
          <path className={styles.chartLine} d={path.line} />
        </svg>
        <div className={styles.xAxis}>
          {points.map((point, index) =>
            index % labelStep === 0 || index === points.length - 1 ? (
              <span
                key={point.timestamp}
                style={{
                  left: `${points.length === 1 ? 100 : (index / (points.length - 1)) * 100}%`,
                }}
              >
                {formatTimestamp(point.timestamp, range)}
              </span>
            ) : null,
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message = "No data found for selected period." }: { message?: string }) {
  return (
    <div className={styles.emptyState}>
      <ChartNoAxesCombined aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

function BreakdownRows({
  items,
  formatLabel = (value) => value,
}: {
  items: AnalyticsBreakdown[]
  formatLabel?: (value: string) => React.ReactNode
}) {
  if (items.length === 0) {
    return <EmptyState />
  }

  const maxVisitors = Math.max(1, ...items.map((item) => item.visitors))

  return (
    <div className={styles.breakdownRows}>
      {items.map((item) => (
        <div className={styles.breakdownRow} key={item.key || "direct"}>
          <span className={styles.rowBar} style={{ width: `${(item.visitors / maxVisitors) * 100}%` }} />
          <span className={styles.rowLabel}>{formatLabel(item.key)}</span>
          <strong>{formatNumber(item.visitors)}</strong>
        </div>
      ))}
    </div>
  )
}

function BreakdownCard({
  primaryTitle,
  primaryItems,
  primaryLabel,
  secondaryTitle,
  secondaryItems,
  secondaryLabel,
  className,
}: {
  primaryTitle: string
  primaryItems: AnalyticsBreakdown[]
  primaryLabel?: (value: string) => React.ReactNode
  secondaryTitle?: string
  secondaryItems?: AnalyticsBreakdown[]
  secondaryLabel?: (value: string) => React.ReactNode
  className?: string
}) {
  const [view, setView] = useState<BreakdownView>("primary")
  const hasSecondary = Boolean(secondaryTitle && secondaryItems)
  const activeItems = view === "secondary" && secondaryItems ? secondaryItems : primaryItems
  const activeLabel = view === "secondary" ? secondaryLabel : primaryLabel

  return (
    <section className={`${styles.breakdownCard} ${className ?? ""}`}>
      <header className={styles.breakdownHeader}>
        <div className={styles.tabList}>
          <button
            aria-pressed={view === "primary"}
            className={view === "primary" ? styles.tabActive : ""}
            onClick={() => setView("primary")}
            type="button"
          >
            {primaryTitle}
          </button>
          {hasSecondary ? (
            <button
              aria-pressed={view === "secondary"}
              className={view === "secondary" ? styles.tabActive : ""}
              onClick={() => setView("secondary")}
              type="button"
            >
              {secondaryTitle}
            </button>
          ) : null}
        </div>
        <span>VISITORS</span>
      </header>
      <BreakdownRows formatLabel={activeLabel} items={activeItems} />
    </section>
  )
}

export function StatsDashboard({ data, range, environment }: StatsDashboardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [metric, setMetric] = useState<Metric>("visitors")
  const [isPending, startTransition] = useTransition()
  const chartMetric = metric === "pageviews" ? "pageviews" : "visitors"

  function updateFilter(key: "range" | "environment", value: string) {
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set(key, value)

    startTransition(() => {
      router.replace(`${pathname}?${nextParams.toString()}`)
    })
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.scopeSwitcher}>
          <span className={styles.avatar}>T</span>
          <strong>Tâm&apos;s projects</strong>
          <span className={styles.plan}>Hobby</span>
          <ChevronDown aria-hidden="true" />
        </div>

        <div className={styles.searchBox}>
          <Search aria-hidden="true" />
          <span>Find</span>
          <kbd>F</kbd>
        </div>

        <nav aria-label="Project navigation" className={styles.sideNav}>
          {navItems.map((item) => {
            const Icon = item.icon

            return item.label === "Overview" ? (
              <a href="/" key={item.label}>
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            ) : (
              <span className={item.active ? styles.navActive : ""} key={item.label}>
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
                {item.label === "Connect" ? <em>Beta</em> : null}
              </span>
            )
          })}
        </nav>

        <div className={styles.sidebarNote}>
          <Sparkles aria-hidden="true" />
          <div>
            <strong>Public analytics</strong>
            <span>Powered by Vercel&apos;s aggregated data.</span>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <a className={styles.projectBrand} href="/">
            <span className={styles.projectMark}>N</span>
            <strong>tam-portfolio</strong>
            <ChevronDown aria-hidden="true" />
          </a>
          <strong className={styles.pageTitle}>Analytics</strong>
          <a className={styles.viewSite} href="/" rel="noreferrer" target="_blank">
            View site
            <ExternalLink aria-hidden="true" />
          </a>
        </header>

        <div className={`${styles.content} ${isPending ? styles.loading : ""}`}>
          <section className={styles.projectRow}>
            <a href="/" rel="noreferrer" target="_blank">
              <Globe2 aria-hidden="true" />
              <strong>tamsacben.vercel.app</strong>
              <ExternalLink aria-hidden="true" />
            </a>
            <span className={styles.status}>
              <i className={data.connected ? styles.statusLive : styles.statusDemo} />
              {data.connected ? "Live data" : "Demo data"}
            </span>

            <div className={styles.controls}>
              <label>
                <span className="sr-only">Environment</span>
                <select
                  onChange={(event) => updateFilter("environment", event.target.value)}
                  value={environment}
                >
                  {Object.entries(environmentLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" />
              </label>
              <label>
                <CalendarDays aria-hidden="true" />
                <span className="sr-only">Date range</span>
                <select
                  onChange={(event) => updateFilter("range", event.target.value)}
                  value={range}
                >
                  {Object.entries(rangeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" />
              </label>
              <button
                aria-label="Refresh analytics"
                onClick={() => router.refresh()}
                type="button"
              >
                <RefreshCw aria-hidden="true" />
              </button>
              <button aria-label="More options" type="button">
                <MoreHorizontal aria-hidden="true" />
              </button>
            </div>
          </section>

          {!data.connected ? (
            <div className={styles.demoNotice}>
              <Activity aria-hidden="true" />
              Showing a faithful preview while the live analytics connection is being prepared.
            </div>
          ) : null}

          <section className={styles.overviewCard}>
            <div className={styles.metrics}>
              <button
                aria-pressed={metric === "visitors"}
                className={metric === "visitors" ? styles.metricActive : ""}
                onClick={() => setMetric("visitors")}
                type="button"
              >
                <span>Visitors</span>
                <strong>{formatNumber(data.visitors)}</strong>
              </button>
              <button
                aria-pressed={metric === "pageviews"}
                className={metric === "pageviews" ? styles.metricActive : ""}
                onClick={() => setMetric("pageviews")}
                type="button"
              >
                <span>Page Views</span>
                <strong>{formatNumber(data.pageviews)}</strong>
              </button>
              <button
                aria-pressed={metric === "bounceRate"}
                className={metric === "bounceRate" ? styles.metricActive : ""}
                onClick={() => setMetric("bounceRate")}
                type="button"
              >
                <span>Bounce Rate</span>
                <strong>{data.bounceRate === null ? "—" : `${data.bounceRate}%`}</strong>
              </button>
            </div>
            {metric === "bounceRate" && data.bounceRate === null ? (
              <EmptyState message="Bounce rate is not exposed by the public API." />
            ) : (
              <Chart metric={chartMetric} points={data.timeline} range={range} />
            )}
          </section>

          <div className={styles.twoColumnGrid}>
            <BreakdownCard
              className={styles.largeBreakdown}
              primaryItems={data.pages}
              primaryTitle="Pages"
              secondaryItems={data.routes}
              secondaryTitle="Routes"
            />
            <BreakdownCard
              className={styles.largeBreakdown}
              primaryItems={data.referrers}
              primaryLabel={(value) => value || "Direct"}
              primaryTitle="Referrers"
            />
          </div>

          <div className={styles.threeColumnGrid}>
            <BreakdownCard
              primaryItems={data.countries}
              primaryLabel={(value) => (
                <>
                  <span className={styles.flag}>{getCountryFlag(value)}</span>
                  {getCountryName(value)}
                </>
              )}
              primaryTitle="Countries"
            />
            <BreakdownCard
              primaryItems={data.devices}
              primaryLabel={titleCase}
              primaryTitle="Devices"
              secondaryItems={data.browsers}
              secondaryLabel={titleCase}
              secondaryTitle="Browsers"
            />
            <BreakdownCard
              primaryItems={data.operatingSystems}
              primaryLabel={titleCase}
              primaryTitle="Operating Systems"
            />
          </div>

          <footer className={styles.footer}>
            <span>Public mirror of Vercel Web Analytics</span>
            <span>
              Updated{" "}
              {new Intl.DateTimeFormat("en-US", {
                hour: "numeric",
                minute: "2-digit",
              }).format(new Date(data.generatedAt))}
            </span>
          </footer>
        </div>
      </main>
    </div>
  )
}
