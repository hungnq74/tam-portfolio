import { z } from "zod"
import {
  PORTFOLIO_CONTENT,
  type FieldId,
  type Locale,
  type Project,
} from "@/data/portfolio"

export const ADMIN_PROJECT_PAGE_LIMIT = 50
export const ADMIN_PROJECT_PDF_SIZE_LIMIT = 150 * 1024 * 1024

const FIELD_IDS = ["social-planner", "creative-copywriter"] as const

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
  proposalSlides: z.array(projectMediaAssetSchema).max(ADMIN_PROJECT_PAGE_LIMIT).optional(),
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

const adminLocaleProjectSchema = z.object({
  title: z.string().min(1).max(120),
  eyebrow: z.string().min(1).max(80),
  category: z.string().min(1).max(80),
  summary: z.string().min(1).max(280),
  client: z.string().min(1).max(120),
  scope: z.array(z.string().min(1).max(80)).min(1).max(12),
  overview: z.string().min(1).max(900),
  objective: z.string().min(1).max(900),
  solution: z.string().min(1).max(900),
  results: z.array(z.string().min(1).max(120)).min(1).max(12),
})

export const adminProjectSaveSchema = z.object({
  expectedEtag: z.string().min(1).nullable(),
  shared: z.object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Project id must be a lowercase slug.",
    }),
    fieldId: fieldIdSchema,
    year: z.string().min(1).max(24),
    thumbnail: thumbnailSchema,
    media: projectMediaSchema.optional(),
  }),
  locales: z.object({
    en: adminLocaleProjectSchema,
    vi: adminLocaleProjectSchema,
  }),
})

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
  return (
    PORTFOLIO_CONTENT[locale].fields.find((field) => field.id === fieldId)?.filters ?? []
  )
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

  if (options.requireMedia && !payload.shared.media) {
    errors.push("Upload a cover image and proposal PDF before saving a new project.")
  }

  if (payload.shared.media?.proposalSlides?.length === 0) {
    errors.push("Proposal carousel must contain at least one slide when media is provided.")
  }

  ;(["en", "vi"] as const).forEach((locale) => {
    const filters = getFieldFilters(locale, payload.shared.fieldId)
    const category = payload.locales[locale].category

    if (!filters.includes(category)) {
      errors.push(
        `${locale.toUpperCase()} category must match one of the selected field filters.`,
      )
    }
  })

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

export function createLocalizedProjects(payload: AdminProjectSavePayload) {
  const createProject = (locale: Locale): Project => ({
    id: payload.shared.id,
    fieldId: payload.shared.fieldId,
    title: payload.locales[locale].title,
    eyebrow: payload.locales[locale].eyebrow,
    category: payload.locales[locale].category,
    summary: payload.locales[locale].summary,
    client: payload.locales[locale].client,
    year: payload.shared.year,
    scope: payload.locales[locale].scope,
    overview: payload.locales[locale].overview,
    objective: payload.locales[locale].objective,
    solution: payload.locales[locale].solution,
    results: payload.locales[locale].results,
    thumbnail: payload.shared.thumbnail,
    media: payload.shared.media,
  })

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
