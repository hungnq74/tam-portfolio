"use client"

import {
  Children,
  createContext,
  type CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import Link from "next/link"
import {
  motion,
  type MotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  Feather,
  Layers3,
  Lock,
  PenLine,
  ScrollText,
} from "lucide-react"
import {
  type Author,
  type Chapter,
  type Field,
  type FieldId,
  type PortfolioContentByLocale,
  type PortfolioUi,
  type Project,
  type ProjectMediaAsset,
  type SectionId,
} from "@/data/portfolio"
import { getLenis } from "@/components/LenisProvider"
import { LocaleToggle } from "@/components/LocaleToggle"
import { useLocale } from "@/hooks/useLocale"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/utils"

const COVER_IMAGE = "/assets/storybook/cover.png"
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const
const LOCKED_FIELD_GATE_SECTIONS = new Set<SectionId>(["gallery", "detail"])
const EMPTY_LOCKED_SECTIONS = new Set<SectionId>()

type RevealPreset = "page-rise" | "ink-line" | "image-depth" | "card-cascade"
type ScrollToOptions = {
  force?: boolean
  immediate?: boolean
}

const MotionPreferenceContext = createContext(false)

function useMotionPreference() {
  return useContext(MotionPreferenceContext)
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function getKeyboardScrollDelta(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey) return null
  if (event.key === "ArrowDown") return 80
  if (event.key === "PageDown") return window.innerHeight * 0.9
  if (event.key === " " && !event.shiftKey) return window.innerHeight * 0.9
  if (event.key === "End") return Number.POSITIVE_INFINITY

  return null
}

function getProjectHref(projectId: string) {
  return `/work/${projectId}`
}

export function StoryPortfolio({
  contentByLocale,
}: {
  contentByLocale: PortfolioContentByLocale
}) {
  const { locale, setLocale } = useLocale()
  const content = useMemo(() => contentByLocale[locale], [contentByLocale, locale])
  const { author, chapters: contentChapters, fields, projects, ui } = content
  const chapters = useMemo(
    () => contentChapters.filter((chapter) => chapter.id !== "detail"),
    [contentChapters],
  )
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    cover: null,
    about: null,
    fields: null,
    gallery: null,
    detail: null,
  })
  const touchStartYRef = useRef<number | null>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.35,
  })
  const [activeSection, setActiveSection] = useState<SectionId>("cover")
  const [selectedFieldId, setSelectedFieldId] = useState<FieldId | null>(null)
  const [activeFilter, setActiveFilter] = useState(ui.allFilter)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [gateNudgeKey, setGateNudgeKey] = useState(0)

  const gateLocked = selectedFieldId === null
  const lockedSectionIds = gateLocked ? LOCKED_FIELD_GATE_SECTIONS : EMPTY_LOCKED_SECTIONS
  const activeField = selectedFieldId
    ? fields.find((field) => field.id === selectedFieldId) ?? fields[0]
    : null
  const activeProjects = useMemo(
    () =>
      selectedFieldId
        ? projects.filter((project) => project.fieldId === selectedFieldId)
        : [],
    [projects, selectedFieldId],
  )
  const filteredProjects = useMemo(() => {
    if (activeFilter === ui.allFilter) return activeProjects
    return activeProjects.filter((project) => project.category === activeFilter)
  }, [activeFilter, activeProjects, ui.allFilter])
  const selectedProject = selectedProjectId
    ? projects.find((project) => project.id === selectedProjectId) ??
      activeProjects[0] ??
      null
    : activeProjects[0] ?? null

  useEffect(() => {
    setActiveFilter(ui.allFilter)
  }, [ui.allFilter])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        const sectionId = visible?.target.getAttribute("data-section-id")
        if (sectionId) setActiveSection(sectionId as SectionId)
      },
      {
        rootMargin: "-28% 0px -52% 0px",
        threshold: [0.12, 0.28, 0.45, 0.62],
      },
    )

    chapters.forEach((chapter) => {
      const node = sectionRefs.current[chapter.id]
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [chapters])

  const setSectionRef = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node
  }

  const nudgeGate = useCallback(() => {
    setGateNudgeKey((key) => key + 1)
  }, [])

  const getGateLimit = useCallback(() => {
    const fields = sectionRefs.current.fields
    if (!fields) return null

    const gallery = sectionRefs.current.gallery
    const fieldsTop = fields.getBoundingClientRect().top + window.scrollY
    const nextTop = gallery
      ? gallery.getBoundingClientRect().top + window.scrollY
      : fieldsTop + fields.offsetHeight

    return Math.max(fieldsTop, nextTop - window.innerHeight + 1)
  }, [])

  const setScrollPosition = useCallback((top: number) => {
    const lenis = getLenis()

    lenis?.scrollTo(top, { immediate: true, force: true })
    window.scrollTo({ top, behavior: "auto" })
  }, [])

  const jumpToFieldsGate = useCallback(
    (shouldNudge = true) => {
      const node = sectionRefs.current.fields
      if (!node) return

      setActiveSection("fields")
      if (shouldNudge) nudgeGate()

      setScrollPosition(node.getBoundingClientRect().top + window.scrollY)
    },
    [nudgeGate, setScrollPosition],
  )

  const scrollTo = useCallback(
    (id: SectionId, options: ScrollToOptions = {}) => {
      if (gateLocked && LOCKED_FIELD_GATE_SECTIONS.has(id) && !options.force) {
        jumpToFieldsGate()
        return
      }

      const node = sectionRefs.current[id]
      if (!node) return

      setActiveSection(id)

      const lenis = getLenis()

      if (lenis && !reducedMotion) {
        lenis.scrollTo(node, {
          offset: 0,
          force: options.force,
          immediate: options.immediate,
        })
        return
      }

      node.scrollIntoView({
        behavior: reducedMotion || options.immediate ? "auto" : "smooth",
      })
    },
    [gateLocked, jumpToFieldsGate, reducedMotion],
  )

  useEffect(() => {
    if (!gateLocked) return

    let frameId: number | undefined
    let didNudgeGate = false

    const shouldIgnoreTarget = (target: EventTarget | null) => {
      return target instanceof HTMLElement && Boolean(target.closest("[data-scroll-gate-ignore]"))
    }

    const clampToGateLimit = (gateLimit: number, shouldNudge = false) => {
      setActiveSection("fields")
      setScrollPosition(gateLimit)

      if (shouldNudge && !didNudgeGate) {
        nudgeGate()
        didNudgeGate = true
      }
    }

    const blockDownwardIntent = (deltaY: number, event?: Event) => {
      if (deltaY <= 0) return false

      const gateLimit = getGateLimit()
      if (gateLimit === null || window.scrollY + deltaY < gateLimit) return false

      if (event?.cancelable) event.preventDefault()
      clampToGateLimit(gateLimit, true)
      return true
    }

    const onWheel = (event: WheelEvent) => {
      if (shouldIgnoreTarget(event.target)) return
      blockDownwardIntent(event.deltaY, event)
    }

    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null
    }

    const onTouchMove = (event: TouchEvent) => {
      if (shouldIgnoreTarget(event.target)) return

      const currentY = event.touches[0]?.clientY
      const startY = touchStartYRef.current
      if (currentY === undefined || startY === null) return

      blockDownwardIntent(startY - currentY, event)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return

      const deltaY = getKeyboardScrollDelta(event)
      if (deltaY === null) return

      blockDownwardIntent(deltaY, event)
    }

    const clampPastGate = () => {
      const gateLimit = getGateLimit()

      if (gateLimit !== null && window.scrollY > gateLimit + 2) {
        clampToGateLimit(gateLimit, true)
      }
    }

    const onScroll = () => {
      if (frameId !== undefined) return

      frameId = window.requestAnimationFrame(() => {
        frameId = undefined
        clampPastGate()
      })
    }

    window.addEventListener("wheel", onWheel, { capture: true, passive: false })
    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true })
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: false })
    window.addEventListener("keydown", onKeyDown, { capture: true })
    window.addEventListener("scroll", onScroll, { passive: true })

    clampPastGate()

    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true })
      window.removeEventListener("touchstart", onTouchStart, { capture: true })
      window.removeEventListener("touchmove", onTouchMove, { capture: true })
      window.removeEventListener("keydown", onKeyDown, { capture: true })
      window.removeEventListener("scroll", onScroll)

      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [gateLocked, getGateLimit, nudgeGate, setScrollPosition])

  const selectField = (fieldId: FieldId) => {
    const firstProject = projects.find((project) => project.fieldId === fieldId)
    if (!firstProject) return

    setSelectedFieldId(fieldId)
    setActiveFilter(ui.allFilter)
    setSelectedProjectId(firstProject.id)
    window.setTimeout(() => scrollTo("gallery", { force: true }), 90)
  }

  return (
    <MotionPreferenceContext.Provider value={reducedMotion}>
      <div className="story-texture min-h-screen overflow-x-clip">
        <LocaleToggle
          locale={locale}
          ariaLabel={ui.languageToggleAria}
          onLocaleChange={setLocale}
          className="fixed left-4 top-4 z-[60]"
        />
        <ProgressRail
          chapters={chapters}
          ui={ui}
          activeSection={activeSection}
          lockedSectionIds={lockedSectionIds}
          onJump={scrollTo}
          progress={reducedMotion ? scrollYProgress : smoothProgress}
        />
        <MobileChapterBar
          chapters={chapters}
          ui={ui}
          activeSection={activeSection}
          lockedSectionIds={lockedSectionIds}
          onJump={scrollTo}
          progress={reducedMotion ? scrollYProgress : smoothProgress}
        />

        <main className="pb-24 lg:px-[5.5rem] lg:pb-0">
          <CoverAboutTransition
            author={author}
            ui={ui}
            coverRefSetter={setSectionRef("cover")}
            aboutRefSetter={setSectionRef("about")}
            onNext={() => scrollTo("about")}
            onAboutNext={() => scrollTo("fields")}
          />
          <FieldsSection
            fields={fields}
            ui={ui}
            refSetter={setSectionRef("fields")}
            selectedFieldId={selectedFieldId}
            gateLocked={gateLocked}
            gateNudgeKey={gateNudgeKey}
            onSelectField={selectField}
          />
          <GallerySection
            ui={ui}
            refSetter={setSectionRef("gallery")}
            activeField={activeField}
            activeFilter={activeFilter}
            filteredProjects={filteredProjects}
            selectedProjectId={selectedProject?.id ?? null}
            onBack={() => scrollTo("fields")}
            onFilter={setActiveFilter}
            onChooseField={() => scrollTo("fields", { immediate: true })}
          />
        </main>
      </div>
    </MotionPreferenceContext.Provider>
  )
}

