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
import {
  motion,
  type MotionValue,
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
  AUTHOR,
  CHAPTERS,
  FIELDS,
  PROJECTS,
  type Field,
  type FieldId,
  type Project,
  type SectionId,
  getField,
  getProjectsByField,
} from "@/data/portfolio"
import { getLenis } from "@/components/LenisProvider"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/utils"

const COVER_IMAGE = "/assets/storybook/cover.png"
const ALL_FILTER = "Tất cả"
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

export function StoryPortfolio() {
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
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [gateNudgeKey, setGateNudgeKey] = useState(0)

  const gateLocked = selectedFieldId === null
  const lockedSectionIds = gateLocked ? LOCKED_FIELD_GATE_SECTIONS : EMPTY_LOCKED_SECTIONS
  const activeField = selectedFieldId ? getField(selectedFieldId) : null
  const activeProjects = useMemo(
    () => (selectedFieldId ? getProjectsByField(selectedFieldId) : []),
    [selectedFieldId],
  )
  const filteredProjects = useMemo(() => {
    if (activeFilter === ALL_FILTER) return activeProjects
    return activeProjects.filter((project) => project.category === activeFilter)
  }, [activeFilter, activeProjects])
  const selectedProject = selectedProjectId
    ? PROJECTS.find((project) => project.id === selectedProjectId) ??
      activeProjects[0] ??
      null
    : activeProjects[0] ?? null
  const selectedProjectField = selectedProject
    ? getField(selectedProject.fieldId)
    : activeField

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

    CHAPTERS.forEach((chapter) => {
      const node = sectionRefs.current[chapter.id]
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [])

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
    const firstProject = getProjectsByField(fieldId)[0]

    setSelectedFieldId(fieldId)
    setActiveFilter(ALL_FILTER)
    setSelectedProjectId(firstProject.id)
    window.setTimeout(() => scrollTo("gallery", { force: true }), 90)
  }

  const selectProject = (project: Project) => {
    setSelectedProjectId(project.id)
    window.setTimeout(() => scrollTo("detail", { force: true }), 80)
  }

  return (
    <MotionPreferenceContext.Provider value={reducedMotion}>
      <div className="story-texture min-h-screen overflow-x-clip">
        <ProgressRail
          activeSection={activeSection}
          lockedSectionIds={lockedSectionIds}
          onJump={scrollTo}
          progress={reducedMotion ? scrollYProgress : smoothProgress}
        />
        <MobileChapterBar
          activeSection={activeSection}
          lockedSectionIds={lockedSectionIds}
          onJump={scrollTo}
          progress={reducedMotion ? scrollYProgress : smoothProgress}
        />

        <main className="pb-24 lg:px-[5.5rem] lg:pb-0">
          <CoverSection refSetter={setSectionRef("cover")} onNext={() => scrollTo("about")} />
          <AboutSection refSetter={setSectionRef("about")} onNext={() => scrollTo("fields")} />
          <FieldsSection
            refSetter={setSectionRef("fields")}
            selectedFieldId={selectedFieldId}
            gateLocked={gateLocked}
            gateNudgeKey={gateNudgeKey}
            onSelectField={selectField}
          />
          <GallerySection
            refSetter={setSectionRef("gallery")}
            activeField={activeField}
            activeFilter={activeFilter}
            filteredProjects={filteredProjects}
            selectedProjectId={selectedProject?.id ?? null}
            onBack={() => scrollTo("fields")}
            onFilter={setActiveFilter}
            onChooseField={() => scrollTo("fields", { immediate: true })}
            onSelectProject={selectProject}
          />
          <DetailSection
            refSetter={setSectionRef("detail")}
            field={selectedProjectField}
            project={selectedProject}
            onBack={() => scrollTo("gallery")}
            onChooseField={() => scrollTo("fields", { immediate: true })}
            onTop={() => scrollTo("cover")}
          />
        </main>
      </div>
    </MotionPreferenceContext.Provider>
  )
}

