import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { ProjectDetailPage } from "@/components/ProjectDetailPage"
import { DEFAULT_LOCALE } from "@/data/portfolio"
import {
  getProjectRedirectTarget,
  readPortfolioSnapshot,
} from "@/lib/portfolio-manifest"

type ProjectPageProps = {
  params: Promise<{
    projectId: string
  }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function toQueryString(query: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item))
    else if (value !== undefined) params.append(key, value)
  })

  const text = params.toString()
  return text ? `?${text}` : ""
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { projectId } = await params
  const { contentByLocale } = await readPortfolioSnapshot()
  const project = contentByLocale[DEFAULT_LOCALE].projects.find(
    (project) => project.id === projectId,
  )

  if (!project) {
    return {
      title: "Project Not Found - Minh Tam Portfolio",
    }
  }

  return {
    title: `${project.title} - Minh Tam Portfolio`,
    description: project.summary,
    openGraph: {
      title: `${project.title} - Minh Tam Portfolio`,
      description: project.summary,
      type: "article",
    },
  }
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { projectId } = await params
  const { contentByLocale, manifest } = await readPortfolioSnapshot()
  const hasProject = (id: string) =>
    contentByLocale[DEFAULT_LOCALE].projects.some((project) => project.id === id)

  if (!hasProject(projectId)) {
    // The project was renamed in admin: send old links to its current URL.
    const target = getProjectRedirectTarget(manifest, projectId)

    if (target && hasProject(target)) {
      const query = searchParams ? await searchParams : {}
      redirect(`/work/${target}${toQueryString(query)}`)
    }

    notFound()
  }

  return <ProjectDetailPage contentByLocale={contentByLocale} projectId={projectId} />
}
