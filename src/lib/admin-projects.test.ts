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

  it("allows Writing projects without AXE-style media", () => {
    const result = validateAdminProjectPayload(
      createAdminPayload({
        shared: { fieldId: "creative-copywriter", media: undefined },
        locales: {
          en: { category: "Social Video Script" },
          vi: { category: "Kịch bản video social" },
        },
      }),
      { requireMedia: false },
    )

    expect(result.success).toBe(true)
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

  it("preserves optional copy and locale-specific media text", () => {
    const projects = createLocalizedProjects(
      createAdminPayload({
        locales: {
          en: {
            campaignTitle: "English campaign",
            closingNote: "English closing note",
            media: {
              ...testMedia,
              cover: {
                ...testMedia.cover,
                alt: "English cover alt",
                caption: "English cover caption",
              },
            },
            namingRationale: {
              eyebrow: "Naming",
              title: "Why this name",
              items: [{ term: "Tet", definition: "Seasonal context" }],
              note: "English note",
            },
          },
          vi: {
            campaignTitle: "Chiến dịch tiếng Việt",
            closingNote: "Ghi chú kết tiếng Việt",
            media: {
              ...testMedia,
              cover: {
                ...testMedia.cover,
                alt: "Alt bìa tiếng Việt",
                caption: "Caption bìa tiếng Việt",
              },
            },
            namingRationale: {
              eyebrow: "Tên gọi",
              title: "Vì sao chọn tên này",
              items: [{ term: "Tết", definition: "Bối cảnh mùa lễ hội" }],
              note: "Ghi chú tiếng Việt",
            },
          },
        },
      }),
    )

    expect(projects.en.campaignTitle).toBe("English campaign")
    expect(projects.vi.campaignTitle).toBe("Chiến dịch tiếng Việt")
    expect(projects.en.media?.cover.caption).toBe("English cover caption")
    expect(projects.vi.media?.cover.caption).toBe("Caption bìa tiếng Việt")
    expect(projects.en.namingRationale?.items[0]).toEqual({
      term: "Tet",
      definition: "Seasonal context",
    })
    expect(projects.vi.namingRationale?.items[0]).toEqual({
      term: "Tết",
      definition: "Bối cảnh mùa lễ hội",
    })
  })
})
