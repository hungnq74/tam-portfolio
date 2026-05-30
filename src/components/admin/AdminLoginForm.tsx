"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { LogIn } from "lucide-react"

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
      <div>
        <p className="mb-2 text-sm font-medium text-slate-500">Private admin</p>
        <h1 className="text-3xl font-semibold tracking-normal text-slate-950">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Manage portfolio projects, media decks, and runtime content.
        </p>
      </div>

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
