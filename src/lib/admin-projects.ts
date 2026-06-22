import { z } from "zod"
import {
  PORTFOLIO_CONTENT,
  type FieldId,
  type Locale,
  type Project,
  type ProjectMedia,
} from "@/data/portfolio"

export const ADMIN_PROJECT_PAGE_LIMIT = 50
export const ADMIN_PROJECT_PDF_SIZE_LIMIT = 150 * 1024 * 1024
export const ADMIN_PROPOSAL_FIELD_ID = "social-planner" as const
export const DEFAULT_PROPOSAL_CREDIT_NAMES = [
  "Minh Anh",
  "Hoàng Linh",
  "Bảo Trân",
] as const

const FIELD_IDS = ["social-planner", "creative-copywriter"] as const
export const ADMIN_MANAGED_FIELD_IDS = [ADMIN_PROPOSAL_FIELD_ID] as const
const ADMIN_PROPOSAL_THUMBNAIL = { col: 1, row: 0 } as const

const fieldIdSchema = z.enum(FIELD_IDS)
const thumbnailSchema = z.object({
  col: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  row: z.union([z.literal(0), z.literal(1)]),
})

export const projectMediaAssetSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1).max(180),
  width: z.number().int().positive().max(10000),
  height: z.number().int().positive().max(10000),
  sourceUrl: z.string().url().max(240).optional(),
  caption: z.string().min(1).max(1000).optional(),
  ctaLabel: z.string().min(1).max(80).optional(),
  focalPoint: z
    .object({
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
    })
    .optional(),
})

const projectVideoCampaignSchema = z.object({
  title: z.string().min(1).max(140),
  description: z.string().min(1).max(300),
  videos: z.array(projectMediaAssetSchema).min(1).max(8),
})

const projectImageCampaignSchema = z.object({
  title: z.string().min(1).max(140),
  description: z.string().min(1).max(500),
  images: z.array(projectMediaAssetSchema).min(1).max(8),
})

const projectOutreachSectionSchema = z.object({
  title: z.string().min(1).max(140),
  description: z.string().min(1).max(300),
  displayMode: z.enum(["linked-posts", "caption-posts"]),
  posts: z.array(projectMediaAssetSchema).min(1).max(12),
})

export const projectMediaSchema = z.object({
  cover: projectMediaAssetSchema,
  introLayout: z.enum(["split-cover"]).optional(),
  summary: projectMediaAssetSchema.optional(),
  websitePreview: projectMediaAssetSchema.optional(),
  proposalSlides: z
    .array(projectMediaAssetSchema)
    .max(ADMIN_PROJECT_PAGE_LIMIT)
    .optional(),
  contentPostsLayout: z.enum(["grid", "carousel"]).optional(),
  contentPosts: z.array(projectMediaAssetSchema).max(12).optional(),
  videoCampaigns: z.array(projectVideoCampaignSchema).max(6).optional(),
  imageCampaigns: z.array(projectImageCampaignSchema).max(6).optional(),
  outreachSections: z.array(projectOutreachSectionSchema).max(4).optional(),
})

const projectNamingRationaleSchema = z.object({
  eyebrow: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  items: z
    .array(
      z.object({
        term: z.string().min(1).max(80),
        definition: z.string().min(1).max(180),
      }),
    )
    .min(1)
    .max(6),
  note: z.string().min(1).max(180),
})

const projectProposalCtaSchema = z.object({
  label: z.string().min(1).max(80),
  credit: z.string().min(1).max(220),
  creditNames: z.array(z.string().min(1).max(80)).max(8).optional(),
})

export const portfolioProjectSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  fieldId: fieldIdSchema,
  title: z.string().min(1).max(120),
  eyebrow: z.string().min(1).max(80),
  category: z.string().min(1).max(80),
  summary: z.string().min(1).max(280),
  client: z.string().min(1).max(120),
  year: z.string().min(1).max(24),
  scope: z.array(z.string().min(1).max(80)).min(1).max(12),
  campaignTitle: z.string().min(1).max(160).optional(),
  closingNote: z.string().min(1).max(320).optional(),
  overview: z.string().min(1).max(900),
  objective: z.string().min(1).max(900),
  solution: z.string().min(1).max(900),
  results: z.array(z.string().min(1).max(120)).min(1).max(12),
  thumbnail: thumbnailSchema,
  media: projectMediaSchema.optional(),
  namingRationale: projectNamingRationaleSchema.optional(),
  proposalCta: projectProposalCtaSchema.optional(),
})

export const portfolioManifestSchema = z.object({
  version: z.literal(1),
  updatedAt: z.string().datetime(),
  revision: z.string().min(1),
  locales: z.object({
    en: z.object({
      projects: z.array(portfolioProjectSchema),
    }),
    vi: z.object({
      projects: z.array(portfolioProjectSchema),
    }),
  }),
})

const adminProposalCtaSchema = z
  .object({
    label: z.string().min(1).max(80),
    credit: z.string().min(1).max(220),
  })
  .strict()

const adminLocaleProjectSchema = z
  .object({
    title: z.string().min(1).max(120),
    summary: z.string().min(1).max(280),
    overview: z.string().min(1).max(900),
    proposalCta: adminProposalCtaSchema,
  })
  .strict()

export const adminProjectSaveSchema = z
  .object({
    expectedEtag: z.string().min(1).nullable(),
    shared: z
      .object({
        id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
          message: "Project id must be a lowercase slug.",
        }),
        media: projectMediaSchema.optional(),
        creditNames: z.array(z.string().min(1).max(80)).min(1).max(8),
      })
      .strict(),
    locales: z.object({
      en: adminLocaleProjectSchema,
      vi: adminLocaleProjectSchema,
    }),
  })
  .strict()

