import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AdminPageHeader, AdminPageShell } from "@/components/admin/AdminChrome"
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton"
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton"
import { AdminManifestRefreshNotice } from "@/components/admin/AdminManifestRefreshNotice"
import { AdminProjectForm } from "@/components/admin/AdminProjectForm"
import { requireAdmin } from "@/lib/admin-auth"
import { isAdminManagedProject } from "@/lib/admin-projects"
import { readAdminPortfolioSnapshot } from "@/lib/portfolio-manifest"

type EditProjectPageProps = {
  params: Promise<{
    projectId: string
  }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: EditProjectPageProps): Promise<Metadata> {
  const { projectId } = await params

  return {
    title: `Edit ${projectId} - Minh Tam Portfolio Admin`,
  }
}

export default async function EditProjectPage({
  params,
  searchParams,
}: EditProjectPageProps) {
  await requireAdmin()
  const { projectId } = await params
  const query = searchParams ? await searchParams : {}
  const created = query.created === "1"
  const snapshot = await readAdminPortfolioSnapshot()
  const en = snapshot.contentByLocale.en.projects.find(
    (project) => project.id === projectId,
  )
  const vi = snapshot.contentByLocale.vi.projects.find(
    (project) => project.id === projectId,
  )

  if (snapshot.error && (!en || !vi)) {
    return (
      <AdminPageShell>
        <AdminPageHeader
          title={created ? "Project saved" : "Content is refreshing"}
          description={`/${projectId}`}
          backHref="/admin"
          backLabel="Back to projects"
          actions={<AdminLogoutButton />}
        />
        <AdminManifestRefreshNotice created={created} error={snapshot.error} />
      </AdminPageShell>
    )
  }

  if (!en || !vi || !isAdminManagedProject(en) || !isAdminManagedProject(vi)) {
    notFound()
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Edit project"
        description={en.title}
        backHref="/admin"
        backLabel="Back to projects"
        actions={
          <>
            <AdminDeleteButton
              projectId={projectId}
              expectedEtag={snapshot.etag}
              label="Delete project"
              redirectTo="/admin"
            />
            <AdminLogoutButton />
          </>
        }
      />

      <AdminProjectForm
        mode="edit"
        manifestEtag={snapshot.etag}
        project={{ en, vi }}
        blobConfigured={snapshot.configured}
        manifestError={snapshot.error}
      />
    </AdminPageShell>
  )
}
