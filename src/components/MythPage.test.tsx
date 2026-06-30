import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { MythPage } from "@/components/MythPage"

describe("MythPage", () => {
  beforeEach(() => {
    window.history.pushState(null, "", "/myth")
    window.localStorage.clear()
  })

  it("renders and cycles through LinkedIn recommendation images", async () => {
    const user = userEvent.setup()

    render(<MythPage />)

    const carousel = screen.getByRole("region", {
      name: "Reader Reviews carousel",
    })

    expect(screen.getByRole("heading", { name: "Reader Reviews" }))
      .toBeInTheDocument()
    expect(carousel).toHaveAttribute("aria-roledescription", "carousel")
    expect(
      screen.getByRole("img", {
        name: "LinkedIn recommendation from Quy Le Ba for Minh Tâm",
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Next recommendation" }))
    expect(
      screen.getByRole("img", {
        name: "LinkedIn recommendation from Tin Ngo for Minh Tâm",
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Next recommendation" }))
    expect(
      screen.getByRole("img", {
        name: "LinkedIn recommendation from Thao Anh Trinh for Minh Tâm",
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Next recommendation" }))
    expect(
      screen.getByRole("img", {
        name: "LinkedIn recommendation from Tom Vo for Minh Tâm",
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Next recommendation" }))
    expect(
      screen.getByRole("img", {
        name: "LinkedIn recommendation from Quy Le Ba for Minh Tâm",
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Previous recommendation" }))
    expect(
      screen.getByRole("img", {
        name: "LinkedIn recommendation from Tom Vo for Minh Tâm",
      }),
    ).toBeInTheDocument()
  })
})