function CoverAboutTransition({
  author,
  ui,
  coverRefSetter,
  aboutRefSetter,
  onNext,
  onAboutNext,
}: {
  author: Author
  ui: PortfolioUi
  coverRefSetter: (node: HTMLElement | null) => void
  aboutRefSetter: (node: HTMLElement | null) => void
  onNext: () => void
  onAboutNext: () => void
}) {
  const reducedMotion = useMotionPreference()
  const stageRef = useRef<HTMLElement | null>(null)
  const [coverInteractive, setCoverInteractive] = useState(true)
  const [aboutInteractive, setAboutInteractive] = useState(false)
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  })
  const stageProgress = useSpring(scrollYProgress, {
    stiffness: 74,
    damping: 28,
    mass: 0.48,
  })
  const bookScale = useTransform(stageProgress, [0, 0.16, 0.82], [1, 0.965, 0.965])
  const bookRadius = useTransform(stageProgress, [0, 0.16], ["0px", "14px"])
  const bookShadow = useTransform(
    stageProgress,
    [0, 0.16, 0.82],
    [
      "0 0 0 rgba(48, 34, 18, 0)",
      "0 24px 80px rgba(48, 34, 18, 0.24)",
      "0 18px 60px rgba(48, 34, 18, 0.14)",
    ],
  )
  const bookInteriorOpacity = useTransform(
    stageProgress,
    [0, 0.12, 0.68, 0.82],
    [0, 0.96, 0.82, 0],
  )
  const leftX = useTransform(
    stageProgress,
    [0.12, 0.68, 0.82, 0.96],
    ["0vw", "-40vw", "-58vw", "-64vw"],
  )
  const rightX = useTransform(
    stageProgress,
    [0.12, 0.68, 0.82, 0.96],
    ["0vw", "40vw", "58vw", "64vw"],
  )
  const leftRotateY = useTransform(
    stageProgress,
    [0.12, 0.68, 0.82, 0.96],
    ["0deg", "-24deg", "-18deg", "-12deg"],
  )
  const rightRotateY = useTransform(
    stageProgress,
    [0.12, 0.68, 0.82, 0.96],
    ["0deg", "24deg", "18deg", "12deg"],
  )
  const panelOpacity = useTransform(stageProgress, [0, 0.68, 0.82, 0.96], [1, 1, 0.2, 0.06])
  const panelShadow = useTransform(stageProgress, [0, 0.12, 0.68], [0, 0.12, 0.44])
  const insideCoverOpacity = useTransform(
    stageProgress,
    [0.12, 0.5, 0.72, 0.86],
    [0, 0.26, 0.36, 0.08],
  )
  const spineOpacity = useTransform(
    stageProgress,
    [0, 0.08, 0.28, 0.68, 0.8],
    [0, 0.45, 1, 0.66, 0],
  )
  const controlsOpacity = useTransform(stageProgress, [0, 0.18, 0.36], [1, 0.75, 0])
  const controlsY = useTransform(stageProgress, [0, 0.36], [0, 18])
  const aboutOpacity = useTransform(stageProgress, [0.28, 0.66, 0.82], [0, 0.72, 1])
  const aboutScale = useTransform(stageProgress, [0.28, 0.82], [0.96, 1])
  const aboutY = useTransform(stageProgress, [0.28, 0.82], [34, 0])

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (reducedMotion) return

    setCoverInteractive((current) => {
      const next = latest < 0.42
      return current === next ? current : next
    })
    setAboutInteractive((current) => {
      const next = latest > 0.56
      return current === next ? current : next
    })
  })

  if (reducedMotion) {
    return (
      <div className="relative left-1/2 w-screen -translate-x-1/2">
        <section
          ref={coverRefSetter}
          data-section-id="cover"
          className="relative min-h-[var(--screen)] overflow-hidden bg-paper"
        >
          <StaticFullBleedCover ui={ui} onNext={onNext} />
        </section>
        <section
          ref={aboutRefSetter}
          data-section-id="about"
          className="relative flex min-h-[var(--screen)] items-center px-4 pb-32 pt-20 sm:px-6 sm:py-20 lg:px-[8rem]"
        >
          <AboutContent author={author} onExplore={onAboutNext} />
        </section>
      </div>
    )
  }

  return (
    <section
      ref={stageRef}
      className="relative left-1/2 h-[220svh] w-screen -translate-x-1/2 overflow-clip bg-paper"
    >
      <div
        ref={coverRefSetter}
        data-section-id="cover"
        aria-hidden="true"
        className="absolute left-0 top-0 h-[var(--screen)] w-px"
      />
      <div
        ref={aboutRefSetter}
        data-section-id="about"
        aria-hidden="true"
        className="absolute left-0 top-[var(--screen)] h-[var(--screen)] w-px"
      />

      <div className="sticky top-0 h-[var(--screen)] overflow-hidden [perspective:1600px]">
        <motion.div
          className={cn(
            "absolute inset-0 z-10 flex items-center px-4 pb-24 pt-8 sm:px-6 sm:py-14 lg:px-[8rem]",
            aboutInteractive ? "pointer-events-auto" : "pointer-events-none",
          )}
          style={{ opacity: aboutOpacity, scale: aboutScale, y: aboutY }}
        >
          <AboutContent author={author} onExplore={onAboutNext} />
        </motion.div>

        <div
          className={cn(
            "absolute inset-0 z-20",
            coverInteractive ? "pointer-events-auto" : "pointer-events-none",
          )}
          aria-hidden={!coverInteractive}
        >
          <h1 className="sr-only">{ui.cover.title}</h1>
          <p className="sr-only">{ui.cover.description}</p>
          <img
            src={COVER_IMAGE}
            alt={ui.cover.imageAlt}
            className="sr-only"
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 z-20 overflow-hidden [transform-style:preserve-3d]"
            style={{ scale: bookScale, borderRadius: bookRadius, boxShadow: bookShadow }}
          >
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-paper"
              style={{ opacity: bookInteriorOpacity }}
            />
            <SplitCoverPanel
              side="left"
              x={leftX}
              rotateY={leftRotateY}
              opacity={panelOpacity}
              shadowOpacity={panelShadow}
              insideOpacity={insideCoverOpacity}
            />
            <SplitCoverPanel
              side="right"
              x={rightX}
              rotateY={rightRotateY}
              opacity={panelOpacity}
              shadowOpacity={panelShadow}
              insideOpacity={insideCoverOpacity}
            />
            <BookSpine opacity={spineOpacity} />
          </motion.div>
          <motion.div
            className="absolute inset-x-0 bottom-24 z-40 flex flex-col items-center lg:bottom-10"
            style={{
              opacity: controlsOpacity,
              y: controlsY,
              pointerEvents: coverInteractive ? "auto" : "none",
            }}
          >
            <button
              type="button"
              onClick={onNext}
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-paper/70 bg-moss text-paper shadow-story transition hover:-translate-y-1 hover:bg-ink focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper motion-reduce:hover:translate-y-0"
              aria-label={ui.cover.nextAria}
            >
              <ArrowDown className="h-5 w-5" />
            </button>
            <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-paper drop-shadow-[0_2px_8px_rgba(38,52,40,0.55)]">
              {ui.cover.nextLabel}
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function StaticFullBleedCover({ ui, onNext }: { ui: PortfolioUi; onNext: () => void }) {
  return (
    <>
      <h1 className="sr-only">{ui.cover.title}</h1>
      <p className="sr-only">{ui.cover.description}</p>
      <img
        src={COVER_IMAGE}
        alt={ui.cover.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-24 z-10 flex flex-col items-center lg:bottom-10">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-paper/70 bg-moss text-paper shadow-story transition hover:-translate-y-1 hover:bg-ink focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper motion-reduce:hover:translate-y-0"
          aria-label={ui.cover.nextAria}
        >
          <ArrowDown className="h-5 w-5" />
        </button>
        <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-paper drop-shadow-[0_2px_8px_rgba(38,52,40,0.55)]">
          {ui.cover.nextLabel}
        </span>
      </div>
    </>
  )
}

function SplitCoverPanel({
  side,
  x,
  rotateY,
  opacity,
  shadowOpacity,
  insideOpacity,
}: {
  side: "left" | "right"
  x: MotionValue<string>
  rotateY: MotionValue<string>
  opacity: MotionValue<number>
  shadowOpacity: MotionValue<number>
  insideOpacity: MotionValue<number>
}) {
  const left = side === "left"

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "absolute inset-y-0 w-1/2 overflow-hidden bg-paper will-change-transform [backface-visibility:hidden]",
        left ? "left-0 origin-right" : "right-0 origin-left",
      )}
      style={{ x, rotateY, opacity }}
    >
      <img
        src={COVER_IMAGE}
        alt=""
        className={cn(
          "absolute inset-y-0 h-full w-screen max-w-none object-cover",
          left ? "left-0" : "right-0",
        )}
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.12),transparent_42%)]" />
      <motion.div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 w-[56%]",
          left
            ? "right-0 bg-gradient-to-l from-[rgba(246,235,211,0.72)] via-[rgba(246,235,211,0.28)] to-transparent"
            : "left-0 bg-gradient-to-r from-[rgba(246,235,211,0.72)] via-[rgba(246,235,211,0.28)] to-transparent",
        )}
        style={{ opacity: insideOpacity }}
      />
      <motion.div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 w-8",
          left
            ? "right-0 bg-gradient-to-l from-[rgba(255,249,234,0.7)] to-transparent"
            : "left-0 bg-gradient-to-r from-[rgba(255,249,234,0.7)] to-transparent",
        )}
        style={{ opacity: insideOpacity }}
      />
      <motion.div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 w-28",
          left
            ? "right-0 bg-gradient-to-l from-[rgba(45,31,19,0.32)] to-transparent"
            : "left-0 bg-gradient-to-r from-[rgba(45,31,19,0.32)] to-transparent",
        )}
        style={{ opacity: shadowOpacity }}
      />
    </motion.div>
  )
}

