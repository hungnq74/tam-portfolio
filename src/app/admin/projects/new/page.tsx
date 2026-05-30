import type { Metadata } from "next"
import { AdminPageHeader, AdminPageShell } from "@/components/admin/AdminChrome"
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton"
import { AdminProjectForm } from "@/components/admin/AdminProjectForm"
import { requireAdmin } from "@/lib/admin-auth"
import { getAdminFieldOptions } from "@/lib/admin-form-options"
import { readAdminPortfolioSnapshot } from "@/lib/portfolio-manifest"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "New Project - Minh Tam Portfolio Admin",
}

export default async function NewProjectPage() {
  await requireAdmin()
  const snapshot = await readAdminPortfolioSnapshot()

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="New project"
        backHref="/admin"
        backLabel="Back to projects"
        actions={<AdminLogoutButton />}
      />
      <AdminProjectForm
        mode="create"
        manifestEtag={snapshot.etag}
        fields={getAdminFieldOptions()}
        blobConfigured={snapshot.configured}
        manifestError={snapshot.error}
      />
    </AdminPageShell>
  )
}
