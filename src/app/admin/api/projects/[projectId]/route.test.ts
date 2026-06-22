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
    assertExpectedEtag: vi.fn(),
    deleteBlobUrls: vi.fn(),
    getOwnedBlobUrls: vi.fn(),
    getUnusedOwnedBlobUrls: vi.fn(),
    readAdminPortfolioSnapshot: vi.fn(),
    removeProjectFromManifest: vi.fn(),
    replaceProjectInManifest: vi.fn(),
    savePortfolioManifest: vi.fn(),
  }
})

vi.mock("@/lib/admin-auth", () => ({
  requireAdminRequest: mocks.requireAdminRequest,
}))

vi.mock("@/lib/portfolio-manifest", () => ({
  assertExpectedEtag: mocks.assertExpectedEtag,
  deleteBlobUrls: mocks.deleteBlobUrls,
  getOwnedBlobUrls: mocks.getOwnedBlobUrls,
  getUnusedOwnedBlobUrls: mocks.getUnusedOwnedBlobUrls,
  ManifestConflictError: mocks.ManifestConflictError,
  readAdminPortfolioSnapshot: mocks.readAdminPortfolioSnapshot,
  removeProjectFromManifest: mocks.removeProjectFromManifest,
  replaceProjectInManifest: mocks.replaceProjectInManifest,
  savePortfolioManifest: mocks.savePortfolioManifest,
}))

const revalidatePath = vi.mocked(await import("next/cache")).revalidatePath
const { DELETE, PUT } = await import("./route")

function request(method: "PUT" | "DELETE", body: unknown) {
  return new NextRequest("http://localhost/admin/api/projects/demo-project", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const context = {
  params: Promise.resolve({ projectId: "demo-project" }),
}

describe("admin project update API", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.requireAdminRequest.mockReturnValue(true)
    mocks.readAdminPortfolioSnapshot.mockResolvedValue(
      createSnapshot({
        projects: [createProject("demo-project")],
        viProjects: [createProject("demo-project", { title: "Du an demo" })],
      }),
    )
    mocks.replaceProjectInManifest.mockImplementation(
      (_manifest, projects) =>
        createSnapshot({ projects: [projects.en], viProjects: [projects.vi] })
          .manifest,
    )
    mocks.getUnusedOwnedBlobUrls.mockReturnValue([])
    mocks.savePortfolioManifest.mockResolvedValue({ etag: "etag-2" })
  })

  it("rejects unauthorized update requests", async () => {
    mocks.requireAdminRequest.mockReturnValue(false)

    const response = await PUT(request("PUT", createAdminPayload()), context)

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized." })
  })

  it("rejects invalid update payloads", async () => {
    const response = await PUT(
      request("PUT", createAdminPayload({ shared: { id: "other-project" } })),
      context,
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe("Project validation failed.")
    expect(body.details).toContain(
      "Project id cannot be changed after creation.",
    )
  })

  it("rejects updates for non-proposal Writing projects", async () => {
    mocks.readAdminPortfolioSnapshot.mockResolvedValue(
      createSnapshot({
        projects: [
          createProject("demo-project", { fieldId: "creative-copywriter" }),
        ],
        viProjects: [
          createProject("demo-project", { fieldId: "creative-copywriter" }),
        ],
      }),
    )

    const response = await PUT(request("PUT", createAdminPayload()), context)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      error: "Project not found.",
    })
    expect(mocks.replaceProjectInManifest).not.toHaveBeenCalled()
  })

  it("returns not found when one locale is missing", async () => {
    mocks.readAdminPortfolioSnapshot.mockResolvedValue(
      createSnapshot({
        projects: [createProject("demo-project")],
        viProjects: [],
      }),
    )

    const response = await PUT(request("PUT", createAdminPayload()), context)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      error: "Project not found.",
    })
  })

  it("returns a conflict for stale update etags", async () => {
    mocks.assertExpectedEtag.mockImplementation(() => {
      throw new mocks.ManifestConflictError()
    })

    const response = await PUT(request("PUT", createAdminPayload()), context)

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      error: "Portfolio content changed in another tab. Refresh and try again.",
    })
  })

  it("saves updates and warns when old media cleanup fails", async () => {
    mocks.getUnusedOwnedBlobUrls.mockReturnValue([
      "projects/demo-project/old/cover.png",
    ])
    mocks.deleteBlobUrls.mockRejectedValue(new Error("cleanup failed"))

    const response = await PUT(request("PUT", createAdminPayload()), context)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      etag: "etag-2",
      projectId: "demo-project",
      warning: "Project saved, but old media cleanup failed: cleanup failed",
    })
    expect(mocks.replaceProjectInManifest).toHaveBeenCalled()
    expect(mocks.deleteBlobUrls).toHaveBeenCalledWith([
      "projects/demo-project/old/cover.png",
    ])
    expect(revalidatePath).toHaveBeenCalledWith("/")
    expect(revalidatePath).toHaveBeenCalledWith("/work/demo-project")
  })

  it("replaces proposal content with the focused admin payload", async () => {
    mocks.readAdminPortfolioSnapshot.mockResolvedValue(
      createSnapshot({
        projects: [
          createProject("demo-project", {
            eyebrow: "Scope",
            campaignTitle: "Existing campaign",
            closingNote: "Existing closing",
            namingRationale: {
              eyebrow: "Naming",
              title: "Why this name",
              items: [{ term: "Tet", definition: "Seasonal context" }],
              note: "Existing note",
            },
            proposalCta: {
              label: "View full portfolio",
              credit:
                "Shout out to the friends who built this proposal with me.",
              creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
            },
          }),
        ],
        viProjects: [
          createProject("demo-project", {
            eyebrow: "Phạm vi",
            campaignTitle: "Chiến dịch hiện có",
            closingNote: "Ghi chú hiện có",
            namingRationale: {
              eyebrow: "Tên gọi",
              title: "Vì sao chọn tên này",
              items: [{ term: "Tết", definition: "Bối cảnh mùa lễ hội" }],
              note: "Ghi chú hiện có",
            },
            proposalCta: {
              label: "Coi full portfolio",
              credit: "Shout out những người đã cùng làm proposal với tôi.",
              creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
            },
          }),
        ],
      }),
    )

    const response = await PUT(request("PUT", createAdminPayload()), context)

    expect(response.status).toBe(200)
    const savedProjects = mocks.replaceProjectInManifest.mock.calls[0][1]
    expect(savedProjects.en).toMatchObject({
      eyebrow: "Project",
      fieldId: "social-planner",
      proposalCta: {
        label: "View full portfolio",
        credit: "Shout out to the friends who built this proposal with me.",
        creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
      },
    })
    expect(savedProjects.vi).toMatchObject({
      eyebrow: "Dự án",
      fieldId: "social-planner",
      proposalCta: {
        label: "Coi full portfolio",
        credit: "Shout out những người đã cùng làm proposal với tôi.",
        creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
      },
    })
    expect(savedProjects.en.campaignTitle).toBeUndefined()
    expect(savedProjects.en.closingNote).toBeUndefined()
    expect(savedProjects.en.namingRationale).toBeUndefined()
    expect(savedProjects.vi.campaignTitle).toBeUndefined()
    expect(savedProjects.vi.closingNote).toBeUndefined()
    expect(savedProjects.vi.namingRationale).toBeUndefined()
  })
})

