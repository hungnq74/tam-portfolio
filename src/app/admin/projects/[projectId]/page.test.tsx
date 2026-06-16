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

  it("renders the editor for Thinking projects with all admin field options", async () => {
    render(
      await EditProjectPage({
        params: Promise.resolve({ projectId: "thinking-project" }),
      }),
    )

    expect(screen.getByRole("heading", { name: "Edit project" })).toBeInTheDocument()
    expect(screen.getByText("Thinking Launch")).toBeInTheDocument()

    const fieldSelect = screen.getByLabelText("Field") as HTMLSelectElement
    expect(Array.from(fieldSelect.options).map((option) => option.value)).toEqual([
      "social-planner",
      "creative-copywriter",
    ])
  })

  it("renders the editor for Writing projects", async () => {
    render(
      await EditProjectPage({
        params: Promise.resolve({ projectId: "writing-project" }),
      }),
    )

    expect(screen.getByRole("heading", { name: "Edit project" })).toBeInTheDocument()
    expect(screen.getByText("Writing Draft")).toBeInTheDocument()
    expect(screen.getByLabelText("Field")).toHaveValue("creative-copywriter")
  })
})
