import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { ProjectDetailPage } from "@/components/ProjectDetailPage"
import {
  LOCALE_STORAGE_KEY,
  PORTFOLIO_CONTENT,
  createPortfolioContentByLocale,
  type ProjectMedia,
} from "@/data/portfolio"
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

  it("renders the proposal CTA before the carousel and the credit after it", () => {
    const project = createProject("demo-project", {
      title: "Demo project",
      overview: "Admin-authored overview text.",
      media,
      proposalCta: {
        label: "View full portfolio",
        credit: "Shout out to the friends who built this proposal with me.",
        creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
      },
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

    const summaryImage = screen.getByAltText("Demo project proposal summary")
    const cta = screen.getByRole("link", {
      name: "View full portfolio: Full proposal",
    })
    const carousel = screen.getByRole("region", {
      name: /Demo project proposal carousel/i,
    })
    const credit = screen.getByText("Shout out to the friends who built this proposal with me.")

    expect(cta).toHaveAttribute("href", "#demo-project-proposal-carousel")
    expect(carousel).toHaveAttribute("id", "demo-project-proposal-carousel")
    expect(screen.getByText("Minh Anh")).toBeInTheDocument()
    expect(screen.getByText("Hoàng Linh")).toBeInTheDocument()
    expect(screen.getByText("Bảo Trân")).toBeInTheDocument()
    expect(summaryImage.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(cta.compareDocumentPosition(carousel) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(carousel.compareDocumentPosition(credit) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it("renders the AEON post campaign detail flow with grouped platform posts", () => {
    render(<ProjectDetailPage contentByLocale={PORTFOLIO_CONTENT} projectId="aeon-vietnam" />)

    const coverImage = screen.getByAltText("AEON Vietnam always-on content horizontal cover")
    const overview = screen.getByText(/AEON is the kind of brand that sells almost everything/)

    expect(coverImage.compareDocumentPosition(overview) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(screen.getByRole("heading", { name: "FACEBOOK" })).toBeInTheDocument()
    expect(
      screen.getByText(/From weekend promotions and shopping events/),
    ).toBeInTheDocument()

    const facebookRegion = screen.getByRole("region", { name: "FACEBOOK posts" })
    expect(
      within(facebookRegion).getAllByRole("img", {
        name: /AEON Vietnam Facebook always-on content post/,
      }),
    ).toHaveLength(6)

    expect(screen.getByRole("heading", { name: "INSTAGRAM" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Christmas Collection" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Office Collection" })).toBeInTheDocument()

    const christmasRegion = screen.getByRole("region", { name: "Christmas Collection post grid" })
    expect(
      within(christmasRegion).getAllByRole("img", {
        name: /AEON Vietnam Christmas Collection Instagram post/,
      }),
    ).toHaveLength(6)
    expect(within(christmasRegion).getByText(/BẬT MOOD/)).toBeInTheDocument()

    const officeRegion = screen.getByRole("region", { name: "Office Collection post grid" })
    expect(
      within(officeRegion).getAllByRole("img", {
        name: /AEON Vietnam Office Collection Instagram post/,
      }),
    ).toHaveLength(3)
    expect(within(officeRegion).getByText(/ĐI LÀM CÓ/)).toBeInTheDocument()
  })

  it("renders Tesla Education social video copy and fanpage CTA", () => {
    render(<ProjectDetailPage contentByLocale={PORTFOLIO_CONTENT} projectId="tesla-education" />)

    expect(
      screen.getByText(
        /My role was to develop the creative concept and write the full script/,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "I'd love to show you the video right here, but it's apparently too heavy for this little portfolio to carry. Mind taking a quick trip to Tesla Education's Fanpage instead?",
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", {
        name: "TAKE ME THERE: Tesla Education brand introduction video preview",
      }),
    ).toHaveAttribute("href", "https://www.facebook.com/reel/1355172016653079")
    expect(
      screen.queryByText("For Tesla Education's always-on content", { exact: false }),
    ).not.toBeInTheDocument()
  })

  it("renders Tesla Education always-on split cover and carousel posts", () => {
    render(
      <ProjectDetailPage
        contentByLocale={PORTFOLIO_CONTENT}
        projectId="tesla-education-always-on"
      />,
    )

    expect(screen.getByText("For Tesla Education's always-on content", { exact: false }))
      .toBeInTheDocument()
    expect(screen.getByAltText("Tesla Education campus story project cover")).toBeInTheDocument()

    const contentPosts = screen.getByRole("region", {
      name: "Tesla Education content posts",
    })
    expect(contentPosts).toHaveAttribute("aria-roledescription", "carousel")
    expect(
      within(contentPosts).getAllByRole("img", {
        name: /Tesla Education always-on post/,
      }),
    ).toHaveLength(6)
    expect(within(contentPosts).queryByText("Facebook caption")).not.toBeInTheDocument()
  })

  it("renders previous and next project navigation within the same scope", () => {
    render(<ProjectDetailPage contentByLocale={PORTFOLIO_CONTENT} projectId="weshare" />)

    const siblingNav = screen.getByRole("navigation", {
      name: "More in Fanpage Always-on Content",
    })

    expect(within(siblingNav).getByText("More in Fanpage Always-on Content")).toBeInTheDocument()
    expect(
      within(siblingNav).getByRole("link", { name: "Previous project: Acecook" }),
    ).toHaveAttribute("href", "/work/acecook")
    expect(
      within(siblingNav).getByRole("link", { name: "Next project: Panasonic" }),
    ).toHaveAttribute("href", "/work/panasonic")
    expect(within(siblingNav).getByText("Acecook")).toBeInTheDocument()
    expect(within(siblingNav).getByText("Panasonic")).toBeInTheDocument()
  })

  it("wraps sibling project navigation at the start and end of a scope", () => {
    const acecookRender = render(
      <ProjectDetailPage contentByLocale={PORTFOLIO_CONTENT} projectId="acecook" />,
    )

    let siblingNav = screen.getByRole("navigation", {
      name: "More in Fanpage Always-on Content",
    })

    expect(
      within(siblingNav).getByRole("link", { name: "Previous project: Tesla Education" }),
    ).toHaveAttribute("href", "/work/tesla-education-always-on")

    acecookRender.unmount()
    window.localStorage.clear()
    render(
      <ProjectDetailPage
        contentByLocale={PORTFOLIO_CONTENT}
        projectId="tesla-education-always-on"
      />,
    )

    siblingNav = screen.getByRole("navigation", {
      name: "More in Fanpage Always-on Content",
    })

    expect(
      within(siblingNav).getByRole("link", { name: "Next project: Acecook" }),
    ).toHaveAttribute("href", "/work/acecook")
  })

  it("does not render sibling navigation for single-project scopes", () => {
    const project = createProject("solo-project", {
      title: "Solo project",
      category: "Solo Scope",
      media,
    })
    const contentByLocale = createPortfolioContentByLocale({
      en: [project],
      vi: [
        createProject("solo-project", {
          title: "Dự án solo",
          category: "Scope solo",
          media,
        }),
      ],
    })

    render(<ProjectDetailPage contentByLocale={contentByLocale} projectId="solo-project" />)

    expect(screen.queryByRole("navigation", { name: /More in/i })).not.toBeInTheDocument()
  })

  it("ignores stale Vietnamese locale storage and renders the English proposal CTA", async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "vi")
    const project = createProject("demo-project", {
      title: "Demo project",
      media,
      proposalCta: {
        label: "View full portfolio",
        credit: "Shout out to the friends who built this proposal with me.",
        creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
      },
    })
    const contentByLocale = createPortfolioContentByLocale({
      en: [project],
      vi: [
        createProject("demo-project", {
          title: "Dự án demo",
          category: "Chiến dịch",
          overview: "Tổng quan do admin nhập.",
          media,
          proposalCta: {
            label: "Coi full portfolio",
            credit: "Shout out những người đã cùng làm proposal với tôi.",
            creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
          },
        }),
      ],
    })

    render(<ProjectDetailPage contentByLocale={contentByLocale} projectId="demo-project" />)

    const cta = await screen.findByRole("link", {
      name: "View full portfolio: Full proposal",
    })
    const carousel = screen.getByRole("region", {
      name: /Demo project proposal carousel/i,
    })
    const credit = screen.getByText("Shout out to the friends who built this proposal with me.")

    expect(cta).toHaveAttribute("href", "#demo-project-proposal-carousel")
    expect(screen.getByText("Minh Anh")).toBeInTheDocument()
    expect(screen.getByText("Hoàng Linh")).toBeInTheDocument()
    expect(screen.getByText("Bảo Trân")).toBeInTheDocument()
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en")
    expect(carousel.compareDocumentPosition(credit) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it("renders caption-grid outreach sections as three visible caption cards", () => {
    const outreachMedia: ProjectMedia = {
      cover: media.cover,
      outreachSections: [
        {
          title: "Formal & Academic Voice",
          description: "Carefully chosen words.",
          displayMode: "linked-posts",
          posts: [
            {
              src: "https://store.blob.vercel-storage.com/projects/outreach/formal.png",
              alt: "Formal outreach post",
              width: 1200,
              height: 1200,
              sourceUrl: "https://example.com/formal",
            },
          ],
        },
        {
          title: "Meme & Funny Voice",
          description: "Meme-led outreach.",
          displayMode: "caption-posts",
          posts: [
            {
              src: "https://store.blob.vercel-storage.com/projects/outreach/meme.png",
              alt: "Meme outreach post",
              width: 1200,
              height: 1200,
              caption: "Meme caption.",
            },
          ],
        },
        {
          title: "Poetry & Creative Writing",
          description:
            "A place where I shamelessly flex my rhyming skills (without client's brief).",
          displayMode: "caption-grid",
          posts: [
            {
              src: "https://store.blob.vercel-storage.com/projects/outreach/poetry-01.png",
              alt: "Poetry post 1",
              width: 600,
              height: 608,
              sourceUrl: "https://example.com/poetry-01",
              caption: "Poetry caption one.",
            },
            {
              src: "https://store.blob.vercel-storage.com/projects/outreach/poetry-02.png",
              alt: "Poetry post 2",
              width: 600,
              height: 600,
              sourceUrl: "https://example.com/poetry-02",
              caption: "Poetry caption two.",
            },
            {
              src: "https://store.blob.vercel-storage.com/projects/outreach/poetry-03.png",
              alt: "Poetry post 3",
              width: 563,
              height: 562,
              sourceUrl: "https://example.com/poetry-03",
              caption: "Poetry caption three.",
            },
          ],
        },
      ],
    }
    const project = createProject("social-outreach", {
      title: "Social Outreach",
      media: outreachMedia,
    })
    const contentByLocale = createPortfolioContentByLocale({
      en: [project],
      vi: [createProject("social-outreach", { media: outreachMedia })],
    })

    render(<ProjectDetailPage contentByLocale={contentByLocale} projectId="social-outreach" />)

    expect(screen.getByText("Voice 03")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Poetry & Creative Writing" })).toBeInTheDocument()
    expect(
      screen.getByText(
        "A place where I shamelessly flex my rhyming skills (without client's brief).",
      ),
    ).toBeInTheDocument()
    const poetryRegion = screen.getByRole("region", {
      name: "Poetry & Creative Writing posts",
    })
    expect(poetryRegion).not.toHaveAttribute("aria-roledescription", "carousel")
    expect(screen.getByAltText("Poetry post 1")).toBeInTheDocument()
    expect(screen.getByAltText("Poetry post 2")).toBeInTheDocument()
    expect(screen.getByAltText("Poetry post 3")).toBeInTheDocument()
    expect(screen.getByText("Poetry caption one.")).toBeInTheDocument()
    expect(screen.getByText("Poetry caption two.")).toBeInTheDocument()
    expect(screen.getByText("Poetry caption three.")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Visit post: Poetry post 1" }),
    ).toHaveAttribute("href", "https://example.com/poetry-01")
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
        cardCover: {
          src: "https://store.blob.vercel-storage.com/projects/tesla/cover-wide.jpg",
          alt: "Tesla Education horizontal campaign thumbnail",
          width: 2048,
          height: 1365,
        },
        cover: {
          src: "https://store.blob.vercel-storage.com/projects/tesla/detail-cover.jpg",
          alt: "Tesla Education campus story project cover",
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

    const coverImage = screen.getByAltText("Tesla Education campus story project cover")
    const overview = screen.getByText("Tesla overview copy below the wide cover.")

    expect(
      screen.queryByAltText("Tesla Education horizontal campaign thumbnail"),
    ).not.toBeInTheDocument()
    expect(coverImage.compareDocumentPosition(overview) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })
})
