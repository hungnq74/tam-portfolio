import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AdminProjectForm } from "@/components/admin/AdminProjectForm"
import type { ProjectMedia } from "@/data/portfolio"
import { createFieldOptions, createProject, testMedia } from "@/test/factories"
import { getMockRouter } from "@/test/setup"

const mocks = vi.hoisted(() => ({
  upload: vi.fn(),
  getDocument: vi.fn(),
}))

vi.mock("@vercel/blob/client", () => ({
  upload: mocks.upload,
}))

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: {},
  getDocument: mocks.getDocument,
}))

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function createLocalizedProject(media: ProjectMedia | undefined) {
  return {
    en: createProject("demo-project", {
      title: "Demo project",
      category: "Campaign",
      media,
    }),
    vi: createProject("demo-project", {
      title: "Du an demo",
      eyebrow: "Du an",
      category: "Chiến dịch",
      summary: "Tom tat du an",
      client: "Khach hang demo",
      scope: ["Chien luoc"],
      overview: "Tong quan",
      objective: "Muc tieu",
      solution: "Giai phap",
      results: ["Ket qua"],
      media,
    }),
  }
}

function renderForm(options: {
  mode?: "create" | "edit"
  media?: ProjectMedia
  blobConfigured?: boolean
  manifestError?: string
  fields?: ReturnType<typeof createFieldOptions>
} = {}) {
  const {
    mode = "edit",
    blobConfigured = true,
    manifestError,
    fields = [createFieldOptions()[0]],
  } = options
  const media = "media" in options ? options.media : testMedia
  const project = mode === "edit" ? createLocalizedProject(media) : undefined

  return render(
    <AdminProjectForm
      mode={mode}
      manifestEtag="etag-1"
      project={project}
      fields={fields}
      blobConfigured={blobConfigured}
      manifestError={manifestError}
    />,
  )
}

function createMockPdf(pageCount = 2) {
  const getPage = vi.fn(async () => ({
    getViewport: ({ scale }: { scale: number }) => ({
      width: 800 * scale,
      height: 450 * scale,
    }),
    render: vi.fn(() => ({ promise: Promise.resolve() })),
  }))

  mocks.getDocument.mockReturnValue({
    promise: Promise.resolve({
      numPages: pageCount,
      getPage,
    }),
  })
}

