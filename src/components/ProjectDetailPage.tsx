"use client"

import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import Link from "next/link"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Layers3,
  Play,
} from "lucide-react"
import {
  type Field,
  type PortfolioContentByLocale,
  type PortfolioUi,
  type Project,
  type ProjectImageCampaign,
  type ProjectNamingRationale,
  type ProjectMediaAsset,
  type ProjectOutreachSection,
  type ProjectProposalCta,
  type ProjectVideoCampaign,
} from "@/data/portfolio"
import { LocaleToggle } from "@/components/LocaleToggle"
import { useLocale } from "@/hooks/useLocale"
import { getProjectReturnHref } from "@/lib/portfolio-route-state"
import { cn } from "@/lib/utils"

const MEDIA_RAIL_CLASS =
  "relative left-1/2 w-[calc(100vw-2rem)] -translate-x-1/2 sm:w-[calc(100vw-3rem)] lg:w-[min(calc(100vw-6rem),1440px)]"
const CAROUSEL_RAIL_CLASS =
  "relative left-1/2 w-[calc(100vw-2rem)] -translate-x-1/2 sm:w-[calc(100vw-3rem)] lg:w-[min(calc(100vw-10rem),1440px)] xl:w-[min(calc(100vw-18rem),1440px)]"

export function ProjectDetailPage({
  projectId,
  contentByLocale,
}: {
  projectId: string
  contentByLocale: PortfolioContentByLocale
}) {
  const { locale, setLocale } = useLocale()
  const content = useMemo(() => contentByLocale[locale], [contentByLocale, locale])
  const { fields, projects, ui } = content
  const project = projects.find((item) => item.id === projectId) ?? null
  const field = project
    ? fields.find((item) => item.id === project.fieldId) ?? null
    : null

  if (!project || !field) return null

  return (
    <div className="story-texture min-h-screen overflow-x-clip pb-24">
      <LocaleToggle
        locale={locale}
        ariaLabel={ui.languageToggleAria}
        onLocaleChange={setLocale}
        className="fixed left-4 top-4 z-[60]"
      />
      {project.media ? (
        <MediaProjectPage
          ui={ui}
          field={field}
          project={project}
        />
      ) : (
        <TextProjectPage
          ui={ui}
          field={field}
          project={project}
        />
      )}
    </div>
  )
}

function ProjectChrome({
  ui,
  field,
  project,
}: {
  ui: PortfolioUi
  field: Field
  project: Project
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-4">
      <Link
        href={getProjectReturnHref(project, field)}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-clay transition hover:text-moss focus:outline-none focus:ring-2 focus:ring-clay"
      >
        <ArrowLeft className="h-4 w-4" />
        {ui.detail.back}
      </Link>
    </div>
  )
}

function useSlidesPerPage() {
  const [slidesPerPage, setSlidesPerPage] = useState(1)

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)")
    const syncSlidesPerPage = () => setSlidesPerPage(query.matches ? 2 : 1)

    syncSlidesPerPage()
    query.addEventListener("change", syncSlidesPerPage)

    return () => query.removeEventListener("change", syncSlidesPerPage)
  }, [])

  return slidesPerPage
}

function useContentPostsPerPage() {
  const [postsPerPage, setPostsPerPage] = useState(1)

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)")
    const syncPostsPerPage = () => setPostsPerPage(query.matches ? 2 : 1)

    syncPostsPerPage()
    query.addEventListener("change", syncPostsPerPage)

    return () => query.removeEventListener("change", syncPostsPerPage)
  }, [])

  return postsPerPage
}

function getSlideRangeLabel(startIndex: number, visibleCount: number, totalSlides: number) {
  const firstSlide = startIndex + 1
  const lastSlide = Math.min(startIndex + visibleCount, totalSlides)

  return firstSlide === lastSlide
    ? `${firstSlide} / ${totalSlides}`
    : `${firstSlide}-${lastSlide} / ${totalSlides}`
}

