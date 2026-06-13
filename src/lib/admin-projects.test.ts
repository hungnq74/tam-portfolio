import { describe, expect, it } from "vitest"
import {
  createLocalizedProjects,
  validateAdminProjectPayload,
} from "@/lib/admin-projects"
import { createAdminPayload, testMedia } from "@/test/factories"

describe("validateAdminProjectPayload", () => {
  it("requires media when creating a project", () => {
    const payload = createAdminPayload({ shared: { media: undefined } })

    const result = validateAdminProjectPayload(payload, { requireMedia: true })

    expect(result.success).toBe(false)
    expect(result.errors).toContain(
      "Upload a cover image and proposal PDF before saving this Thinking project.",
    )
  })

  it("requires AXE-style media when editing a Thinking project", () => {
    const payload = createAdminPayload({ shared: { media: undefined } })

    const result = validateAdminProjectPayload(payload, {
      requireMedia: false,
      routeProjectId: "demo-project",
    })

    expect(result.success).toBe(false)
    expect(result.errors).toContain(
      "Upload a cover image and proposal PDF before saving this Thinking project.",
    )
  })

  it("requires cover, summary, and proposal slides for Thinking media", () => {
    const withoutSummary = validateAdminProjectPayload(
      createAdminPayload({
        shared: {
          media: {
            cover: testMedia.cover,
            proposalSlides: testMedia.proposalSlides,
          },
        },
      }),
      { requireMedia: false },
    )
    const withoutSlides = validateAdminProjectPayload(
      createAdminPayload({
        shared: {
          media: {
            cover: testMedia.cover,
            summary: testMedia.summary,
          },
        },
      }),
      { requireMedia: false },
    )

    expect(withoutSummary.success).toBe(false)
    expect(withoutSummary.errors).toContain(
      "Upload a cover image and proposal PDF before saving this Thinking project.",
    )
    expect(withoutSlides.success).toBe(false)
    expect(withoutSlides.errors).toContain(
      "Upload a cover image and proposal PDF before saving this Thinking project.",
    )
  })

  it("rejects admin saves outside Thinking in Systems", () => {
    const result = validateAdminProjectPayload(
      createAdminPayload({
        shared: { fieldId: "creative-copywriter" },
        locales: {
          en: { category: "Social Video Script" },
          vi: { category: "Kịch bản video social" },
        },
      }),
      { requireMedia: false },
    )

    expect(result.success).toBe(false)
    expect(result.errors).toContain("Admin can only manage Thinking in Systems projects.")
  })

  it("rejects invalid slugs and route id changes", () => {
    const invalidSlug = validateAdminProjectPayload(
      createAdminPayload({ shared: { id: "Bad Project" } }),
      { requireMedia: false },
    )
    const changedId = validateAdminProjectPayload(createAdminPayload(), {
      requireMedia: false,
      routeProjectId: "another-project",
    })

    expect(invalidSlug.success).toBe(false)
    expect(invalidSlug.errors).toContain("Project id must be a lowercase slug.")
    expect(changedId.success).toBe(false)
    expect(changedId.errors).toContain("Project id cannot be changed after creation.")
  })

  it("validates locale categories against the selected field filters", () => {
    const result = validateAdminProjectPayload(
      createAdminPayload({
        locales: {
          en: { category: "Brand Story" },
          vi: { category: "Brand Story" },
        },
      }),
      { requireMedia: false },
    )

    expect(result.success).toBe(false)
    expect(result.errors).toEqual([
      "EN category must match one of the selected field filters.",
      "VI category must match one of the selected field filters.",
    ])
  })

  it("rejects media with an empty proposal carousel", () => {
    const result = validateAdminProjectPayload(
      createAdminPayload({
        shared: {
          media: {
            ...testMedia,
            proposalSlides: [],
          },
        },
      }),
      { requireMedia: false },
    )

    expect(result.success).toBe(false)
    expect(result.errors).toContain(
      "Proposal carousel must contain at least one slide when media is provided.",
    )
  })
})

describe("createLocalizedProjects", () => {
  it("splits shared and localized fields into locale-specific projects", () => {
    const projects = createLocalizedProjects(createAdminPayload())

    expect(projects.en).toMatchObject({
      id: "demo-project",
      fieldId: "social-planner",
      title: "Demo project",
      category: "Campaign",
      year: "2026",
      media: testMedia,
    })
    expect(projects.vi).toMatchObject({
      id: "demo-project",
      title: "Du an demo",
      category: "Chiến dịch",
      scope: ["Chien luoc", "Ke hoach noi dung"],
      thumbnail: { col: 0, row: 1 },
    })
  })
})
