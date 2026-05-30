import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const mocks = vi.hoisted(() => ({
  handleUpload: vi.fn(),
  hasBlobConfig: vi.fn(),
  requireAdminRequest: vi.fn(),
}))

vi.mock("@vercel/blob/client", () => ({
  handleUpload: mocks.handleUpload,
}))

vi.mock("@/lib/admin-auth", () => ({
  requireAdminRequest: mocks.requireAdminRequest,
}))

vi.mock("@/lib/portfolio-manifest", () => ({
  hasBlobConfig: mocks.hasBlobConfig,
}))

const { POST } = await import("./route")

function request(body: string) {
  return new NextRequest("http://localhost/admin/api/blob-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
}

describe("admin Blob upload API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BLOB_READ_WRITE_TOKEN = "blob-token"
    mocks.requireAdminRequest.mockReturnValue(true)
    mocks.hasBlobConfig.mockReturnValue(true)
    mocks.handleUpload.mockResolvedValue({ type: "blob.upload-complete" })
  })

  it("rejects unauthorized upload requests", async () => {
    mocks.requireAdminRequest.mockReturnValue(false)

    const response = await POST(request(JSON.stringify({ type: "client" })))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized." })
    expect(mocks.handleUpload).not.toHaveBeenCalled()
  })

  it("requires Blob storage configuration", async () => {
    mocks.hasBlobConfig.mockReturnValue(false)

    const response = await POST(request(JSON.stringify({ type: "client" })))

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: "BLOB_READ_WRITE_TOKEN is required before uploading media.",
    })
  })

  it("rejects invalid JSON upload bodies", async () => {
    const response = await POST(request("not json"))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: "Invalid upload request." })
  })

  it("generates upload options for allowed project image paths", async () => {
    mocks.handleUpload.mockImplementation(async ({ onBeforeGenerateToken }) => {
      const options = await onBeforeGenerateToken(
        "projects/demo-project/upload-id/proposal-001.png",
        "client-payload",
      )

      return { ok: true, options }
    })

    const response = await POST(request(JSON.stringify({ type: "client" })))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.options).toMatchObject({
      addRandomSuffix: false,
      allowOverwrite: false,
      allowedContentTypes: ["image/png", "image/jpeg", "image/webp"],
      cacheControlMaxAge: 31536000,
      maximumSizeInBytes: 150 * 1024 * 1024,
      tokenPayload: "client-payload",
    })
  })

  it("rejects upload paths outside project media directories", async () => {
    mocks.handleUpload.mockImplementation(async ({ onBeforeGenerateToken }) => {
      await onBeforeGenerateToken("users/demo/avatar.png", null)
    })

    const response = await POST(request(JSON.stringify({ type: "client" })))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: "Upload path is not allowed.",
    })
  })
})
