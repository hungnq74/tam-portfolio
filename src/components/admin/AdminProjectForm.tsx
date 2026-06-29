"use client"

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react"
import { upload } from "@vercel/blob/client"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  CircleAlert,
  Eye,
  FileImage,
  FileText,
  FileUp,
  ListChecks,
  Loader2,
  Save,
  UploadCloud,
  Users,
} from "lucide-react"
import {
  type Locale,
  type Project,
  type ProjectMedia,
  type ProjectMediaAsset,
} from "@/data/portfolio"

const PDF_PAGE_LIMIT = 50
const PDF_SIZE_LIMIT = 150 * 1024 * 1024
const PDF_RENDER_WIDTH = 1600
const DEFAULT_CREDIT_NAMES = ["Minh Anh", "Hoàng Linh", "Bảo Trân"]

type LocaleDraft = {
  title: string
  summary: string
  overview: string
  ctaLabel: string
  credit: string
}

type UploadProgress = {
  label: string
  percent: number
} | null

type AdminProjectTab = "content" | "media" | "credits"

const FORM_TABS: Array<{ id: AdminProjectTab; label: string }> = [
  { id: "content", label: "Content" },
  { id: "media", label: "Media" },
  { id: "credits", label: "CTA & Credits" },
]

const COVER_POSITION_PRESETS = [
  { label: "Center", x: 50, y: 50 },
  { label: "Top", x: 50, y: 22 },
  { label: "Bottom", x: 50, y: 78 },
  { label: "Left", x: 22, y: 50 },
  { label: "Right", x: 78, y: 50 },
]

