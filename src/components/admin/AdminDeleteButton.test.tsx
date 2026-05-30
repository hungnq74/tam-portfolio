import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton"
import { getMockRouter } from "@/test/setup"

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

describe("AdminDeleteButton", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    vi.spyOn(window, "confirm").mockReturnValue(true)
  })

  it("does not call the API when deletion is cancelled", async () => {
    const user = userEvent.setup()
    const fetch = vi.fn()
    vi.stubGlobal("fetch", fetch)
    vi.mocked(window.confirm).mockReturnValue(false)

    render(<AdminDeleteButton projectId="demo-project" expectedEtag="etag-1" />)

    await user.click(screen.getByRole("button", { name: /delete/i }))

    expect(fetch).not.toHaveBeenCalled()
  })

  it("shows API delete errors inline", async () => {
    const user = userEvent.setup()
    const fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: "Delete failed." }, 500))
    vi.stubGlobal("fetch", fetch)

    render(<AdminDeleteButton projectId="demo-project" expectedEtag="etag-1" />)

    await user.click(screen.getByRole("button", { name: /delete/i }))

    expect(await screen.findByText("Delete failed.")).toBeInTheDocument()
    expect(getMockRouter().refresh).not.toHaveBeenCalled()
  })

  it("refreshes the dashboard after a successful inline delete", async () => {
    const user = userEvent.setup()
    const router = getMockRouter()
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal("fetch", fetch)

    render(<AdminDeleteButton projectId="demo-project" expectedEtag="etag-1" />)

    await user.click(screen.getByRole("button", { name: /delete/i }))

    expect(fetch).toHaveBeenCalledWith("/admin/api/projects/demo-project", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expectedEtag: "etag-1" }),
    })
    expect(router.refresh).toHaveBeenCalled()
  })

  it("redirects after deleting from an edit page", async () => {
    const user = userEvent.setup()
    const router = getMockRouter()
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ ok: true })))

    render(
      <AdminDeleteButton
        projectId="demo-project"
        expectedEtag={null}
        redirectTo="/admin"
      />,
    )

    await user.click(screen.getByRole("button", { name: /delete/i }))

    expect(router.push).toHaveBeenCalledWith("/admin")
  })
})