describe("AdminProjectForm basics", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    mocks.upload.mockImplementation(async (pathname: string) => ({
      url: `https://store.blob.vercel-storage.com/${pathname}`,
    }))
  })

  it("auto-generates the project slug from a new English title until the id is touched", async () => {
    const user = userEvent.setup()
    renderForm({ mode: "create", media: undefined })

    await user.click(screen.getByRole("tab", { name: "English" }))
    await user.clear(screen.getByLabelText("Title"))
    await user.type(screen.getByLabelText("Title"), "Fresh Launch")
    await user.click(screen.getByRole("tab", { name: "Overview" }))

    await waitFor(() => {
      expect(screen.getByLabelText("Project id")).toHaveValue("fresh-launch")
    })

    await user.clear(screen.getByLabelText("Project id"))
    await user.type(screen.getByLabelText("Project id"), "manual-id")
    await user.click(screen.getByRole("tab", { name: "English" }))
    await user.clear(screen.getByLabelText("Title"))
    await user.type(screen.getByLabelText("Title"), "Another Title")
    await user.click(screen.getByRole("tab", { name: "Overview" }))

    expect(screen.getByLabelText("Project id")).toHaveValue("manual-id")
  })

  it("uses the provided Thinking-only field options", () => {
    renderForm()

    const fieldSelect = screen.getByLabelText("Field") as HTMLSelectElement

    expect(Array.from(fieldSelect.options).map((option) => option.value)).toEqual([
      "social-planner",
    ])
    expect(fieldSelect).toHaveValue("social-planner")
  })

  it("disables saving and uploading when Blob storage is not configured", async () => {
    const user = userEvent.setup()
    renderForm({ blobConfigured: false })

    expect(screen.getByText(/BLOB_READ_WRITE_TOKEN is missing/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /save project/i })).toBeDisabled()

    await user.click(screen.getByRole("tab", { name: "Media" }))
    expect(screen.getByLabelText(/Upload cover image/)).toBeDisabled()
  })

  it("surfaces API validation details on save failure", async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            error: "Project validation failed.",
            details: ["EN category must match one of the selected field filters."],
          },
          400,
        ),
      ),
    )
    renderForm()

    await user.click(screen.getByRole("button", { name: /save project/i }))

    expect(
      await screen.findByText(
        "Project validation failed. EN category must match one of the selected field filters.",
      ),
    ).toBeInTheDocument()
  })

  it("normalizes list text and refreshes the edit page after a successful save", async () => {
    const user = userEvent.setup()
    const router = getMockRouter()
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ ok: true, etag: "etag-2" }))
    vi.stubGlobal("fetch", fetch)
    renderForm()

    await user.click(screen.getByRole("tab", { name: "English" }))
    await user.clear(screen.getByLabelText("Scope"))
    await user.type(screen.getByLabelText("Scope"), "Strategy, Writing\nLaunch")
    await user.clear(screen.getByLabelText("Results"))
    await user.type(screen.getByLabelText("Results"), "Lift, Reach")
    await user.click(screen.getByRole("button", { name: /save project/i }))

    await screen.findByText("Project saved.")
    const requestBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(requestBody.locales.en.scope).toEqual(["Strategy", "Writing", "Launch"])
    expect(requestBody.locales.en.results).toEqual(["Lift", "Reach"])
    expect(requestBody.expectedEtag).toBe("etag-1")
    expect(router.refresh).toHaveBeenCalled()
  })

  it("submits edited shared and localized text content in the update payload", async () => {
    const user = userEvent.setup()
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ ok: true, etag: "etag-2" }))
    vi.stubGlobal("fetch", fetch)
    renderForm()

    await user.clear(screen.getByLabelText("Year"))
    await user.type(screen.getByLabelText("Year"), "2027")
    await user.selectOptions(screen.getByLabelText("Thumbnail column"), "2")
    await user.selectOptions(screen.getByLabelText("Thumbnail row"), "0")

    await user.click(screen.getByRole("tab", { name: "English" }))
    await user.clear(screen.getByLabelText("Title"))
    await user.type(screen.getByLabelText("Title"), "Signal Launch")
    await user.selectOptions(screen.getByLabelText("Category"), "Content Plan")
    await user.clear(screen.getByLabelText("Client"))
    await user.type(screen.getByLabelText("Client"), "Signal Co")
    await user.clear(screen.getByLabelText("Summary"))
    await user.type(screen.getByLabelText("Summary"), "A sharp launch planning project.")
    await user.clear(screen.getByLabelText("Scope"))
    await user.type(screen.getByLabelText("Scope"), "Strategy, Proposal\nLaunch")
    await user.clear(screen.getByLabelText("Overview"))
    await user.type(screen.getByLabelText("Overview"), "English overview")
    await user.clear(screen.getByLabelText("Objective"))
    await user.type(screen.getByLabelText("Objective"), "English objective")
    await user.clear(screen.getByLabelText("Solution"))
    await user.type(screen.getByLabelText("Solution"), "English solution")
    await user.clear(screen.getByLabelText("Results"))
    await user.type(screen.getByLabelText("Results"), "Lift, Reach")

    await user.click(screen.getByRole("tab", { name: "Vietnamese" }))
    await user.clear(screen.getByLabelText("Title"))
    await user.type(screen.getByLabelText("Title"), "Ra mắt tín hiệu")
    await user.selectOptions(screen.getByLabelText("Category"), "Kế hoạch nội dung")
    await user.clear(screen.getByLabelText("Client"))
    await user.type(screen.getByLabelText("Client"), "Signal VN")
    await user.clear(screen.getByLabelText("Summary"))
    await user.type(screen.getByLabelText("Summary"), "Dự án lập kế hoạch ra mắt.")
    await user.clear(screen.getByLabelText("Scope"))
    await user.type(screen.getByLabelText("Scope"), "Chiến lược, Proposal\nRa mắt")
    await user.clear(screen.getByLabelText("Overview"))
    await user.type(screen.getByLabelText("Overview"), "Tổng quan tiếng Việt")
    await user.clear(screen.getByLabelText("Objective"))
    await user.type(screen.getByLabelText("Objective"), "Mục tiêu tiếng Việt")
    await user.clear(screen.getByLabelText("Solution"))
    await user.type(screen.getByLabelText("Solution"), "Giải pháp tiếng Việt")
    await user.clear(screen.getByLabelText("Results"))
    await user.type(screen.getByLabelText("Results"), "Tăng trưởng, Tiếp cận")

    await user.click(screen.getByRole("button", { name: /save project/i }))
    await screen.findByText("Project saved.")

    const requestBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(fetch).toHaveBeenCalledWith(
      "/admin/api/projects/demo-project",
      expect.objectContaining({ method: "PUT" }),
    )
    expect(requestBody.shared).toMatchObject({
      id: "demo-project",
      fieldId: "social-planner",
      year: "2027",
      thumbnail: { col: 2, row: 0 },
      media: testMedia,
    })
    expect(requestBody.locales.en).toEqual({
      title: "Signal Launch",
      eyebrow: "Project",
      category: "Content Plan",
      summary: "A sharp launch planning project.",
      client: "Signal Co",
      scope: ["Strategy", "Proposal", "Launch"],
      overview: "English overview",
      objective: "English objective",
      solution: "English solution",
      results: ["Lift", "Reach"],
    })
    expect(requestBody.locales.vi).toEqual({
      title: "Ra mắt tín hiệu",
      eyebrow: "Du an",
      category: "Kế hoạch nội dung",
      summary: "Dự án lập kế hoạch ra mắt.",
      client: "Signal VN",
      scope: ["Chiến lược", "Proposal", "Ra mắt"],
      overview: "Tổng quan tiếng Việt",
      objective: "Mục tiêu tiếng Việt",
      solution: "Giải pháp tiếng Việt",
      results: ["Tăng trưởng", "Tiếp cận"],
    })
  })
})

