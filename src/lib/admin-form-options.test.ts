import { describe, expect, it } from "vitest"
import { getAdminFieldOptions } from "@/lib/admin-form-options"

describe("getAdminFieldOptions", () => {
  it("returns only the Thinking in Systems field for admin-managed projects", () => {
    expect(getAdminFieldOptions().map((field) => field.id)).toEqual(["social-planner"])
  })
})
