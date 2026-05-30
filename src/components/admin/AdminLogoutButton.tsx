"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function AdminLogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onLogout = async () => {
    setLoading(true)
    await fetch("/admin/api/logout", { method: "POST" }).catch(() => null)
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loading}
      className="admin-button admin-button-secondary"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Signing out" : "Sign out"}
    </button>
  )
}