function BookSpine({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-1/2 z-30 w-6 -translate-x-1/2 bg-[linear-gradient(90deg,rgba(76,48,29,0.24),rgba(255,248,232,0.72)_22%,rgba(126,89,55,0.36)_50%,rgba(255,248,232,0.72)_78%,rgba(76,48,29,0.24))] shadow-[inset_10px_0_20px_rgba(45,31,19,0.18),inset_-10px_0_20px_rgba(45,31,19,0.18),0_0_34px_rgba(45,31,19,0.22)] sm:w-7"
      style={{ opacity }}
    >
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(255,250,236,0.92)_18%,rgba(255,250,236,0.5)_50%,rgba(255,250,236,0.92)_82%,transparent)]" />
      <span className="absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,248,232,0.34),transparent_68%)]" />
    </motion.div>
  )
}

function AboutContent({
  author,
  onExplore,
}: {
  author: Author
  onExplore: () => void
}) {
  const [headlinePrefix, ...headlineRest] = author.headline.split(author.name)
  const headlineSuffix = headlineRest.join(author.name)
  const openingParagraphs = author.opening ?? []
  const lead = author.body[0]
  const supportingParagraphs = author.body.slice(1)

  return (
    <div className="mx-auto w-full max-w-6xl">
      <OrnamentDivider label="01" />
      <StoryFrame className="grid gap-5 overflow-hidden p-4 sm:gap-8 sm:p-7 lg:grid-cols-[0.82fr_1.18fr] lg:p-7 xl:p-8">
        <div className="relative h-[360px] overflow-hidden rounded-[6px] border border-[rgba(116,63,36,0.24)] bg-paper-deep sm:h-[500px] lg:h-[clamp(455px,66vh,520px)]">
          <DepthImage
            src={author.image}
            alt={author.imageAlt}
            imageClassName="h-full w-full object-cover object-[center_32%]"
          />
        </div>

        <div className="flex flex-col justify-center px-1 py-1 sm:px-4 sm:py-2">
          <span
            aria-hidden="true"
            className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-clay sm:mb-5"
          >
            <PenLine className="h-4 w-4" />
          </span>
          <div className="font-prose max-w-xl space-y-4 text-base leading-8 text-ink/76 sm:text-lg sm:leading-9">
            {openingParagraphs.map((paragraph) => (
              <p key={paragraph}>
                {paragraph}
              </p>
            ))}
            <p className="text-ink/86">
              {author.greeting}{" "}
              {headlinePrefix}
              <span className="font-serif text-[1.18em] font-semibold text-moss">
                {author.name}
              </span>
              {headlineSuffix}
              {lead ? ` - ${lead}` : null}
            </p>
            {supportingParagraphs.map((paragraph) => (
              <p key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onExplore}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-clay px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-paper transition hover:-translate-y-0.5 hover:bg-[#87331f] focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-4 focus:ring-offset-paper motion-reduce:hover:translate-y-0"
            >
              {author.ctas.explore}
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/myth"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(116,63,36,0.28)] bg-paper/45 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-moss transition hover:-translate-y-0.5 hover:border-clay hover:bg-gold/18 focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper motion-reduce:hover:translate-y-0"
            >
              {author.ctas.myth}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </StoryFrame>
    </div>
  )
}

function FieldsSection({
  fields,
  ui,
  refSetter,
  selectedFieldId,
  gateLocked,
  gateNudgeKey,
  onSelectField,
}: {
  fields: Field[]
  ui: PortfolioUi
  refSetter: (node: HTMLElement | null) => void
  selectedFieldId: FieldId | null
  gateLocked: boolean
  gateNudgeKey: number
  onSelectField: (fieldId: FieldId) => void
}) {
  const reducedMotion = useMotionPreference()

  return (
    <section
      ref={refSetter}
      data-section-id="fields"
      className="relative flex min-h-[var(--screen)] items-center px-4 pb-32 pt-20 sm:px-6 sm:py-20 lg:px-10"
    >
      <div className="mx-auto w-full max-w-6xl">
        <OrnamentDivider label="02" />
        <ScrollReveal preset="page-rise" className="mb-8 text-center">
          <h2 className="font-serif text-[clamp(2.3rem,5vw,4.6rem)] font-semibold text-clay">
            {ui.fields.heading}
          </h2>
          <p className="font-prose mx-auto mt-3 max-w-xl text-balance text-sm leading-7 text-ink/72 sm:text-base">
            {ui.fields.body}
          </p>
        </ScrollReveal>

        <RevealGroup className="grid gap-5 lg:grid-cols-2" preset="card-cascade" stagger={0.12}>
          {fields.map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              active={field.id === selectedFieldId}
              onSelect={() => onSelectField(field.id)}
            />
          ))}
        </RevealGroup>
        <ScrollReveal preset="page-rise" delay={0.16}>
          <motion.div
            key={gateNudgeKey}
            className={cn(
              "mt-8 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]",
              gateLocked ? "text-clay" : "text-ink/62",
            )}
            initial={false}
            animate={
              reducedMotion || gateNudgeKey === 0
                ? undefined
                : { scale: [1, 1.035, 1], y: [0, -3, 0] }
            }
            transition={{ duration: 0.45, ease: REVEAL_EASE }}
          >
            <Feather className="h-4 w-4" />
            {gateLocked ? ui.fields.lockedPrompt : ui.fields.unlockedPrompt}
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  )
}

function GallerySection({
  ui,
  refSetter,
  activeField,
  activeFilter,
  filteredProjects,
  selectedProjectId,
  onBack,
  onFilter,
  onChooseField,
}: {
  ui: PortfolioUi
  refSetter: (node: HTMLElement | null) => void
  activeField: Field | null
  activeFilter: string
  filteredProjects: Project[]
  selectedProjectId: string | null
  onBack: () => void
  onFilter: (filter: string) => void
  onChooseField: () => void
}) {
  if (!activeField) {
    return (
      <section
        ref={refSetter}
        data-section-id="gallery"
        className="relative flex min-h-[var(--screen)] items-center px-4 pb-32 pt-20 sm:px-6 sm:py-20 lg:px-10"
      >
        <LockedChapterPanel
          eyebrow={ui.gallery.lockedEyebrow}
          title={ui.gallery.lockedTitle}
          body={ui.gallery.lockedBody}
          actionLabel={ui.gallery.lockedAction}
          onAction={onChooseField}
        />
      </section>
    )
  }

  const filters = [ui.allFilter, ...activeField.filters]

  return (
    <section
      ref={refSetter}
      data-section-id="gallery"
      className="relative min-h-[var(--screen)] px-4 pb-32 pt-20 sm:px-6 sm:py-20 lg:px-10"
    >
      <ScrollReveal
        preset="page-rise"
        amount={0.16}
        className="mx-auto w-full max-w-6xl overflow-hidden rounded-[10px] bg-moss text-paper shadow-story"
      >
        <div className="relative p-5 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 opacity-[0.09] [background-image:linear-gradient(45deg,#f5dfaa_1px,transparent_1px),linear-gradient(-45deg,#f5dfaa_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="relative">
            <ScrollReveal
              preset="page-rise"
              delay={0.06}
              className="mb-7 flex flex-col gap-5 border-b border-paper/18 pb-6 md:flex-row md:items-end md:justify-between"
            >
              <div>
                <button
                  type="button"
                  onClick={onBack}
                  className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold transition hover:text-paper focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {ui.gallery.back}
                </button>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
                  {ui.gallery.eyebrow}
                </p>
                <h2 className="mt-2 font-serif text-[clamp(2.4rem,5vw,5rem)] font-semibold leading-none">
                  {activeField.title}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => onFilter(filter)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition focus:outline-none focus:ring-2 focus:ring-gold",
                      filter === activeFilter
                        ? "border-gold bg-gold text-moss"
                        : "border-paper/22 text-paper/76 hover:border-gold hover:text-paper",
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </ScrollReveal>

            <RevealGroup
              key={`${activeField.id}-${activeFilter}`}
              className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3"
              itemClassName="h-full"
              preset="card-cascade"
              stagger={0.055}
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  ui={ui}
                  field={activeField}
                  project={project}
                  active={project.id === selectedProjectId}
                  href={getProjectHref(project.id)}
                />
              ))}
            </RevealGroup>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

