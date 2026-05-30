import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AdminLoginForm } from "@/components/admin/AdminLoginForm"
import { getMockRouter } from "@/test/setup"

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

describe("AdminLoginForm", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it("shows API errors without navigating", async () => {
    const user = userEvent.setup()
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ error: "Invalid login." }, 401))
    vi.stubGlobal("fetch", fetch)

    render(<AdminLoginForm />)

    await user.type(screen.getByLabelText("Username"), "tam")
    await user.type(screen.getByLabelText("Password"), "wrong")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(await screen.findByText("Invalid login.")).toBeInTheDocument()
    expect(getMockRouter().push).not.toHaveBeenCalled()
  })

  it("posts credentials and navigates to the admin dashboard on success", async () => {
    const user = userEvent.setup()
    const router = getMockRouter()
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal("fetch", fetch)

    render(<AdminLoginForm />)

    await user.type(screen.getByLabelText("Username"), "tam")
    await user.type(screen.getByLabelText("Password"), "secret")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(fetch).toHaveBeenCalledWith("/admin/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "tam", password: "secret" }),
    })
    expect(router.push).toHaveBeenCalledWith("/admin")
    expect(router.refresh).toHaveBeenCalled()
  })
})
