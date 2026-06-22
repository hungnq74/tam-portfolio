import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AdminProjectForm } from "@/components/admin/AdminProjectForm"
import type { ProjectMedia } from "@/data/portfolio"
import { createProject, testMedia } from "@/test/factories"
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
  const proposalCta = {
    label: "View full portfolio",
    credit: "Shout out to the friends who built this proposal with me.",
    creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
  }

  return {
    en: createProject("demo-project", {
      title: "Demo project",
      summary: "English summary",
      overview: "English overview",
      media,
      proposalCta,
    }),
    vi: createProject("demo-project", {
      title: "Du an demo",
      eyebrow: "Dự án",
      category: "Chiến dịch",
      summary: "Tom tat tieng Viet",
      overview: "Tong quan tieng Viet",
      media,
      proposalCta: {
        label: "Coi full portfolio",
        credit: "Shout out những người đã cùng làm proposal với tôi.",
        creditNames: proposalCta.creditNames,
      },
    }),
  }
}

function renderForm(
  options: {
    mode?: "create" | "edit"
    media?: ProjectMedia
    blobConfigured?: boolean
    manifestError?: string
  } = {},
) {
  const { mode = "edit", blobConfigured = true, manifestError } = options
  const media = "media" in options ? options.media : testMedia
  const project = mode === "edit" ? createLocalizedProject(media) : undefined

  return render(
    <AdminProjectForm
      mode={mode}
      manifestEtag="etag-1"
      project={project}
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

  it("renders only AXE-standard proposal tabs and fields", () => {
    renderForm()

    expect(screen.getByRole("tab", { name: "Content" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Media" })).toBeInTheDocument()
    expect(
      screen.getByRole("tab", { name: "CTA & Credits" }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Project id")).toBeInTheDocument()
    expect(screen.getByLabelText("EN title")).toBeInTheDocument()
    expect(screen.getByLabelText("VI summary")).toBeInTheDocument()
    expect(
      screen.queryByRole("tab", { name: "Overview" }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("tab", { name: "English" }),
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Field")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Year")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Thumbnail column")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Category")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Client")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Scope")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Objective")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Solution")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Results")).not.toBeInTheDocument()
  })

  it("auto-generates the project slug from a new English title until the id is touched", async () => {
    const user = userEvent.setup()
    renderForm({ mode: "create", media: undefined })

    await user.type(screen.getByLabelText("EN title"), "Fresh Launch")

    await waitFor(() => {
      expect(screen.getByLabelText("Project id")).toHaveValue("fresh-launch")
    })

    await user.clear(screen.getByLabelText("Project id"))
    await user.type(screen.getByLabelText("Project id"), "manual-id")
    await user.clear(screen.getByLabelText("EN title"))
    await user.type(screen.getByLabelText("EN title"), "Another Title")

    expect(screen.getByLabelText("Project id")).toHaveValue("manual-id")
  })

  it("pre-fills proposal CTA and collaborator defaults for new projects", async () => {
    const user = userEvent.setup()
    renderForm({ mode: "create", media: undefined })

    await user.click(screen.getByRole("tab", { name: "CTA & Credits" }))

    expect(screen.getByLabelText("EN CTA label")).toHaveValue(
      "View full portfolio",
    )
    expect(screen.getByLabelText("VI CTA label")).toHaveValue(
      "Coi full portfolio",
    )
    expect(screen.getByLabelText("EN credit intro")).toHaveValue(
      "Shout out to the friends who built this proposal with me.",
    )
    expect(screen.getByLabelText("VI credit intro")).toHaveValue(
      "Shout out những người đã cùng làm proposal với tôi.",
    )
    expect(screen.getByLabelText("Collaborator names")).toHaveValue(
      "Minh Anh\nHoàng Linh\nBảo Trân",
    )
    expect(screen.getByText("Minh Anh")).toBeInTheDocument()
    expect(screen.getByText("Hoàng Linh")).toBeInTheDocument()
    expect(screen.getByText("Bảo Trân")).toBeInTheDocument()
  })

  it("disables saving and uploading when Blob storage is not configured", async () => {
    const user = userEvent.setup()
    renderForm({ blobConfigured: false })

    expect(
      screen.getByText(/BLOB_READ_WRITE_TOKEN is missing/),
    ).toBeInTheDocument()
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
            details: [
              "Upload a cover image, main image, and proposal PDF before saving this Thinking project.",
            ],
          },
          400,
        ),
      ),
    )
    renderForm()

    await user.click(screen.getByRole("button", { name: /save project/i }))

    expect(
      await screen.findByText(
        "Project validation failed. Upload a cover image, main image, and proposal PDF before saving this Thinking project.",
      ),
    ).toBeInTheDocument()
  })

  it("submits edited content, CTA copy, and collaborator chips", async () => {
    const user = userEvent.setup()
    const router = getMockRouter()
    const fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ ok: true, etag: "etag-2" }))
    vi.stubGlobal("fetch", fetch)
    renderForm()

    await user.clear(screen.getByLabelText("EN title"))
    await user.type(screen.getByLabelText("EN title"), "Signal Launch")
    await user.clear(screen.getByLabelText("EN summary"))
    await user.type(
      screen.getByLabelText("EN summary"),
      "A sharp launch planning project.",
    )
    await user.clear(screen.getByLabelText("EN overview"))
    await user.type(screen.getByLabelText("EN overview"), "English overview")

    await user.clear(screen.getByLabelText("VI title"))
    await user.type(screen.getByLabelText("VI title"), "Ra mắt tín hiệu")
    await user.clear(screen.getByLabelText("VI summary"))
    await user.type(
      screen.getByLabelText("VI summary"),
      "Dự án lập kế hoạch ra mắt.",
    )
    await user.clear(screen.getByLabelText("VI overview"))
    await user.type(
      screen.getByLabelText("VI overview"),
      "Tổng quan tiếng Việt",
    )

    await user.click(screen.getByRole("tab", { name: "CTA & Credits" }))
    await user.clear(screen.getByLabelText("EN CTA label"))
    await user.type(screen.getByLabelText("EN CTA label"), "View deck")
    await user.clear(screen.getByLabelText("VI CTA label"))
    await user.type(screen.getByLabelText("VI CTA label"), "Coi deck")
    await user.clear(screen.getByLabelText("EN credit intro"))
    await user.type(
      screen.getByLabelText("EN credit intro"),
      "Built with these friends.",
    )
    await user.clear(screen.getByLabelText("VI credit intro"))
    await user.type(
      screen.getByLabelText("VI credit intro"),
      "Làm cùng các bạn này.",
    )
    await user.clear(screen.getByLabelText("Collaborator names"))
    await user.type(
      screen.getByLabelText("Collaborator names"),
      "An Nhi\nGia Hân, Phương Vy",
    )

    expect(screen.getByText("An Nhi")).toBeInTheDocument()
    expect(screen.getByText("Gia Hân")).toBeInTheDocument()
    expect(screen.getByText("Phương Vy")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /save project/i }))
    await screen.findByText("Project saved.")

    const requestBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(fetch).toHaveBeenCalledWith(
      "/admin/api/projects/demo-project",
      expect.objectContaining({ method: "PUT" }),
    )
    expect(requestBody.shared).toMatchObject({
      id: "demo-project",
      media: testMedia,
      creditNames: ["An Nhi", "Gia Hân", "Phương Vy"],
    })
    expect(requestBody.shared).not.toHaveProperty("fieldId")
    expect(requestBody.shared).not.toHaveProperty("year")
    expect(requestBody.shared).not.toHaveProperty("thumbnail")
    expect(requestBody.locales.en).toEqual({
      title: "Signal Launch",
      summary: "A sharp launch planning project.",
      overview: "English overview",
      proposalCta: {
        label: "View deck",
        credit: "Built with these friends.",
      },
    })
    expect(requestBody.locales.vi).toEqual({
      title: "Ra mắt tín hiệu",
      summary: "Dự án lập kế hoạch ra mắt.",
      overview: "Tổng quan tiếng Việt",
      proposalCta: {
        label: "Coi deck",
        credit: "Làm cùng các bạn này.",
      },
    })
    expect(router.refresh).toHaveBeenCalled()
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

  it("keeps main image and proposal PDF upload disabled until a cover exists", async () => {
    const user = userEvent.setup()
    renderForm({ mode: "create", media: undefined })

    await user.click(screen.getByRole("tab", { name: "Media" }))

    expect(screen.getByLabelText(/Upload main image/)).toBeDisabled()
    expect(screen.getByLabelText(/Upload proposal PDF/)).toBeDisabled()
  })

  it("rejects invalid cover, main image, and PDF files before uploading", async () => {
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
    expect(
      await screen.findByText("Cover must be an image file."),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Upload main image/), {
      target: {
        files: [new File(["text"], "main.txt", { type: "text/plain" })],
      },
    })
    expect(
      await screen.findByText("Main image must be an image file."),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Upload proposal PDF/), {
      target: {
        files: [new File(["image"], "proposal.png", { type: "image/png" })],
      },
    })
    expect(
      await screen.findByText("Proposal must be a PDF file."),
    ).toBeInTheDocument()

    const oversizedPdf = new File(["pdf"], "proposal.pdf", {
      type: "application/pdf",
    })
    Object.defineProperty(oversizedPdf, "size", { value: 151 * 1024 * 1024 })
    fireEvent.change(screen.getByLabelText(/Upload proposal PDF/), {
      target: {
        files: [oversizedPdf],
      },
    })
    expect(
      await screen.findByText("PDF is larger than 150 MB."),
    ).toBeInTheDocument()
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

    expect(
      await screen.findByText("PDF has 51 pages. The limit is 50."),
    ).toBeInTheDocument()
    expect(mocks.upload).not.toHaveBeenCalled()
  })

  it("uploads cover, main image, and PDF slides without letting PDF overwrite the main image", async () => {
    const user = userEvent.setup()
    const router = getMockRouter()
    const fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ ok: true, etag: "etag-2" }))
    vi.stubGlobal("fetch", fetch)
    renderForm({ mode: "create", media: undefined })

    await user.type(screen.getByLabelText("EN title"), "Demo Project")
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

    await user.upload(
      screen.getByLabelText(/Upload main image/),
      new File(["main"], "main.webp", { type: "image/webp" }),
    )

    await waitFor(() => {
      expect(mocks.upload).toHaveBeenCalledWith(
        "projects/demo-project/test-upload-id/summary.webp",
        expect.any(File),
        expect.objectContaining({
          access: "public",
          contentType: "image/webp",
          handleUploadUrl: "/admin/api/blob-upload",
        }),
      )
    })

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

    fireEvent.change(screen.getByLabelText(/Cover focal X/), {
      target: { value: "30" },
    })
    fireEvent.change(screen.getByLabelText(/Cover focal Y/), {
      target: { value: "70" },
    })

    await user.click(screen.getByRole("button", { name: /save project/i }))
    await screen.findByText("Project saved.")

    const requestBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(requestBody.shared.media.cover).toMatchObject({
      width: 1600,
      height: 900,
      focalPoint: { x: 30, y: 70 },
    })
    expect(requestBody.shared.media.summary.src).toContain("summary.webp")
    expect(requestBody.shared.media.summary.src).not.toContain(
      "proposal-01.png",
    )
    expect(requestBody.shared.media.proposalSlides).toHaveLength(2)
    expect(router.push).toHaveBeenCalledWith("/admin/projects/demo-project")
  })
})
