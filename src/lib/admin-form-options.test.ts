import { describe, expect, it } from "vitest"
import { getAdminFieldOptions } from "@/lib/admin-form-options"

describe("getAdminFieldOptions", () => {
  it("returns both project fields for admin-managed projects", () => {
    const fields = getAdminFieldOptions()

    expect(fields.map((field) => field.id)).toEqual([
      "social-planner",
      "creative-copywriter",
    ])
    expect(fields.find((field) => field.id === "creative-copywriter")?.filters.en).toContain(
      "Brand Story",
    )
  })
})
