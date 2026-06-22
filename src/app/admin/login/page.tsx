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
      <div className="admin-card overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <p className="admin-kicker">Private workspace</p>
          <p className="mt-1 text-sm font-semibold text-[rgb(var(--ink))]">
            Proposal content manager
          </p>
        </div>
        <div className="p-5 sm:p-6">
          {!configState.configured ? (
            <div className="admin-notice admin-notice-error mb-5">
              Missing admin env: {configState.missing.join(", ")}
            </div>
          ) : null}
          <AdminLoginForm />
        </div>
      </div>
    </AdminPageShell>
  )
}
