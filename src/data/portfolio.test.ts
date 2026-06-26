import { describe, expect, it } from "vitest"
import { existsSync } from "node:fs"
import path from "node:path"
import {
  PORTFOLIO_CONTENT,
  type Locale,
  type Project,
  type ProjectMediaAsset,
} from "@/data/portfolio"

const REMOVED_THINKING_PROJECT_IDS = [
  "tet-ve-nha",
  "lang-nghe-viet",
  "xanh-moi-ngay",
  "an-lanh-song-khoe",
  "thuong-hieu-me-be",
  "back-to-school",
] as const

const LOCALES = ["en", "vi"] as const

function expectLocalAssetExists(src: string) {
  if (!src.startsWith("/")) return

  const cleanPath = src.split(/[?#]/)[0]?.replace(/^\/+/, "")
  expect(cleanPath, `asset path for ${src}`).toBeTruthy()

  const absolutePath = path.join(process.cwd(), "public", cleanPath ?? "")
  expect(existsSync(absolutePath), `missing public asset ${src}`).toBe(true)
}

function collectProjectMediaAssets(project: Project) {
  const media = project.media
  if (!media) return []

  const assets: ProjectMediaAsset[] = [
    media.cover,
    media.cardCover,
    media.summary,
    media.websitePreview,
    ...(media.proposalSlides ?? []),
    ...(media.contentPosts ?? []),
    ...(media.videoCampaigns ?? []).flatMap((campaign) => campaign.videos),
    ...(media.imageCampaigns ?? []).flatMap((campaign) => campaign.images),
    ...(media.postCampaigns ?? []).flatMap((campaign) => [
      ...(campaign.posts ?? []),
      ...(campaign.sections ?? []).flatMap((section) => section.posts),
    ]),
    ...(media.outreachSections ?? []).flatMap((section) => section.posts),
  ].filter(Boolean) as ProjectMediaAsset[]

  return assets
}

describe("static portfolio projects", () => {
  it("keeps AXE as the Thinking sample and removes placeholder Thinking projects", () => {
    LOCALES.forEach((locale: Locale) => {
      const projectIds = PORTFOLIO_CONTENT[locale].projects.map((project) => project.id)

      expect(projectIds).toContain("axe")
      REMOVED_THINKING_PROJECT_IDS.forEach((projectId) => {
        expect(projectIds).not.toContain(projectId)
      })
    })
  })

  it("keeps locale project inventories and route wiring consistent", () => {
    const englishProjectIds = PORTFOLIO_CONTENT.en.projects.map((project) => project.id).sort()

    LOCALES.forEach((locale: Locale) => {
      const content = PORTFOLIO_CONTENT[locale]
      const fieldIds = new Set(content.fields.map((field) => field.id))
      const projectIds = content.projects.map((project) => project.id)

      expect(new Set(projectIds).size, `${locale} project ids are unique`).toBe(
        projectIds.length,
      )
      expect(projectIds.toSorted(), `${locale} project inventory matches English`).toEqual(
        englishProjectIds,
      )

      content.projects.forEach((project) => {
        expect(project.id, `${locale} project id is a stable slug`).toMatch(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        )
        expect(fieldIds.has(project.fieldId), `${locale}/${project.id} field exists`).toBe(
          true,
        )
      })

      content.fields.forEach((field) => {
        field.scopeCards?.forEach((scope) => {
          expect(
            field.filters.includes(scope.category),
            `${locale}/${field.id}/${scope.id} category is listed in field filters`,
          ).toBe(true)

          if (scope.landingProjectId) {
            expect(
              content.projects.some((project) => project.id === scope.landingProjectId),
              `${locale}/${field.id}/${scope.id} landing project exists`,
            ).toBe(true)
          }
        })
      })
    })
  })

  it("keeps English scope cards backed by public projects", () => {
    const content = PORTFOLIO_CONTENT.en

    content.fields.forEach((field) => {
      field.scopeCards?.forEach((scope) => {
        const matchingProjects = content.projects.filter(
          (project) => project.fieldId === field.id && project.category === scope.category,
        )

        if (scope.landingProjectId) {
          expect(
            matchingProjects.some((project) => project.id === scope.landingProjectId),
            `${field.id}/${scope.id} landing project matches its scope category`,
          ).toBe(true)
          return
        }

        expect(
          matchingProjects.length,
          `${field.id}/${scope.id} has at least one public project`,
        ).toBeGreaterThan(0)
      })
    })
  })

  it("keeps Tesla Education split into video and always-on scope projects", () => {
    const projects = PORTFOLIO_CONTENT.en.projects
    const videoProject = projects.find((project) => project.id === "tesla-education")
    const alwaysOnProject = projects.find(
      (project) => project.id === "tesla-education-always-on",
    )

    expect(videoProject).toMatchObject({
      title: "Tesla Education",
      category: "Social Video Script",
      summary:
        "Every school has a story. The challenge is telling it in a way that people can actually feel.",
    })
    expect(videoProject?.media?.videoCampaigns?.[0].videos[0].sourceUrl).toBe(
      "https://www.facebook.com/reel/1355172016653079",
    )

    expect(alwaysOnProject).toMatchObject({
      title: "Tesla Education",
      category: "Fanpage Always-on Content",
      summary: "Choosing a school is about finding a place that feels right for your child's story.",
    })
    expect(alwaysOnProject?.media?.introLayout).toBe("split-cover")
    expect(alwaysOnProject?.media?.contentPostsLayout).toBe("carousel")
    expect(alwaysOnProject?.media?.contentPosts).toHaveLength(6)
  })

  it("references existing local public assets with valid media metadata", () => {
    LOCALES.forEach((locale: Locale) => {
      const content = PORTFOLIO_CONTENT[locale]

      expectLocalAssetExists(content.ui.cover.imageSrc)
      expectLocalAssetExists(content.author.image)

      content.fields.forEach((field) => {
        expectLocalAssetExists(field.image)
        expectLocalAssetExists(field.sheetImage)
        field.scopeCards?.forEach((scope) => expectLocalAssetExists(scope.image))
      })

      content.projects.forEach((project) => {
        collectProjectMediaAssets(project).forEach((asset) => {
          expect(asset.alt.trim(), `${locale}/${project.id}/${asset.src} alt text`).toBeTruthy()
          expect(asset.width, `${locale}/${project.id}/${asset.src} width`).toBeGreaterThan(0)
          expect(asset.height, `${locale}/${project.id}/${asset.src} height`).toBeGreaterThan(0)
          expectLocalAssetExists(asset.src)
        })
      })
    })
  })
})