function DetailSection({
  ui,
  refSetter,
  field,
  project,
  onBack,
  onChooseField,
  onTop,
}: {
  ui: PortfolioUi
  refSetter: (node: HTMLElement | null) => void
  field: Field | null
  project: Project | null
  onBack: () => void
  onChooseField: () => void
  onTop: () => void
}) {
  if (!field || !project) {
    return (
      <section
        ref={refSetter}
        data-section-id="detail"
        className="relative flex min-h-[var(--screen)] items-center px-4 pb-32 pt-20 sm:px-6 sm:py-20 lg:px-10"
      >
        <LockedChapterPanel
          eyebrow={ui.detail.lockedEyebrow}
          title={ui.detail.lockedTitle}
          body={ui.detail.lockedBody}
          actionLabel={ui.detail.lockedAction}
          onAction={onChooseField}
        />
      </section>
    )
  }

  if (project.media) {
    return (
      <MediaProjectDetailSection
        ui={ui}
        refSetter={refSetter}
        project={project}
        onBack={onBack}
        onTop={onTop}
      />
    )
  }

  return (
    <section
      ref={refSetter}
      data-section-id="detail"
      className="relative flex min-h-[var(--screen)] items-center px-4 pb-32 pt-20 sm:px-6 sm:py-20 lg:px-10"
    >
      <div className="mx-auto w-full max-w-6xl">
        <ScrollReveal key={project.id} preset="page-rise" amount={0.16}>
          <StoryFrame className="overflow-hidden p-5 sm:p-7 lg:p-9">
            <ScrollReveal
              preset="page-rise"
              className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(116,63,36,0.18)] pb-5"
            >
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-clay transition hover:text-moss focus:outline-none focus:ring-2 focus:ring-clay"
              >
                <ArrowLeft className="h-4 w-4" />
                {ui.detail.back}
              </button>
              <button
                type="button"
                onClick={onTop}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(116,63,36,0.28)] text-moss transition hover:bg-moss hover:text-paper focus:outline-none focus:ring-2 focus:ring-clay"
                aria-label={ui.detail.topAria}
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </ScrollReveal>

            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
              <article className="flex flex-col justify-between">
                <div>
                  <ScrollReveal preset="page-rise" delay={0.06}>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay">
                      {field.title}
                    </p>
                    <h2 className="mt-3 font-serif text-[clamp(2.7rem,6vw,6rem)] font-semibold leading-[0.92] text-moss">
                      {project.title}
                    </h2>
                  </ScrollReveal>
                  <RevealGroup
                    className="mt-6 grid gap-3 text-sm text-ink/72 sm:grid-cols-3"
                    preset="card-cascade"
                    stagger={0.065}
                  >
                    <MetaBlock label={ui.detail.client} value={project.client} />
                    <MetaBlock label={ui.detail.year} value={project.year} />
                    <MetaBlock label={ui.detail.scope} value={project.scope.join(", ")} />
                  </RevealGroup>
                  <ScrollReveal preset="page-rise" delay={0.14}>
                    <p className="font-prose mt-7 text-base leading-8 text-ink/82 sm:text-lg">
                      {project.overview}
                    </p>
                  </ScrollReveal>
                </div>

                <RevealGroup className="mt-8 grid gap-5 sm:grid-cols-2" stagger={0.08}>
                  <CaseNote title={ui.detail.objective} body={project.objective} />
                  <CaseNote title={ui.detail.solution} body={project.solution} />
                </RevealGroup>
              </article>

              <div className="space-y-5">
                <ScrollReveal
                  preset="image-depth"
                  className="relative aspect-[4/3] overflow-hidden rounded-[7px] border border-[rgba(116,63,36,0.26)] bg-paper-deep shadow-insetpaper"
                >
                  <DepthPanel className="absolute inset-0">
                    <ThumbnailArt field={field} project={project} className="absolute inset-0" />
                  </DepthPanel>
                </ScrollReveal>
                <ScrollReveal
                  preset="page-rise"
                  delay={0.12}
                  className="rounded-[7px] border border-[rgba(116,63,36,0.2)] bg-[rgba(255,247,226,0.55)] p-5"
                >
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
                </ScrollReveal>
              </div>
            </div>
          </StoryFrame>
        </ScrollReveal>
      </div>
    </section>
  )
}

