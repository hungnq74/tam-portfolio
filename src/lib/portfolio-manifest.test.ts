import { describe, expect, it } from "vitest"
import type { Project } from "@/data/portfolio"
import { createManifestFromProjects } from "@/lib/admin-projects"
import {
  addProjectToManifest,
  assertExpectedEtag,
  getOwnedBlobUrls,
  getUnusedOwnedBlobUrls,
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
      "projects/demo/a/website-preview.png",
      "projects/demo/a/proposal-01.png",
      "projects/demo/a/content-01.png",
      "projects/demo/a/image-campaign-01.png",
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
