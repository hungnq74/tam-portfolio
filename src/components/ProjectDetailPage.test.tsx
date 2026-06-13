import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { ProjectDetailPage } from "@/components/ProjectDetailPage"
import { createPortfolioContentByLocale, type ProjectMedia } from "@/data/portfolio"
import { createProject } from "@/test/factories"

const media: ProjectMedia = {
  cover: {
    src: "https://store.blob.vercel-storage.com/projects/demo-project/a/cover.png",
    alt: "Demo project cover image",
    width: 1600,
    height: 900,
    focalPoint: { x: 50, y: 50 },
  },
  summary: {
    src: "https://store.blob.vercel-storage.com/projects/demo-project/a/proposal-01.png",
    alt: "Demo project proposal summary",
    width: 1600,
    height: 900,
  },
  proposalSlides: [
    {
      src: "https://store.blob.vercel-storage.com/projects/demo-project/a/proposal-01.png",
      alt: "Demo project proposal page 1",
      width: 1600,
      height: 900,
    },
    {
      src: "https://store.blob.vercel-storage.com/projects/demo-project/a/proposal-02.png",
      alt: "Demo project proposal page 2",
      width: 1600,
      height: 900,
    },
  ],
}

describe("ProjectDetailPage", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("renders admin-shaped Thinking media as an AXE-style proposal carousel", async () => {
    const user = userEvent.setup()
    const project = createProject("demo-project", {
      title: "Demo project",
      overview: "Admin-authored overview text.",
      media,
    })
    const contentByLocale = createPortfolioContentByLocale({
      en: [project],
      vi: [
        createProject("demo-project", {
          title: "Dự án demo",
          category: "Chiến dịch",
          overview: "Tổng quan do admin nhập.",
          media,
        }),
      ],
    })

    render(<ProjectDetailPage contentByLocale={contentByLocale} projectId="demo-project" />)

    expect(screen.getByAltText("Demo project cover image")).toBeInTheDocument()
    expect(screen.getByText("Admin-authored overview text.")).toBeInTheDocument()
    expect(screen.getByAltText("Demo project proposal summary")).toBeInTheDocument()
    expect(
      screen.getByRole("region", { name: /Demo project proposal carousel/i }),
    ).toBeInTheDocument()
    expect(screen.getByText("1 / 2")).toBeInTheDocument()
    expect(screen.getByAltText("Demo project proposal page 1")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Next slide" }))

    expect(screen.getByText("2 / 2")).toBeInTheDocument()
    expect(screen.getByAltText("Demo project proposal page 2")).toBeInTheDocument()
  })
})
