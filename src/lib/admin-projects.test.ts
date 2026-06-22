import { describe, expect, it } from "vitest"
import {
  createLocalizedProjects,
  portfolioProjectSchema,
  validateAdminProjectPayload,
} from "@/lib/admin-projects"
import { createAdminPayload, createProject, testMedia } from "@/test/factories"

describe("portfolioProjectSchema", () => {
  it("accepts hidden proposal CTA credit names", () => {
    const result = portfolioProjectSchema.safeParse(
      createProject("demo-project", {
        proposalCta: {
          label: "View full portfolio",
          credit: "Shout out to the friends who built this proposal with me.",
          creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
        },
      }),
    )

    expect(result.success).toBe(true)
  })
})

describe("validateAdminProjectPayload", () => {
  it("requires cover, main image, and proposal slides", () => {
    const withoutMedia = validateAdminProjectPayload(
      createAdminPayload({ shared: { media: undefined } }),
      { requireMedia: false },
    )
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

    expect(withoutMedia.success).toBe(false)
    expect(withoutSummary.success).toBe(false)
    expect(withoutSlides.success).toBe(false)
    expect(withoutMedia.errors).toContain(
      "Upload a cover image, main image, and proposal PDF before saving this Thinking project.",
    )
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

  it("rejects invalid slugs, route id changes, and missing CTA/credit fields", () => {
    const invalidSlug = validateAdminProjectPayload(
      createAdminPayload({ shared: { id: "Bad Project" } }),
      { requireMedia: false },
    )
    const changedId = validateAdminProjectPayload(createAdminPayload(), {
      requireMedia: false,
      routeProjectId: "another-project",
    })
    const missingCta = validateAdminProjectPayload(
      createAdminPayload({
        locales: {
          en: { proposalCta: { label: "", credit: "" } },
        },
      }),
      { requireMedia: false },
    )

    expect(invalidSlug.success).toBe(false)
    expect(invalidSlug.errors).toContain("Project id must be a lowercase slug.")
    expect(changedId.success).toBe(false)
    expect(changedId.errors).toContain(
      "Project id cannot be changed after creation.",
    )
    expect(missingCta.success).toBe(false)
    expect(missingCta.errors.length).toBeGreaterThan(0)
  })

  it("requires at least one collaborator name chip", () => {
    const result = validateAdminProjectPayload(
      createAdminPayload({ shared: { creditNames: [] } }),
      { requireMedia: false },
    )

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it("rejects legacy admin payload fields that are no longer editable", () => {
    const legacyPayload = {
      ...createAdminPayload(),
      shared: {
        ...createAdminPayload().shared,
        fieldId: "creative-copywriter",
        year: "2026",
        thumbnail: { col: 0, row: 0 },
      },
      locales: {
        en: {
          ...createAdminPayload().locales.en,
          category: "Social Video Script",
          client: "Legacy Client",
          scope: ["Legacy Scope"],
          objective: "Legacy objective",
          solution: "Legacy solution",
          results: ["Legacy result"],
        },
        vi: createAdminPayload().locales.vi,
      },
    }

    const result = validateAdminProjectPayload(legacyPayload, {
      requireMedia: false,
    })

    expect(result.success).toBe(false)
    expect(result.errors.join(" ")).toContain("Unrecognized")
    expect(result.errors.join(" ")).toContain("fieldId")
    expect(result.errors.join(" ")).toContain("category")
  })
})

describe("createLocalizedProjects", () => {
  it("creates proposal-style projects with hidden defaults and localized CTA copy", () => {
    const projects = createLocalizedProjects(createAdminPayload())

    expect(projects.en).toMatchObject({
      id: "demo-project",
      fieldId: "social-planner",
      title: "Demo project",
      eyebrow: "Project",
      category: "Campaign",
      client: "Demo project",
      scope: ["Campaign proposal", "Creative direction", "Portfolio showcase"],
      thumbnail: { col: 1, row: 0 },
      media: testMedia,
      proposalCta: {
        label: "View full portfolio",
        credit: "Shout out to the friends who built this proposal with me.",
        creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
      },
    })
    expect(projects.vi).toMatchObject({
      id: "demo-project",
      fieldId: "social-planner",
      title: "Du an demo",
      eyebrow: "Dự án",
      category: "Chiến dịch",
      client: "Du an demo",
      proposalCta: {
        label: "Coi full portfolio",
        credit: "Shout out những người đã cùng làm proposal với tôi.",
        creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
      },
    })
    expect(projects.en.campaignTitle).toBeUndefined()
    expect(projects.en.closingNote).toBeUndefined()
    expect(projects.en.namingRationale).toBeUndefined()
  })

  it("preserves existing year while replacing admin-managed proposal content", () => {
    const existingEn = createProject("demo-project", {
      year: "2024",
      campaignTitle: "Legacy campaign",
      proposalCta: {
        label: "Old CTA",
        credit: "Old credit",
        creditNames: ["Old Name"],
      },
    })
    const existingVi = createProject("demo-project", {
      year: "2024",
      campaignTitle: "Chiến dịch cũ",
      proposalCta: {
        label: "CTA cũ",
        credit: "Credit cũ",
        creditNames: ["Tên cũ"],
      },
    })
    const projects = createLocalizedProjects(createAdminPayload(), {
      en: existingEn,
      vi: existingVi,
    })

    expect(projects.en.year).toBe("2024")
    expect(projects.vi.year).toBe("2024")
    expect(projects.en.campaignTitle).toBeUndefined()
    expect(projects.vi.campaignTitle).toBeUndefined()
    expect(projects.en.proposalCta).toEqual({
      label: "View full portfolio",
      credit: "Shout out to the friends who built this proposal with me.",
      creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
    })
  })
})