function CoverSection({
  refSetter,
  onNext,
}: {
  refSetter: (node: HTMLElement | null) => void
  onNext: () => void
}) {
  const reducedMotion = useMotionPreference()

  return (
    <section
      ref={refSetter}
      data-section-id="cover"
      className="relative flex min-h-[var(--screen)] flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-10"
    >
      <motion.div
        className="mx-auto flex w-full max-w-6xl flex-col items-center"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.7, ease: REVEAL_EASE }}
      >
        <h1 className="sr-only">Portfolio – Cổ tích Việt Nam cho dân sáng tạo</h1>
        <p className="sr-only">
          Storytelling, strategy, creativity. Một cuốn portfolio được lật mở bằng nhịp cuộn.
        </p>
        <div className="story-frame relative aspect-[1672/941] w-full overflow-hidden rounded-[10px] bg-paper shadow-story">
          <img
            src={COVER_IMAGE}
            alt="Bìa portfolio Cổ tích Việt Nam cho dân sáng tạo — Tâm Sắc Bén"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="mt-8 flex flex-col items-center">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-paper/70 bg-moss text-paper shadow-story transition hover:-translate-y-1 hover:bg-ink focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper motion-reduce:hover:translate-y-0"
            aria-label="Cuộn đến trang giới thiệu"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
          <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-ink/72">
            Lật trang
          </span>
        </div>
      </motion.div>
    </section>
  )
}

