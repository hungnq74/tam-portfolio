"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { LogIn, ShieldCheck } from "lucide-react"

export function AdminLoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch("/admin/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const result = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        setError(result?.error ?? "Unable to log in.")
        return
      }

      router.push("/admin")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-slate-200 bg-slate-50 text-slate-700">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="admin-kicker mb-2">Private admin</p>
          <h1 className="text-3xl font-semibold tracking-normal text-[rgb(var(--ink))]">
            Sign in
          </h1>
          <p className="admin-subtle mt-3 text-sm leading-6">
            Manage proposal projects, media decks, and public portfolio copy.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-[8px] border border-slate-200 bg-slate-50 p-4">
        <label className="block">
          <span className="admin-label">Username</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            className="admin-input"
          />
        </label>

        <label className="block">
          <span className="admin-label">Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            className="admin-input"
          />
        </label>

        <p className="text-xs leading-5 text-slate-500">
          English-only editing is enabled. Existing Vietnamese data is preserved
          behind the scenes.
        </p>
      </div>

      {error ? <p className="admin-notice admin-notice-error">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="admin-button admin-button-primary w-full"
      >
        <LogIn className="h-4 w-4" />
        {loading ? "Signing in" : "Sign in"}
      </button>
    </form>
  )
}
