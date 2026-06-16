import { describe, expect, it } from "vitest"
import { PORTFOLIO_CONTENT } from "@/data/portfolio"
import {
  getPortfolioGalleryHref,
  projectReturnsToScopeHub,
  resolvePortfolioRouteState,
} from "@/lib/portfolio-route-state"

function resolveEn(search = "", hash = "") {
  const content = PORTFOLIO_CONTENT.en

  return resolvePortfolioRouteState({
    allFilter: content.ui.allFilter,
    fields: content.fields,
    hash,
    projects: content.projects,
    search,
  })
}

function resolveVi(search = "", hash = "") {
  const content = PORTFOLIO_CONTENT.vi

  return resolvePortfolioRouteState({
    allFilter: content.ui.allFilter,
    fields: content.fields,
    hash,
    projects: content.projects,
    search,
  })
}

function getEnProjectWithField(projectId: string) {
  const content = PORTFOLIO_CONTENT.en
  const project = content.projects.find((item) => item.id === projectId)
  if (!project) throw new Error(`Missing test project ${projectId}`)

  const field = content.fields.find((item) => item.id === project.fieldId)
  if (!field) throw new Error(`Missing field for test project ${projectId}`)

  return { field, project }
}

describe("resolvePortfolioRouteState", () => {
  it("falls back to the cover with no route target", () => {
    expect(resolveEn()).toMatchObject({
      selectedFieldId: null,
      activeFilter: "All",
      selectedProjectId: null,
      targetSection: "cover",
      hasExplicitTarget: false,
    })
  })

  it("restores the Writing scope chooser from a field-only gallery URL", () => {
    expect(resolveEn("?field=creative-copywriter", "#gallery")).toMatchObject({
      selectedFieldId: "creative-copywriter",
      activeFilter: "All",
      selectedProjectId: null,
      targetSection: "gallery",
    })
  })

  it("restores Fanpage Always-on Content projects from media project URLs", () => {
    expect(resolveEn("?field=creative-copywriter&project=weshare", "#gallery")).toMatchObject({
      selectedFieldId: "creative-copywriter",
      activeFilter: "Fanpage Always-on Content",
      selectedProjectId: "weshare",
    })

    expect(resolveEn("?field=creative-copywriter&project=panasonic", "#gallery")).toMatchObject({
      selectedFieldId: "creative-copywriter",
      activeFilter: "Fanpage Always-on Content",
      selectedProjectId: "panasonic",
    })
  })

  it("restores the other Writing scopes from project URLs", () => {
    expect(resolveEn("?field=creative-copywriter&project=samsung", "#gallery")).toMatchObject({
      selectedFieldId: "creative-copywriter",
      activeFilter: "Social Video Script",
      selectedProjectId: "samsung",
    })

    expect(resolveEn("?field=creative-copywriter&project=tesla-education", "#gallery")).toMatchObject({
      selectedFieldId: "creative-copywriter",
      activeFilter: "Social Video Script",
      selectedProjectId: "tesla-education",
    })

    expect(resolveEn("?field=creative-copywriter&project=tiktok", "#gallery")).toMatchObject({
      selectedFieldId: "creative-copywriter",
      activeFilter: "Website Content",
      selectedProjectId: "tiktok",
    })
  })

  it("returns Social Outreach landing project URLs to the Writing scope hub", () => {
    expect(resolveEn("?field=creative-copywriter&project=social-outreach", "#gallery")).toMatchObject({
      selectedFieldId: "creative-copywriter",
      activeFilter: "All",
      selectedProjectId: null,
    })
  })

  it("uses localized categories after a locale switch", () => {
    expect(resolveVi("?field=creative-copywriter&project=weshare", "#gallery")).toMatchObject({
      selectedFieldId: "creative-copywriter",
      activeFilter: "Nội dung fanpage always-on",
      selectedProjectId: "weshare",
    })
  })

  it("never returns a project selection for invalid route params", () => {
    expect(resolveEn("?field=creative-copywriter&project=missing", "#gallery")).toMatchObject({
      selectedFieldId: "creative-copywriter",
      activeFilter: "All",
      selectedProjectId: null,
      targetSection: "gallery",
    })

    expect(resolveEn("?project=missing", "#gallery")).toMatchObject({
      selectedFieldId: null,
      activeFilter: "All",
      selectedProjectId: null,
      targetSection: "fields",
    })
  })
})

describe("portfolio gallery href helpers", () => {
  it("returns a field and project gallery URL for standard projects", () => {
    const { field, project } = getEnProjectWithField("weshare")

    expect(projectReturnsToScopeHub(project, field)).toBe(false)
    expect(getPortfolioGalleryHref(project, field)).toBe(
      "/?field=creative-copywriter&project=weshare#gallery",
    )
  })

  it("returns a field-only gallery URL for scope landing projects", () => {
    const { field, project } = getEnProjectWithField("social-outreach")

    expect(projectReturnsToScopeHub(project, field)).toBe(true)
    expect(getPortfolioGalleryHref(project, field)).toBe(
      "/?field=creative-copywriter#gallery",
    )
  })
})