function MediaProjectPage({
  ui,
  field,
  project,
}: {
  ui: PortfolioUi
  field: Field
  project: Project
}) {
  const media = project.media
  const slides = media?.proposalSlides ?? []
  const websitePreview = media?.websitePreview
  const contentPosts = media?.contentPosts ?? []
  const contentPostsLayout = media?.contentPostsLayout ?? "grid"
  const imageCampaigns = media?.imageCampaigns ?? []
  const videoCampaigns = media?.videoCampaigns ?? []
  const outreachSections = media?.outreachSections ?? []
  const usesSplitCoverIntro = media?.introLayout === "split-cover"
  const showsProposalCarousel = !websitePreview && slides.length > 0
  const proposalCarouselId = `${project.id}-proposal-carousel`
  const slidesPerPage = useSlidesPerPage()
  const [activePageIndex, setActivePageIndex] = useState(0)
  const pageCount = Math.max(1, Math.ceil(slides.length / slidesPerPage))
  const visibleSlideStart = activePageIndex * slidesPerPage
  const visibleSlides = slides.slice(visibleSlideStart, visibleSlideStart + slidesPerPage)
  const slideRangeLabel = getSlideRangeLabel(visibleSlideStart, visibleSlides.length, slides.length)

  useEffect(() => {
    setActivePageIndex((pageIndex) => Math.min(pageIndex, pageCount - 1))
  }, [pageCount])

  const goToPage = useCallback(
    (direction: number) => {
      if (pageCount <= 1) return

      setActivePageIndex((index) => (index + direction + pageCount) % pageCount)
    },
    [pageCount],
  )

  const onCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return

    event.preventDefault()
    goToPage(event.key === "ArrowLeft" ? -1 : 1)
  }

  if (!media) return null

  if (outreachSections.length > 0) {
    return (
      <ProjectSocialOutreachPage
        ui={ui}
        field={field}
        project={project}
        sections={outreachSections}
      />
    )
  }

  return (
    <main className="relative min-h-screen px-4 pb-24 pt-20 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <ProjectChrome ui={ui} field={field} project={project} />

        <article className="space-y-10 sm:space-y-14">
          {usesSplitCoverIntro ? (
            <ProjectSplitCoverIntro
              eyebrow={project.category}
              title={project.campaignTitle ?? project.title}
              body={project.overview}
              cover={media.cover}
            />
          ) : (
            <ProjectMediaImage
              asset={media.cover}
              eager
              className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-ink"
              imageClassName="h-full w-full object-contain"
            />
          )}

          {!usesSplitCoverIntro ? (
            project.campaignTitle ? (
              <ProjectCampaignIntro
                title={project.campaignTitle}
                body={project.overview}
              />
            ) : (
              <div className={cn(MEDIA_RAIL_CLASS, "border-l-4 border-clay bg-paper/72 px-5 py-4 shadow-[0_14px_36px_rgba(45,32,21,0.1)] sm:px-6 sm:py-5")}>
                <p className="font-prose mx-auto max-w-4xl whitespace-pre-line text-base leading-7 text-ink/82 sm:text-lg">
                  {project.overview}
                </p>
              </div>
            )
          ) : null}

          {project.namingRationale ? (
            <ProjectNamingRationaleBlock rationale={project.namingRationale} />
          ) : null}

          {media.summary ? (
            <ProjectMediaImage
              asset={media.summary}
              className={cn(MEDIA_RAIL_CLASS, "overflow-hidden bg-paper")}
              imageClassName="h-full w-full object-contain"
            />
          ) : null}

          {project.proposalCta && showsProposalCarousel ? (
            <ProjectProposalCtaButton
              cta={project.proposalCta}
              targetId={proposalCarouselId}
              proposalLabel={ui.detail.proposal}
            />
          ) : null}

          {websitePreview ? (
            <ProjectWebsitePreview
              label={ui.detail.websitePreview}
              asset={websitePreview}
            />
          ) : showsProposalCarousel ? (
            <div
              id={proposalCarouselId}
              className={cn(CAROUSEL_RAIL_CLASS, "scroll-mt-24 focus:outline-none")}
              role="region"
              aria-label={`${project.title} ${ui.detail.proposalCarousel}`}
              aria-roledescription="carousel"
              tabIndex={0}
              onKeyDown={onCarouselKeyDown}
            >
              <div className="mx-auto mb-4 flex w-full max-w-7xl flex-wrap items-center justify-end gap-3 px-4 sm:px-6 lg:px-10">
                <p
                  className="text-xs font-bold uppercase tracking-[0.16em] text-ink/58"
                  aria-live="polite"
                >
                  {slideRangeLabel}
                </p>
              </div>

              <div className="relative">
                <div className="grid items-center gap-4 lg:grid-cols-2">
                  {visibleSlides.map((slide) => (
                    <ProjectMediaImage
                      key={slide.src}
                      asset={slide}
                      className={cn(
                        "flex w-full items-center justify-center overflow-hidden bg-paper",
                        visibleSlides.length === 1 && slidesPerPage === 2
                          ? "lg:col-span-2 lg:mx-auto lg:max-w-[calc(50%_-_0.5rem)]"
                          : null,
                      )}
                      imageClassName="h-full w-full object-contain"
                    />
                  ))}
                </div>

                {pageCount > 1 ? (
                  <div className="mt-4 flex items-center justify-center gap-3 xl:pointer-events-none xl:absolute xl:inset-y-0 xl:-left-16 xl:-right-16 xl:mt-0 xl:justify-between">
                    <CarouselButton label={ui.detail.previousSlide} onClick={() => goToPage(-1)}>
                      <ArrowLeft className="h-4 w-4" />
                    </CarouselButton>
                    <CarouselButton label={ui.detail.nextSlide} onClick={() => goToPage(1)}>
                      <ArrowRight className="h-4 w-4" />
                    </CarouselButton>
                  </div>
                ) : null}
              </div>

              {pageCount > 1 ? (
                <div className="mt-5 overflow-x-auto overscroll-x-contain pb-2">
                  <div className="flex w-max min-w-full justify-start gap-2 px-1 sm:justify-center sm:gap-3">
                    {slides.map((slide, index) => {
                      const thumbnailPageIndex = Math.floor(index / slidesPerPage)
                      const isVisible =
                        index >= visibleSlideStart && index < visibleSlideStart + visibleSlides.length

                      return (
                        <button
                          key={slide.src}
                          type="button"
                          onClick={() => setActivePageIndex(thumbnailPageIndex)}
                          className={cn(
                            "group relative h-14 w-24 shrink-0 overflow-hidden rounded-[5px] border bg-paper shadow-[0_10px_26px_rgba(45,32,21,0.12)] transition focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper sm:h-16 sm:w-28 lg:h-20 lg:w-36",
                            isVisible
                              ? "border-clay opacity-100 ring-2 ring-clay ring-offset-2 ring-offset-paper"
                              : "border-ink/16 opacity-60 hover:border-clay/65 hover:opacity-100",
                          )}
                          aria-label={`${ui.detail.showProposalSlide} ${index + 1}`}
                          aria-pressed={isVisible}
                        >
                          <img
                            src={slide.src}
                            alt=""
                            width={slide.width}
                            height={slide.height}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                          <span className="absolute bottom-1 right-1 rounded-[3px] bg-ink/72 px-1.5 py-0.5 text-[10px] font-bold leading-none text-paper">
                            {index + 1}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {project.proposalCta && showsProposalCarousel ? (
            <ProjectProposalCreditNote cta={project.proposalCta} />
          ) : null}

          {contentPosts.length > 0 ? (
            <ProjectContentPostsGrid
              posts={contentPosts}
              layout={contentPostsLayout}
              ariaLabel={`${project.title} content posts`}
              postLinkLabel={ui.detail.visitPost}
              captionLabel={ui.detail.postCaption}
              readMoreLabel={ui.detail.readMoreCaption}
              showLessLabel={ui.detail.showLessCaption}
              previousLabel={ui.detail.previousSlide}
              nextLabel={ui.detail.nextSlide}
            />
          ) : null}

          {imageCampaigns.length > 0 ? (
            <ProjectImageCampaigns
              campaigns={imageCampaigns}
              postLinkLabel={ui.detail.visitPost}
            />
          ) : null}

          {videoCampaigns.length > 0 ? (
            <ProjectVideoCampaigns
              campaigns={videoCampaigns}
              watchVideoLabel={ui.detail.watchVideo}
            />
          ) : null}

          {project.closingNote ? (
            <ProjectClosingNote note={project.closingNote} />
          ) : null}
        </article>
      </div>
    </main>
  )
}

function ProjectProposalCtaButton({
  cta,
  targetId,
  proposalLabel,
}: {
  cta: ProjectProposalCta
  targetId: string
  proposalLabel: string
}) {
  return (
    <section className={cn(MEDIA_RAIL_CLASS, "py-1 text-center")} aria-label={cta.label}>
      <div className="mx-auto max-w-3xl border-y border-gold/45 px-3 py-7 sm:py-8">
        <div className="mx-auto mb-5 flex max-w-xs items-center justify-center gap-3 text-clay/72 sm:max-w-sm">
          <span className="h-px flex-1 bg-gold/45" />
          <span className="h-1.5 w-1.5 rotate-45 bg-gold/70" />
          <span className="h-px flex-1 bg-gold/45" />
        </div>

        <a
          href={`#${targetId}`}
          aria-label={`${cta.label}: ${proposalLabel}`}
          className="group inline-flex max-w-full flex-col items-center gap-2 rounded-[8px] border border-[rgba(116,63,36,0.24)] bg-paper/72 px-6 py-4 text-clay shadow-[0_14px_36px_rgba(45,32,21,0.1)] transition hover:-translate-y-0.5 hover:border-clay hover:bg-gold/16 hover:text-moss focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper motion-reduce:hover:translate-y-0 sm:px-8"
        >
          <span className="max-w-full break-words text-sm font-bold uppercase tracking-[0.16em] sm:text-base">
            {cta.label}
          </span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/55 bg-gold/12 text-clay transition group-hover:border-moss group-hover:bg-moss group-hover:text-paper">
            <ArrowDown className="h-4 w-4" />
          </span>
        </a>
      </div>
    </section>
  )
}

function ProjectProposalCreditNote({ cta }: { cta: ProjectProposalCta }) {
  return (
    <aside className={cn(MEDIA_RAIL_CLASS, "border-t border-gold/45 pt-6 text-center")}>
      <p className="font-prose mx-auto max-w-3xl px-3 text-sm italic leading-7 text-ink/66 sm:text-base">
        {cta.credit}
      </p>
      {cta.creditNames?.length ? (
        <div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2 px-3">
          {cta.creditNames.map((name) => (
            <span
              key={name}
              className="inline-flex rounded-full border border-gold/45 bg-paper/72 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-clay shadow-[0_8px_20px_rgba(45,32,21,0.08)]"
            >
              {name}
            </span>
          ))}
        </div>
      ) : null}
    </aside>
  )
}

function ProjectCampaignIntro({
  title,
  body,
}: {
  title: string
  body: string
}) {
  const titleLines = title.split("\n").filter(Boolean)

  return (
    <section
      className={cn(
        MEDIA_RAIL_CLASS,
        "border-y border-[rgba(165,66,47,0.28)] py-8 sm:py-10",
      )}
    >
      <div className="grid gap-7 lg:grid-cols-[0.86fr_1.14fr] lg:items-start lg:gap-12">
        <h2
          aria-label={titleLines.join(" ")}
          className="font-serif text-[clamp(2.4rem,4vw,3.45rem)] font-semibold leading-[0.95] text-clay"
        >
          {titleLines.map((line) => (
            <span key={line} className="block max-w-full sm:whitespace-nowrap">
              {line}
            </span>
          ))}
        </h2>
        <p className="font-prose whitespace-pre-line text-base leading-8 text-ink/82 sm:text-lg sm:leading-8">
          {body}
        </p>
      </div>
    </section>
  )
}

function ProjectSplitCoverIntro({
  eyebrow,
  title,
  body,
  cover,
}: {
  eyebrow: string
  title: string
  body: string
  cover: ProjectMediaAsset
}) {
  return (
    <section
      className={cn(
        MEDIA_RAIL_CLASS,
        "border-y border-[rgba(165,66,47,0.28)] py-8 sm:py-10",
      )}
    >
      <div className="grid gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-12">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-clay">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-serif text-[clamp(3rem,6vw,6.2rem)] font-semibold leading-none text-clay">
            {title}
          </h1>
          <p className="font-prose mt-6 whitespace-pre-line text-base leading-8 text-ink/82 sm:text-lg sm:leading-8">
            {body}
          </p>
        </div>
        <ProjectMediaImage
          asset={cover}
          eager
          className="overflow-hidden rounded-[8px] border border-[rgba(116,63,36,0.2)] bg-paper shadow-[0_16px_42px_rgba(45,32,21,0.12)]"
          imageClassName="h-full w-full object-cover"
        />
      </div>
    </section>
  )
}

function ProjectSocialOutreachPage({
  ui,
  field,
  project,
  sections,
}: {
  ui: PortfolioUi
  field: Field
  project: Project
  sections: ProjectOutreachSection[]
}) {
  return (
    <main className="relative min-h-screen px-4 pb-24 pt-20 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <ProjectChrome ui={ui} field={field} project={project} />

        <article className="space-y-12 sm:space-y-16">
          <section
            className={cn(
              MEDIA_RAIL_CLASS,
              "border-y border-[rgba(165,66,47,0.28)] py-8 sm:py-10",
            )}
          >
            <div className="grid gap-7 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:gap-14">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-clay">
                  {project.eyebrow}
                </p>
                <h1 className="mt-4 font-serif text-[clamp(3.2rem,7vw,7rem)] font-semibold leading-none text-clay">
                  {project.title}
                </h1>
              </div>
              <p className="font-prose max-w-3xl whitespace-pre-line text-base leading-8 text-ink/82 sm:text-lg sm:leading-8">
                {project.overview}
              </p>
            </div>
          </section>

          {sections.map((section, index) => (
            <ProjectOutreachSectionBlock
              key={section.title}
              section={section}
              index={index}
              postLinkLabel={ui.detail.visitPost}
              captionLabel={ui.detail.postCaption}
              previousLabel={ui.detail.previousSlide}
              nextLabel={ui.detail.nextSlide}
            />
          ))}
        </article>
      </div>
    </main>
  )
}

function ProjectOutreachSectionBlock({
  section,
  index,
  postLinkLabel,
  captionLabel,
  previousLabel,
  nextLabel,
}: {
  section: ProjectOutreachSection
  index: number
  postLinkLabel: string
  captionLabel: string
  previousLabel: string
  nextLabel: string
}) {
  return (
    <section className={cn(MEDIA_RAIL_CLASS, "space-y-5 border-t border-gold/45 pt-6 sm:pt-8")}>
      <div className="max-w-3xl border-l-2 border-gold/60 pl-4 sm:pl-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">
          Voice {String(index + 1).padStart(2, "0")}
        </p>
        <h2 className="mt-2 font-serif text-[clamp(2rem,3.7vw,3.8rem)] font-semibold leading-[0.98] text-clay">
          {section.title}
        </h2>
        <p className="font-prose mt-3 max-w-2xl text-base leading-7 text-ink/76 sm:text-[1.05rem] sm:leading-8">
          {section.description}
        </p>
      </div>

      <ProjectOutreachPosts
        section={section}
        postLinkLabel={postLinkLabel}
        captionLabel={captionLabel}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
      />
    </section>
  )
}

function ProjectOutreachPosts({
  section,
  postLinkLabel,
  captionLabel,
  previousLabel,
  nextLabel,
}: {
  section: ProjectOutreachSection
  postLinkLabel: string
  captionLabel: string
  previousLabel: string
  nextLabel: string
}) {
  const showLinks = section.displayMode === "linked-posts"
  const showCaptions = section.displayMode === "caption-posts"
  const postsPerPage = useContentPostsPerPage()
  const pageCount = Math.max(1, Math.ceil(section.posts.length / postsPerPage))
  const [activePageIndex, setActivePageIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const programmaticScrollTimeoutRef = useRef<number | null>(null)
  const visibleStart = activePageIndex * postsPerPage
  const visibleCount = Math.min(postsPerPage, Math.max(0, section.posts.length - visibleStart))
  const rangeLabel = getSlideRangeLabel(visibleStart, visibleCount, section.posts.length)
  const postPages = Array.from({ length: pageCount }, (_, pageIndex) =>
    section.posts.slice(pageIndex * postsPerPage, pageIndex * postsPerPage + postsPerPage),
  )

  const scrollToPostPage = useCallback((pageIndex: number, behavior: ScrollBehavior = "smooth") => {
    const trackElement = trackRef.current
    if (!trackElement) return

    if (programmaticScrollTimeoutRef.current) {
      window.clearTimeout(programmaticScrollTimeoutRef.current)
    }

    programmaticScrollTimeoutRef.current = window.setTimeout(() => {
      programmaticScrollTimeoutRef.current = null
    }, behavior === "smooth" ? 520 : 0)

    const nextScrollLeft = pageIndex * trackElement.clientWidth

    if (typeof trackElement.scrollTo === "function") {
      trackElement.scrollTo({
        left: nextScrollLeft,
        behavior,
      })
    } else {
      trackElement.scrollLeft = nextScrollLeft
    }
  }, [])

  useEffect(() => {
    setActivePageIndex((pageIndex) => {
      const nextPageIndex = Math.min(pageIndex, pageCount - 1)
      window.requestAnimationFrame(() => scrollToPostPage(nextPageIndex, "auto"))

      return nextPageIndex
    })
  }, [pageCount, scrollToPostPage])

  useEffect(() => {
    return () => {
      if (programmaticScrollTimeoutRef.current) {
        window.clearTimeout(programmaticScrollTimeoutRef.current)
      }
    }
  }, [])

  const goToPostPage = useCallback(
    (direction: number) => {
      if (pageCount <= 1) return

      setActivePageIndex((index) => {
        const nextPageIndex = (index + direction + pageCount) % pageCount
        scrollToPostPage(nextPageIndex)

        return nextPageIndex
      })
    },
    [pageCount, scrollToPostPage],
  )

  const syncPageFromScroll = useCallback(() => {
    if (programmaticScrollTimeoutRef.current) return

    const trackElement = trackRef.current
    if (!trackElement || trackElement.clientWidth === 0) return

    const nextPageIndex = Math.round(trackElement.scrollLeft / trackElement.clientWidth)
    setActivePageIndex(Math.min(Math.max(nextPageIndex, 0), pageCount - 1))
  }, [pageCount])

  const onCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return

    event.preventDefault()
    goToPostPage(event.key === "ArrowLeft" ? -1 : 1)
  }

  return (
    <div
      className={cn(CAROUSEL_RAIL_CLASS, "focus:outline-none")}
      role="region"
      aria-label={`${section.title} posts`}
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={onCarouselKeyDown}
    >
      <div className="mb-4 flex items-center justify-end px-1 sm:px-2">
        <p
          className="text-xs font-bold uppercase tracking-[0.16em] text-ink/58"
          aria-live="polite"
        >
          {rangeLabel}
        </p>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={syncPageFromScroll}
          data-scroll-gate-ignore
        >
          {postPages.map((pagePosts) => (
            <div
              key={pagePosts.map((post) => post.src).join("-")}
              className="grid min-w-full snap-start items-stretch gap-4 md:grid-cols-2"
            >
              {pagePosts.map((post) => (
                <ProjectOutreachPostCard
                  key={post.src}
                  post={post}
                  postLinkLabel={postLinkLabel}
                  captionLabel={captionLabel}
                  showLink={showLinks}
                  showCaption={showCaptions}
                  compact
                />
              ))}
            </div>
          ))}
        </div>

        {pageCount > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-3 xl:pointer-events-none xl:absolute xl:inset-y-0 xl:-left-16 xl:-right-16 xl:mt-0 xl:justify-between">
            <CarouselButton label={previousLabel} onClick={() => goToPostPage(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </CarouselButton>
            <CarouselButton label={nextLabel} onClick={() => goToPostPage(1)}>
              <ArrowRight className="h-4 w-4" />
            </CarouselButton>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ProjectOutreachPostCard({
  post,
  postLinkLabel,
  captionLabel,
  showLink,
  showCaption,
  compact = false,
}: {
  post: ProjectMediaAsset
  postLinkLabel: string
  captionLabel: string
  showLink: boolean
  showCaption: boolean
  compact?: boolean
}) {
  const caption = showCaption ? post.caption : undefined

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[8px] border border-[rgba(116,63,36,0.2)] bg-paper shadow-[0_16px_42px_rgba(45,32,21,0.12)]">
      <div className={cn("flex items-center justify-center bg-paper", compact ? "h-[42vh] min-h-[300px] max-h-[460px]" : null)}>
        <ProjectMediaImage
          asset={post}
          className={cn("w-full bg-paper", compact ? "flex h-full items-center justify-center" : null)}
          imageClassName={compact ? "h-full w-full object-contain" : "h-auto w-full object-contain"}
        />
      </div>

      {caption ? (
        <div className={cn("border-t border-[rgba(116,63,36,0.16)] bg-paper/96", compact ? "px-3 py-3 sm:px-4" : "px-4 py-4 sm:px-5")}>
          <p className="mb-2 text-[0.64rem] font-bold uppercase tracking-[0.18em] text-clay">
            {captionLabel}
          </p>
          <p
            className={cn(
              "font-prose whitespace-pre-line text-sm leading-7 text-ink/78 sm:text-[0.95rem]",
              compact ? "max-h-40 overflow-y-auto pr-2 sm:text-sm sm:leading-6" : null,
            )}
          >
            {caption}
          </p>
        </div>
      ) : null}

      {showLink && post.sourceUrl ? (
        <div className="mt-auto flex justify-end border-t border-[rgba(116,63,36,0.16)] bg-paper/92 px-3 py-3 sm:px-4">
          <a
            href={post.sourceUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`${postLinkLabel}: ${post.alt}`}
            className="inline-flex items-center gap-2 rounded-full border border-clay/24 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-clay transition hover:border-clay hover:bg-clay hover:text-paper focus:outline-none focus:ring-2 focus:ring-clay"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {postLinkLabel}
          </a>
        </div>
      ) : null}
    </article>
  )
}

function ProjectContentPostsGrid({
  posts,
  layout,
  ariaLabel,
  postLinkLabel,
  captionLabel,
  readMoreLabel,
  showLessLabel,
  previousLabel,
  nextLabel,
}: {
  posts: ProjectMediaAsset[]
  layout: "grid" | "carousel"
  ariaLabel: string
  postLinkLabel: string
  captionLabel?: string
  readMoreLabel?: string
  showLessLabel?: string
  previousLabel?: string
  nextLabel?: string
}) {
  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({})
  const arrangedPosts = [...posts].sort((left, right) => {
    const leftRatio = left.height / left.width
    const rightRatio = right.height / right.width

    return rightRatio - leftRatio
  })

  const toggleCaption = useCallback((postSrc: string) => {
    setExpandedCaptions((currentCaptions) => ({
      ...currentCaptions,
      [postSrc]: !currentCaptions[postSrc],
    }))
  }, [])

  if (layout === "carousel") {
    return (
      <ProjectContentPostsCarousel
        posts={arrangedPosts}
        ariaLabel={ariaLabel}
        postLinkLabel={postLinkLabel}
        captionLabel={captionLabel}
        readMoreLabel={readMoreLabel}
        showLessLabel={showLessLabel}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        expandedCaptions={expandedCaptions}
        onToggleCaption={toggleCaption}
      />
    )
  }

  return (
    <section
      className={cn(MEDIA_RAIL_CLASS, "grid items-start gap-4 sm:grid-cols-2 lg:gap-5")}
      aria-label={ariaLabel}
    >
      {arrangedPosts.map((post) => {
        return (
          <ProjectContentPostCard
            key={post.src}
            post={post}
            postLinkLabel={postLinkLabel}
          />
        )
      })}
    </section>
  )
}

function ProjectContentPostsCarousel({
  posts,
  ariaLabel,
  postLinkLabel,
  captionLabel,
  readMoreLabel,
  showLessLabel,
  previousLabel,
  nextLabel,
  expandedCaptions,
  onToggleCaption,
}: {
  posts: ProjectMediaAsset[]
  ariaLabel: string
  postLinkLabel: string
  captionLabel?: string
  readMoreLabel?: string
  showLessLabel?: string
  previousLabel?: string
  nextLabel?: string
  expandedCaptions: Record<string, boolean>
  onToggleCaption: (postSrc: string) => void
}) {
  const postsPerPage = useContentPostsPerPage()
  const pageCount = Math.max(1, Math.ceil(posts.length / postsPerPage))
  const [activePageIndex, setActivePageIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const programmaticScrollTimeoutRef = useRef<number | null>(null)
  const visibleStart = activePageIndex * postsPerPage
  const visibleCount = Math.min(postsPerPage, Math.max(0, posts.length - visibleStart))
  const rangeLabel = getSlideRangeLabel(visibleStart, visibleCount, posts.length)
  const postPages = Array.from({ length: pageCount }, (_, pageIndex) =>
    posts.slice(pageIndex * postsPerPage, pageIndex * postsPerPage + postsPerPage),
  )

  const scrollToPostPage = useCallback((pageIndex: number, behavior: ScrollBehavior = "smooth") => {
    const trackElement = trackRef.current
    if (!trackElement) return

    if (programmaticScrollTimeoutRef.current) {
      window.clearTimeout(programmaticScrollTimeoutRef.current)
    }

    programmaticScrollTimeoutRef.current = window.setTimeout(() => {
      programmaticScrollTimeoutRef.current = null
    }, behavior === "smooth" ? 520 : 0)

    const nextScrollLeft = pageIndex * trackElement.clientWidth

    if (typeof trackElement.scrollTo === "function") {
      trackElement.scrollTo({
        left: nextScrollLeft,
        behavior,
      })
    } else {
      trackElement.scrollLeft = nextScrollLeft
    }
  }, [])

  useEffect(() => {
    setActivePageIndex((pageIndex) => {
      const nextPageIndex = Math.min(pageIndex, pageCount - 1)
      window.requestAnimationFrame(() => scrollToPostPage(nextPageIndex, "auto"))

      return nextPageIndex
    })
  }, [pageCount, scrollToPostPage])

  useEffect(() => {
    return () => {
      if (programmaticScrollTimeoutRef.current) {
        window.clearTimeout(programmaticScrollTimeoutRef.current)
      }
    }
  }, [])

  const goToPostPage = useCallback(
    (direction: number) => {
      if (pageCount <= 1) return

      setActivePageIndex((index) => {
        const nextPageIndex = (index + direction + pageCount) % pageCount
        scrollToPostPage(nextPageIndex)

        return nextPageIndex
      })
    },
    [pageCount, scrollToPostPage],
  )

  const syncPageFromScroll = useCallback(() => {
    if (programmaticScrollTimeoutRef.current) return

    const trackElement = trackRef.current
    if (!trackElement || trackElement.clientWidth === 0) return

    const nextPageIndex = Math.round(trackElement.scrollLeft / trackElement.clientWidth)
    setActivePageIndex(Math.min(Math.max(nextPageIndex, 0), pageCount - 1))
  }, [pageCount])

  const onCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return

    event.preventDefault()
    goToPostPage(event.key === "ArrowLeft" ? -1 : 1)
  }

  return (
    <section
      className={cn(CAROUSEL_RAIL_CLASS, "focus:outline-none")}
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={onCarouselKeyDown}
    >
      <div className="mb-4 flex items-center justify-end px-1 sm:px-2">
        <p
          className="text-xs font-bold uppercase tracking-[0.16em] text-ink/58"
          aria-live="polite"
        >
          {rangeLabel}
        </p>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={syncPageFromScroll}
        >
          {postPages.map((pagePosts) => {
            return (
              <div
                key={pagePosts.map((post) => post.src).join("-")}
                className="grid min-w-full snap-start gap-4 md:grid-cols-2"
              >
                {pagePosts.map((post) => (
                  <ProjectContentPostCard
                    key={post.src}
                    post={post}
                    postLinkLabel={postLinkLabel}
                    captionLabel={captionLabel}
                    readMoreLabel={readMoreLabel}
                    showLessLabel={showLessLabel}
                    isCaptionExpanded={Boolean(expandedCaptions[post.src])}
                    onToggleCaption={() => onToggleCaption(post.src)}
                    compact
                  />
                ))}
              </div>
            )
          })}
        </div>

        {pageCount > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-3 xl:pointer-events-none xl:absolute xl:inset-y-0 xl:-left-16 xl:-right-16 xl:mt-0 xl:justify-between">
            <CarouselButton label={previousLabel ?? "Previous post"} onClick={() => goToPostPage(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </CarouselButton>
            <CarouselButton label={nextLabel ?? "Next post"} onClick={() => goToPostPage(1)}>
              <ArrowRight className="h-4 w-4" />
            </CarouselButton>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function ProjectContentPostCard({
  post,
  postLinkLabel,
  captionLabel,
  readMoreLabel,
  showLessLabel,
  isCaptionExpanded = false,
  onToggleCaption,
  compact = false,
}: {
  post: ProjectMediaAsset
  postLinkLabel: string
  captionLabel?: string
  readMoreLabel?: string
  showLessLabel?: string
  isCaptionExpanded?: boolean
  onToggleCaption?: () => void
  compact?: boolean
}) {
  const caption = onToggleCaption ? post.caption : undefined
  const captionLineBreaks = caption ? (caption.match(/\n/g) ?? []).length : 0
  const collapsedCaptionHeight = compact ? "max-h-28" : "max-h-24"
  const canToggleCaption = Boolean(
    caption &&
      (compact
        ? caption.length > 180 || captionLineBreaks >= 4
        : caption.length > 150 || captionLineBreaks >= 2),
  )

  return (
    <article className="overflow-hidden rounded-[8px] border border-[rgba(116,63,36,0.2)] bg-paper shadow-[0_16px_42px_rgba(45,32,21,0.12)]">
      <div className={cn("flex items-center justify-center bg-paper", compact ? "h-[40vh] min-h-[300px] max-h-[430px]" : null)}>
        <ProjectMediaImage
          asset={post}
          className={cn("w-full bg-paper", compact ? "flex h-full items-center justify-center" : null)}
          imageClassName={compact ? "h-full w-full object-contain" : "h-auto w-full"}
        />
      </div>

      {caption ? (
        <div className={cn("border-t border-[rgba(116,63,36,0.16)] bg-paper/96", compact ? "px-3 py-3 sm:px-4" : "px-4 py-4 sm:px-5")}>
          <p className="mb-2 text-[0.64rem] font-bold uppercase tracking-[0.18em] text-clay">
            {captionLabel}
          </p>
          <div className="relative">
            <p
              className={cn(
                "font-prose whitespace-pre-line text-sm leading-7 text-ink/78 sm:text-[0.95rem]",
                compact ? "sm:text-sm sm:leading-6" : null,
                canToggleCaption && !isCaptionExpanded ? cn(collapsedCaptionHeight, "overflow-hidden") : null,
              )}
            >
              {caption}
            </p>
            {canToggleCaption && !isCaptionExpanded ? (
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-paper via-paper/90 to-paper/0",
                  compact ? "h-6" : "h-10",
                )}
              />
            ) : null}
          </div>

          {canToggleCaption ? (
            <button
              type="button"
              className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-clay underline decoration-clay/45 underline-offset-4 transition hover:text-moss focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper"
              aria-expanded={isCaptionExpanded}
              onClick={onToggleCaption}
            >
              {isCaptionExpanded ? showLessLabel : readMoreLabel}
            </button>
          ) : null}
        </div>
      ) : null}

      {post.sourceUrl ? (
        <div className="flex justify-end border-t border-[rgba(116,63,36,0.16)] bg-paper/92 px-3 py-3 sm:px-4">
          <a
            href={post.sourceUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`${postLinkLabel}: ${post.alt}`}
            className="inline-flex items-center gap-2 rounded-full border border-clay/24 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-clay transition hover:border-clay hover:bg-clay hover:text-paper focus:outline-none focus:ring-2 focus:ring-clay"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {postLinkLabel}
          </a>
        </div>
      ) : null}
    </article>
  )
}

function ProjectImageCampaigns({
  campaigns,
  postLinkLabel,
}: {
  campaigns: ProjectImageCampaign[]
  postLinkLabel: string
}) {
  return (
    <section className={cn(MEDIA_RAIL_CLASS, "space-y-10")} aria-label="Image campaigns">
      {campaigns.map((campaign) => (
        <article
          key={campaign.title}
          className="border-t border-gold/45 pt-6 sm:pt-8"
        >
          <div className="grid gap-4 md:grid-cols-[0.68fr_1fr] md:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">
                Campus campaigns
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-moss sm:text-4xl lg:text-5xl">
                {campaign.title}
              </h2>
            </div>
            <p className="font-prose max-w-3xl whitespace-pre-line text-base leading-7 text-ink/78 sm:text-lg sm:leading-8">
              {campaign.description}
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {campaign.images.map((image) => (
              <article
                key={image.src}
                className="flex h-full flex-col overflow-hidden rounded-[8px] border border-[rgba(116,63,36,0.2)] bg-paper shadow-[0_16px_42px_rgba(45,32,21,0.12)]"
              >
                <ProjectMediaImage
                  asset={image}
                  className="w-full bg-paper"
                  imageClassName="h-auto w-full object-contain"
                />
                {image.sourceUrl ? (
                  <div className="mt-auto flex justify-end border-t border-[rgba(116,63,36,0.16)] bg-paper/92 px-3 py-3 sm:px-4">
                    <a
                      href={image.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${postLinkLabel}: ${image.alt}`}
                      className="inline-flex items-center gap-2 rounded-full border border-clay/24 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-clay transition hover:border-clay hover:bg-clay hover:text-paper focus:outline-none focus:ring-2 focus:ring-clay"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {postLinkLabel}
                    </a>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}

function ProjectVideoCampaigns({
  campaigns,
  watchVideoLabel,
}: {
  campaigns: ProjectVideoCampaign[]
  watchVideoLabel: string
}) {
  return (
    <section className={cn(MEDIA_RAIL_CLASS, "space-y-10")} aria-label="Video campaigns">
      {campaigns.map((campaign) => {
        const featuredVideo = campaign.videos.length === 1 ? campaign.videos[0] : null

        return (
          <article
            key={campaign.title}
            className="border-t border-gold/45 pt-6 sm:pt-8"
          >
            <div className="grid gap-4 md:grid-cols-[0.68fr_1fr] md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">
                  Video scripts
                </p>
                <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-moss sm:text-4xl lg:text-5xl">
                  {campaign.title}
                </h2>
              </div>
              <p className="font-prose max-w-3xl text-base leading-7 text-ink/78 sm:text-lg sm:leading-8">
                {campaign.description}
              </p>
            </div>

            {featuredVideo ? (
              <ProjectFeaturedVideoCard
                video={featuredVideo}
                watchVideoLabel={watchVideoLabel}
              />
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {campaign.videos.map((video, index) => (
                  <ProjectVideoPreviewCard
                    key={video.src}
                    video={video}
                    index={index}
                    watchVideoLabel={watchVideoLabel}
                  />
                ))}
              </div>
            )}
          </article>
        )
      })}
    </section>
  )
}

function ProjectFeaturedVideoCard({
  video,
  watchVideoLabel,
}: {
  video: ProjectMediaAsset
  watchVideoLabel: string
}) {
  const platformLabel = getVideoPlatformLabel(video.sourceUrl)
  const ctaLabel = video.ctaLabel ?? watchVideoLabel

  return (
    <article className="mt-6 overflow-hidden rounded-[8px] border border-[rgba(116,63,36,0.2)] bg-paper shadow-[0_18px_48px_rgba(45,32,21,0.14)] lg:mx-auto lg:max-w-6xl">
      <a
        href={video.sourceUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${ctaLabel}: ${video.alt}`}
        className="group block focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper"
      >
        <div
          className="relative overflow-hidden bg-ink"
          style={{ aspectRatio: `${video.width} / ${video.height}` }}
        >
          <img
            src={video.src}
            alt={video.alt}
            width={video.width}
            height={video.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(43,30,19,0.34),rgba(43,30,19,0.04)_38%,rgba(43,30,19,0.74))]" />
          <span className="absolute left-3 top-3 rounded-full border border-paper/70 bg-ink/90 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-paper shadow-[0_8px_20px_rgba(43,30,19,0.28)] backdrop-blur sm:left-5 sm:top-5">
            {platformLabel}
          </span>
          <span className="absolute left-1/2 top-1/2 inline-flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper/92 text-clay shadow-story transition group-hover:bg-clay group-hover:text-paper sm:h-16 sm:w-16">
            <Play className="ml-1 h-5 w-5 fill-current sm:h-6 sm:w-6" />
          </span>
          <div className="absolute inset-x-0 bottom-0 flex justify-end p-4 sm:p-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-paper px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-clay shadow-[0_12px_28px_rgba(43,30,19,0.28)] transition group-hover:bg-clay group-hover:text-paper">
              {ctaLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </a>
    </article>
  )
}

function ProjectVideoPreviewCard({
  video,
  index,
  watchVideoLabel,
}: {
  video: ProjectMediaAsset
  index: number
  watchVideoLabel: string
}) {
  const platformLabel = getVideoPlatformLabel(video.sourceUrl)
  const ctaLabel = video.ctaLabel ?? watchVideoLabel

  return (
    <article className="overflow-hidden rounded-[8px] border border-[rgba(116,63,36,0.2)] bg-paper shadow-[0_16px_42px_rgba(45,32,21,0.12)]">
      <a
        href={video.sourceUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${ctaLabel}: ${video.alt}`}
        className="group block focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper"
      >
        <div className="relative aspect-[9/16] max-h-[26rem] overflow-hidden bg-ink">
          <img
            src={video.src}
            alt={video.alt}
            width={video.width}
            height={video.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(43,30,19,0.42),rgba(43,30,19,0.06)_28%,rgba(43,30,19,0.18)_56%,rgba(43,30,19,0.88))]" />
          <span className="absolute left-3 top-3 rounded-full border border-paper/70 bg-ink/90 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-paper shadow-[0_8px_20px_rgba(43,30,19,0.28)] backdrop-blur">
            {platformLabel}
          </span>
          <span className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-paper/92 text-clay shadow-story transition group-hover:bg-clay group-hover:text-paper">
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          </span>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="inline-flex max-w-full flex-col rounded-[6px] bg-ink/90 px-3 py-2 text-paper shadow-[0_12px_28px_rgba(43,30,19,0.32)] ring-1 ring-paper/20 backdrop-blur-sm">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-paper/82">
                Video {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-1.5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-paper">
                {ctaLabel}
                <ExternalLink className="h-3.5 w-3.5" />
              </p>
            </div>
          </div>
        </div>
      </a>
    </article>
  )
}

function getVideoPlatformLabel(sourceUrl?: string) {
  if (!sourceUrl) return "Video"

  try {
    const hostname = new URL(sourceUrl).hostname.replace(/^www\./, "")

    if (hostname.includes("tiktok")) return "TikTok"
    if (hostname.includes("facebook")) return "Facebook"

    return hostname
  } catch {
    return "Video"
  }
}

function ProjectClosingNote({
  note,
}: {
  note: string
}) {
  return (
    <aside className={cn(MEDIA_RAIL_CLASS, "border-t border-gold/45 pt-6 text-center")}>
      <div className="overflow-x-auto overscroll-x-contain pb-1">
        <p className="font-prose inline-block min-w-max whitespace-nowrap px-2 text-base italic leading-8 text-moss/82">
          {note}
        </p>
      </div>
    </aside>
  )
}

function ProjectWebsitePreview({
  label,
  asset,
}: {
  label: string
  asset: ProjectMediaAsset
}) {
  const sourceUrl = asset.sourceUrl ?? asset.src

  return (
    <section
      className={cn(
        CAROUSEL_RAIL_CLASS,
        "overflow-hidden rounded-[8px] border border-[rgba(116,63,36,0.24)] bg-paper shadow-[0_18px_48px_rgba(45,32,21,0.14)]",
      )}
      aria-label={label}
    >
      <div className="flex flex-col gap-3 border-b border-[rgba(116,63,36,0.16)] bg-[rgba(255,247,226,0.84)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-clay/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-gold/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-moss/70" />
          <p className="ml-2 text-xs font-bold uppercase tracking-[0.16em] text-clay">
            {label}
          </p>
        </div>
        <p className="min-w-0 truncate rounded-full border border-[rgba(116,63,36,0.18)] bg-paper/76 px-3 py-1.5 text-xs leading-none text-ink/62">
          {sourceUrl}
        </p>
      </div>

      <div className="relative bg-[#f5dfaa]/35 p-2 sm:p-4">
        <div className="overflow-hidden rounded-[6px] bg-white shadow-insetpaper">
          <img
            src={asset.src}
            alt={asset.alt}
            width={asset.width}
            height={asset.height}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
        </div>
      </div>
    </section>
  )
}

function ProjectNamingRationaleBlock({
  rationale,
}: {
  rationale: ProjectNamingRationale
}) {
  const tetItem =
    rationale.items.find((item) => item.term === "TET") ?? rationale.items[0]
  const topItem =
    rationale.items.find((item) => item.term === "TO THE TOP") ??
    rationale.items.find((item) => item.term === "TOP") ??
    rationale.items[1]
  const titleTermClass =
    "font-serif text-5xl font-semibold leading-[0.98] text-clay sm:text-6xl md:text-7xl lg:text-8xl"
  const definitionClass =
    "font-prose mt-4 max-w-[17rem] text-base leading-7 text-ink/78 sm:text-lg sm:leading-8"

  return (
    <section className="mx-auto w-full max-w-5xl px-1 py-8 sm:py-10 lg:py-12">
      <div className="max-w-[58rem]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay sm:text-sm">
          {rationale.eyebrow}
        </p>

        <blockquote className="mt-5 max-w-[55rem] border-l-2 border-gold/60 py-1 pl-5 sm:pl-7">
          <h2 className="sr-only">{rationale.title}</h2>
          <div className="flex max-w-full flex-wrap items-start gap-x-5 gap-y-7 sm:gap-x-7 lg:w-max lg:max-w-none lg:flex-nowrap lg:gap-x-8 lg:pb-24 xl:gap-x-10">
            <div className="inline-flex max-w-full flex-col lg:relative lg:block lg:max-w-none">
              <span
                aria-hidden="true"
                className={cn(
                  titleTermClass,
                  "underline decoration-clay decoration-[0.055em] underline-offset-[0.08em]",
                )}
              >
                TET
              </span>
              <p
                className={cn(
                  definitionClass,
                  "lg:absolute lg:left-0 lg:top-full lg:mt-5 lg:w-[17rem] lg:max-w-[17rem]",
                )}
              >
                {tetItem?.definition}
              </p>
            </div>

            <span
              aria-hidden="true"
              className={cn(titleTermClass, "whitespace-nowrap")}
            >
              TO THE
            </span>

            <div className="inline-flex max-w-full flex-col lg:relative lg:block lg:max-w-none">
              <span
                aria-hidden="true"
                className={cn(
                  titleTermClass,
                  "underline decoration-clay decoration-[0.055em] underline-offset-[0.08em]",
                )}
              >
                TOP
              </span>
              <p
                className={cn(
                  definitionClass,
                  "max-w-[32rem] lg:absolute lg:left-0 lg:top-full lg:mt-5 lg:w-[24rem] lg:max-w-[24rem] 2xl:w-[32rem] 2xl:max-w-[32rem]",
                )}
              >
                {topItem?.definition}
              </p>
            </div>
          </div>
        </blockquote>

        <p className="font-prose mt-9 max-w-[55rem] pl-5 text-sm italic leading-7 text-ink/76 sm:pl-7 sm:text-base">
          {rationale.note}
        </p>
      </div>
    </section>
  )
}

function TextProjectPage({
  ui,
  field,
  project,
}: {
  ui: PortfolioUi
  field: Field
  project: Project
}) {
  return (
    <main className="relative flex min-h-screen items-center px-4 pb-24 pt-20 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <ProjectChrome ui={ui} field={field} project={project} />
        <StoryFrame className="overflow-hidden p-5 sm:p-7 lg:p-9">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
            <article className="flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay">
                  {field.title}
                </p>
                <h1 className="mt-3 font-serif text-[clamp(2.7rem,6vw,6rem)] font-semibold leading-[0.92] text-moss">
                  {project.title}
                </h1>
                <div className="mt-6 grid gap-3 text-sm text-ink/72 sm:grid-cols-3">
                  <MetaBlock label={ui.detail.client} value={project.client} />
                  <MetaBlock label={ui.detail.year} value={project.year} />
                  <MetaBlock label={ui.detail.scope} value={project.scope.join(", ")} />
                </div>
                <p className="font-prose mt-7 whitespace-pre-line text-base leading-8 text-ink/82 sm:text-lg">
                  {project.overview}
                </p>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <CaseNote title={ui.detail.objective} body={project.objective} />
                <CaseNote title={ui.detail.solution} body={project.solution} />
              </div>
            </article>

            <div className="space-y-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[7px] border border-[rgba(116,63,36,0.26)] bg-paper-deep shadow-insetpaper">
                <ThumbnailArt field={field} project={project} className="absolute inset-0" />
              </div>
              <div className="rounded-[7px] border border-[rgba(116,63,36,0.2)] bg-[rgba(255,247,226,0.55)] p-5">
                <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-clay">
                  <Layers3 className="h-4 w-4" />
                  {ui.detail.results}
                </p>
                <ul className="grid gap-3 text-sm leading-6 text-ink/78 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {project.results.map((result) => (
                    <li key={result} className="border-l border-gold/50 pl-3">
                      {result}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </StoryFrame>
      </div>
    </main>
  )
}

function ProjectMediaImage({
  asset,
  className,
  imageClassName,
  eager = false,
}: {
  asset: ProjectMediaAsset
  className?: string
  imageClassName?: string
  eager?: boolean
}) {
  const style = {
    aspectRatio: `${asset.width} / ${asset.height}`,
  } satisfies CSSProperties

  return (
    <figure className={className} style={style}>
      <img
        src={asset.src}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={cn("block", imageClassName)}
      />
    </figure>
  )
}

function CarouselButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-paper/80 bg-ink/70 text-paper shadow-story backdrop-blur transition hover:bg-clay focus:outline-none focus:ring-2 focus:ring-gold sm:h-12 sm:w-12"
      aria-label={label}
    >
      {children}
    </button>
  )
}

function ThumbnailArt({
  field,
  project,
  className,
}: {
  field: Field
  project: Project
  className?: string
}) {
  const style = {
    backgroundImage: `url(${field.sheetImage})`,
    backgroundSize: "300% 200%",
    backgroundPosition: `${project.thumbnail.col * 50}% ${project.thumbnail.row * 100}%`,
  } satisfies CSSProperties

  return (
    <div className={cn("bg-cover bg-no-repeat", className)} style={style}>
      <div className="h-full w-full bg-[linear-gradient(180deg,transparent,rgba(43,30,19,0.08))]" />
    </div>
  )
}

function StoryFrame({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="paper-panel story-frame relative rounded-[10px]">
      <div className="ornament-corner" />
      <div className="ornament-corner" />
      <div className="ornament-corner" />
      <div className="ornament-corner" />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  )
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] border border-[rgba(116,63,36,0.16)] bg-[rgba(255,247,226,0.42)] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-clay">
        {label}
      </p>
      <p className="font-prose mt-2 text-sm leading-6 text-ink/78">{value}</p>
    </div>
  )
}

function CaseNote({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold text-clay">{title}</h2>
      <p className="font-prose mt-2 text-sm leading-7 text-ink/72">{body}</p>
    </div>
  )
}
