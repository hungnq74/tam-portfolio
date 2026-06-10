import type { FieldId, Locale, Project, ProjectMedia } from "@/data/portfolio"
import type { AdminProjectSavePayload } from "@/lib/admin-projects"

export const testMedia: ProjectMedia = {
  cover: {
    src: "https://store.blob.vercel-storage.com/projects/demo-project/a/cover.png",
    alt: "Demo project cover image",
    width: 1600,
    height: 900,
    focalPoint: { x: 50, y: 50 },
  },
  summary: {
    src: "https://store.blob.vercel-storage.com/projects/demo-project/a/proposal-01.png",
    alt: "Demo project proposal page 1",
    width: 1600,
    height: 900,
  },
  proposalSlides: [
    {
      src: "https://store.blob.vercel-storage.com/projects/demo-project/a/proposal-01.png",
      alt: "Demo project proposal page 1",
      width: 1600,
      height: 900,
    },
  ],
}

export function createAdminPayload(
  overrides: Omit<Partial<AdminProjectSavePayload>, "shared" | "locales"> & {
    shared?: Partial<AdminProjectSavePayload["shared"]>
    locales?: {
      en?: Partial<AdminProjectSavePayload["locales"]["en"]>
      vi?: Partial<AdminProjectSavePayload["locales"]["vi"]>
    }
  } = {},
): AdminProjectSavePayload {
  const payload: AdminProjectSavePayload = {
    expectedEtag: "etag-1",
    shared: {
      id: "demo-project",
      fieldId: "social-planner",
      year: "2026",
      thumbnail: { col: 0, row: 1 },
      media: testMedia,
    },
    locales: {
      en: createLocalePayload("en"),
      vi: createLocalePayload("vi"),
    },
  }

  return {
    ...payload,
    ...overrides,
    shared: {
      ...payload.shared,
      ...overrides.shared,
    },
    locales: {
      en: {
        ...payload.locales.en,
        ...overrides.locales?.en,
      },
      vi: {
        ...payload.locales.vi,
        ...overrides.locales?.vi,
      },
    },
  }
}

export function createProject(
  id = "demo-project",
  overrides: Partial<Project> = {},
): Project {
  return {
    id,
    fieldId: "social-planner",
    title: `${id} title`,
    eyebrow: "Project",
    category: "Campaign",
    summary: `${id} summary`,
    client: "Demo Client",
    year: "2026",
    scope: ["Strategy"],
    overview: "Overview text",
    objective: "Objective text",
    solution: "Solution text",
    results: ["Result one"],
    thumbnail: { col: 0, row: 1 },
    ...overrides,
  }
}

export function createSnapshot({
  projects = [],
  viProjects,
  etag = "etag-1",
  configured = true,
  error,
}: {
  projects?: Project[]
  viProjects?: Project[]
  etag?: string | null
  configured?: boolean
  error?: string
} = {}) {
  return {
    contentByLocale: {
      en: { projects },
      vi: { projects: viProjects ?? projects },
    },
    manifest: {
      version: 1,
      updatedAt: "2026-05-30T00:00:00.000Z",
      revision: "revision-1",
      locales: {
        en: { projects },
        vi: { projects: viProjects ?? projects },
      },
    },
    etag,
    configured,
    error,
  }
}

function createLocalePayload(locale: Locale) {
  return locale === "en"
    ? {
        title: "Demo project",
        eyebrow: "Project",
        category: "Campaign",
        summary: "Short project summary",
        client: "Demo Client",
        scope: ["Strategy", "Content Plan"],
        overview: "Overview text",
        objective: "Objective text",
        solution: "Solution text",
        results: ["Result one", "Result two"],
      }
    : {
        title: "Du an demo",
        eyebrow: "Du an",
        category: "Chiến dịch",
        summary: "Tom tat du an ngan",
        client: "Khach hang demo",
        scope: ["Chien luoc", "Ke hoach noi dung"],
        overview: "Noi dung tong quan",
        objective: "Muc tieu",
        solution: "Giai phap",
        results: ["Ket qua mot", "Ket qua hai"],
      }
}

export function createFieldOptions() {
  return [
    {
      id: "social-planner" as FieldId,
      title: "The Thinking",
      filters: {
        en: ["Strategy", "Campaign", "Content Plan"],
        vi: ["Chiến lược", "Chiến dịch", "Kế hoạch nội dung"],
      },
    },
    {
      id: "creative-copywriter" as FieldId,
      title: "The Making",
      filters: {
        en: [
          "Social Video Script",
          "Fanpage Always-on Content",
          "Website Content",
          "Social Outreach",
        ],
        vi: [
          "Kịch bản video social",
          "Nội dung fanpage always-on",
          "Nội dung website",
          "Social outreach",
        ],
      },
    },
  ]
}
