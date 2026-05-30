import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import {
  createLocalizedProjects,
  validateAdminProjectPayload,
} from "@/lib/admin-projects"
import { requireAdminRequest } from "@/lib/admin-auth"
import {
  addProjectToManifest,
  assertExpectedEtag,
  ManifestConflictError,
  readAdminPortfolioSnapshot,
  savePortfolioManifest,
} from "@/lib/portfolio-manifest"

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

export async function POST(request: NextRequest) {
  if (!requireAdminRequest(request)) {
    return jsonError("Unauthorized.", 401)
  }

  const input = await request.json().catch(() => null)
  const parsed = validateAdminProjectPayload(input, { requireMedia: true })

  if (!parsed.success) {
    return jsonError("Project validation failed.", 400, parsed.errors)
  }

  const snapshot = await readAdminPortfolioSnapshot()
  const writableError = getWritableError(snapshot)

  if (writableError) {
    return jsonError(writableError, 503)
  }

  try {
    assertExpectedEtag(snapshot, parsed.payload.expectedEtag)
  } catch (error) {
    if (error instanceof ManifestConflictError) {
      return jsonError(error.message, 409)
    }

    throw error
  }

  const projectId = parsed.payload.shared.id
  const duplicate = ["en", "vi"].some((locale) =>
    snapshot.manifest.locales[locale as "en" | "vi"].projects.some(
      (project) => project.id === projectId,
    ),
  )

  if (duplicate) {
    return jsonError("A project with this id already exists.", 409)
  }

  try {
    const projects = createLocalizedProjects(parsed.payload)
    const nextManifest = addProjectToManifest(snapshot.manifest, projects)
    const saved = await savePortfolioManifest(nextManifest, snapshot.etag)

    revalidatePath("/")
    revalidatePath(`/work/${projectId}`)

    return NextResponse.json({
      ok: true,
      etag: saved.etag,
      projectId,
    })
  } catch (error) {
    if (error instanceof ManifestConflictError) {
      return jsonError(error.message, 409)
    }

    return jsonError(
      error instanceof Error ? error.message : "Unable to create project.",
      500,
    )
  }
}
