"use client"

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react"
import { upload } from "@vercel/blob/client"
import { useRouter } from "next/navigation"
import {
  FileImage,
  FileUp,
  Loader2,
  Save,
  SlidersHorizontal,
  UploadCloud,
} from "lucide-react"
import {
  type FieldId,
  type Locale,
  type Project,
  type ProjectMedia,
  type ProjectMediaAsset,
} from "@/data/portfolio"

const PDF_PAGE_LIMIT = 50
const PDF_SIZE_LIMIT = 150 * 1024 * 1024
const PDF_RENDER_WIDTH = 1600

type LocaleDraft = {
  title: string
  eyebrow: string
  category: string
  summary: string
  client: string
  scopeText: string
  overview: string
  objective: string
  solution: string
  resultsText: string
}

type FieldOption = {
  id: FieldId
  title: string
  filters: Record<Locale, string[]>
}

type UploadProgress = {
  label: string
  percent: number
} | null

type AdminProjectTab = "overview" | "en" | "vi" | "media"

const FORM_TABS: Array<{ id: AdminProjectTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "en", label: "English" },
  { id: "vi", label: "Vietnamese" },
  { id: "media", label: "Media" },
]

export function AdminProjectForm({
  mode,
  manifestEtag,
  project,
  fields,
  blobConfigured,
  manifestError,
}: {
  mode: "create" | "edit"
  manifestEtag: string | null
  project?: Record<Locale, Project>
  fields: FieldOption[]
  blobConfigured: boolean
  manifestError?: string
}) {
  const router = useRouter()
  const firstField = fields[0]
  const initialFieldId = project?.en.fieldId ?? firstField.id
  const [expectedEtag, setExpectedEtag] = useState(manifestEtag)
  const [projectId, setProjectId] = useState(project?.en.id ?? "")
  const [idTouched, setIdTouched] = useState(mode === "edit")
  const [fieldId, setFieldId] = useState<FieldId>(initialFieldId)
  const [year, setYear] = useState(project?.en.year ?? new Date().getFullYear().toString())
  const [thumbnail, setThumbnail] = useState(project?.en.thumbnail ?? { col: 0, row: 0 })
  const [media, setMedia] = useState<ProjectMedia | undefined>(project?.en.media)
  const [locales, setLocales] = useState<Record<Locale, LocaleDraft>>(() => ({
    en: createLocaleDraft("en", project?.en, fields, initialFieldId),
    vi: createLocaleDraft("vi", project?.vi, fields, initialFieldId),
  }))
  const [coverProgress, setCoverProgress] = useState<UploadProgress>(null)
  const [pdfProgress, setPdfProgress] = useState<UploadProgress>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AdminProjectTab>("overview")

  const selectedField = useMemo(
    () => fields.find((field) => field.id === fieldId) ?? firstField,
    [fieldId, fields, firstField],
  )
  const uploading = Boolean(coverProgress || pdfProgress)

  useEffect(() => {
    if (mode === "edit" || idTouched) return

    setProjectId(slugify(locales.en.title))
  }, [idTouched, locales.en.title, mode])

  const updateLocale = (locale: Locale, key: keyof LocaleDraft, value: string) => {
    setLocales((current) => ({
      ...current,
      [locale]: {
        ...current[locale],
        [key]: value,
      },
    }))
  }

  const onFieldChange = (nextFieldId: FieldId) => {
    const nextField = fields.find((field) => field.id === nextFieldId)
    if (!nextField) return

    setFieldId(nextFieldId)
    setLocales((current) => ({
      en: {
        ...current.en,
        category: nextField.filters.en[0] ?? current.en.category,
      },
      vi: {
        ...current.vi,
        category: nextField.filters.vi[0] ?? current.vi.category,
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
        ...current,
        cover: {
          src: blob.url,
          alt: `${title} cover image`,
          width: dimensions.width,
          height: dimensions.height,
          focalPoint: current?.cover.focalPoint ?? { x: 50, y: 50 },
        },
      }))
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Cover upload failed.")
    } finally {
      setCoverProgress(null)
    }
  }

  const onPdfChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setError(null)

    try {
      ensureUploadReady(projectId, blobConfigured)
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

      if (!media?.cover) {
        throw new Error("Upload a cover image before saving.")
      }

      setMedia((current) =>
        current?.cover
          ? {
              ...current,
              summary: slides[0],
              proposalSlides: slides,
            }
          : current,
      )
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "PDF upload failed.")
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
          fieldId,
          year,
          thumbnail,
          media,
        },
        locales: {
          en: createLocalePayload(locales.en),
          vi: createLocalePayload(locales.vi),
        },
      }
      const response = await fetch(
        mode === "create" ? "/admin/api/projects" : `/admin/api/projects/${projectId}`,
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
        warning?: string
      } | null

      if (!response.ok) {
        setError(
          [result?.error, ...(result?.details ?? [])].filter(Boolean).join(" ") ||
            "Unable to save project.",
        )
        return
      }

      if (result?.etag) setExpectedEtag(result.etag)
      setMessage(result?.warning ?? "Project saved.")

      if (mode === "create") {
        router.push(`/admin/projects/${projectId}`)
      } else {
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {manifestError ? <AdminNotice tone="error" message={manifestError} /> : null}
      {!blobConfigured ? (
        <AdminNotice
          tone="error"
          message="BLOB_READ_WRITE_TOKEN is missing. Admin can preview fallback content, but saving and uploads are disabled."
        />
      ) : null}
      {error ? <AdminNotice tone="error" message={error} /> : null}
      {message ? <AdminNotice tone="success" message={message} /> : null}

      <section className="admin-card overflow-hidden">
        <FormTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="p-4 sm:p-6">
          {activeTab === "overview" ? (
            <div className="space-y-5">
              <SectionHeader
                icon={<SlidersHorizontal className="h-4 w-4" />}
                title="Overview"
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <label className="block lg:col-span-2">
                  <AdminLabel>Project id</AdminLabel>
                  <input
                    value={projectId}
                    onChange={(event) => {
                      setIdTouched(true)
                      setProjectId(slugify(event.target.value, { trimEdges: false }))
                    }}
                    disabled={mode === "edit"}
                    className="admin-input"
                  />
                </label>
                <label className="block">
                  <AdminLabel>Field</AdminLabel>
                  <select
                    value={fieldId}
                    onChange={(event) => onFieldChange(event.target.value as FieldId)}
                    className="admin-input"
                  >
                    {fields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <AdminLabel>Year</AdminLabel>
                  <input
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                    className="admin-input"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <AdminLabel>Thumbnail column</AdminLabel>
                  <select
                    value={thumbnail.col}
                    onChange={(event) =>
                      setThumbnail((current) => ({
                        ...current,
                        col: Number(event.target.value) as 0 | 1 | 2,
                      }))
                    }
                    className="admin-input"
                  >
                    <option value={0}>Left</option>
                    <option value={1}>Center</option>
                    <option value={2}>Right</option>
                  </select>
                </label>
                <label className="block">
                  <AdminLabel>Thumbnail row</AdminLabel>
                  <select
                    value={thumbnail.row}
                    onChange={(event) =>
                      setThumbnail((current) => ({
                        ...current,
                        row: Number(event.target.value) as 0 | 1,
                      }))
                    }
                    className="admin-input"
                  >
                    <option value={0}>Top</option>
                    <option value={1}>Bottom</option>
                  </select>
                </label>
              </div>
            </div>
          ) : null}

          {activeTab === "en" ? (
            <LocaleEditor
              locale="en"
              draft={locales.en}
              filters={selectedField.filters.en}
              onChange={updateLocale}
            />
          ) : null}

          {activeTab === "vi" ? (
            <LocaleEditor
              locale="vi"
              draft={locales.vi}
              filters={selectedField.filters.vi}
              onChange={updateLocale}
            />
          ) : null}

          {activeTab === "media" ? (
            <div className="space-y-5">
              <SectionHeader icon={<FileUp className="h-4 w-4" />} title="Media" />
              <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="space-y-4">
                  <UploadControl
                    icon={<FileImage className="h-4 w-4" />}
                    label="Upload cover image"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={!blobConfigured || uploading || saving}
                    progress={coverProgress}
                    onChange={onCoverChange}
                  />
                  <UploadControl
                    icon={<UploadCloud className="h-4 w-4" />}
                    label="Upload proposal PDF"
                    accept="application/pdf"
                    disabled={!blobConfigured || uploading || saving || !media?.cover}
                    progress={pdfProgress}
                    onChange={onPdfChange}
                  />
                  {media?.cover ? (
                    <div className="grid gap-3 rounded-[8px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                      <RangeField
                        label="Cover focal X"
                        value={media.cover.focalPoint?.x ?? 50}
                        onChange={(value) => updateCoverFocalPoint("x", value)}
                      />
                      <RangeField
                        label="Cover focal Y"
                        value={media.cover.focalPoint?.y ?? 50}
                        onChange={(value) => updateCoverFocalPoint("y", value)}
                      />
                    </div>
                  ) : null}
                </div>

                <MediaPreview media={media} />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-[8px] border border-slate-200 bg-white/95 p-3 shadow-lg shadow-slate-950/5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-500">
          {!blobConfigured
            ? "Blob token required to save or upload."
            : manifestError
              ? "Resolve the manifest issue before saving."
              : uploading
                ? coverProgress?.label ?? pdfProgress?.label ?? "Uploading media."
                : "Ready to save changes."}
        </p>
        <button
          type="submit"
          disabled={!blobConfigured || saving || uploading || Boolean(manifestError)}
          className="admin-button admin-button-primary sm:min-w-36"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving" : "Save project"}
        </button>
      </div>
    </form>
  )
}

function createLocaleDraft(
  locale: Locale,
  project: Project | undefined,
  fields: FieldOption[],
  fieldId: FieldId,
): LocaleDraft {
  const field = fields.find((item) => item.id === fieldId) ?? fields[0]

  return {
    title: project?.title ?? "",
    eyebrow: project?.eyebrow ?? (locale === "en" ? "Project" : "Dự án"),
    category: project?.category ?? field.filters[locale][0] ?? "",
    summary: project?.summary ?? "",
    client: project?.client ?? "",
    scopeText: project?.scope.join("\n") ?? "",
    overview: project?.overview ?? "",
    objective: project?.objective ?? "",
    solution: project?.solution ?? "",
    resultsText: project?.results.join("\n") ?? "",
  }
}

function createLocalePayload(draft: LocaleDraft) {
  return {
    title: draft.title.trim(),
    eyebrow: draft.eyebrow.trim(),
    category: draft.category,
    summary: draft.summary.trim(),
    client: draft.client.trim(),
    scope: normalizeListText(draft.scopeText),
    overview: draft.overview.trim(),
    objective: draft.objective.trim(),
    solution: draft.solution.trim(),
    results: normalizeListText(draft.resultsText),
  }
}

function FormTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: AdminProjectTab
  onTabChange: (tab: AdminProjectTab) => void
}) {
  return (
    <div className="admin-tabs no-scrollbar" role="tablist" aria-label="Project form sections">
      {FORM_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={activeTab === tab.id ? "admin-tab admin-tab-active" : "admin-tab"}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function LocaleEditor({
  locale,
  draft,
  filters,
  onChange,
}: {
  locale: Locale
  draft: LocaleDraft
  filters: string[]
  onChange: (locale: Locale, key: keyof LocaleDraft, value: string) => void
}) {
  return (
    <section className="space-y-5">
      <SectionHeader title={locale === "en" ? "English content" : "Vietnamese content"} />
      <div className="grid gap-4">
        <TextField
          label="Title"
          value={draft.title}
          onChange={(value) => onChange(locale, "title", value)}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Eyebrow"
            value={draft.eyebrow}
            onChange={(value) => onChange(locale, "eyebrow", value)}
          />
          <label className="block">
            <AdminLabel>Category</AdminLabel>
            <select
              value={draft.category}
              onChange={(event) => onChange(locale, "category", event.target.value)}
              className="admin-input"
            >
              {filters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </label>
        </div>
        <TextField
          label="Client"
          value={draft.client}
          onChange={(value) => onChange(locale, "client", value)}
        />
        <TextAreaField
          label="Summary"
          rows={2}
          value={draft.summary}
          onChange={(value) => onChange(locale, "summary", value)}
        />
        <TextAreaField
          label="Scope"
          rows={3}
          value={draft.scopeText}
          onChange={(value) => onChange(locale, "scopeText", value)}
        />
        <TextAreaField
          label="Overview"
          rows={5}
          value={draft.overview}
          onChange={(value) => onChange(locale, "overview", value)}
        />
        <TextAreaField
          label="Objective"
          rows={4}
          value={draft.objective}
          onChange={(value) => onChange(locale, "objective", value)}
        />
        <TextAreaField
          label="Solution"
          rows={4}
          value={draft.solution}
          onChange={(value) => onChange(locale, "solution", value)}
        />
        <TextAreaField
          label="Results"
          rows={3}
          value={draft.resultsText}
          onChange={(value) => onChange(locale, "resultsText", value)}
        />
      </div>
    </section>
  )
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <AdminLabel>{label}</AdminLabel>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="admin-input" />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  rows,
  onChange,
}: {
  label: string
  value: string
  rows: number
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <AdminLabel>{label}</AdminLabel>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input resize-y"
      />
    </label>
  )
}

function AdminLabel({ children }: { children: ReactNode }) {
  return <span className="admin-label">{children}</span>
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
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-slate-200 bg-slate-50 text-slate-600">
          {icon}
        </span>
      ) : null}
      <div>
        <h2 className="admin-section-title">{title}</h2>
        {description ? <p className="admin-section-subtitle">{description}</p> : null}
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
}: {
  icon: ReactNode
  label: string
  accept: string
  disabled: boolean
  progress: UploadProgress
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
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

function RangeField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span>{value}</span>
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

function MediaPreview({ media }: { media?: ProjectMedia }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
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
        <div className="flex aspect-[16/9] items-center justify-center rounded-[6px] bg-white text-sm font-semibold text-slate-400 ring-1 ring-inset ring-slate-200">
          Cover preview
        </div>
      )}
      <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-5">
        <PreviewStat label="Cover" value={media?.cover ? "Ready" : "Missing"} />
        <PreviewStat label="Summary" value={media?.summary ? "Ready" : "Missing"} />
        <PreviewStat label="Website" value={media?.websitePreview ? "Ready" : "Missing"} />
        <PreviewStat
          label="Slides"
          value={String(media?.proposalSlides?.length ?? 0)}
        />
        <PreviewStat
          label="Posts"
          value={String(media?.contentPosts?.length ?? 0)}
        />
      </div>
    </div>
  )
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
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

function normalizeListText(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function slugify(value: string, { trimEdges = true }: { trimEdges?: boolean } = {}) {
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

  const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
    .promise

  if (document.numPages > PDF_PAGE_LIMIT) {
    throw new Error(`PDF has ${document.numPages} pages. The limit is ${PDF_PAGE_LIMIT}.`)
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
    const scaledViewport = page.getViewport({ scale: PDF_RENDER_WIDTH / viewport.width })
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
          percent: ((pageNumber - 1 + percentage / 100) / document.numPages) * 100,
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
