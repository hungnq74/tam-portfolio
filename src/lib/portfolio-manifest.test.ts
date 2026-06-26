import { describe, expect, it } from "vitest"
import { getStaticProjectsByLocale, type Project } from "@/data/portfolio"
import { createManifestFromProjects } from "@/lib/admin-projects"
import {
  addProjectToManifest,
  assertExpectedEtag,
  getOwnedBlobUrls,
  getUnusedOwnedBlobUrls,
  hydrateManifestProjectDefaults,
  ManifestConflictError,
  removeProjectFromManifest,
  replaceProjectInManifest,
  type PortfolioSnapshot,
} from "@/lib/portfolio-manifest"

function createProject(id: string, overrides: Partial<Project> = {}): Project {
  return {
    id,
    fieldId: "social-planner",
    title: `${id} title`,
    eyebrow: "Project",
    category: "Campaign",
    summary: `${id} summary`,
    client: "Client",
    year: "2026",
    scope: ["Strategy"],
    overview: "Overview",
    objective: "Objective",
    solution: "Solution",
    results: ["Result"],
    thumbnail: { col: 0, row: 0 },
    ...overrides,
  }
}

describe("portfolio manifest mutation helpers", () => {
  it("adds, replaces, and removes localized projects without changing unrelated items", () => {
    const original = createProject("original")
    const manifest = createManifestFromProjects({
      en: [original],
      vi: [createProject("original", { title: "Ban dau" })],
    })
    const added = {
      en: createProject("new-project", { title: "New EN" }),
      vi: createProject("new-project", { title: "New VI" }),
    }

    const withProject = addProjectToManifest(manifest, added)
    const replaced = replaceProjectInManifest(withProject, {
      en: createProject("new-project", { title: "Updated EN" }),
      vi: createProject("new-project", { title: "Updated VI" }),
    })
    const removed = removeProjectFromManifest(replaced, "new-project")

    expect(withProject.locales.en.projects.map((project) => project.id)).toEqual([
      "original",
      "new-project",
    ])
    expect(replaced.locales.en.projects.find((project) => project.id === "new-project"))
      .toMatchObject({ title: "Updated EN" })
    expect(replaced.locales.vi.projects.find((project) => project.id === "new-project"))
      .toMatchObject({ title: "Updated VI" })
    expect(removed.locales.en.projects).toEqual([original])
    expect(removed.locales.vi.projects).toHaveLength(1)
  })

  it("throws a manifest conflict when the expected etag is stale", () => {
    const snapshot = {
      etag: "current-etag",
    } as PortfolioSnapshot

    expect(() => assertExpectedEtag(snapshot, "current-etag")).not.toThrow()
    expect(() => assertExpectedEtag(snapshot, "old-etag")).toThrow(ManifestConflictError)
    expect(() => assertExpectedEtag({ etag: null } as PortfolioSnapshot, null)).not.toThrow()
  })

  it("hydrates hidden static project defaults into older runtime manifests", () => {
    const manifest = createManifestFromProjects({
      en: [createProject("axe", { title: "Runtime AXE" })],
      vi: [createProject("axe", { title: "Runtime AXE VI" })],
    })

    const hydrated = hydrateManifestProjectDefaults(manifest)

    expect(hydrated.locales.en.projects[0]).toMatchObject({ title: "Runtime AXE" })
    expect(hydrated.locales.vi.projects[0]).toMatchObject({ title: "Runtime AXE VI" })
    expect(hydrated.locales.en.projects[0].proposalCta).toEqual({
      label: "View full portfolio",
      credit: "Shout out to the friends who built this proposal with me.",
      creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
    })
    expect(hydrated.locales.vi.projects[0].proposalCta).toEqual({
      label: "Coi full portfolio",
      credit: "Shout out những người đã cùng làm proposal với tôi.",
      creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
    })
  })

  it("hydrates credit names into older manifests that already have proposal CTA copy", () => {
    const manifest = createManifestFromProjects({
      en: [
        createProject("axe", {
          proposalCta: {
            label: "View full portfolio",
            credit: "Older credit copy",
          },
        }),
      ],
      vi: [
        createProject("axe", {
          proposalCta: {
            label: "Coi full portfolio",
            credit: "Credit cũ",
          },
        }),
      ],
    })

    const hydrated = hydrateManifestProjectDefaults(manifest)

    expect(hydrated.locales.en.projects[0].proposalCta).toEqual({
      label: "View full portfolio",
      credit: "Older credit copy",
      creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
    })
    expect(hydrated.locales.vi.projects[0].proposalCta).toEqual({
      label: "Coi full portfolio",
      credit: "Credit cũ",
      creditNames: ["Minh Anh", "Hoàng Linh", "Bảo Trân"],
    })
  })

  it("does not add hidden defaults to projects missing from static content", () => {
    const manifest = createManifestFromProjects({
      en: [createProject("custom-project")],
      vi: [createProject("custom-project")],
    })

    const hydrated = hydrateManifestProjectDefaults(manifest)

    expect(hydrated.locales.en.projects[0].proposalCta).toBeUndefined()
    expect(hydrated.locales.vi.projects[0].proposalCta).toBeUndefined()
  })

  it("merges static creative-copywriter projects missing from older runtime manifests", () => {
    const staticProjects = getStaticProjectsByLocale()
    const staticAeon = staticProjects.en.find((project) => project.id === "aeon-vietnam")
    const staticAeonVi = staticProjects.vi.find((project) => project.id === "aeon-vietnam")

    const manifest = createManifestFromProjects({
      en: [
        createProject("acecook", {
          fieldId: "creative-copywriter",
          category: "Fanpage Always-on Content",
        }),
        createProject("weshare", {
          fieldId: "creative-copywriter",
          category: "Fanpage Always-on Content",
        }),
        createProject("panasonic", {
          fieldId: "creative-copywriter",
          category: "Fanpage Always-on Content",
        }),
      ],
      vi: [
        createProject("acecook", {
          fieldId: "creative-copywriter",
          category: "Fanpage Always-on Content",
        }),
        createProject("weshare", {
          fieldId: "creative-copywriter",
          category: "Fanpage Always-on Content",
        }),
        createProject("panasonic", {
          fieldId: "creative-copywriter",
          category: "Fanpage Always-on Content",
        }),
      ],
    })

    const hydrated = hydrateManifestProjectDefaults(manifest)

    expect(hydrated.locales.en.projects.find((project) => project.id === "aeon-vietnam"))
      .toEqual(staticAeon)
    expect(hydrated.locales.vi.projects.find((project) => project.id === "aeon-vietnam"))
      .toEqual(staticAeonVi)
  })

  it("replaces stale runtime creative-copywriter projects with static code-owned data", () => {
    const staticTesla = getStaticProjectsByLocale().en.find(
      (project) => project.id === "tesla-education",
    )
    const manifest = createManifestFromProjects({
      en: [
        createProject("tesla-education", {
          fieldId: "creative-copywriter",
          title: "Old Tesla",
          summary: "Old runtime Tesla summary",
          overview: "Old runtime Tesla overview",
          media: {
            cover: {
              src: "/assets/projects/tesla-education/old-cover.jpg",
              alt: "Old Tesla cover",
              width: 1200,
              height: 630,
            },
          },
        }),
      ],
      vi: [],
    })

    const hydrated = hydrateManifestProjectDefaults(manifest)
    const hydratedTesla = hydrated.locales.en.projects.find(
      (project) => project.id === "tesla-education",
    )

    expect(hydratedTesla).toEqual(staticTesla)
    expect(hydratedTesla?.summary).toBe(
      "Every school has a story. The challenge is telling it in a way that people can actually feel.",
    )
    expect(hydratedTesla?.media?.cover.src).toBe(
      "/assets/projects/tesla-education/video-01.jpg",
    )
    expect(
      hydrated.locales.en.projects.some(
        (project) => project.id === "tesla-education-always-on",
      ),
    ).toBe(true)
  })

  it("preserves runtime-only projects while merging code-owned creative projects", () => {
    const manifest = createManifestFromProjects({
      en: [
        createProject("runtime-only-project", {
          fieldId: "creative-copywriter",
          title: "Runtime-only Project",
        }),
      ],
      vi: [],
    })

    const hydrated = hydrateManifestProjectDefaults(manifest)

    expect(hydrated.locales.en.projects.find((project) => project.id === "runtime-only-project"))
      .toMatchObject({ title: "Runtime-only Project" })
    expect(hydrated.locales.en.projects.some((project) => project.id === "aeon-vietnam"))
      .toBe(true)
  })
})

