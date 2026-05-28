import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProjectDetailPage } from "@/components/ProjectDetailPage"
import {
  DEFAULT_LOCALE,
  getPortfolioProject,
  getPortfolioProjectIds,
} from "@/data/portfolio"

type ProjectPageProps = {
  params: Promise<{
    projectId: string
  }>
}

export function generateStaticParams() {
  return getPortfolioProjectIds().map((projectId) => ({ projectId }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { projectId } = await params
  const project = getPortfolioProject(DEFAULT_LOCALE, projectId)

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

  if (!getPortfolioProject(DEFAULT_LOCALE, projectId)) {
    notFound()
  }

  return <ProjectDetailPage projectId={projectId} />
}
