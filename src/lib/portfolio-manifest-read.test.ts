import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createManifestFromProjects } from "@/lib/admin-projects"
import { createProject } from "@/test/factories"

const mocks = vi.hoisted(() => {
  class BlobPreconditionFailedError extends Error {}

  return {
    BlobPreconditionFailedError,
    del: vi.fn(),
    get: vi.fn(),
    head: vi.fn(),
    put: vi.fn(),
  }
})

vi.mock("@vercel/blob", () => ({
  BlobPreconditionFailedError: mocks.BlobPreconditionFailedError,
  del: mocks.del,
  get: mocks.get,
  head: mocks.head,
  put: mocks.put,
}))

const {
  PORTFOLIO_MANIFEST_PATH,
  readAdminPortfolioSnapshot,
  readPortfolioSnapshot,
} = await import("@/lib/portfolio-manifest")

function mockManifestRead(etag = '"etag-current"') {
  const manifest = createManifestFromProjects({
    en: [createProject("axe")],
    vi: [createProject("axe")],
  })

  mocks.get.mockResolvedValue({
    blob: { etag },
    statusCode: 200,
    stream: new Response(JSON.stringify(manifest)).body,
  })
  mocks.head.mockResolvedValue({
    etag,
    pathname: "portfolio/content.json",
  })
}

describe("portfolio manifest Blob reads", () => {
  const originalToken = process.env.BLOB_READ_WRITE_TOKEN

  beforeEach(() => {
    vi.resetAllMocks()
    process.env.BLOB_READ_WRITE_TOKEN = "vercel-blob-token"
    mockManifestRead()
  })

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.BLOB_READ_WRITE_TOKEN
    } else {
      process.env.BLOB_READ_WRITE_TOKEN = originalToken
    }
  })

  it("keeps public manifest reads cacheable", async () => {
    await readPortfolioSnapshot()

    expect(mocks.get).toHaveBeenCalledWith(PORTFOLIO_MANIFEST_PATH, {
      access: "public",
    })
    expect(mocks.head).not.toHaveBeenCalled()
  })

  it("revalidates admin reads without using the unsupported public Blob cache bypass", async () => {
    mockManifestRead('W/"etag-current"')
    mocks.head.mockResolvedValue({
      etag: '"etag-current"',
      pathname: "portfolio/content.json",
    })

    const snapshot = await readAdminPortfolioSnapshot()

    expect(snapshot.etag).toBe('"etag-current"')
    expect(mocks.get).toHaveBeenCalledWith(PORTFOLIO_MANIFEST_PATH, {
      access: "public",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    })
    expect(mocks.head).toHaveBeenCalledWith(PORTFOLIO_MANIFEST_PATH)
  })

  it("blocks admin writes when the public Blob response is still stale", async () => {
    mockManifestRead('"old-etag"')
    mocks.head.mockResolvedValue({
      etag: '"new-etag"',
      pathname: "portfolio/content.json",
    })

    const snapshot = await readAdminPortfolioSnapshot()

    expect(snapshot.etag).toBe('"new-etag"')
    expect(snapshot.contentByLocale.en.projects.some((project) => project.id === "axe"))
      .toBe(true)
    expect(snapshot.error).toBe(
      "Blob manifest cache is still refreshing. Please wait a few seconds and try again.",
    )
  })
})