function MediaProjectDetailSection({
  ui,
  refSetter,
  project,
  onBack,
  onTop,
}: {
  ui: PortfolioUi
  refSetter: (node: HTMLElement | null) => void
  project: Project
  onBack: () => void
  onTop: () => void
}) {
  const media = project.media
  const slides = media?.proposalSlides ?? []
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const activeSlide = slides[activeSlideIndex]

  useEffect(() => {
    setActiveSlideIndex(0)
  }, [project.id])

  const goToSlide = useCallback(
    (direction: number) => {
      if (slides.length <= 1) return

      setActiveSlideIndex((index) => (index + direction + slides.length) % slides.length)
    },
    [slides.length],
  )

  const onCarouselKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return

    event.preventDefault()
    goToSlide(event.key === "ArrowLeft" ? -1 : 1)
  }

  if (!media) return null

  return (
    <section
      ref={refSetter}
      data-section-id="detail"
      className="relative min-h-[var(--screen)] px-4 pb-32 pt-20 sm:px-6 sm:py-20 lg:px-10"
    >
      <div className="mx-auto w-full max-w-7xl">
        <ScrollReveal
          preset="page-rise"
          className="mb-5 flex flex-wrap items-center justify-between gap-4"
        >
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-clay transition hover:text-moss focus:outline-none focus:ring-2 focus:ring-clay"
          >
            <ArrowLeft className="h-4 w-4" />
            {ui.detail.back}
          </button>
          <button
            type="button"
            onClick={onTop}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(116,63,36,0.28)] bg-paper/70 text-moss transition hover:bg-moss hover:text-paper focus:outline-none focus:ring-2 focus:ring-clay"
            aria-label={ui.detail.topAria}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </ScrollReveal>

        <article className="space-y-10 sm:space-y-14">
          <ScrollReveal key={`${project.id}-cover`} preset="image-depth" amount={0.14}>
            <ProjectMediaImage
              asset={media.cover}
              eager
              className="relative left-1/2 w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden bg-ink sm:w-[calc(100vw-3rem)] lg:w-[min(calc(100vw-6rem),1440px)]"
              imageClassName="h-full w-full object-contain"
            />
          </ScrollReveal>

          <ScrollReveal preset="page-rise" amount={0.16}>
            <p className="font-prose mx-auto max-w-4xl border-l-4 border-clay bg-paper/72 px-5 py-4 text-base leading-7 text-ink/82 shadow-[0_14px_36px_rgba(45,32,21,0.1)] sm:px-6 sm:py-5 sm:text-lg">
              {project.overview}
            </p>
          </ScrollReveal>

          {media.summary ? (
            <ScrollReveal preset="page-rise" amount={0.12}>
              <ProjectMediaImage
                asset={media.summary}
                className="relative left-1/2 w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden bg-paper sm:w-[calc(100vw-3rem)] lg:w-[min(calc(100vw-6rem),1440px)]"
                imageClassName="h-full w-full object-contain"
              />
            </ScrollReveal>
          ) : null}

          {activeSlide ? (
            <ScrollReveal preset="page-rise" amount={0.12}>
              <div
                className="relative left-1/2 w-[calc(100vw-2rem)] -translate-x-1/2 focus:outline-none sm:w-[calc(100vw-3rem)] lg:w-[min(calc(100vw-10rem),1440px)] xl:w-[min(calc(100vw-18rem),1440px)]"
                role="region"
                aria-label={`${project.title} ${ui.detail.proposalCarousel}`}
                aria-roledescription="carousel"
                tabIndex={0}
                onKeyDown={onCarouselKeyDown}
                data-scroll-gate-ignore
              >
                <div className="mx-auto mb-4 flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-clay">
                    {ui.detail.proposal}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/58">
                    {activeSlideIndex + 1} / {slides.length}
                  </p>
                </div>

                <div className="relative">
                  <ProjectMediaImage
                    asset={activeSlide}
                    className="flex w-full items-center justify-center overflow-hidden bg-paper"
                    imageClassName="h-full w-full object-contain"
                  />

                  {slides.length > 1 ? (
                    <div className="mt-4 flex items-center justify-center gap-3 xl:pointer-events-none xl:absolute xl:inset-y-0 xl:-left-16 xl:-right-16 xl:mt-0 xl:justify-between">
                      <CarouselButton label={ui.detail.previousSlide} onClick={() => goToSlide(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                      </CarouselButton>
                      <CarouselButton label={ui.detail.nextSlide} onClick={() => goToSlide(1)}>
                        <ArrowRight className="h-4 w-4" />
                      </CarouselButton>
                    </div>
                  ) : null}
                </div>

                {slides.length > 1 ? (
                  <div className="mt-5 flex items-center justify-center gap-2">
                    {slides.map((slide, index) => (
                      <button
                        key={slide.src}
                        type="button"
                        onClick={() => setActiveSlideIndex(index)}
                        className={cn(
                          "h-2.5 rounded-full transition focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper",
                          index === activeSlideIndex ? "w-8 bg-clay" : "w-2.5 bg-ink/24 hover:bg-clay/65",
                        )}
                        aria-label={`${ui.detail.showProposalSlide} ${index + 1}`}
                        aria-current={index === activeSlideIndex ? "true" : undefined}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </ScrollReveal>
          ) : null}
        </article>
      </div>
    </section>
  )
}

function ProjectMediaImage({
  asset,
  className,
  imageClassName,
  eager = false,
  preserveAspect = true,
}: {
  asset: ProjectMediaAsset
  className?: string
  imageClassName?: string
  eager?: boolean
  preserveAspect?: boolean
}) {
  const style = preserveAspect
    ? ({
        aspectRatio: `${asset.width} / ${asset.height}`,
      } satisfies CSSProperties)
    : undefined

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

function LockedChapterPanel({
  eyebrow,
  title,
  body,
  actionLabel,
  onAction,
}: {
  eyebrow: string
  title: string
  body: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <ScrollReveal preset="page-rise" amount={0.18}>
        <StoryFrame className="p-7 text-center sm:p-10">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/55 bg-gold/12 text-clay">
            <Lock className="h-5 w-5" />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-clay">
            {eyebrow}
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-serif text-[clamp(2.4rem,6vw,4.8rem)] font-semibold leading-none text-moss">
            {title}
          </h2>
          <p className="font-prose mx-auto mt-5 max-w-xl text-base leading-8 text-ink/72">
            {body}
          </p>
          <button
            type="button"
            onClick={onAction}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-clay px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-paper transition hover:-translate-y-0.5 hover:bg-[#87331f] focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-4 focus:ring-offset-paper motion-reduce:hover:translate-y-0"
          >
            <ArrowLeft className="h-4 w-4" />
            {actionLabel}
          </button>
        </StoryFrame>
      </ScrollReveal>
    </div>
  )
}

function ProgressRail({
  chapters,
  ui,
  activeSection,
  lockedSectionIds,
  onJump,
  progress,
}: {
  chapters: Chapter[]
  ui: PortfolioUi
  activeSection: SectionId
  lockedSectionIds: ReadonlySet<SectionId>
  onJump: (section: SectionId) => void
  progress: MotionValue<number>
}) {
  return (
    <nav
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
      aria-label={ui.progress.aria}
    >
      <div className="relative flex flex-col items-end gap-2 rounded-full border border-[rgba(116,63,36,0.18)] bg-paper/76 px-2 py-3 shadow-story backdrop-blur-xl">
        <span
          aria-hidden="true"
          className="absolute right-[18px] top-5 h-[calc(100%-2.5rem)] w-px overflow-hidden rounded-full bg-[rgba(116,63,36,0.18)]"
        >
          <motion.span
            className="block h-full w-full origin-top bg-clay"
            style={{ scaleY: progress }}
          />
        </span>
        {chapters.map((chapter) => {
          const active = chapter.id === activeSection
          const locked = lockedSectionIds.has(chapter.id)

          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => onJump(chapter.id)}
              className={cn(
                "group relative flex h-8 items-center justify-end focus:outline-none",
                locked && "cursor-not-allowed",
              )}
              aria-label={
                locked
                  ? `${chapter.title} ${ui.progress.lockedAria}`
                  : `${ui.progress.goToPrefix} ${chapter.title}`
              }
              data-locked={locked || undefined}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "pointer-events-none absolute right-9 max-w-[12rem] translate-x-1 rounded-full border border-[rgba(116,63,36,0.18)] bg-paper/92 px-3 py-1.5 text-right text-[10px] font-bold uppercase tracking-[0.16em] text-ink/76 opacity-0 shadow-sm transition group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                  active && "text-clay",
                  locked && "text-ink/45",
                )}
              >
                {chapter.number} · {chapter.title}
                {locked ? ` · ${ui.progress.lockedHint}` : ""}
              </span>
              <span
                className={cn(
                  "relative z-10 flex h-5 w-5 items-center justify-center rounded-full border bg-paper transition group-focus-visible:ring-2 group-focus-visible:ring-clay group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-paper",
                  locked
                    ? "border-[rgba(116,63,36,0.18)] text-ink/30"
                    : active
                      ? "border-clay text-clay shadow-[0_0_0_5px_rgba(165,66,47,0.12)]"
                      : "border-[rgba(116,63,36,0.32)] text-ink/35 group-hover:border-clay",
                )}
              >
                {locked ? (
                  <Lock className="h-2.5 w-2.5" />
                ) : (
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full transition",
                      active ? "scale-100 bg-clay" : "scale-75 bg-gold/45",
                    )}
                  />
                )}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function MobileChapterBar({
  chapters,
  ui,
  activeSection,
  lockedSectionIds,
  onJump,
  progress,
}: {
  chapters: Chapter[]
  ui: PortfolioUi
  activeSection: SectionId
  lockedSectionIds: ReadonlySet<SectionId>
  onJump: (section: SectionId) => void
  progress: MotionValue<number>
}) {
  const activeChapter = chapters.find((chapter) => chapter.id === activeSection) ?? chapters[0]

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 overflow-hidden rounded-full border border-[rgba(116,63,36,0.22)] bg-paper/88 px-3 py-2 shadow-story backdrop-blur-xl lg:hidden">
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-clay"
        style={{ scaleX: progress }}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-[4rem] rounded-full bg-moss px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-paper">
          {activeChapter.number}
        </span>
        <div className="flex flex-1 items-center justify-center gap-2">
          {chapters.map((chapter) => {
            const active = chapter.id === activeSection
            const locked = lockedSectionIds.has(chapter.id)

            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => onJump(chapter.id)}
                className={cn(
                  "h-2.5 rounded-full transition focus:outline-none focus:ring-2 focus:ring-clay",
                  active ? "w-8 bg-clay" : "w-2.5",
                  locked ? "bg-ink/12 ring-1 ring-ink/10" : !active && "bg-ink/22",
                )}
                aria-label={
                  locked
                    ? `${chapter.title} ${ui.progress.lockedAria}`
                    : `${ui.progress.goToPrefix} ${chapter.title}`
                }
                data-locked={locked || undefined}
                aria-current={active ? "step" : undefined}
              />
            )
          })}
        </div>
        <span className="min-w-[4rem] truncate text-right text-xs font-bold uppercase tracking-[0.12em] text-ink/70">
          {activeChapter.label}
        </span>
      </div>
    </nav>
  )
}

function getRevealVariants(preset: RevealPreset, delay: number) {
  const transition = { duration: 0.68, ease: REVEAL_EASE, delay }

  if (preset === "card-cascade") {
    return {
      hidden: { opacity: 0, y: 22, scale: 0.985, filter: "blur(8px)" },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { ...transition, duration: 0.58 },
      },
    }
  }

  if (preset === "image-depth") {
    return {
      hidden: { opacity: 0, y: 18, scale: 1.025, filter: "blur(10px)" },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { ...transition, duration: 0.78 },
      },
    }
  }

  if (preset === "ink-line") {
    return {
      hidden: { opacity: 0, scaleX: 0 },
      visible: {
        opacity: 1,
        scaleX: 1,
        transition: { ...transition, duration: 0.7 },
      },
    }
  }

  return {
    hidden: { opacity: 0, y: 30, filter: "blur(9px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition,
    },
  }
}

function ScrollReveal({
  children,
  className,
  preset = "page-rise",
  delay = 0,
  once = true,
  amount = 0.24,
}: {
  children: React.ReactNode
  className?: string
  preset?: RevealPreset
  delay?: number
  once?: boolean
  amount?: number
}) {
  const reducedMotion = useMotionPreference()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={cn("will-change-transform", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: "0px 0px -12% 0px" }}
      variants={getRevealVariants(preset, delay)}
    >
      {children}
    </motion.div>
  )
}

function RevealGroup({
  children,
  className,
  itemClassName,
  preset = "page-rise",
  stagger = 0.08,
}: {
  children: React.ReactNode
  className?: string
  itemClassName?: string
  preset?: RevealPreset
  stagger?: number
}) {
  return (
    <div className={className}>
      {Children.toArray(children).map((child, index) => (
        <ScrollReveal key={index} preset={preset} delay={index * stagger} className={itemClassName}>
          {child}
        </ScrollReveal>
      ))}
    </div>
  )
}

function DepthImage({
  src,
  alt,
  className,
  imageClassName,
}: {
  src: string
  alt: string
  className?: string
  imageClassName?: string
}) {
  const reducedMotion = useMotionPreference()
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [-16, 16])
  const scale = useTransform(scrollYProgress, [0, 1], reducedMotion ? [1, 1] : [1.035, 1.01])

  return (
    <div ref={ref} className={cn("h-full w-full overflow-hidden", className)}>
      <motion.img
        src={src}
        alt={alt}
        className={imageClassName}
        style={reducedMotion ? undefined : { y, scale }}
      />
    </div>
  )
}

