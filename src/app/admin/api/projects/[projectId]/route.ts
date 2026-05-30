import { z } from "zod"
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import {
  createLocalizedProjects,
  validateAdminProjectPayload,
} from "@/lib/admin-projects"
import { requireAdminRequest } from "@/lib/admin-auth"
import {
  assertExpectedEtag,
  deleteBlobUrls,
  getUnusedOwnedBlobUrls,
  getOwnedBlobUrls,
  ManifestConflictError,
  readAdminPortfolioSnapshot,
  removeProjectFromManifest,
  replaceProjectInManifest,
  savePortfolioManifest,
} from "@/lib/portfolio-manifest"

type RouteContext = {
  params: Promise<{
    projectId: string
  }>
}

const deletePayloadSchema = z.object({
  expectedEtag: z.string().min(1).nullable(),
})

function jsonError(message: string, status = 400, details?: string[]) {
  return NextResponse.json({ error: message, details }, { status })
}

function getWritableError(snapshot: Awaited<ReturnType<typeof readAdminPortfolioSnapshot>>) {
  if (!snapshot.configured) {
    return "BLOB_READ_WRITE_TOKEN is required before project changes can be saved."
  }

  if (snapshot.error) {
    return snapshot.error
  }

  return null
}

function findLocalizedProjects(
  snapshot: Awaited<ReturnType<typeof readAdminPortfolioSnapshot>>,
  projectId: string,
) {
  const en = snapshot.manifest.locales.en.projects.find((project) => project.id === projectId)
  const vi = snapshot.manifest.locales.vi.projects.find((project) => project.id === projectId)

  if (!en || !vi) return null

  return [en, vi]
}

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!requireAdminRequest(request)) {
    return jsonError("Unauthorized.", 401)
  }

  const { projectId } = await context.params
  const input = await request.json().catch(() => null)
  const parsed = validateAdminProjectPayload(input, {
    requireMedia: false,
    routeProjectId: projectId,
  })

  if (!parsed.success) {
    return jsonError("Project validation failed.", 400, parsed.errors)
  }

  const snapshot = await readAdminPortfolioSnapshot()
  const writableError = getWritableError(snapshot)

  if (writableError) {
    return jsonError(writableError, 503)
  }

  const existingProjects = findLocalizedProjects(snapshot, projectId)
  if (!existingProjects) {
    return jsonError("Project not found.", 404)
  }

  try {
    assertExpectedEtag(snapshot, parsed.payload.expectedEtag)
  } catch (error) {
    if (error instanceof ManifestConflictError) {
      return jsonError(error.message, 409)
    }

    throw error
  }

  try {
    const projects = createLocalizedProjects(parsed.payload)
    const nextManifest = replaceProjectInManifest(snapshot.manifest, projects)
    const saved = await savePortfolioManifest(nextManifest, snapshot.etag)
    const unusedUrls = getUnusedOwnedBlobUrls({
      projectId,
      before: existingProjects,
      after: [projects.en, projects.vi],
    })
    let warning: string | undefined

    try {
      await deleteBlobUrls(unusedUrls)
    } catch (error) {
      warning =
        error instanceof Error
          ? `Project saved, but old media cleanup failed: ${error.message}`
          : "Project saved, but old media cleanup failed."
    }

    revalidatePath("/")
    revalidatePath(`/work/${projectId}`)

    return NextResponse.json({
      ok: true,
      etag: saved.etag,
      projectId,
      warning,
    })
  } catch (error) {
    if (error instanceof ManifestConflictError) {
      return jsonError(error.message, 409)
    }

    return jsonError(
      error instanceof Error ? error.message : "Unable to update project.",
      500,
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!requireAdminRequest(request)) {
    return jsonError("Unauthorized.", 401)
  }

  const { projectId } = await context.params
  const input = await request.json().catch(() => null)
  const parsed = deletePayloadSchema.safeParse(input)

  if (!parsed.success) {
    return jsonError("Delete request is invalid.", 400)
  }

  const snapshot = await readAdminPortfolioSnapshot()
  const writableError = getWritableError(snapshot)

  if (writableError) {
    return jsonError(writableError, 503)
  }

  const existingProjects = findLocalizedProjects(snapshot, projectId)
  if (!existingProjects) {
    return jsonError("Project not found.", 404)
  }

  try {
    assertExpectedEtag(snapshot, parsed.data.expectedEtag)
  } catch (error) {
    if (error instanceof ManifestConflictError) {
      return jsonError(error.message, 409)
    }

    throw error
  }

  try {
    const nextManifest = removeProjectFromManifest(snapshot.manifest, projectId)
    const saved = await savePortfolioManifest(nextManifest, snapshot.etag)
    const urls = getOwnedBlobUrls(projectId, existingProjects)
    let warning: string | undefined

    try {
      await deleteBlobUrls(urls)
    } catch (error) {
      warning =
        error instanceof Error
          ? `Project deleted, but media cleanup failed: ${error.message}`
          : "Project deleted, but media cleanup failed."
    }

    revalidatePath("/")
    revalidatePath(`/work/${projectId}`)

    return NextResponse.json({
      ok: true,
      etag: saved.etag,
      warning,
    })
  } catch (error) {
    if (error instanceof ManifestConflictError) {
      return jsonError(error.message, 409)
    }

    return jsonError(
      error instanceof Error ? error.message : "Unable to delete project.",
      500,
    )
  }
}
