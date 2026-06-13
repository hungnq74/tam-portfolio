import { describe, expect, it } from "vitest"
import { PORTFOLIO_CONTENT, type Locale } from "@/data/portfolio"

const REMOVED_THINKING_PROJECT_IDS = [
  "tet-ve-nha",
  "lang-nghe-viet",
  "xanh-moi-ngay",
  "an-lanh-song-khoe",
  "thuong-hieu-me-be",
  "back-to-school",
] as const

describe("static portfolio projects", () => {
  it("keeps AXE as the Thinking sample and removes placeholder Thinking projects", () => {
    ;(["en", "vi"] as const).forEach((locale: Locale) => {
      const projectIds = PORTFOLIO_CONTENT[locale].projects.map((project) => project.id)

      expect(projectIds).toContain("axe")
      REMOVED_THINKING_PROJECT_IDS.forEach((projectId) => {
        expect(projectIds).not.toContain(projectId)
      })
    })
  })
})