function DepthPanel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reducedMotion = useMotionPreference()
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [-12, 12])
  const scale = useTransform(scrollYProgress, [0, 1], reducedMotion ? [1, 1] : [1.035, 1.015])

  return (
    <motion.div
      ref={ref}
      className={className}
      style={reducedMotion ? undefined : { y, scale }}
    >
      {children}
    </motion.div>
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

function OrnamentDivider({ label }: { label: string }) {
  const reducedMotion = useMotionPreference()
  const lineMotion = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, scaleX: 0 },
        whileInView: { opacity: 1, scaleX: 1 },
        viewport: { once: true, amount: 0.8 },
        transition: { duration: 0.75, ease: REVEAL_EASE },
      }
  const labelMotion = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.8 },
        transition: { duration: 0.55, ease: REVEAL_EASE, delay: 0.08 },
      }

  return (
    <div className="mb-8 flex items-center justify-center gap-4 text-clay">
      <motion.span className="h-px w-16 origin-right bg-gold/45" {...lineMotion} />
      <motion.span
        className="rounded-full border border-gold/45 bg-gold/18 px-3 py-1 font-serif text-sm font-bold"
        {...labelMotion}
      >
        {label}
      </motion.span>
      <motion.span className="h-px w-16 origin-left bg-gold/45" {...lineMotion} />
    </div>
  )
}

