import { NextResponse } from "next/server"
import {
  credentialsMatch,
  getAdminAuthConfig,
  setAdminSessionCookie,
} from "@/lib/admin-auth"

export async function POST(request: Request) {
  const configState = getAdminAuthConfig()

  if (!configState.configured) {
    return NextResponse.json(
      {
        error: `Admin auth is missing: ${configState.missing.join(", ")}`,
      },
      { status: 503 },
    )
  }

  const body = (await request.json().catch(() => null)) as {
    username?: unknown
    password?: unknown
  } | null

  const username = typeof body?.username === "string" ? body.username : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!credentialsMatch(username, password)) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  setAdminSessionCookie(response, username)

  return response
}
