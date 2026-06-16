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

  it("renders content posts as a carousel from project media layout without requiring captions", () => {
    const project = createProject("carousel-project", {
      title: "Carousel project",
      overview: "Carousel overview text.",
      media: {
        cover: media.cover,
        contentPostsLayout: "carousel",
        contentPosts: [
          {
            src: "https://store.blob.vercel-storage.com/projects/demo-project/a/content-01.png",
            alt: "Carousel content post 1",
            width: 1200,
            height: 1200,
          },
          {
            src: "https://store.blob.vercel-storage.com/projects/demo-project/a/content-02.png",
            alt: "Carousel content post 2",
            width: 1200,
            height: 1500,
          },
        ],
      },
    })
    const contentByLocale = createPortfolioContentByLocale({
      en: [project],
      vi: [
        createProject("carousel-project", {
          title: "Dự án carousel",
          overview: "Tổng quan carousel.",
          media: project.media,
        }),
      ],
    })

    render(<ProjectDetailPage contentByLocale={contentByLocale} projectId="carousel-project" />)

    expect(
      screen.getByRole("region", { name: "Carousel project content posts" }),
    ).toHaveAttribute("aria-roledescription", "carousel")
    expect(screen.getByAltText("Carousel content post 1")).toBeInTheDocument()
    expect(screen.getByAltText("Carousel content post 2")).toBeInTheDocument()
    expect(screen.queryByText("Facebook caption")).not.toBeInTheDocument()
  })

  it("keeps carousel captions available when content posts provide them", async () => {
    const user = userEvent.setup()
    const project = createProject("caption-project", {
      title: "Caption project",
      media: {
        cover: media.cover,
        contentPostsLayout: "carousel",
        contentPosts: [
          {
            src: "https://store.blob.vercel-storage.com/projects/demo-project/a/content-caption.png",
            alt: "Caption content post",
            width: 1200,
            height: 1200,
            caption:
              "This is a longer caption for a content post.\n\nIt keeps the social copy attached to the media card, preserves campaign context, and gives readers the same source text the brand published with the asset.\n\nThat is enough copy to make the compact carousel card offer an expansion control.",
          },
        ],
      },
    })
    const contentByLocale = createPortfolioContentByLocale({
      en: [project],
      vi: [
        createProject("caption-project", {
          title: "Dự án caption",
          media: project.media,
        }),
      ],
    })

    render(<ProjectDetailPage contentByLocale={contentByLocale} projectId="caption-project" />)

    expect(screen.getByRole("region", { name: "Caption project content posts" })).toHaveAttribute(
      "aria-roledescription",
      "carousel",
    )
    expect(screen.getByText("Facebook caption")).toBeInTheDocument()
    expect(screen.getByText(/This is a longer caption/)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Read more" }))

    expect(screen.getByRole("button", { name: "Show less" })).toBeInTheDocument()
  })

  it("renders non-split project media cover before campaign overview text", () => {
    const project = createProject("tesla-layout", {
      title: "Tesla Education",
      campaignTitle: "Tesla Education",
      overview: "Tesla overview copy below the wide cover.",
      media: {
        cover: {
          src: "https://store.blob.vercel-storage.com/projects/tesla/cover-wide.jpg",
          alt: "Tesla Education horizontal campaign cover",
          width: 2048,
          height: 1365,
        },
      },
    })
    const contentByLocale = createPortfolioContentByLocale({
      en: [project],
      vi: [
        createProject("tesla-layout", {
          title: "Tesla Education",
          campaignTitle: "Tesla Education",
          overview: "Nội dung Tesla nằm dưới cover ngang.",
          media: project.media,
        }),
      ],
    })

    render(<ProjectDetailPage contentByLocale={contentByLocale} projectId="tesla-layout" />)

    const coverImage = screen.getByAltText("Tesla Education horizontal campaign cover")
    const overview = screen.getByText("Tesla overview copy below the wide cover.")

    expect(coverImage.compareDocumentPosition(overview) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })
})
