import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import {
  getGlobalPortfolioNavActiveItem,
  GlobalPortfolioNav,
} from "@/components/GlobalPortfolioNav"

describe("GlobalPortfolioNav", () => {
  beforeEach(() => {
    window.history.pushState(null, "", "/")
  })

  it("renders the primary public navigation links", () => {
    render(<GlobalPortfolioNav />)

    expect(
      screen.getByRole("navigation", { name: "Primary portfolio navigation" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "HOME" })).toHaveAttribute("href", "/#about")
    expect(screen.getByRole("link", { name: "WORK" })).toHaveAttribute("href", "/#fields")
    expect(screen.getByRole("link", { name: "ME" })).toHaveAttribute("href", "/myth")
  })

  it.each([
    { pathname: "/", hash: "", active: "home" },
    { pathname: "/", hash: "#about", active: "home" },
    { pathname: "/", hash: "#fields", active: "work" },
    { pathname: "/content/creative-copywriter", hash: "", active: "work" },
    { pathname: "/work/weshare", hash: "", active: "work" },
    { pathname: "/myth", hash: "", active: "me" },
  ] as const)("marks $active active for $pathname$hash", ({ pathname, hash, active }) => {
    expect(getGlobalPortfolioNavActiveItem(pathname, hash)).toBe(active)
  })

  it("marks WORK active on content and project routes", () => {
    window.history.pushState(null, "", "/work/weshare")

    render(<GlobalPortfolioNav />)

    expect(screen.getByRole("link", { name: "WORK" })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", { name: "HOME" })).not.toHaveAttribute("aria-current")
  })

  it("handles same-page home and work jumps on the homepage", async () => {
    const user = userEvent.setup()
    window.history.pushState(null, "", "/#fields")

    render(<GlobalPortfolioNav />)

    await user.click(screen.getByRole("link", { name: "HOME" }))
    expect(window.location.pathname).toBe("/")
    expect(window.location.hash).toBe("#about")
    expect(screen.getByRole("link", { name: "HOME" })).toHaveAttribute("aria-current", "page")

    await user.click(screen.getByRole("link", { name: "WORK" }))
    expect(window.location.pathname).toBe("/")
    expect(window.location.hash).toBe("#fields")
    expect(screen.getByRole("link", { name: "WORK" })).toHaveAttribute("aria-current", "page")
  })

  it("does not render when hidden on the cover page", () => {
    render(<GlobalPortfolioNav visible={false} />)

    expect(
      screen.queryByRole("navigation", { name: "Primary portfolio navigation" }),
    ).not.toBeInTheDocument()
  })
})
