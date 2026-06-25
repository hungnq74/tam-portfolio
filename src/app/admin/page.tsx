import type { Metadata } from "next"
import Link from "next/link"
import { Edit3, FileImage, FileText, Plus, Settings } from "lucide-react"
import { AdminPageHeader, AdminPageShell } from "@/components/admin/AdminChrome"
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton"
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton"
import { AdminManifestRefreshNotice } from "@/components/admin/AdminManifestRefreshNotice"
import { requireAdmin } from "@/lib/admin-auth"
import { isAdminManagedProject } from "@/lib/admin-projects"
import {
  BLOB_MANIFEST_CACHE_REFRESHING_MESSAGE,
  readAdminPortfolioSnapshot,
} from "@/lib/portfolio-manifest"
import type { Project } from "@/data/portfolio"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Admin - Minh Tam Portfolio",
}

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminPage({ searchParams }: AdminPageProps = {}) {
  await requireAdmin()
  const query = searchParams ? await searchParams : {}
  const deleted = query.deleted === "1"
  const snapshot = await readAdminPortfolioSnapshot()
  const projects = snapshot.contentByLocale.en.projects.filter(
    isAdminManagedProject,
  )
  const cacheRefreshing = snapshot.error?.includes(
    BLOB_MANIFEST_CACHE_REFRESHING_MESSAGE,
  )

  return (
    <AdminPageShell>
      <AdminPageHeader
        eyebrow="Portfolio admin"
        title="Projects"
        description={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
        actions={
          <>
            <Link
              href="/admin/projects/new"
              className="admin-button admin-button-primary"
            >
              <Plus className="h-4 w-4" />
              New project
            </Link>
            <AdminLogoutButton />
          </>
        }
      />

      {!snapshot.configured ? (
        <AdminBanner message="BLOB_READ_WRITE_TOKEN is missing. Public pages are using static fallback content, and admin changes are disabled." />
      ) : null}
      {cacheRefreshing ? (
        <div className="mb-5">
          <AdminManifestRefreshNotice deleted={deleted} error={snapshot.error} />
        </div>
      ) : snapshot.error ? (
        <AdminBanner message={snapshot.error} tone="error" />
      ) : null}

      <div className="admin-card mb-5 flex flex-wrap items-center gap-3 px-4 py-3 text-sm text-slate-500">
        <Settings className="h-4 w-4 text-slate-400" />
        <span>Revision: {snapshot.manifest.revision}</span>
        <span>
          Updated: {new Date(snapshot.manifest.updatedAt).toLocaleString()}
        </span>
      </div>

      <div className="grid gap-4">
        {projects.length ? (
          projects.map((project) => (
            <AdminProjectCard
              key={project.id}
              project={project}
              expectedEtag={snapshot.etag}
              updatedAt={snapshot.manifest.updatedAt}
            />
          ))
        ) : (
          <div className="admin-card p-8 text-center">
            <p className="admin-kicker">No proposal projects</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-[rgb(var(--ink))]">
              Start with a clean AXE-style case.
            </h2>
            <p className="admin-subtle mx-auto mt-2 max-w-md text-sm leading-6">
              Create a proposal project with cover, summary image, PDF slides,
              CTA, and collaborator credits.
            </p>
            <Link
              href="/admin/projects/new"
              className="admin-button admin-button-primary mt-5"
            >
              <Plus className="h-4 w-4" />
              New project
            </Link>
          </div>
        )}
      </div>
    </AdminPageShell>
  )
}

function AdminProjectCard({
  project,
  expectedEtag,
  updatedAt,
}: {
  project: Project
  expectedEtag: string | null
  updatedAt: string
}) {
  const readiness = getReadiness(project)
  const slideCount = project.media?.proposalSlides?.length ?? 0
  const cardCover = project.media?.cardCover ?? project.media?.cover

  return (
    <article className="admin-card overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[15rem_1fr]">
        <div className="relative min-h-44 border-b border-slate-200 bg-slate-100 lg:border-b-0 lg:border-r">
          {cardCover ? (
            <img
              src={cardCover.src}
              alt={cardCover.alt}
              className="h-full min-h-44 w-full object-cover"
              style={{
                objectPosition: `${cardCover.focalPoint?.x ?? 50}% ${cardCover.focalPoint?.y ?? 50}%`,
              }}
            />
          ) : (
            <div className="flex h-full min-h-44 items-center justify-center text-sm font-semibold text-[rgba(38,52,40,0.42)]">
              Cover pending
            </div>
          )}
          <span
            className="admin-status-chip absolute left-3 top-3"
            data-tone={readiness.ready ? "ready" : "warn"}
          >
            {readiness.label}
          </span>
        </div>

        <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="admin-pill">
                <FileImage className="h-3.5 w-3.5" />
                {getMediaStatus(project)}
              </span>
              <span className="admin-pill">
                <FileText className="h-3.5 w-3.5" />
                {slideCount} slide{slideCount === 1 ? "" : "s"}
              </span>
              <span className="admin-pill">
                Updated {new Date(updatedAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="truncate text-xl font-semibold tracking-normal text-[rgb(var(--ink))]">
              {project.title}
            </h2>
            <p className="admin-subtle mt-2 line-clamp-2 text-sm leading-6">
              {project.summary || "No summary yet."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <Link
              href={`/admin/projects/${project.id}`}
              className="admin-button admin-button-secondary"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Link>
            <AdminDeleteButton
              projectId={project.id}
              expectedEtag={expectedEtag}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

function AdminBanner({
  message,
  tone = "warn",
}: {
  message: string
  tone?: "warn" | "error"
}) {
  return (
    <div
      className={`admin-notice mb-5 ${tone === "error" ? "admin-notice-error" : "admin-notice-warn"}`}
    >
      {message}
    </div>
  )
}

function getMediaStatus(project: {
  media?: {
    proposalSlides?: unknown[]
    summary?: unknown
    cover?: unknown
  }
}) {
  if (!project.media) return "Text detail"
  const slides = project.media.proposalSlides?.length ?? 0
  if (project.media.cover && project.media.summary && slides > 0) {
    return "Media ready"
  }
  if (slides > 0) return `${slides} slides`
  if (project.media.summary) return "Main image"
  if (project.media.cover) return "Cover"
  return "Text detail"
}

function getReadiness(project: Project) {
  const hasCover = Boolean(project.media?.cover)
  const hasSummary = Boolean(project.media?.summary)
  const hasSlides = Boolean(project.media?.proposalSlides?.length)
  const ready = hasCover && hasSummary && hasSlides

  return {
    ready,
    label: ready ? "Ready" : "Needs media",
  }
}
