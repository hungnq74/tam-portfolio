import "server-only"

import {
  BlobPreconditionFailedError,
  del,
  get,
  head,
  put,
  type PutBlobResult,
} from "@vercel/blob"
import {
  createPortfolioContentByLocale,
  getStaticProjectsByLocale,
  type Locale,
  type PortfolioContentByLocale,
  type Project,
  type ProjectMedia,
  type ProjectMediaAsset,
} from "@/data/portfolio"
import {
  createManifestFromProjects,
  portfolioManifestSchema,
  touchManifest,
  type PortfolioManifest,
} from "@/lib/admin-projects"

export const PORTFOLIO_MANIFEST_PATH = "portfolio/content.json"
export const BLOB_MANIFEST_CACHE_REFRESHING_MESSAGE =
  "Blob manifest cache is still refreshing. Please wait a few seconds and try again."

export interface PortfolioSnapshot {
  contentByLocale: PortfolioContentByLocale
  manifest: PortfolioManifest
  etag: string | null
  configured: boolean
  error?: string
}

interface ReadPortfolioSnapshotOptions {
  fresh?: boolean
}

export class ManifestConflictError extends Error {
  constructor() {
    super("Portfolio content changed in another tab. Refresh and try again.")
    this.name = "ManifestConflictError"
  }
}

export function hasBlobConfig() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID),
  )
}

function getSeedManifest() {
  return createManifestFromProjects(getStaticProjectsByLocale())
}

async function streamToText(stream: ReadableStream<Uint8Array>) {
  return new Response(stream).text()
}

function normalizeBlobEtag(etag: string) {
  return etag.replace(/^W\//, "")
}

async function resolveFreshManifestEtag(cachedEtag: string) {
  const metadata = await head(PORTFOLIO_MANIFEST_PATH)

  if (normalizeBlobEtag(metadata.etag) !== normalizeBlobEtag(cachedEtag)) {
    return {
      error: BLOB_MANIFEST_CACHE_REFRESHING_MESSAGE,
      etag: metadata.etag,
    }
  }

  return {
    etag: metadata.etag,
  }
}

function contentFromManifest(manifest: PortfolioManifest) {
  return createPortfolioContentByLocale({
    en: manifest.locales.en.projects,
    vi: manifest.locales.vi.projects,
  })
}

function hydrateProjectDefaults(project: Project, staticProject?: Project): Project {
  const proposalCta = project.proposalCta
    ? {
        ...staticProject?.proposalCta,
        ...project.proposalCta,
        creditNames:
          project.proposalCta.creditNames ?? staticProject?.proposalCta?.creditNames,
      }
    : staticProject?.proposalCta

  return {
    ...project,
    proposalCta,
  }
}

function hydrateLocaleProjects(projects: Project[], staticProjects: Project[]) {
  const runtimeProjectIds = new Set(projects.map((project) => project.id))
  const staticProjectsById = new Map(staticProjects.map((project) => [project.id, project]))
  const hydratedProjects = projects.map((project) => {
    const staticProject = staticProjectsById.get(project.id)

    if (staticProject?.fieldId === "creative-copywriter") {
      return staticProject
    }

    return hydrateProjectDefaults(project, staticProject)
  })

  staticProjects.forEach((staticProject) => {
    if (
      staticProject.fieldId === "creative-copywriter" &&
      !runtimeProjectIds.has(staticProject.id)
    ) {
      hydratedProjects.push(staticProject)
    }
  })

  return hydratedProjects
}

export function hydrateManifestProjectDefaults(manifest: PortfolioManifest): PortfolioManifest {
  const staticProjectsByLocale = getStaticProjectsByLocale()

  return {
    ...manifest,
    locales: {
      en: {
        projects: hydrateLocaleProjects(
          manifest.locales.en.projects,
          staticProjectsByLocale.en,
        ),
      },
      vi: {
        projects: hydrateLocaleProjects(
          manifest.locales.vi.projects,
          staticProjectsByLocale.vi,
        ),
      },
    },
  }
}

export async function readPortfolioSnapshot({
  fresh = false,
}: ReadPortfolioSnapshotOptions = {}): Promise<PortfolioSnapshot> {
  const seedManifest = getSeedManifest()

  if (!hasBlobConfig()) {
    return {
      contentByLocale: contentFromManifest(seedManifest),
      manifest: seedManifest,
      etag: null,
      configured: false,
      error:
        "BLOB_READ_WRITE_TOKEN is not configured. Public pages are using static fallback projects.",
    }
  }

  try {
    const result = await get(PORTFOLIO_MANIFEST_PATH, {
      access: "public",
      ...(fresh
        ? {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        : {}),
    })

    if (!result || result.statusCode !== 200 || !result.stream) {
      return {
        contentByLocale: contentFromManifest(seedManifest),
        manifest: seedManifest,
        etag: null,
        configured: true,
      }
    }

    const text = await streamToText(result.stream)
    const parsed = portfolioManifestSchema.safeParse(JSON.parse(text))

    if (!parsed.success) {
      return {
        contentByLocale: contentFromManifest(seedManifest),
        manifest: seedManifest,
        etag: result.blob.etag,
        configured: true,
        error: "Blob manifest is invalid. Public pages are using static fallback projects.",
      }
    }

    const hydratedManifest = hydrateManifestProjectDefaults(parsed.data)
    const freshness = fresh
      ? await resolveFreshManifestEtag(result.blob.etag)
      : { etag: result.blob.etag }

    return {
      contentByLocale: contentFromManifest(hydratedManifest),
      manifest: hydratedManifest,
      etag: freshness.etag,
      configured: true,
      error: freshness.error,
    }
  } catch (error) {
    return {
      contentByLocale: contentFromManifest(seedManifest),
      manifest: seedManifest,
      etag: null,
      configured: true,
      error:
        error instanceof Error
          ? `Unable to read Blob manifest: ${error.message}`
          : "Unable to read Blob manifest.",
    }
  }
}

export async function readAdminPortfolioSnapshot() {
  const snapshot = await readPortfolioSnapshot({ fresh: true })

  if (!snapshot.configured) {
    return snapshot
  }

  if (snapshot.error) {
    return snapshot
  }

  return snapshot
}

export async function savePortfolioManifest(
  manifest: PortfolioManifest,
  expectedEtag: string | null,
): Promise<PutBlobResult> {
  if (!hasBlobConfig()) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to save portfolio projects.")
  }

  const nextManifest = touchManifest(manifest)

  try {
    return await put(PORTFOLIO_MANIFEST_PATH, JSON.stringify(nextManifest, null, 2), {
      access: "public",
      allowOverwrite: Boolean(expectedEtag),
      cacheControlMaxAge: 60,
      contentType: "application/json; charset=utf-8",
      ifMatch: expectedEtag ?? undefined,
    })
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) {
      throw new ManifestConflictError()
    }

    throw error
  }
}