export function AdminProjectForm({
  mode,
  manifestEtag,
  project,
  blobConfigured,
  manifestError,
}: {
  mode: "create" | "edit"
  manifestEtag: string | null
  project?: Record<Locale, Project>
  blobConfigured: boolean
  manifestError?: string
}) {
  const router = useRouter()
  const [expectedEtag, setExpectedEtag] = useState(manifestEtag)
  const [projectId, setProjectId] = useState(project?.en.id ?? "")
  const [idTouched, setIdTouched] = useState(mode === "edit")
  const [media, setMedia] = useState<ProjectMedia | undefined>(
    () => project?.en.media ?? project?.vi.media,
  )
  const [locales, setLocales] = useState<Record<Locale, LocaleDraft>>(() => ({
    en: createLocaleDraft("en", project?.en),
    vi: createLocaleDraft("vi", project?.vi),
  }))
  const [creditNamesText, setCreditNamesText] = useState(() =>
    getInitialCreditNames(project).join("\n"),
  )
  const [coverProgress, setCoverProgress] = useState<UploadProgress>(null)
  const [mainImageProgress, setMainImageProgress] =
    useState<UploadProgress>(null)
  const [pdfProgress, setPdfProgress] = useState<UploadProgress>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AdminProjectTab>("content")

  const uploading = Boolean(coverProgress || mainImageProgress || pdfProgress)
  const creditNames = normalizeListText(creditNamesText)
  const readinessItems = getReadinessItems({
    projectId,
    draft: locales.en,
    media,
    creditNames,
  })
  const saveStatus = getSaveStatus({
    blobConfigured,
    manifestError,
    uploading,
    saving,
    message,
    progress:
      coverProgress ?? mainImageProgress ?? pdfProgress,
  })

  useEffect(() => {
    if (mode === "edit" || idTouched) return

    setProjectId(slugify(locales.en.title))
  }, [idTouched, locales.en.title, mode])

  const updateLocale = (
    locale: Locale,
    key: keyof LocaleDraft,
    value: string,
  ) => {
    setLocales((current) => ({
      ...current,
      [locale]: {
        ...current[locale],
        [key]: value,
      },
    }))
  }

  const onCoverChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setError(null)

    try {
      ensureUploadReady(projectId, blobConfigured)
      if (!file.type.startsWith("image/")) {
        throw new Error("Cover must be an image file.")
      }

      const dimensions = await getImageDimensions(file)
      const extension = getImageExtension(file)
      const uploadId = globalThis.crypto.randomUUID()
      const pathname = `projects/${projectId}/${uploadId}/cover.${extension}`
      setCoverProgress({ label: "Uploading cover", percent: 0 })

      const blob = await upload(pathname, file, {
        access: "public",
        contentType: file.type,
        handleUploadUrl: "/admin/api/blob-upload",
        onUploadProgress: ({ percentage }) =>
          setCoverProgress({ label: "Uploading cover", percent: percentage }),
      })
      const title = locales.en.title || projectId

      setMedia((current) => ({
        ...(current ?? {}),
        cover: {
          ...current?.cover,
          src: blob.url,
          alt: current?.cover.alt || getDefaultCoverAlt(title),
          width: dimensions.width,
          height: dimensions.height,
          focalPoint: current?.cover.focalPoint ?? { x: 50, y: 50 },
        },
      }))
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Cover upload failed.",
      )
    } finally {
      setCoverProgress(null)
    }
  }

  const onMainImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setError(null)

    try {
      ensureUploadReady(projectId, blobConfigured)
      if (!media?.cover) {
        throw new Error("Upload a cover image before adding the main image.")
      }
      if (!file.type.startsWith("image/")) {
        throw new Error("Main image must be an image file.")
      }

      const dimensions = await getImageDimensions(file)
      const extension = getImageExtension(file)
      const uploadId = globalThis.crypto.randomUUID()
      const pathname = `projects/${projectId}/${uploadId}/summary.${extension}`
      setMainImageProgress({ label: "Uploading main image", percent: 0 })

      const blob = await upload(pathname, file, {
        access: "public",
        contentType: file.type,
        handleUploadUrl: "/admin/api/blob-upload",
        onUploadProgress: ({ percentage }) =>
          setMainImageProgress({
            label: "Uploading main image",
            percent: percentage,
          }),
      })
      const title = locales.en.title || projectId

      setMedia((current) =>
        current?.cover
          ? {
              ...current,
              summary: {
                ...current.summary,
                src: blob.url,
                alt: current.summary?.alt || getDefaultMainImageAlt(title),
                width: dimensions.width,
                height: dimensions.height,
              },
            }
          : current,
      )
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Main image upload failed.",
      )
    } finally {
      setMainImageProgress(null)
    }
  }

  const onPdfChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setError(null)

    try {
      ensureUploadReady(projectId, blobConfigured)
      if (!media?.cover) {
        throw new Error("Upload a cover image before adding the proposal PDF.")
      }
      if (file.type !== "application/pdf") {
        throw new Error("Proposal must be a PDF file.")
      }

      if (file.size > PDF_SIZE_LIMIT) {
        throw new Error("PDF is larger than 150 MB.")
      }

      const slides = await extractAndUploadPdf(file, {
        projectId,
        title: locales.en.title || projectId,
        onProgress: setPdfProgress,
      })

      setMedia((current) =>
        current?.cover
          ? {
              ...current,
              proposalSlides: slides.map((slide, index) =>
                mergeUploadedAsset(
                  current.proposalSlides?.[index],
                  slide,
                  getDefaultProposalAlt(
                    locales.en.title || projectId,
                    index + 1,
                  ),
                ),
              ),
            }
          : current,
      )
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "PDF upload failed.",
      )
    } finally {
      setPdfProgress(null)
    }
  }

  const updateCoverFocalPoint = (axis: "x" | "y", value: number) => {
    setMedia((current) => {
      if (!current?.cover) return current

      return {
        ...current,
        cover: {
          ...current.cover,
          focalPoint: {
            x: current.cover.focalPoint?.x ?? 50,
            y: current.cover.focalPoint?.y ?? 50,
            [axis]: value,
          },
        },
      }
    })
  }

  const updateCoverPosition = (x: number, y: number) => {
    setMedia((current) => {
      if (!current?.cover) return current

      return {
        ...current,
        cover: {
          ...current.cover,
          focalPoint: { x, y },
        },
      }
    })
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const payload = {
        expectedEtag,
        shared: {
          id: projectId,
          media,
          creditNames,
        },
        locales: {
          en: createLocalePayload(locales.en),
          vi: createHiddenViPayload(locales.en, project?.vi),
        },
      }
      const response = await fetch(
        mode === "create"
          ? "/admin/api/projects"
          : `/admin/api/projects/${projectId}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      )
      const result = (await response.json().catch(() => null)) as {
        error?: string
        details?: string[]
        etag?: string
        projectId?: string
        warning?: string
      } | null

      if (!response.ok) {
        setError(
          [result?.error, ...(result?.details ?? [])]
            .filter(Boolean)
            .join(" ") || "Unable to save project.",
        )
        return
      }

      if (result?.etag) setExpectedEtag(result.etag)
      setMessage(result?.warning ?? "Project saved.")

      if (mode === "create") {
        router.push(`/admin/projects/${result?.projectId ?? projectId}?created=1`)
      } else {
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {manifestError ? (
        <AdminNotice tone="error" message={manifestError} />
      ) : null}
      {!blobConfigured ? (
        <AdminNotice
          tone="error"
          message="BLOB_READ_WRITE_TOKEN is missing. Admin can preview fallback content, but saving and uploads are disabled."
        />
      ) : null}
      {error ? <AdminNotice tone="error" message={error} /> : null}
      {message ? <AdminNotice tone="success" message={message} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <section className="admin-card overflow-hidden">
          <FormTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="p-4 sm:p-6">
            {activeTab === "content" ? (
              <div className="space-y-5">
                <SectionHeader
                  icon={<FileText className="h-4 w-4" />}
                  title="Content"
                  description="AXE-style proposal content for the English-only portfolio."
                />
                <label className="block max-w-xl">
                  <AdminLabel>Project id</AdminLabel>
                  <input
                    aria-label="Project id"
                    value={projectId}
                    onChange={(event) => {
                      setIdTouched(true)
                      setProjectId(
                        slugify(event.target.value, { trimEdges: false }),
                      )
                    }}
                    disabled={mode === "edit"}
                    className="admin-input"
                  />
                  <FieldHelp>
                    Lowercase URL slug for the public project page.
                  </FieldHelp>
                </label>
                <LocaleContentFields
                  locale="en"
                  draft={locales.en}
                  onChange={updateLocale}
                />
              </div>
            ) : null}

            {activeTab === "media" ? (
              <div className="space-y-5">
                <SectionHeader
                  icon={<FileUp className="h-4 w-4" />}
                  title="Media"
                  description="Upload the public cover, the main detail image, and the full proposal PDF."
                />
                <div className="space-y-4">
                  <UploadControl
                    icon={<FileImage className="h-4 w-4" />}
                    label="Upload cover image"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={!blobConfigured || uploading || saving}
                    progress={coverProgress}
                    onChange={onCoverChange}
                    helper="Top visual for the project page and admin cards."
                  />
                  <UploadControl
                    icon={<FileImage className="h-4 w-4" />}
                    label="Upload main image"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={
                      !blobConfigured || uploading || saving || !media?.cover
                    }
                    progress={mainImageProgress}
                    onChange={onMainImageChange}
                    helper="The large image shown between overview text and CTA."
                  />
                  <UploadControl
                    icon={<UploadCloud className="h-4 w-4" />}
                    label="Upload proposal PDF"
                    accept="application/pdf"
                    disabled={
                      !blobConfigured || uploading || saving || !media?.cover
                    }
                    progress={pdfProgress}
                    onChange={onPdfChange}
                    helper="Pages are converted into carousel slides automatically."
                  />
                  {media?.cover ? (
                    <CoverPositionControl
                      cover={media.cover}
                      onPreset={(x, y) => updateCoverPosition(x, y)}
                      onFineTune={updateCoverFocalPoint}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}

            {activeTab === "credits" ? (
              <div className="space-y-5">
                <SectionHeader
                  icon={<Users className="h-4 w-4" />}
                  title="CTA & Credits"
                  description="Editorial bridge copy before the proposal carousel and quiet credits after it."
                />
                <section className="admin-card-soft space-y-4 p-4">
                  <h3 className="text-sm font-semibold tracking-normal text-[rgb(var(--ink))]">
                    English
                  </h3>
                  <TextField
                    label="CTA label"
                    value={locales.en.ctaLabel}
                    onChange={(value) => updateLocale("en", "ctaLabel", value)}
                    hint="Button text that jumps to the proposal carousel."
                    maxLength={80}
                    showCount
                  />
                  <TextAreaField
                    label="Credit intro"
                    rows={3}
                    value={locales.en.credit}
                    onChange={(value) => updateLocale("en", "credit", value)}
                    hint="Short thank-you line shown after the carousel."
                    maxLength={220}
                    showCount
                  />
                </section>
                <TextAreaField
                  label="Collaborator names"
                  rows={4}
                  value={creditNamesText}
                  onChange={setCreditNamesText}
                  hint="One name per line, or comma-separated."
                />
                <CreditPreview
                  ctaLabel={locales.en.ctaLabel}
                  credit={locales.en.credit}
                  creditNames={creditNames}
                />
              </div>
            ) : null}
          </div>
        </section>

        <aside className="admin-inspector self-start p-4 xl:sticky xl:top-5">
          <div className="space-y-4">
            <AdminReadinessPanel items={readinessItems} />
            <AdminMediaPreviewPanel media={media} />
          </div>
        </aside>
      </div>

      <AdminSaveBar
        status={saveStatus}
        disabled={!blobConfigured || saving || uploading || Boolean(manifestError)}
        saving={saving}
      />
    </form>
  )
}

function createLocaleDraft(
  locale: Locale,
  project: Project | undefined,
): LocaleDraft {
  return {
    title: project?.title ?? "",
    summary: project?.summary ?? "",
    overview: project?.overview ?? "",
    ctaLabel:
      project?.proposalCta?.label ??
      (locale === "vi" ? "Coi full portfolio" : "View full portfolio"),
    credit:
      project?.proposalCta?.credit ??
      (locale === "vi"
        ? "Shout out những người đã cùng làm proposal với tôi."
        : "Shout out to the friends who built this proposal with me."),
  }
}

function createLocalePayload(draft: LocaleDraft) {
  return {
    title: draft.title.trim(),
    summary: draft.summary.trim(),
    overview: draft.overview.trim(),
    proposalCta: {
      label: draft.ctaLabel.trim(),
      credit: draft.credit.trim(),
    },
  }
}

function createHiddenViPayload(enDraft: LocaleDraft, existingVi?: Project) {
  if (existingVi) {
    return createLocalePayload(createLocaleDraft("vi", existingVi))
  }

  return createLocalePayload({
    title: enDraft.title,
    summary: enDraft.summary,
    overview: enDraft.overview,
    ctaLabel: enDraft.ctaLabel,
    credit: enDraft.credit,
  })
}

function getInitialCreditNames(project: Record<Locale, Project> | undefined) {
  return (
    project?.en.proposalCta?.creditNames ??
    project?.vi.proposalCta?.creditNames ??
    DEFAULT_CREDIT_NAMES
  )
}

function FormTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: AdminProjectTab
  onTabChange: (tab: AdminProjectTab) => void
}) {
  return (
    <div
      className="admin-tabs no-scrollbar"
      role="tablist"
      aria-label="Project form sections"
    >
      {FORM_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={
            activeTab === tab.id ? "admin-tab admin-tab-active" : "admin-tab"
          }
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function LocaleContentFields({
  locale,
  draft,
  onChange,
}: {
  locale: Locale
  draft: LocaleDraft
  onChange: (locale: Locale, key: keyof LocaleDraft, value: string) => void
}) {
  return (
    <section className="admin-card-soft space-y-4 p-4">
      <h3 className="text-sm font-semibold tracking-normal text-[rgb(var(--ink))]">
        English content
      </h3>
      <TextField
        label="Title"
        value={draft.title}
        onChange={(value) => onChange(locale, "title", value)}
        hint="Public project name used on cards and detail pages."
        maxLength={120}
        showCount
      />
      <TextAreaField
        label="Summary"
        rows={3}
        value={draft.summary}
        onChange={(value) => onChange(locale, "summary", value)}
        hint="Short context line near the top of the project page."
        maxLength={280}
        showCount
      />
      <TextAreaField
        label="Overview"
        rows={6}
        value={draft.overview}
        onChange={(value) => onChange(locale, "overview", value)}
        hint="Longer project setup before the main image."
        maxLength={900}
        showCount
      />
    </section>
  )
}

function TextField({
  label,
  value,
  onChange,
  hint,
  maxLength,
  showCount = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  maxLength?: number
  showCount?: boolean
}) {
  return (
    <label className="block">
      <AdminLabel>{label}</AdminLabel>
      <input
        aria-label={label}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input"
      />
      <FieldFooter hint={hint} value={value} maxLength={maxLength} showCount={showCount} />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  rows,
  onChange,
  hint,
  maxLength,
  showCount = false,
}: {
  label: string
  value: string
  rows: number
  onChange: (value: string) => void
  hint?: string
  maxLength?: number
  showCount?: boolean
}) {
  return (
    <label className="block">
      <AdminLabel>{label}</AdminLabel>
      <textarea
        aria-label={label}
        value={value}
        rows={rows}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input resize-y"
      />
      <FieldFooter hint={hint} value={value} maxLength={maxLength} showCount={showCount} />
    </label>
  )
}

function AdminLabel({ children }: { children: ReactNode }) {
  return <span className="admin-label">{children}</span>
}

function FieldHelp({ children }: { children: ReactNode }) {
  return (
    <p className="admin-subtle mt-2 text-xs leading-5">
      {children}
    </p>
  )
}

function FieldFooter({
  hint,
  value,
  maxLength,
  showCount,
}: {
  hint?: string
  value: string
  maxLength?: number
  showCount: boolean
}) {
  if (!hint && !showCount) return null

  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs leading-5">
      {hint ? <span className="admin-subtle">{hint}</span> : <span />}
      {showCount ? (
        <span className="font-semibold text-[rgba(38,52,40,0.5)]">
          {value.length}
          {maxLength ? `/${maxLength}` : ""}
        </span>
      ) : null}
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon?: ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-200 pb-4">
      {icon ? (
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-slate-200 bg-slate-50 text-slate-700">
          {icon}
        </span>
      ) : null}
      <div>
        <h2 className="admin-section-title">{title}</h2>
        {description ? (
          <p className="admin-section-subtitle">{description}</p>
        ) : null}
      </div>
    </div>
  )
}

function UploadControl({
  icon,
  label,
  accept,
  disabled,
  progress,
  onChange,
  helper,
}: {
  icon: ReactNode
  label: string
  accept: string
  disabled: boolean
  progress: UploadProgress
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  helper?: string
}) {
  return (
    <label
      className={`admin-upload ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          {icon}
          {label}
        </span>
        <span className="rounded-[6px] border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
          Browse
        </span>
      </span>
      {helper ? (
        <span className="admin-subtle mt-2 block text-xs leading-5">
          {helper}
        </span>
      ) : null}
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />
      {progress ? (
        <span className="mt-4 block">
          <span className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
            <span>{progress.label}</span>
            <span>{Math.round(progress.percent)}%</span>
          </span>
          <span className="block h-2 overflow-hidden rounded-full bg-slate-200">
            <span
              className="block h-full rounded-full bg-slate-950"
              style={{ width: `${progress.percent}%` }}
            />
          </span>
        </span>
      ) : null}
    </label>
  )
}