describe("owned Blob URL helpers", () => {
  it("returns only Blob URLs owned by the project path", () => {
    const project = createProject("demo", {
      media: {
        cover: {
          src: "https://store.blob.vercel-storage.com/projects/demo/a/cover.png",
          alt: "Cover",
          width: 1600,
          height: 900,
        },
        cardCover: {
          src: "projects/demo/a/card-cover.png",
          alt: "Card cover",
          width: 1600,
          height: 900,
        },
        summary: {
          src: "https://cdn.example.com/projects/demo/a/summary.png",
          alt: "Summary",
          width: 1600,
          height: 900,
        },
        websitePreview: {
          src: "projects/demo/a/website-preview.png",
          alt: "Website preview",
          width: 1600,
          height: 9000,
        },
        proposalSlides: [
          {
            src: "projects/demo/a/proposal-01.png",
            alt: "Slide one",
            width: 1600,
            height: 900,
          },
          {
            src: "https://store.blob.vercel-storage.com/projects/other/a/proposal-02.png",
            alt: "Foreign slide",
            width: 1600,
            height: 900,
          },
        ],
        contentPosts: [
          {
            src: "projects/demo/a/content-01.png",
            alt: "Content post one",
            width: 1600,
            height: 1600,
          },
          {
            src: "https://store.blob.vercel-storage.com/projects/other/a/content-02.png",
            alt: "Foreign post",
            width: 1600,
            height: 1600,
          },
        ],
        imageCampaigns: [
          {
            title: "Image campaign one",
            description: "Image campaign group.",
            images: [
              {
                src: "projects/demo/a/image-campaign-01.png",
                alt: "Image campaign one",
                width: 1600,
                height: 900,
              },
              {
                src: "https://store.blob.vercel-storage.com/projects/other/a/image-campaign-02.png",
                alt: "Foreign image campaign",
                width: 1600,
                height: 900,
              },
            ],
          },
        ],
        postCampaigns: [
          {
            title: "Post campaign one",
            description: "Post campaign group.",
            posts: [
              {
                src: "projects/demo/a/post-campaign-01.png",
                alt: "Direct post campaign asset",
                width: 1200,
                height: 1200,
              },
              {
                src: "https://store.blob.vercel-storage.com/projects/other/a/post-campaign-02.png",
                alt: "Foreign direct post campaign asset",
                width: 1200,
                height: 1200,
              },
            ],
            sections: [
              {
                title: "Nested section",
                description: "Nested post campaign section.",
                posts: [
                  {
                    src: "projects/demo/a/post-campaign-section-01.png",
                    alt: "Nested post campaign asset",
                    width: 1200,
                    height: 1200,
                  },
                  {
                    src: "https://store.blob.vercel-storage.com/projects/other/a/post-campaign-section-02.png",
                    alt: "Foreign nested post campaign asset",
                    width: 1200,
                    height: 1200,
                  },
                ],
              },
            ],
          },
        ],
        videoCampaigns: [
          {
            title: "Campaign one",
            description: "Video campaign group.",
            videos: [
              {
                src: "projects/demo/a/video-01.png",
                alt: "Video one",
                width: 1080,
                height: 1920,
              },
              {
                src: "https://store.blob.vercel-storage.com/projects/other/a/video-02.png",
                alt: "Foreign video",
                width: 1080,
                height: 1920,
              },
            ],
          },
        ],
        outreachSections: [
          {
            title: "Outreach one",
            description: "Outreach group.",
            displayMode: "linked-posts",
            posts: [
              {
                src: "projects/demo/a/outreach-01.png",
                alt: "Outreach one",
                width: 1200,
                height: 1200,
              },
              {
                src: "https://store.blob.vercel-storage.com/projects/other/a/outreach-02.png",
                alt: "Foreign outreach",
                width: 1200,
                height: 1200,
              },
            ],
          },
        ],
      },
    })

    expect(getOwnedBlobUrls("demo", [project])).toEqual([
      "https://store.blob.vercel-storage.com/projects/demo/a/cover.png",
      "projects/demo/a/card-cover.png",
      "projects/demo/a/website-preview.png",
      "projects/demo/a/proposal-01.png",
      "projects/demo/a/content-01.png",
      "projects/demo/a/image-campaign-01.png",
      "projects/demo/a/post-campaign-01.png",
      "projects/demo/a/post-campaign-section-01.png",
      "projects/demo/a/video-01.png",
      "projects/demo/a/outreach-01.png",
    ])
  })

  it("finds owned Blob URLs that are no longer referenced after an edit", () => {
    const before = createProject("demo", {
      media: {
        cover: {
          src: "projects/demo/old/cover.png",
          alt: "Old cover",
          width: 1600,
          height: 900,
        },
        proposalSlides: [
          {
            src: "projects/demo/old/proposal-01.png",
            alt: "Old slide",
            width: 1600,
            height: 900,
          },
        ],
      },
    })
    const after = createProject("demo", {
      media: {
        cover: {
          src: "projects/demo/new/cover.png",
          alt: "New cover",
          width: 1600,
          height: 900,
        },
        proposalSlides: [
          {
            src: "projects/demo/old/proposal-01.png",
            alt: "Kept slide",
            width: 1600,
            height: 900,
          },
        ],
      },
    })

    expect(
      getUnusedOwnedBlobUrls({
        projectId: "demo",
        before: [before],
        after: [after],
      }),
    ).toEqual(["projects/demo/old/cover.png"])
  })
})
