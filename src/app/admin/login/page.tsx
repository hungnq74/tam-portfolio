import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AdminPageShell } from "@/components/admin/AdminChrome"
import { AdminLoginForm } from "@/components/admin/AdminLoginForm"
import { getAdminAuthConfig, isAdminAuthenticated } from "@/lib/admin-auth"

export const metadata: Metadata = {
  title: "Admin Login - Minh Tam Portfolio",
}

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin")
  }

  const configState = getAdminAuthConfig()

  return (
    <AdminPageShell narrow>
      <div className="admin-card p-6 sm:p-8">
        {!configState.configured ? (
          <div className="admin-notice admin-notice-error mb-5">
            Missing admin env: {configState.missing.join(", ")}
          </div>
        ) : null}
        <AdminLoginForm />
      </div>
    </AdminPageShell>
  )
}