export type PortfolioManifest = z.infer<typeof portfolioManifestSchema>
export type AdminProjectSavePayload = z.infer<typeof adminProjectSaveSchema>

export function createRevision() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

export function createManifestFromProjects(
  projectsByLocale: Record<Locale, Project[]>,
): PortfolioManifest {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    revision: createRevision(),
    locales: {
      en: { projects: projectsByLocale.en },
      vi: { projects: projectsByLocale.vi },
    },
  }
}

export function normalizeListText(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function getFieldFilters(locale: Locale, fieldId: FieldId) {
  const fieldFilters =
    PORTFOLIO_CONTENT[locale].fields.find((field) => field.id === fieldId)
      ?.filters ?? []
  const existingCategories = PORTFOLIO_CONTENT[locale].projects
    .filter((project) => project.fieldId === fieldId)
    .map((project) => project.category)

  return Array.from(new Set([...fieldFilters, ...existingCategories]))
}

export function isAdminManagedFieldId(fieldId: FieldId) {
  return ADMIN_MANAGED_FIELD_IDS.includes(
    fieldId as (typeof ADMIN_MANAGED_FIELD_IDS)[number],
  )
}

export function isAdminManagedProject(project: Pick<Project, "fieldId">) {
  return isAdminManagedFieldId(project.fieldId)
}

function hasProposalMedia(media?: ProjectMedia) {
  return Boolean(
    media?.cover && media.summary && (media.proposalSlides?.length ?? 0) > 0,
  )
}

function getSubmittedMedia(payload: AdminProjectSavePayload) {
  return payload.shared.media ? [payload.shared.media] : []
}

export function validateAdminProjectPayload(
  input: unknown,
  options: {
    requireMedia: boolean
    routeProjectId?: string
  },
) {
  const parsed = adminProjectSaveSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.issues.map((issue) => issue.message),
    }
  }

  const payload = parsed.data
  const errors: string[] = []

  if (options.routeProjectId && payload.shared.id !== options.routeProjectId) {
    errors.push("Project id cannot be changed after creation.")
  }

  if (!hasProposalMedia(payload.shared.media)) {
    errors.push(
      "Upload a cover image, main image, and proposal PDF before saving this Thinking project.",
    )
  }

  if (
    getSubmittedMedia(payload).some(
      (media) => media.proposalSlides?.length === 0,
    )
  ) {
    errors.push(
      "Proposal carousel must contain at least one slide when media is provided.",
    )
  }

  if (errors.length > 0) {
    return {
      success: false as const,
      errors,
    }
  }

  return {
    success: true as const,
    payload,
  }
}

function getDefaultEyebrow(locale: Locale) {
  return locale === "vi" ? "Dự án" : "Project"
}

function getDefaultProjectDetails(locale: Locale, title: string) {
  if (locale === "vi") {
    return {
      category: "Chiến dịch",
      client: title,
      scope: ["Campaign proposal", "Creative direction", "Portfolio showcase"],
      objective:
        "Trình bày bối cảnh, hướng tiếp cận và proposal của dự án theo một cấu trúc rõ ràng.",
      solution:
        "Kết hợp ảnh bìa, tóm tắt, main image, CTA, carousel PDF và credit để tạo trang proposal hoàn chỉnh.",
      results: [
        "Trang chi tiết dạng proposal",
        "Carousel PDF",
        "Credit cộng sự",
      ],
    }
  }

  return {
    category: "Campaign",
    client: title,
    scope: ["Campaign proposal", "Creative direction", "Portfolio showcase"],
    objective:
      "Present the project context, approach, and proposal in a clear portfolio-ready structure.",
    solution:
      "Combine a cover, summary, main image, CTA, PDF carousel, and collaborator credit into one proposal flow.",
    results: ["Proposal detail page", "PDF carousel", "Collaborator credits"],
  }
}

function getProjectYear(existingProject?: Project) {
  return existingProject?.year ?? new Date().getFullYear().toString()
}

export function createLocalizedProjects(
  payload: AdminProjectSavePayload,
  existingProjects?: Partial<Record<Locale, Project>>,
) {
  const createProject = (locale: Locale): Project => {
    const localePayload = payload.locales[locale]
    const defaults = getDefaultProjectDetails(locale, localePayload.title)

    return {
      id: payload.shared.id,
      fieldId: ADMIN_PROPOSAL_FIELD_ID,
      title: localePayload.title,
      eyebrow: getDefaultEyebrow(locale),
      category: defaults.category,
      summary: localePayload.summary,
      client: defaults.client,
      year: getProjectYear(existingProjects?.[locale]),
      scope: defaults.scope,
      overview: localePayload.overview,
      objective: defaults.objective,
      solution: defaults.solution,
      results: defaults.results,
      thumbnail: ADMIN_PROPOSAL_THUMBNAIL,
      media: payload.shared.media,
      proposalCta: {
        label: localePayload.proposalCta.label,
        credit: localePayload.proposalCta.credit,
        creditNames: payload.shared.creditNames,
      },
    }
  }

  return {
    en: createProject("en"),
    vi: createProject("vi"),
  } satisfies Record<Locale, Project>
}

export function touchManifest(manifest: PortfolioManifest): PortfolioManifest {
  return {
    ...manifest,
    updatedAt: new Date().toISOString(),
    revision: createRevision(),
  }
}