function CoverPositionControl({
  cover,
  onPreset,
  onFineTune,
}: {
  cover: ProjectMediaAsset
  onPreset: (x: number, y: number) => void
  onFineTune: (axis: "x" | "y", value: number) => void
}) {
  const focalPoint = {
    x: cover.focalPoint?.x ?? 50,
    y: cover.focalPoint?.y ?? 50,
  }
  const activePreset = COVER_POSITION_PRESETS.find(
    (preset) => preset.x === focalPoint.x && preset.y === focalPoint.y,
  )

  return (
    <section className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Adjust cover crop
            </h3>
            <p className="admin-subtle mt-1 text-xs leading-5">
              Choose which part of the cover should stay visible when the page
              crops it on different screens.
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Quick position
            </p>
            <div className="flex flex-wrap gap-2">
              {COVER_POSITION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={activePreset?.label === preset.label}
                  onClick={() => onPreset(preset.x, preset.y)}
                  className="rounded-[6px] border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950 aria-pressed:border-slate-950 aria-pressed:bg-slate-950 aria-pressed:text-white"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <RangeField
              label="Move focus left or right"
              value={focalPoint.x}
              onChange={(value) => onFineTune("x", value)}
              valueLabel={`${focalPoint.x}%`}
            />
            <RangeField
              label="Move focus up or down"
              value={focalPoint.y}
              onChange={(value) => onFineTune("y", value)}
              valueLabel={`${focalPoint.y}%`}
            />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Crop preview
          </p>
          <img
            src={cover.src}
            alt={cover.alt}
            className="aspect-[16/9] w-full rounded-[6px] border border-slate-200 object-cover"
            style={{
              objectPosition: `${focalPoint.x}% ${focalPoint.y}%`,
            }}
          />
          <p className="admin-subtle mt-2 text-xs leading-5">
            This preview matches the public cover crop.
          </p>
        </div>
      </div>
    </section>
  )
}

function RangeField({
  label,
  value,
  onChange,
  valueLabel,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  valueLabel?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span>{valueLabel ?? value}</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-slate-950"
      />
    </label>
  )
}

function AdminReadinessPanel({
  items,
}: {
  items: Array<{ label: string; ready: boolean; detail: string }>
}) {
  const readyCount = items.filter((item) => item.ready).length

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="admin-kicker">Readiness</p>
          <h2 className="mt-1 text-lg font-semibold tracking-normal text-[rgb(var(--ink))]">
            {readyCount}/{items.length} ready
          </h2>
        </div>
        <span
          className="admin-status-chip"
          data-tone={readyCount === items.length ? "ready" : "warn"}
        >
          <ListChecks className="h-3.5 w-3.5" />
          {readyCount === items.length ? "Ready" : "Draft"}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex gap-3 rounded-[8px] border border-slate-200 bg-white p-3"
          >
            <span
              className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                item.ready
                  ? "bg-slate-100 text-slate-700"
                  : "bg-orange-50 text-orange-700"
              }`}
            >
              {item.ready ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <CircleAlert className="h-3.5 w-3.5" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[rgb(var(--ink))]">
                {item.label}
              </p>
              <p className="admin-subtle mt-0.5 text-xs leading-5">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function AdminMediaPreviewPanel({ media }: { media?: ProjectMedia }) {
  return (
    <section className="space-y-3 border-t border-slate-200 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="admin-kicker">Preview</p>
          <h2 className="mt-1 text-lg font-semibold tracking-normal text-[rgb(var(--ink))]">
            Media stack
          </h2>
        </div>
        <Eye className="h-4 w-4 text-[rgba(38,52,40,0.52)]" />
      </div>
      <div className="grid gap-3">
        {media?.cover ? (
          <img
            src={media.cover.src}
            alt={media.cover.alt}
            className="aspect-[16/9] w-full rounded-[6px] object-cover"
            style={{
              objectPosition: `${media.cover.focalPoint?.x ?? 50}% ${media.cover.focalPoint?.y ?? 50}%`,
            }}
          />
        ) : (
          <PreviewPlaceholder>Cover preview</PreviewPlaceholder>
        )}
        {media?.summary ? (
          <img
            src={media.summary.src}
            alt={media.summary.alt}
            className="aspect-[16/9] w-full rounded-[6px] object-cover"
          />
        ) : (
          <PreviewPlaceholder>Main image preview</PreviewPlaceholder>
        )}
      </div>
      <div className="grid gap-3 text-sm text-slate-600">
        <PreviewStat label="Cover" value={media?.cover ? "Ready" : "Missing"} />
        <PreviewStat
          label="Main image"
          value={media?.summary ? "Ready" : "Missing"}
        />
        <PreviewStat
          label="Slides"
          value={String(media?.proposalSlides?.length ?? 0)}
        />
      </div>
    </section>
  )
}

function PreviewPlaceholder({ children }: { children: ReactNode }) {
  return (
    <div className="flex aspect-[16/9] items-center justify-center rounded-[6px] bg-white text-sm font-semibold text-slate-400 ring-1 ring-inset ring-slate-200">
      {children}
    </div>
  )
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold text-[rgba(38,52,40,0.54)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-[rgb(var(--ink))]">
        {value}
      </p>
    </div>
  )
}

function CreditPreview({
  ctaLabel,
  credit,
  creditNames,
}: {
  ctaLabel: string
  credit: string
  creditNames: string[]
}) {
  const creditNamesLine = creditNames.join(" · ")

  return (
    <div className="admin-card-soft p-4">
      <p className="admin-kicker mb-3">Public-page bridge preview</p>
      <div className="rounded-[8px] border border-slate-200 bg-white p-4 text-center">
        <span className="admin-button admin-button-secondary pointer-events-none">
          {ctaLabel || "View full portfolio"}
        </span>
        <p className="mx-auto mt-4 max-w-xl text-sm font-bold leading-6 text-[rgb(var(--ink))]">
          {credit || "Credit intro will appear after the proposal carousel."}
        </p>
        <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-slate-600">
          {creditNamesLine || "Add one name per line or comma-separated."}
        </p>
      </div>
    </div>
  )
}

function AdminSaveBar({
  status,
  disabled,
  saving,
}: {
  status: { label: string; detail: string; tone: "ready" | "warn" }
  disabled: boolean
  saving: boolean
}) {
  return (
    <div className="admin-save-bar">
      <div className="min-w-0">
        <span className="admin-status-chip" data-tone={status.tone}>
          {status.label}
        </span>
        <p className="admin-subtle mt-1 text-sm font-medium">
          {status.detail}
        </p>
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="admin-button admin-button-primary sm:min-w-36"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? "Saving" : "Save project"}
      </button>
    </div>
  )
}

function AdminNotice({
  tone,
  message,
}: {
  tone: "error" | "success"
  message: string
}) {
  return (
    <div
      className={
        tone === "error"
          ? "admin-notice admin-notice-error"
          : "admin-notice admin-notice-success"
      }
    >
      {message}
    </div>
  )
}

function getReadinessItems({
  projectId,
  draft,
  media,
  creditNames,
}: {
  projectId: string
  draft: LocaleDraft
  media?: ProjectMedia
  creditNames: string[]
}) {
  const hasText =
    draft.title.trim() && draft.summary.trim() && draft.overview.trim()

  return [
    {
      label: "Project identity",
      ready: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectId),
      detail: projectId ? `/${projectId}` : "Add a URL-safe project id.",
    },
    {
      label: "English content",
      ready: Boolean(hasText),
      detail: hasText
        ? "Title, summary, and overview are filled."
        : "Add title, summary, and overview.",
    },
    {
      label: "Cover image",
      ready: Boolean(media?.cover),
      detail: media?.cover ? "Cover is ready." : "Upload a cover image.",
    },
    {
      label: "Main image asset",
      ready: Boolean(media?.summary),
      detail: media?.summary ? "Main image is ready." : "Upload the main image.",
    },
    {
      label: "Proposal PDF",
      ready: Boolean(media?.proposalSlides?.length),
      detail: media?.proposalSlides?.length
        ? `${media.proposalSlides.length} slide${media.proposalSlides.length === 1 ? "" : "s"} ready.`
        : "Upload a proposal PDF.",
    },
    {
      label: "CTA & credits",
      ready: Boolean(draft.ctaLabel.trim() && draft.credit.trim() && creditNames.length),
      detail:
        draft.ctaLabel.trim() && draft.credit.trim() && creditNames.length
          ? `${creditNames.length} collaborator${creditNames.length === 1 ? "" : "s"}.`
          : "Add CTA, credit intro, and collaborator names.",
    },
  ]
}

function getSaveStatus({
  blobConfigured,
  manifestError,
  uploading,
  saving,
  message,
  progress,
}: {
  blobConfigured: boolean
  manifestError?: string
  uploading: boolean
  saving: boolean
  message: string | null
  progress: UploadProgress
}) {
  if (!blobConfigured) {
    return {
      label: "Blocked",
      detail: "Blob token required to save or upload.",
      tone: "warn" as const,
    }
  }

  if (manifestError) {
    return {
      label: "Blocked",
      detail: "Resolve the manifest issue before saving.",
      tone: "warn" as const,
    }
  }

  if (saving) {
    return {
      label: "Saving",
      detail: "Writing project changes to the manifest.",
      tone: "warn" as const,
    }
  }

  if (uploading) {
    return {
      label: "Uploading",
      detail: progress?.label ?? "Uploading media.",
      tone: "warn" as const,
    }
  }

  if (message) {
    return {
      label: "Saved",
      detail: "Latest changes are stored.",
      tone: "ready" as const,
    }
  }

  return {
    label: "Ready",
    detail: "Ready to save changes.",
    tone: "ready" as const,
  }
}

function normalizeListText(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function slugify(
  value: string,
  { trimEdges = true }: { trimEdges?: boolean } = {},
) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")

  return trimEdges ? slug.replace(/^-+|-+$/g, "") : slug.replace(/^-+/, "")
}

function ensureUploadReady(projectId: string, blobConfigured: boolean) {
  if (!blobConfigured) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required before uploading media.")
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectId)) {
    throw new Error("Enter a valid project id before uploading media.")
  }
}

function getDefaultCoverAlt(title: string) {
  return `${title} cover image`
}

function getDefaultMainImageAlt(title: string) {
  return `${title} main image`
}

function getDefaultProposalAlt(title: string, pageNumber: number) {
  return `${title} proposal page ${pageNumber}`
}

function mergeUploadedAsset(
  current: ProjectMediaAsset | undefined,
  uploaded: ProjectMediaAsset,
  fallbackAlt: string,
): ProjectMediaAsset {
  return {
    ...current,
    ...uploaded,
    alt: current?.alt || fallbackAlt,
    caption: current?.caption,
    ctaLabel: current?.ctaLabel,
  }
}

function getImageExtension(file: File) {
  if (file.type === "image/jpeg") return "jpg"
  if (file.type === "image/webp") return "webp"
  return "png"
}

function getImageDimensions(file: Blob) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Unable to read image dimensions."))
    }
    image.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error("Unable to render PDF page."))
      }
    }, "image/png")
  })
}

async function extractAndUploadPdf(
  file: File,
  {
    projectId,
    title,
    onProgress,
  }: {
    projectId: string
    title: string
    onProgress: (progress: UploadProgress) => void
  },
) {
  onProgress({ label: "Reading PDF", percent: 0 })

  const pdfjs = await import("pdfjs-dist")
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).toString()

  const document = await pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  }).promise

  if (document.numPages > PDF_PAGE_LIMIT) {
    throw new Error(
      `PDF has ${document.numPages} pages. The limit is ${PDF_PAGE_LIMIT}.`,
    )
  }

  const uploadId = globalThis.crypto.randomUUID()
  const slides: ProjectMediaAsset[] = []

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    onProgress({
      label: `Rendering page ${pageNumber}/${document.numPages}`,
      percent: ((pageNumber - 1) / document.numPages) * 100,
    })

    const page = await document.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1 })
    const scaledViewport = page.getViewport({
      scale: PDF_RENDER_WIDTH / viewport.width,
    })
    const canvas = window.document.createElement("canvas")
    canvas.width = Math.round(scaledViewport.width)
    canvas.height = Math.round(scaledViewport.height)

    await page.render({ canvas, viewport: scaledViewport }).promise

    const blob = await canvasToBlob(canvas)
    const pathname = `projects/${projectId}/${uploadId}/proposal-${String(pageNumber).padStart(2, "0")}.png`
    const uploaded = await upload(pathname, blob, {
      access: "public",
      contentType: "image/png",
      handleUploadUrl: "/admin/api/blob-upload",
      onUploadProgress: ({ percentage }) =>
        onProgress({
          label: `Uploading page ${pageNumber}/${document.numPages}`,
          percent:
            ((pageNumber - 1 + percentage / 100) / document.numPages) * 100,
        }),
    })

    slides.push({
      src: uploaded.url,
      alt: `${title} proposal page ${pageNumber}`,
      width: canvas.width,
      height: canvas.height,
    })
  }

  onProgress({ label: "Proposal ready", percent: 100 })

  return slides
}
