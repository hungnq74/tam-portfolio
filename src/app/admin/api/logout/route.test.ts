import { describe, expect, it } from "vitest"
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth"
import { POST } from "./route"

describe("admin logout API", () => {
  it("clears the scoped admin session cookie", async () => {
    const response = await POST()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(response.headers.get("set-cookie")).toContain(`${ADMIN_COOKIE_NAME}=;`)
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0")
    expect(response.headers.get("set-cookie")).toContain("Path=/admin")
  })
})