describe("AdminProjectForm uploads", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    createMockPdf()
    mocks.upload.mockImplementation(async (pathname: string) => ({
      url: `https://store.blob.vercel-storage.com/${pathname}`,
    }))
  })

  it("keeps proposal PDF upload disabled until a cover exists", async () => {
    const user = userEvent.setup()
    renderForm({ mode: "create", media: undefined })

    await user.click(screen.getByRole("tab", { name: "Media" }))

    expect(screen.getByLabelText(/Upload proposal PDF/)).toBeDisabled()
  })

  it("rejects invalid cover and PDF files before uploading", async () => {
    const user = userEvent.setup()
    renderForm({
      mode: "edit",
      media: {
        cover: testMedia.cover,
      },
    })

    await user.click(screen.getByRole("tab", { name: "Media" }))
    fireEvent.change(screen.getByLabelText(/Upload cover image/), {
      target: {
        files: [new File(["text"], "cover.txt", { type: "text/plain" })],
      },
    })
    expect(await screen.findByText("Cover must be an image file.")).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Upload proposal PDF/), {
      target: {
        files: [new File(["image"], "proposal.png", { type: "image/png" })],
      },
    })
    expect(await screen.findByText("Proposal must be a PDF file.")).toBeInTheDocument()

    const oversizedPdf = new File(["pdf"], "proposal.pdf", { type: "application/pdf" })
    Object.defineProperty(oversizedPdf, "size", { value: 151 * 1024 * 1024 })
    fireEvent.change(screen.getByLabelText(/Upload proposal PDF/), {
      target: {
        files: [oversizedPdf],
      },
    })
    expect(await screen.findByText("PDF is larger than 150 MB.")).toBeInTheDocument()
  })

  it("rejects proposal PDFs above the page limit", async () => {
    const user = userEvent.setup()
    createMockPdf(51)
    renderForm({
      mode: "edit",
      media: {
        cover: testMedia.cover,
      },
    })

    await user.click(screen.getByRole("tab", { name: "Media" }))
    await user.upload(
      screen.getByLabelText(/Upload proposal PDF/),
      new File(["pdf"], "proposal.pdf", { type: "application/pdf" }),
    )

    expect(await screen.findByText("PDF has 51 pages. The limit is 50.")).toBeInTheDocument()
    expect(mocks.upload).not.toHaveBeenCalled()
  })

  it("uploads a cover, converts a PDF into proposal images, and saves the created project", async () => {
    const user = userEvent.setup()
    const router = getMockRouter()
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ ok: true, etag: "etag-2" }))
    vi.stubGlobal("fetch", fetch)
    renderForm({ mode: "create", media: undefined })

    await user.click(screen.getByRole("tab", { name: "English" }))
    await user.type(screen.getByLabelText("Title"), "Demo Project")
    await user.click(screen.getByRole("tab", { name: "Overview" }))
    await waitFor(() => {
      expect(screen.getByLabelText("Project id")).toHaveValue("demo-project")
    })
    await user.click(screen.getByRole("tab", { name: "Media" }))

    await user.upload(
      screen.getByLabelText(/Upload cover image/),
      new File(["cover"], "cover.png", { type: "image/png" }),
    )

    await waitFor(() => {
      expect(mocks.upload).toHaveBeenCalledWith(
        "projects/demo-project/test-upload-id/cover.png",
        expect.any(File),
        expect.objectContaining({
          access: "public",
          contentType: "image/png",
          handleUploadUrl: "/admin/api/blob-upload",
        }),
      )
    })
    expect(await screen.findByText("Ready")).toBeInTheDocument()

    await user.upload(
      screen.getByLabelText(/Upload proposal PDF/),
      new File(["pdf"], "proposal.pdf", { type: "application/pdf" }),
    )

    await waitFor(() => {
      expect(mocks.upload).toHaveBeenCalledWith(
        "projects/demo-project/test-upload-id/proposal-01.png",
        expect.any(Blob),
        expect.objectContaining({
          access: "public",
          contentType: "image/png",
          handleUploadUrl: "/admin/api/blob-upload",
        }),
      )
      expect(mocks.upload).toHaveBeenCalledWith(
        "projects/demo-project/test-upload-id/proposal-02.png",
        expect.any(Blob),
        expect.objectContaining({
          access: "public",
          contentType: "image/png",
          handleUploadUrl: "/admin/api/blob-upload",
        }),
      )
    })
    expect(screen.getByText("2")).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Cover focal X/), { target: { value: "30" } })
    fireEvent.change(screen.getByLabelText(/Cover focal Y/), { target: { value: "70" } })

    await user.click(screen.getByRole("button", { name: /save project/i }))
    await screen.findByText("Project saved.")

    const requestBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(fetch).toHaveBeenCalledWith("/admin/api/projects", expect.any(Object))
    expect(requestBody.shared.media.cover).toMatchObject({
      width: 1600,
      height: 900,
      focalPoint: { x: 30, y: 70 },
    })
    expect(requestBody.shared.media.summary.src).toContain("proposal-01.png")
    expect(requestBody.shared.media.proposalSlides).toHaveLength(2)
    expect(router.push).toHaveBeenCalledWith("/admin/projects/demo-project")
  })
})
