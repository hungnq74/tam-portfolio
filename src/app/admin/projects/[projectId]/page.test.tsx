import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import EditProjectPage from "@/app/admin/projects/[projectId]/page"
import { createProject, createSnapshot, testMedia } from "@/test/factories"

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  readAdminPortfolioSnapshot: vi.fn(),
}))

vi.mock("@/lib/admin-auth", () => ({
  requireAdmin: mocks.requireAdmin,
}))

vi.mock("@/lib/portfolio-manifest", () => ({
  readAdminPortfolioSnapshot: mocks.readAdminPortfolioSnapshot,
}))

describe("EditProjectPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.readAdminPortfolioSnapshot.mockResolvedValue(
      createSnapshot({
        projects: [
          createProject("thinking-project", {
            title: "Thinking Launch",
            media: testMedia,
          }),
          createProject("writing-project", {
            fieldId: "creative-copywriter",
            title: "Writing Draft",
            media: testMedia,
          }),
        ],
        viProjects: [
          createProject("thinking-project", {
            title: "Dự án Thinking",
            category: "Chiến dịch",
            media: testMedia,
          }),
          createProject("writing-project", {
            fieldId: "creative-copywriter",
            title: "Bản nháp Writing",
            media: testMedia,
          }),
        ],
      }),
    )
  })

  it("renders the proposal editor for Thinking projects", async () => {
    render(
      await EditProjectPage({
        params: Promise.resolve({ projectId: "thinking-project" }),
      }),
    )

    expect(
      screen.getByRole("heading", { name: "Edit project" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Thinking Launch")).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Content" })).toBeInTheDocument()
    expect(screen.queryByLabelText("Field")).not.toBeInTheDocument()
  })

  it("does not render the editor for Writing projects", async () => {
    await expect(
      EditProjectPage({
        params: Promise.resolve({ projectId: "writing-project" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND")
  })

  it("shows a refresh notice instead of a 404 when a saved project is still propagating", async () => {
    mocks.readAdminPortfolioSnapshot.mockResolvedValue(
      createSnapshot({
        projects: [],
        viProjects: [],
        error:
          "Unable to read Blob manifest: Blob manifest cache is still refreshing. Please wait a few seconds and try again.",
      }),
    )

    render(
      await EditProjectPage({
        params: Promise.resolve({ projectId: "new-project" }),
        searchParams: Promise.resolve({ created: "1" }),
      }),
    )

    expect(
      screen.getByRole("heading", { name: "Project saved" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "Your project was saved. Vercel Blob is still refreshing the admin manifest, so this page will retry automatically.",
      ),
    ).toBeInTheDocument()
    expect(screen.getByText("/new-project")).toBeInTheDocument()
  })
})
