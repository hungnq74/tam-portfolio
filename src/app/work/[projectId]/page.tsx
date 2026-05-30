import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProjectDetailPage } from "@/components/ProjectDetailPage"
import { DEFAULT_LOCALE } from "@/data/portfolio"
import { readPortfolioSnapshot } from "@/lib/portfolio-manifest"

type ProjectPageProps = {
  params: Promise<{
    projectId: string
  }>
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

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params
  const { contentByLocale } = await readPortfolioSnapshot()

  if (!contentByLocale[DEFAULT_LOCALE].projects.some((project) => project.id === projectId)) {
    notFound()
  }

  return <ProjectDetailPage contentByLocale={contentByLocale} projectId={projectId} />
}
