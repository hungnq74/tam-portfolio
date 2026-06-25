"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

export function AdminManifestRefreshNotice({
  created = false,
  error,
}: {
  created?: boolean
  error?: string
}) {
  const router = useRouter()
  const [attempt, setAttempt] = useState(1)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAttempt((current) => current + 1)
      router.refresh()
    }, 2500)

    return () => window.clearTimeout(timeoutId)
  }, [attempt, router])

  return (
    <section className="admin-card p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
          <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="admin-kicker mb-2">
            {created ? "Project saved" : "Content is refreshing"}
          </p>
          <h2 className="text-xl font-semibold tracking-normal text-[rgb(var(--ink))]">
            Waiting for the admin content index
          </h2>
          <p className="admin-subtle mt-2 max-w-2xl text-sm leading-6">
            {created
              ? "Your project was saved. Vercel Blob is still refreshing the admin manifest, so this page will retry automatically."
              : "The admin manifest is refreshing. This page will retry automatically instead of showing a 404."}
          </p>
          {error ? (
            <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium leading-5 text-slate-600">
              {error}
            </p>
          ) : null}
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Retry {attempt}
          </p>
        </div>
      </div>
    </section>
  )
}
