import type { Metadata } from "next"
import Link from "next/link"
import { Edit3, Plus, Settings } from "lucide-react"
import { AdminPageHeader, AdminPageShell } from "@/components/admin/AdminChrome"
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton"
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton"
import { requireAdmin } from "@/lib/admin-auth"
import { isAdminManagedProject } from "@/lib/admin-projects"
import { readAdminPortfolioSnapshot } from "@/lib/portfolio-manifest"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Admin - Minh Tam Portfolio",
}

export default async function AdminPage() {
  await requireAdmin()
  const snapshot = await readAdminPortfolioSnapshot()
  const projects = snapshot.contentByLocale.en.projects.filter(
    isAdminManagedProject,
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
      {snapshot.error ? (
        <AdminBanner message={snapshot.error} tone="error" />
      ) : null}

      <div className="admin-card mb-5 flex flex-wrap items-center gap-3 px-4 py-3 text-sm text-slate-500">
        <Settings className="h-4 w-4 text-slate-400" />
        <span>Revision: {snapshot.manifest.revision}</span>
        <span>
          Updated: {new Date(snapshot.manifest.updatedAt).toLocaleString()}
        </span>
      </div>

      <div className="grid gap-3">
        {projects.map((project) => {
          const viProject = snapshot.contentByLocale.vi.projects.find(
            (item) => item.id === project.id,
          )

          return (
            <article key={project.id} className="admin-card p-3 sm:p-4">
              <div className="grid gap-4 md:grid-cols-[6.5rem_1fr_auto] md:items-center">
                <div className="overflow-hidden rounded-[6px] border border-slate-200 bg-slate-100">
                  {project.media?.cover ? (
                    <img
                      src={project.media.cover.src}
                      alt={project.media.cover.alt}
                      className="aspect-[16/10] h-full w-full object-cover"
                      style={{
                        objectPosition: `${project.media.cover.focalPoint?.x ?? 50}% ${project.media.cover.focalPoint?.y ?? 50}%`,
                      }}
                    />
                  ) : (
                    <div className="flex aspect-[16/10] items-center justify-center text-xs font-semibold text-slate-400">
                      Text
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="admin-pill">
                      {getMediaStatus(project)}
                    </span>
                  </div>
                  <h2 className="truncate text-lg font-semibold tracking-normal text-slate-950">
                    {project.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                    {viProject?.title ? `${viProject.title} · ` : null}
                    {project.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="admin-button admin-button-secondary"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Link>
                  <AdminDeleteButton
                    projectId={project.id}
                    expectedEtag={snapshot.etag}
                  />
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </AdminPageShell>
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
  }
}) {
  if (!project.media) return "Text detail"
  const slides = project.media.proposalSlides?.length ?? 0
  return slides > 0
    ? `${slides} slides`
    : project.media.summary
      ? "Main image"
      : "Cover"
}
