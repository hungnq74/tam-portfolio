import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AdminPageHeader, AdminPageShell } from "@/components/admin/AdminChrome"
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton"
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton"
import { AdminProjectForm } from "@/components/admin/AdminProjectForm"
import { requireAdmin } from "@/lib/admin-auth"
import { getAdminFieldOptions } from "@/lib/admin-form-options"
import { readAdminPortfolioSnapshot } from "@/lib/portfolio-manifest"

type EditProjectPageProps = {
  params: Promise<{
    projectId: string
  }>
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

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  await requireAdmin()
  const { projectId } = await params
  const snapshot = await readAdminPortfolioSnapshot()
  const en = snapshot.contentByLocale.en.projects.find((project) => project.id === projectId)
  const vi = snapshot.contentByLocale.vi.projects.find((project) => project.id === projectId)

  if (!en || !vi) {
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
        fields={getAdminFieldOptions()}
        blobConfigured={snapshot.configured}
        manifestError={snapshot.error}
      />
    </AdminPageShell>
  )
}
