import { describe, expect, it } from "vitest"
import { getAdminFieldOptions } from "@/lib/admin-form-options"

describe("getAdminFieldOptions", () => {
  it("returns only the proposal-style Thinking field for admin-managed projects", () => {
    const fields = getAdminFieldOptions()

    expect(fields.map((field) => field.id)).toEqual(["social-planner"])
    expect(fields[0]?.filters.en).toContain("Campaign")
  })
})
