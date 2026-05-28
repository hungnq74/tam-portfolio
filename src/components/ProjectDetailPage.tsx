"use client"

import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Layers3,
} from "lucide-react"
import {
  type Field,
  type PortfolioUi,
  type Project,
  type ProjectMediaAsset,
  getPortfolioContent,
} from "@/data/portfolio"
import { LocaleToggle } from "@/components/LocaleToggle"
import { useLocale } from "@/hooks/useLocale"
import { cn } from "@/lib/utils"

const MEDIA_RAIL_CLASS =
  "relative left-1/2 w-[calc(100vw-2rem)] -translate-x-1/2 sm:w-[calc(100vw-3rem)] lg:w-[min(calc(100vw-6rem),1440px)]"
const CAROUSEL_RAIL_CLASS =
  "relative left-1/2 w-[calc(100vw-2rem)] -translate-x-1/2 sm:w-[calc(100vw-3rem)] lg:w-[min(calc(100vw-10rem),1440px)] xl:w-[min(calc(100vw-18rem),1440px)]"

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const { locale, setLocale } = useLocale()
  const content = useMemo(() => getPortfolioContent(locale), [locale])
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
}: {
  ui: PortfolioUi
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-4">
      <Link
        href="/"
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

function getSlideRangeLabel(startIndex: number, visibleCount: number, totalSlides: number) {
  const firstSlide = startIndex + 1
  const lastSlide = Math.min(startIndex + visibleCount, totalSlides)

  return firstSlide === lastSlide
    ? `${firstSlide} / ${totalSlides}`
    : `${firstSlide}-${lastSlide} / ${totalSlides}`
}

function MediaProjectPage({
  ui,
  project,
}: {
  ui: PortfolioUi
  project: Project
}) {
  const media = project.media
  const slides = media?.proposalSlides ?? []
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

  return (
    <main className="relative min-h-screen px-4 pb-24 pt-20 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <ProjectChrome ui={ui} />

        <article className="space-y-10 sm:space-y-14">
          <ProjectMediaImage
            asset={media.cover}
            eager
            className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-ink"
            imageClassName="h-full w-full object-contain"
          />

          <div className={cn(MEDIA_RAIL_CLASS, "border-l-4 border-clay bg-paper/72 px-5 py-4 shadow-[0_14px_36px_rgba(45,32,21,0.1)] sm:px-6 sm:py-5")}>
            <p className="font-prose mx-auto max-w-4xl text-base leading-7 text-ink/82 sm:text-lg">
              {project.overview}
            </p>
          </div>

          {media.summary ? (
            <ProjectMediaImage
              asset={media.summary}
              className={cn(MEDIA_RAIL_CLASS, "overflow-hidden bg-paper")}
              imageClassName="h-full w-full object-contain"
            />
          ) : null}

          {slides.length > 0 ? (
            <div
              className={cn(CAROUSEL_RAIL_CLASS, "focus:outline-none")}
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
        </article>
      </div>
    </main>
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
        <ProjectChrome ui={ui} />
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
                <p className="font-prose mt-7 text-base leading-8 text-ink/82 sm:text-lg">
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