function FieldCard({
  field,
  active,
  onSelect,
}: {
  field: Field
  active: boolean
  onSelect: () => void
}) {
  const clay = field.accent === "clay"

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "group story-frame relative min-h-[360px] w-full overflow-hidden rounded-[10px] text-left shadow-story transition duration-300 focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper sm:aspect-[4/3] motion-reduce:hover:translate-y-0",
        active
          ? "scale-[1.01] ring-1 ring-gold/55"
          : "hover:-translate-y-1",
      )}
    >
      <img
        src={field.image}
        alt={field.imageAlt}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
      />
      <div
        className={cn(
          "absolute inset-0",
          clay
            ? "bg-[linear-gradient(90deg,rgba(105,37,25,0.91),rgba(126,45,30,0.48)_48%,rgba(246,235,211,0.08))]"
            : "bg-[linear-gradient(90deg,rgba(16,48,33,0.93),rgba(22,55,38,0.44)_50%,rgba(246,235,211,0.08))]",
        )}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(246,235,211,0.16),transparent_32%),linear-gradient(180deg,rgba(32,24,16,0.04),rgba(32,24,16,0.28))]" />
      <div className="relative z-10 flex min-h-[360px] flex-col justify-between p-6 text-paper sm:p-8">
        <div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/70 bg-paper/10 text-gold">
            {clay ? <ScrollText className="h-5 w-5" /> : <Feather className="h-5 w-5" />}
          </span>
          <h3 className="mt-7 max-w-[12ch] font-serif text-[clamp(2.35rem,4.25vw,3.9rem)] font-semibold leading-none">
            {field.title}
          </h3>
          <p className="mt-3 max-w-sm text-xs font-bold uppercase tracking-[0.18em] text-gold">
            ({field.subtitle})
          </p>
          <p className="font-prose mt-5 max-w-sm text-base leading-7 text-paper/84">
            {field.description}
          </p>
        </div>
        <div className="flex items-center justify-end gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/70 text-gold transition group-hover:translate-x-1 group-hover:bg-gold group-hover:text-moss">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </button>
  )
}

