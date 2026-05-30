import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextRequest, NextResponse } from "next/server"
import { ADMIN_PROJECT_PDF_SIZE_LIMIT } from "@/lib/admin-projects"
import { requireAdminRequest } from "@/lib/admin-auth"
import { hasBlobConfig } from "@/lib/portfolio-manifest"

const PROJECT_UPLOAD_PATH =
  /^projects\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9-]+\/(?:cover\.(?:png|jpe?g|webp)|summary\.png|proposal-\d{2,3}\.png)$/i

export async function POST(request: NextRequest) {
  if (!requireAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  if (!hasBlobConfig()) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is required before uploading media." },
      { status: 503 },
    )
  }

  const body = (await request.json().catch(() => null)) as HandleUploadBody | null

  if (!body) {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 })
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!PROJECT_UPLOAD_PATH.test(pathname)) {
          throw new Error("Upload path is not allowed.")
        }

        return {
          addRandomSuffix: false,
          allowOverwrite: false,
          allowedContentTypes: ["image/png", "image/jpeg", "image/webp"],
          cacheControlMaxAge: 31536000,
          maximumSizeInBytes: ADMIN_PROJECT_PDF_SIZE_LIMIT,
          tokenPayload: clientPayload,
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to prepare upload.",
      },
      { status: 400 },
    )
  }
}
