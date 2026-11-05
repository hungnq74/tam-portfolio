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

// Override only for isolated local testing against a separate manifest file.
export const PORTFOLIO_MANIFEST_PATH =
  process.env.PORTFOLIO_MANIFEST_PATH || "portfolio/content.json"
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

function isOwnedBlobPath(src: string, projectIds: string[]) {
  let pathname: string

  try {
    const url = new URL(src)
    if (!url.hostname.endsWith(".blob.vercel-storage.com")) return false
    pathname = url.pathname
  } catch {
    pathname = `/${src}`
  }

  return projectIds.some((projectId) => pathname.startsWith(`/projects/${projectId}/`))
}

/**
 * Blob URLs uploaded by admin for this project. Pass every id the project has had
 * (current id plus ids it was renamed from), because uploads keep their original path.
 */
export function getOwnedBlobUrls(projectIds: string | string[], projects: Project[]) {
  const ids = Array.isArray(projectIds) ? projectIds : [projectIds]
  const owned = new Set<string>()

  projects.forEach((project) => {
    mediaAssets(project.media).forEach((asset) => {
      if (asset.src && isOwnedBlobPath(asset.src, ids)) {
        owned.add(asset.src)
      }
    })
  })

  return Array.from(owned)
}

export function getUnusedOwnedBlobUrls({
  projectIds,
  before,
  after,
}: {
  projectIds: string | string[]
  before: Project[]
  after: Project[]
}) {
  const beforeUrls = getOwnedBlobUrls(projectIds, before)
  const afterUrls = new Set(getOwnedBlobUrls(projectIds, after))

  return beforeUrls.filter((url) => !afterUrls.has(url))
}

/** Current project id for an old (renamed) project id, if one is recorded. */
export function getProjectRedirectTarget(manifest: PortfolioManifest, projectId: string) {
  return manifest.redirects?.[projectId]
}

/** Every id this project has had: the current one plus ids that redirect to it. */
export function getProjectIdHistory(manifest: PortfolioManifest, projectId: string) {
  const formerIds = Object.entries(manifest.redirects ?? {})
    .filter(([, target]) => target === projectId)
    .map(([from]) => from)

  return [projectId, ...formerIds]
}

function renameRedirects(
  redirects: PortfolioManifest["redirects"],
  previousId: string,
  nextId: string,
) {
  const next: Record<string, string> = {}

  Object.entries(redirects ?? {}).forEach(([from, target]) => {
    // The new id now belongs to a real project, so it must not redirect anywhere.
    if (from === nextId) return
    next[from] = target === previousId ? nextId : target
  })

  next[previousId] = nextId

  return next
}

function withoutRedirectsFrom(redirects: PortfolioManifest["redirects"], projectId: string) {
  if (!redirects?.[projectId]) return redirects

  const next = { ...redirects }
  delete next[projectId]

  return Object.keys(next).length > 0 ? next : undefined
}

function withoutRedirectsTo(redirects: PortfolioManifest["redirects"], projectId: string) {
  if (!redirects) return undefined

  const next = Object.fromEntries(
    Object.entries(redirects).filter(([from, target]) => target !== projectId && from !== projectId),
  )

  return Object.keys(next).length > 0 ? next : undefined
}

export async function deleteBlobUrls(urls: string[]) {
  if (urls.length === 0 || !hasBlobConfig()) return

  await del(urls)
}

export function replaceProjectInManifest(
  manifest: PortfolioManifest,
  projects: Record<Locale, Project>,
  previousId: string = projects.en.id,
): PortfolioManifest {
  const renamed = previousId !== projects.en.id

  return {
    ...manifest,
    ...(renamed
      ? { redirects: renameRedirects(manifest.redirects, previousId, projects.en.id) }
      : {}),
    locales: {
      en: {
        projects: manifest.locales.en.projects.map((project) =>
          project.id === previousId ? projects.en : project,
        ),
      },
      vi: {
        projects: manifest.locales.vi.projects.map((project) =>
          project.id === previousId ? projects.vi : project,
        ),
      },
    },
  }
}

export function addProjectToManifest(
  manifest: PortfolioManifest,
  projects: Record<Locale, Project>,
): PortfolioManifest {
  return {
    ...manifest,
    // A new project may reuse an old renamed id; the real project wins over the redirect.
    redirects: withoutRedirectsFrom(manifest.redirects, projects.en.id),
    locales: {
      en: { projects: [...manifest.locales.en.projects, projects.en] },
      vi: { projects: [...manifest.locales.vi.projects, projects.vi] },
    },
  }
}

export function removeProjectFromManifest(
  manifest: PortfolioManifest,
  projectId: string,
): PortfolioManifest {
  return {
    ...manifest,
    redirects: withoutRedirectsTo(manifest.redirects, projectId),
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