function ProjectCard({
  ui,
  field,
  project,
  active,
  href,
}: {
  ui: PortfolioUi
  field: Field
  project: Project
  active: boolean
  href: string
}) {
  const coverFocalPoint = project.media?.cover.focalPoint ?? { x: 50, y: 50 }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex h-[25rem] w-full flex-col overflow-hidden rounded-[8px] border bg-paper text-left text-ink shadow-[0_18px_45px_rgba(20,28,20,0.18)] transition duration-300 focus:outline-none focus:ring-2 focus:ring-gold motion-reduce:hover:translate-y-0",
        active
          ? "border-gold shadow-[0_22px_55px_rgba(176,108,51,0.24)]"
          : "border-paper/35 hover:-translate-y-1 hover:border-gold/70",
      )}
    >
      <div className={cn("relative aspect-[16/10] overflow-hidden", project.media?.cover ? "bg-[#5bae31]" : "bg-paper-deep")}>
        {project.media?.cover ? (
          <img
            src={project.media.cover.src}
            alt={project.media.cover.alt}
            width={project.media.cover.width}
            height={project.media.cover.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
            style={{ objectPosition: `${coverFocalPoint.x}% ${coverFocalPoint.y}%` }}
          />
        ) : (
          <ThumbnailArt field={field} project={project} className="absolute inset-0 transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100" />
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-5">
        <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-clay">
          {project.eyebrow}
        </p>
        <h3 className="mt-2 shrink-0 overflow-hidden font-serif text-2xl font-semibold leading-tight text-moss [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
          {project.title}
        </h3>
        <p className="font-prose mt-2 shrink-0 overflow-hidden text-sm leading-6 text-ink/72 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
          {project.summary}
        </p>
        <span className="mt-auto inline-flex shrink-0 items-center gap-2 pt-5 text-xs font-bold uppercase tracking-[0.16em] text-clay">
          {ui.projectCard.action}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
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
      <h3 className="font-serif text-2xl font-semibold text-clay">{title}</h3>
      <p className="font-prose mt-2 text-sm leading-7 text-ink/72">{body}</p>
    </div>
  )
}
