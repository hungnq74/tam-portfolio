"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

export function AdminDeleteButton({
  projectId,
  expectedEtag,
  label = "Delete",
  redirectTo,
}: {
  projectId: string
  expectedEtag: string | null
  label?: string
  redirectTo?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDelete = async () => {
    if (!window.confirm(`Delete project "${projectId}"?`)) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/admin/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedEtag }),
      })
      const result = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        setError(result?.error ?? "Unable to delete project.")
        return
      }

      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={onDelete}
        disabled={loading}
        className="admin-button admin-button-danger"
      >
        <Trash2 className="h-4 w-4" />
        {loading ? "Deleting" : label}
      </button>
      {error ? <span className="max-w-xs text-xs font-semibold text-red-700">{error}</span> : null}
    </span>
  )
}
