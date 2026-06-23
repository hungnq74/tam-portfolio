import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

export function AdminPageShell({
  children,
  narrow = false,
}: {
  children: ReactNode
  narrow?: boolean
}) {
  return (
    <main className="admin-app">
      <section className={narrow ? "admin-container max-w-md" : "admin-container"}>
        <div className="admin-command">
          <div className="admin-brand">
            <span className="admin-brand-mark" aria-hidden="true">
              MT
            </span>
            <div className="min-w-0">
              <p className="admin-kicker">Proposal CMS</p>
              <p className="truncate text-sm font-semibold text-[rgb(var(--ink))]">
                Minh Tam Portfolio
              </p>
            </div>
          </div>
        </div>
        {children}
      </section>
    </main>
  )
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  backHref,
  backLabel = "Back",
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  backHref?: string
  backLabel?: string
}) {
  return (
    <header className="admin-card mb-6 flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {backHref ? (
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        ) : null}
        {eyebrow ? (
          <p className="admin-kicker mb-2">{eyebrow}</p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-normal text-[rgb(var(--ink))] sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="admin-subtle mt-2 max-w-2xl text-sm leading-6">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
