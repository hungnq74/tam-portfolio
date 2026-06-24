"use client"

import { type MouseEvent, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getHomeAboutHref, getHomeFieldsHref } from "@/lib/portfolio-route-state"
import { cn } from "@/lib/utils"

type GlobalNavItemId = "home" | "work" | "me"

const NAV_ITEMS: Array<{
  id: GlobalNavItemId
  href: string
  label: string
}> = [
  { id: "home", href: getHomeAboutHref(), label: "HOME" },
  { id: "work", href: getHomeFieldsHref(), label: "WORK" },
  { id: "me", href: "/myth", label: "ME" },
]

export function getGlobalPortfolioNavActiveItem(
  pathname: string,
  hash = "",
): GlobalNavItemId {
  if (pathname.startsWith("/myth")) return "me"
  if (pathname.startsWith("/content") || pathname.startsWith("/work")) return "work"
  if (pathname === "/" && hash === "#fields") return "work"

  return "home"
}

function dispatchRouteHashSync() {
  window.dispatchEvent(new Event("hashchange"))
}

export function GlobalPortfolioNav({ visible = true }: { visible?: boolean }) {
  const pathname = usePathname() ?? "/"
  const [currentHash, setCurrentHash] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash,
  )
  const activeItem = getGlobalPortfolioNavActiveItem(pathname, currentHash)

  useEffect(() => {
    const syncHash = () => setCurrentHash(window.location.hash)

    syncHash()
    window.addEventListener("hashchange", syncHash)
    window.addEventListener("popstate", syncHash)

    return () => {
      window.removeEventListener("hashchange", syncHash)
      window.removeEventListener("popstate", syncHash)
    }
  }, [])

  const handleSamePageJump = (
    event: MouseEvent<HTMLAnchorElement>,
    item: GlobalNavItemId,
  ) => {
    if (pathname !== "/" || typeof window === "undefined") return

    if (item === "home") {
      event.preventDefault()
      window.history.pushState(null, "", getHomeAboutHref())
      setCurrentHash("#about")
      dispatchRouteHashSync()
      return
    }

    if (item === "work") {
      event.preventDefault()
      window.history.pushState(null, "", getHomeFieldsHref())
      setCurrentHash("#fields")
      dispatchRouteHashSync()
    }
  }

  if (!visible) return null

  return (
    <nav
      aria-label="Primary portfolio navigation"
      className="fixed left-1/2 top-4 z-[70] w-[min(calc(100vw-1.5rem),26rem)] -translate-x-1/2 rounded-full border border-moss/45 bg-paper/82 px-2.5 py-2 shadow-[0_12px_36px_rgba(45,32,21,0.12)] backdrop-blur-xl sm:top-5 sm:w-auto sm:min-w-[24rem] sm:px-3"
    >
      <ul className="grid grid-cols-3 items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.id === activeItem

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={(event) => handleSamePageJump(event, item.id)}
                className={cn(
                  "group relative flex min-h-9 items-center justify-center rounded-full px-4 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-moss transition hover:bg-gold/14 hover:text-clay focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 focus:ring-offset-paper sm:px-6 sm:text-[0.72rem]",
                  active && "text-clay",
                )}
              >
                <span>{item.label}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute bottom-1.5 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-clay transition",
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-60",
                  )}
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