describe("admin project delete API", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.requireAdminRequest.mockReturnValue(true)
    mocks.readAdminPortfolioSnapshot.mockResolvedValue(
      createSnapshot({
        projects: [createProject("demo-project")],
        viProjects: [createProject("demo-project", { title: "Du an demo" })],
      }),
    )
    mocks.removeProjectFromManifest.mockReturnValue(createSnapshot().manifest)
    mocks.getOwnedBlobUrls.mockReturnValue([
      "projects/demo-project/a/cover.png",
    ])
    mocks.savePortfolioManifest.mockResolvedValue({ etag: "etag-2" })
  })

  it("rejects invalid delete payloads", async () => {
    const response = await DELETE(request("DELETE", {}), context)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: "Delete request is invalid.",
    })
  })

  it("returns not found when deleting a missing project", async () => {
    mocks.readAdminPortfolioSnapshot.mockResolvedValue(createSnapshot())

    const response = await DELETE(
      request("DELETE", { expectedEtag: "etag-1" }),
      context,
    )

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      error: "Project not found.",
    })
  })

  it("rejects deletion for non-proposal Writing projects", async () => {
    mocks.readAdminPortfolioSnapshot.mockResolvedValue(
      createSnapshot({
        projects: [
          createProject("demo-project", { fieldId: "creative-copywriter" }),
        ],
        viProjects: [
          createProject("demo-project", { fieldId: "creative-copywriter" }),
        ],
      }),
    )

    const response = await DELETE(
      request("DELETE", { expectedEtag: "etag-1" }),
      context,
    )

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      error: "Project not found.",
    })
    expect(mocks.removeProjectFromManifest).not.toHaveBeenCalled()
  })

  it("returns a conflict for stale delete etags", async () => {
    mocks.assertExpectedEtag.mockImplementation(() => {
      throw new mocks.ManifestConflictError()
    })

    const response = await DELETE(
      request("DELETE", { expectedEtag: "etag-1" }),
      context,
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      error: "Portfolio content changed in another tab. Refresh and try again.",
    })
  })

  it("deletes the project and warns when media cleanup fails", async () => {
    mocks.deleteBlobUrls.mockRejectedValue(new Error("cleanup failed"))

    const response = await DELETE(
      request("DELETE", { expectedEtag: "etag-1" }),
      context,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      etag: "etag-2",
      warning: "Project deleted, but media cleanup failed: cleanup failed",
    })
    expect(mocks.removeProjectFromManifest).toHaveBeenCalledWith(
      expect.objectContaining({ revision: "revision-1" }),
      "demo-project",
    )
    expect(mocks.deleteBlobUrls).toHaveBeenCalledWith([
      "projects/demo-project/a/cover.png",
    ])
    expect(revalidatePath).toHaveBeenCalledWith("/")
    expect(revalidatePath).toHaveBeenCalledWith("/work/demo-project")
  })
})
