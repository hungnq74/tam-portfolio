import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import {
  createAdminPayload,
  createProject,
  createSnapshot,
} from "@/test/factories"

const mocks = vi.hoisted(() => {
  class ManifestConflictError extends Error {
    constructor() {
      super("Portfolio content changed in another tab. Refresh and try again.")
      this.name = "ManifestConflictError"
    }
  }

  return {
    ManifestConflictError,
    requireAdminRequest: vi.fn(),
    addProjectToManifest: vi.fn(),
    assertExpectedEtag: vi.fn(),
    readAdminPortfolioSnapshot: vi.fn(),
    savePortfolioManifest: vi.fn(),
  }
})

vi.mock("@/lib/admin-auth", () => ({
  requireAdminRequest: mocks.requireAdminRequest,
}))

vi.mock("@/lib/portfolio-manifest", () => ({
  addProjectToManifest: mocks.addProjectToManifest,
  assertExpectedEtag: mocks.assertExpectedEtag,
  ManifestConflictError: mocks.ManifestConflictError,
  readAdminPortfolioSnapshot: mocks.readAdminPortfolioSnapshot,
  savePortfolioManifest: mocks.savePortfolioManifest,
}))

const revalidatePath = vi.mocked(await import("next/cache")).revalidatePath
const { POST } = await import("./route")

function request(body: unknown) {
  return new NextRequest("http://localhost/admin/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("admin project create API", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.requireAdminRequest.mockReturnValue(true)
    mocks.readAdminPortfolioSnapshot.mockResolvedValue(createSnapshot())
    mocks.addProjectToManifest.mockImplementation(
      (_manifest, projects) =>
        createSnapshot({ projects: [projects.en], viProjects: [projects.vi] })
          .manifest,
    )
    mocks.savePortfolioManifest.mockResolvedValue({ etag: "etag-2" })
  })

  it("rejects unauthorized requests before parsing the payload", async () => {
    mocks.requireAdminRequest.mockReturnValue(false)

    const response = await POST(request({}))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized." })
    expect(mocks.readAdminPortfolioSnapshot).not.toHaveBeenCalled()
  })

  it("returns validation details for invalid project payloads", async () => {
    const response = await POST(request({}))

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe("Project validation failed.")
    expect(body.details.length).toBeGreaterThan(0)
  })

  it("rejects project creation without proposal media", async () => {
    const response = await POST(
      request(createAdminPayload({ shared: { media: undefined } })),
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe("Project validation failed.")
    expect(body.details).toContain(
      "Upload a cover image, main image, and proposal PDF before saving this Thinking project.",
    )
  })

  it("blocks writes when Blob storage is not configured", async () => {
    mocks.readAdminPortfolioSnapshot.mockResolvedValue(
      createSnapshot({ configured: false, etag: null }),
    )

    const response = await POST(
      request(createAdminPayload({ expectedEtag: null })),
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error:
        "BLOB_READ_WRITE_TOKEN is required before project changes can be saved.",
    })
  })

  it("creates against the latest server snapshot even when the form etag is stale", async () => {
    const response = await POST(
      request(createAdminPayload({ expectedEtag: "stale-form-etag" })),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      etag: "etag-2",
      projectId: "demo-project",
    })
    expect(mocks.assertExpectedEtag).not.toHaveBeenCalled()
    expect(mocks.savePortfolioManifest).toHaveBeenCalledWith(
      expect.objectContaining({ revision: "revision-1" }),
      "etag-1",
    )
  })

  it("rejects duplicate ids across locales", async () => {
    mocks.readAdminPortfolioSnapshot.mockResolvedValue(
      createSnapshot({
        projects: [createProject("demo-project")],
        viProjects: [createProject("other-project")],
      }),
    )

    const response = await POST(request(createAdminPayload()))

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      error: "A project with this id already exists.",
    })
  })

  it("creates localized projects, saves the manifest, and revalidates public paths", async () => {
    const response = await POST(request(createAdminPayload()))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      etag: "etag-2",
      projectId: "demo-project",
    })
    expect(mocks.addProjectToManifest).toHaveBeenCalledWith(
      expect.objectContaining({ revision: "revision-1" }),
      {
        en: expect.objectContaining({
          id: "demo-project",
          fieldId: "social-planner",
          title: "Demo project",
          proposalCta: expect.objectContaining({
            creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
          }),
        }),
        vi: expect.objectContaining({
          id: "demo-project",
          fieldId: "social-planner",
          title: "Du an demo",
          proposalCta: expect.objectContaining({
            label: "Coi full portfolio",
          }),
        }),
      },
    )
    expect(mocks.savePortfolioManifest).toHaveBeenCalledWith(
      expect.objectContaining({ revision: "revision-1" }),
      "etag-1",
    )
    expect(revalidatePath).toHaveBeenCalledWith("/")
    expect(revalidatePath).toHaveBeenCalledWith("/work/demo-project")
  })
})
