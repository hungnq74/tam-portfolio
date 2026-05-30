import "server-only"

import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { NextRequest, NextResponse } from "next/server"

export const ADMIN_COOKIE_NAME = "tam_admin_session"
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8

interface AdminAuthConfig {
  username: string
  password: string
  secret: string
}

export function getAdminAuthConfig() {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_SESSION_SECRET

  if (!username || !password || !secret) {
    return {
      configured: false as const,
      missing: [
        !username ? "ADMIN_USERNAME" : null,
        !password ? "ADMIN_PASSWORD" : null,
        !secret ? "ADMIN_SESSION_SECRET" : null,
      ].filter(Boolean) as string[],
    }
  }

  return {
    configured: true as const,
    config: { username, password, secret } satisfies AdminAuthConfig,
  }
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url")
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) return false

  return timingSafeEqual(leftBuffer, rightBuffer)
}

function serializeSession(username: string, secret: string) {
  const expiresAt = Date.now() + ADMIN_COOKIE_MAX_AGE * 1000
  const payload = Buffer.from(JSON.stringify({ username, expiresAt })).toString("base64url")
  const signature = sign(payload, secret)

  return `${payload}.${signature}`
}

function verifySession(value: string | undefined) {
  if (!value) return false

  const configState = getAdminAuthConfig()
  if (!configState.configured) return false

  const [payload, signature] = value.split(".")
  if (!payload || !signature) return false

  const expectedSignature = sign(payload, configState.config.secret)
  if (!safeEqual(signature, expectedSignature)) return false

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      username?: string
      expiresAt?: number
    }

    return (
      session.username === configState.config.username &&
      typeof session.expiresAt === "number" &&
      session.expiresAt > Date.now()
    )
  } catch {
    return false
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  return verifySession(cookieStore.get(ADMIN_COOKIE_NAME)?.value)
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login")
  }
}

export function requireAdminRequest(request: NextRequest) {
  if (!verifySession(request.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return false
  }

  return true
}

export function setAdminSessionCookie(response: NextResponse, username: string) {
  const configState = getAdminAuthConfig()

  if (!configState.configured) {
    throw new Error("Admin auth is not configured.")
  }

  response.cookies.set(ADMIN_COOKIE_NAME, serializeSession(username, configState.config.secret), {
    httpOnly: true,
    maxAge: ADMIN_COOKIE_MAX_AGE,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

export function credentialsMatch(username: string, password: string) {
  const configState = getAdminAuthConfig()

  if (!configState.configured) return false

  return (
    safeEqual(username, configState.config.username) &&
    safeEqual(password, configState.config.password)
  )
}
