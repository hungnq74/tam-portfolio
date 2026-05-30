import { afterEach, describe, expect, it, vi } from "vitest"
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth"
import { POST } from "./route"

const originalEnv = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnv }
  vi.restoreAllMocks()
})

function loginRequest(body: unknown) {
  return new Request("http://localhost/admin/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("admin login API", () => {
  it("returns the missing admin env names when auth is not configured", async () => {
    delete process.env.ADMIN_USERNAME
    delete process.env.ADMIN_PASSWORD
    delete process.env.ADMIN_SESSION_SECRET

    const response = await POST(loginRequest({ username: "tam", password: "secret" }))

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: "Admin auth is missing: ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_SECRET",
    })
  })

  it("rejects invalid credentials", async () => {
    process.env.ADMIN_USERNAME = "tam"
    process.env.ADMIN_PASSWORD = "secret"
    process.env.ADMIN_SESSION_SECRET = "test-secret"

    const response = await POST(loginRequest({ username: "tam", password: "wrong" }))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      error: "Invalid username or password.",
    })
  })

  it("sets a scoped admin session cookie for valid credentials", async () => {
    process.env.ADMIN_USERNAME = "tam"
    process.env.ADMIN_PASSWORD = "secret"
    process.env.ADMIN_SESSION_SECRET = "test-secret"

    const response = await POST(loginRequest({ username: "tam", password: "secret" }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(response.headers.get("set-cookie")).toContain(`${ADMIN_COOKIE_NAME}=`)
    expect(response.headers.get("set-cookie")).toContain("Path=/admin")
    expect(response.headers.get("set-cookie")).toContain("HttpOnly")
  })
})