function AboutSection({
  refSetter,
  onNext,
}: {
  refSetter: (node: HTMLElement | null) => void
  onNext: () => void
}) {
  return (
    <section
      ref={refSetter}
      data-section-id="about"
      className="relative flex min-h-[var(--screen)] items-center px-4 pb-32 pt-20 sm:px-6 sm:py-20 lg:px-10"
    >
      <div className="mx-auto w-full max-w-6xl">
        <OrnamentDivider label="01" />
        <ScrollReveal preset="page-rise" amount={0.18}>
          <StoryFrame className="grid gap-8 overflow-hidden p-5 sm:p-7 lg:grid-cols-[0.95fr_1.05fr] lg:p-9">
            <ScrollReveal
              preset="image-depth"
              className="relative min-h-[330px] overflow-hidden rounded-[6px] border border-[rgba(116,63,36,0.24)] bg-paper-deep"
            >
              <DepthImage
                src={AUTHOR.image}
                alt="Minh họa tác giả đang viết"
                imageClassName="h-full min-h-[330px] w-full object-cover"
              />
            </ScrollReveal>

            <div className="flex flex-col justify-center px-1 py-2 sm:px-4">
              <ScrollReveal preset="page-rise" delay={0.08}>
                <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-clay">
                  <PenLine className="h-4 w-4" />
                  {AUTHOR.greeting}
                </span>
                <h2 className="font-serif text-[clamp(2.8rem,7vw,5.8rem)] font-semibold leading-[0.9] text-moss">
                  Mình là {AUTHOR.name}
                </h2>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-clay">
                  {AUTHOR.title}
                </p>
              </ScrollReveal>
              <ScrollReveal preset="page-rise" delay={0.16}>
                <p className="mt-7 max-w-xl text-base leading-8 text-ink/82 sm:text-lg">
                  {AUTHOR.intro}
                </p>
                <p className="mt-4 max-w-xl text-sm leading-7 text-ink/68 sm:text-base">
                  {AUTHOR.note}
                </p>
                <button
                  type="button"
                  onClick={onNext}
                  className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-clay px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-paper transition hover:-translate-y-0.5 hover:bg-[#87331f] focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-4 focus:ring-offset-paper motion-reduce:hover:translate-y-0"
                >
                  Tìm hiểu thêm
                  <ArrowRight className="h-4 w-4" />
                </button>
              </ScrollReveal>
            </div>
          </StoryFrame>
        </ScrollReveal>
      </div>
    </section>
  )
}

function FieldsSection({
  refSetter,
  selectedFieldId,
  gateLocked,
  gateNudgeKey,
  onSelectField,
}: {
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
            Lĩnh vực hoạt động
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-balance text-sm leading-7 text-ink/72 sm:text-base">
            Mỗi nhánh là một trang truyện riêng, cùng đi về một cách kể thương hiệu rõ ràng và có cảm xúc.
          </p>
        </ScrollReveal>

        <RevealGroup className="grid gap-5 lg:grid-cols-2" preset="card-cascade" stagger={0.12}>
          {FIELDS.map((field) => (
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
            {gateLocked
              ? "Chọn một lĩnh vực để mở trang dự án"
              : "Cuộn tiếp hoặc chọn lĩnh vực khác"}
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  )
}

function GallerySection({
  refSetter,
  activeField,
  activeFilter,
  filteredProjects,
  selectedProjectId,
  onBack,
  onFilter,
  onChooseField,
  onSelectProject,
}: {
  refSetter: (node: HTMLElement | null) => void
  activeField: Field | null
  activeFilter: string
  filteredProjects: Project[]
  selectedProjectId: string | null
  onBack: () => void
  onFilter: (filter: string) => void
  onChooseField: () => void
  onSelectProject: (project: Project) => void
}) {
  if (!activeField) {
    return (
      <section
        ref={refSetter}
        data-section-id="gallery"
        className="relative flex min-h-[var(--screen)] items-center px-4 pb-32 pt-20 sm:px-6 sm:py-20 lg:px-10"
      >
        <LockedChapterPanel
          eyebrow="Trang lĩnh vực"
          title="Chọn một lĩnh vực trước"
          body="Danh mục dự án sẽ mở ra sau khi bạn chọn Social Planner hoặc Creative Copywriter."
          actionLabel="Quay lại Lĩnh vực"
          onAction={onChooseField}
        />
      </section>
    )
  }

  const filters = [ALL_FILTER, ...activeField.filters]

  return (
    <section
      ref={refSetter}
      data-section-id="gallery"
      className="relative flex min-h-[var(--screen)] items-center px-4 pb-32 pt-20 sm:px-6 sm:py-20 lg:px-10"
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
                  Quay lại
                </button>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
                  Trang lĩnh vực
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
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              preset="card-cascade"
              stagger={0.055}
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  field={activeField}
                  project={project}
                  active={project.id === selectedProjectId}
                  onSelect={() => onSelectProject(project)}
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
  refSetter,
  field,
  project,
  onBack,
  onChooseField,
  onTop,
}: {
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
          eyebrow="Chi tiết dự án"
          title="Chưa có dự án được chọn"
          body="Trang chi tiết sẽ mở sau khi bạn chọn một lĩnh vực và một dự án cụ thể."
          actionLabel="Quay lại Lĩnh vực"
          onAction={onChooseField}
        />
      </section>
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
                Quay lại
              </button>
              <button
                type="button"
                onClick={onTop}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(116,63,36,0.28)] text-moss transition hover:bg-moss hover:text-paper focus:outline-none focus:ring-2 focus:ring-clay"
                aria-label="Quay về bìa"
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
                    <MetaBlock label="Client" value={project.client} />
                    <MetaBlock label="Year" value={project.year} />
                    <MetaBlock label="Scope" value={project.scope.join(", ")} />
                  </RevealGroup>
                  <ScrollReveal preset="page-rise" delay={0.14}>
                    <p className="mt-7 text-base leading-8 text-ink/82 sm:text-lg">
                      {project.overview}
                    </p>
                  </ScrollReveal>
                </div>

                <RevealGroup className="mt-8 grid gap-5 sm:grid-cols-2" stagger={0.08}>
                  <CaseNote title="Objective" body={project.objective} />
                  <CaseNote title="Solution" body={project.solution} />
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
                    Kết quả
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
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-ink/72">
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
  activeSection,
  lockedSectionIds,
  onJump,
  progress,
}: {
  activeSection: SectionId
  lockedSectionIds: ReadonlySet<SectionId>
  onJump: (section: SectionId) => void
  progress: MotionValue<number>
}) {
  return (
    <nav
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
      aria-label="Điều hướng chương"
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
        {CHAPTERS.map((chapter) => {
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
                  ? `${chapter.title} đang khóa. Chọn lĩnh vực trước.`
                  : `Đến ${chapter.title}`
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
                {locked ? " · Chọn lĩnh vực trước" : ""}
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
  activeSection,
  lockedSectionIds,
  onJump,
  progress,
}: {
  activeSection: SectionId
  lockedSectionIds: ReadonlySet<SectionId>
  onJump: (section: SectionId) => void
  progress: MotionValue<number>
}) {
  const activeChapter = CHAPTERS.find((chapter) => chapter.id === activeSection) ?? CHAPTERS[0]

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
          {CHAPTERS.map((chapter) => {
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
                    ? `${chapter.title} đang khóa. Chọn lĩnh vực trước.`
                    : `Đến ${chapter.title}`
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
  preset = "page-rise",
  stagger = 0.08,
}: {
  children: React.ReactNode
  className?: string
  preset?: RevealPreset
  stagger?: number
}) {
  return (
    <div className={className}>
      {Children.toArray(children).map((child, index) => (
        <ScrollReveal key={index} preset={preset} delay={index * stagger}>
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
        "group story-frame relative min-h-[360px] overflow-hidden rounded-[10px] text-left shadow-story transition duration-300 focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-4 focus:ring-offset-paper motion-reduce:hover:translate-y-0",
        active
          ? "scale-[1.01] ring-1 ring-gold/55"
          : "hover:-translate-y-1",
      )}
    >
      <img
        src={field.image}
        alt={`Minh họa ${field.title}`}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
      />
      <div
        className={cn(
          "absolute inset-0",
          clay
            ? "bg-[linear-gradient(90deg,rgba(126,45,30,0.86),rgba(126,45,30,0.28)_52%,rgba(246,235,211,0.18))]"
            : "bg-[linear-gradient(90deg,rgba(22,55,38,0.9),rgba(22,55,38,0.34)_54%,rgba(246,235,211,0.14))]",
        )}
      />
      <div className="relative z-10 flex min-h-[360px] flex-col justify-between p-6 text-paper sm:p-8">
        <div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/70 bg-paper/10 text-gold">
            {clay ? <ScrollText className="h-5 w-5" /> : <Feather className="h-5 w-5" />}
          </span>
          <h3 className="mt-7 max-w-[9ch] font-serif text-[clamp(2.3rem,5vw,4.2rem)] font-semibold leading-none">
            {field.title}
          </h3>
          <p className="mt-5 max-w-sm text-base leading-7 text-paper/84">
            {field.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="max-w-md text-sm leading-6 text-paper/70">{field.body}</p>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/70 text-gold transition group-hover:translate-x-1 group-hover:bg-gold group-hover:text-moss">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </button>
  )
}

function ProjectCard({
  field,
  project,
  active,
  onSelect,
}: {
  field: Field
  project: Project
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group overflow-hidden rounded-[8px] border bg-paper text-left text-ink shadow-[0_18px_45px_rgba(20,28,20,0.18)] transition duration-300 focus:outline-none focus:ring-2 focus:ring-gold motion-reduce:hover:translate-y-0",
        active
          ? "border-gold shadow-[0_22px_55px_rgba(176,108,51,0.24)]"
          : "border-paper/35 hover:-translate-y-1 hover:border-gold/70",
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-paper-deep">
        <ThumbnailArt field={field} project={project} className="absolute inset-0 transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100" />
      </div>
      <div className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">
          {project.eyebrow}
        </p>
        <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight text-moss">
          {project.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-ink/72">{project.summary}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-clay">
          Xem dự án
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
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

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] border border-[rgba(116,63,36,0.16)] bg-[rgba(255,247,226,0.42)] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-clay">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-ink/78">{value}</p>
    </div>
  )
}

function CaseNote({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-serif text-2xl font-semibold text-clay">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-ink/72">{body}</p>
    </div>
  )
}
