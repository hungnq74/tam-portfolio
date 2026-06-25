import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AdminPage from "@/app/admin/page"
import { createProject, createSnapshot } from "@/test/factories"

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  readAdminPortfolioSnapshot: vi.fn(),
}))

vi.mock("@/lib/admin-auth", () => ({
  requireAdmin: mocks.requireAdmin,
}))

vi.mock("@/lib/portfolio-manifest", () => ({
  BLOB_MANIFEST_CACHE_REFRESHING_MESSAGE:
    "Blob manifest cache is still refreshing. Please wait a few seconds and try again.",
  readAdminPortfolioSnapshot: mocks.readAdminPortfolioSnapshot,
}))

describe("AdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.readAdminPortfolioSnapshot.mockResolvedValue(
      createSnapshot({
        projects: [
          createProject("thinking-project", { title: "Thinking Launch" }),
          createProject("writing-project", {
            fieldId: "creative-copywriter",
            title: "Writing Draft",
          }),
        ],
        viProjects: [
          createProject("thinking-project", { title: "Dự án Thinking" }),
          createProject("writing-project", {
            fieldId: "creative-copywriter",
            title: "Bản nháp Writing",
          }),
        ],
      }),
    )
  })

  it("lists only proposal-style Thinking projects", async () => {
    render(await AdminPage())

    expect(mocks.requireAdmin).toHaveBeenCalled()
    expect(screen.getByText("1 project")).toBeInTheDocument()
    expect(screen.getByText("Thinking Launch")).toBeInTheDocument()
    expect(screen.queryByText("Dự án Thinking")).not.toBeInTheDocument()
    expect(screen.queryByText("Writing Draft")).not.toBeInTheDocument()
    expect(screen.queryByText(/Bản nháp Writing/)).not.toBeInTheDocument()
    expect(screen.queryByText("social-planner")).not.toBeInTheDocument()
    expect(screen.queryByText("Campaign")).not.toBeInTheDocument()
  })

  it("shows a delete refresh notice instead of a fatal error during Blob cache propagation", async () => {
    mocks.readAdminPortfolioSnapshot.mockResolvedValue(
      createSnapshot({
        projects: [createProject("thinking-project", { title: "Thinking Launch" })],
        error:
          "Blob manifest cache is still refreshing. Please wait a few seconds and try again.",
      }),
    )

    render(
      await AdminPage({
        searchParams: Promise.resolve({ deleted: "1" }),
      }),
    )

    expect(screen.getByText("Project deleted")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Your project was deleted. Vercel Blob is still refreshing the admin manifest, so this list will retry automatically.",
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(
        "Unable to read Blob manifest: Blob manifest cache is still refreshing. Please wait a few seconds and try again.",
      ),
    ).not.toBeInTheDocument()
    expect(screen.getByText("Thinking Launch")).toBeInTheDocument()
  })
})