export function assertExpectedEtag(snapshot: PortfolioSnapshot, expectedEtag: string | null) {
  if ((snapshot.etag ?? null) !== expectedEtag) {
    throw new ManifestConflictError()
  }
}

function mediaAssets(media?: ProjectMedia) {
  const assets: ProjectMediaAsset[] = []

  if (media?.cover) assets.push(media.cover)
  if (media?.cardCover) assets.push(media.cardCover)
  if (media?.summary) assets.push(media.summary)
  if (media?.websitePreview) assets.push(media.websitePreview)
  if (media?.proposalSlides) assets.push(...media.proposalSlides)
  if (media?.contentPosts) assets.push(...media.contentPosts)
  if (media?.imageCampaigns) {
    media.imageCampaigns.forEach((campaign) => assets.push(...campaign.images))
  }
  if (media?.postCampaigns) {
    media.postCampaigns.forEach((campaign) => {
      if (campaign.posts) assets.push(...campaign.posts)
      if (campaign.sections) {
        campaign.sections.forEach((section) => assets.push(...section.posts))
      }
    })
  }
  if (media?.videoCampaigns) {
    media.videoCampaigns.forEach((campaign) => assets.push(...campaign.videos))
  }
  if (media?.outreachSections) {
    media.outreachSections.forEach((section) => assets.push(...section.posts))
  }

  return assets
}

export function getOwnedBlobUrls(projectId: string, projects: Project[]) {
  const owned = new Set<string>()

  projects.forEach((project) => {
    mediaAssets(project.media).forEach((asset) => {
      if (!asset.src) return

      try {
        const url = new URL(asset.src)

        if (
          url.hostname.endsWith(".blob.vercel-storage.com") &&
          url.pathname.startsWith(`/projects/${projectId}/`)
        ) {
          owned.add(asset.src)
        }
      } catch {
        if (asset.src.startsWith(`projects/${projectId}/`)) {
          owned.add(asset.src)
        }
      }
    })
  })

  return Array.from(owned)
}

export function getUnusedOwnedBlobUrls({
  projectId,
  before,
  after,
}: {
  projectId: string
  before: Project[]
  after: Project[]
}) {
  const beforeUrls = getOwnedBlobUrls(projectId, before)
  const afterUrls = new Set(getOwnedBlobUrls(projectId, after))

  return beforeUrls.filter((url) => !afterUrls.has(url))
}

export async function deleteBlobUrls(urls: string[]) {
  if (urls.length === 0 || !hasBlobConfig()) return

  await del(urls)
}

export function replaceProjectInManifest(
  manifest: PortfolioManifest,
  projects: Record<Locale, Project>,
) {
  return {
    ...manifest,
    locales: {
      en: {
        projects: manifest.locales.en.projects.map((project) =>
          project.id === projects.en.id ? projects.en : project,
        ),
      },
      vi: {
        projects: manifest.locales.vi.projects.map((project) =>
          project.id === projects.vi.id ? projects.vi : project,
        ),
      },
    },
  }
}

export function addProjectToManifest(
  manifest: PortfolioManifest,
  projects: Record<Locale, Project>,
) {
  return {
    ...manifest,
    locales: {
      en: { projects: [...manifest.locales.en.projects, projects.en] },
      vi: { projects: [...manifest.locales.vi.projects, projects.vi] },
    },
  }
}

export function removeProjectFromManifest(manifest: PortfolioManifest, projectId: string) {
  return {
    ...manifest,
    locales: {
      en: {
        projects: manifest.locales.en.projects.filter((project) => project.id !== projectId),
      },
      vi: {
        projects: manifest.locales.vi.projects.filter((project) => project.id !== projectId),
      },
    },
  }
}
