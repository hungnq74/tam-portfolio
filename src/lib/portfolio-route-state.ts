import type { Field, FieldId, FieldScopeCard, Project, SectionId } from "@/data/portfolio"

export interface PortfolioRouteState {
  selectedFieldId: FieldId | null
  activeFilter: string
  selectedProjectId: string | null
  targetSection: SectionId
  hasExplicitTarget: boolean
}

export function projectReturnsToScopeHub(project: Project, field: Field) {
  return Boolean(
    field.scopeCards?.some((scope) => scope.landingProjectId === project.id),
  )
}

function getFieldId(field: Field | FieldId) {
  return typeof field === "string" ? field : field.id
}

function withProjectQuery(href: string, projectId?: string | null) {
  if (!projectId) return href

  const params = new URLSearchParams({ project: projectId })

  return `${href}?${params.toString()}`
}

export function getHomeFieldsHref() {
  return "/#fields"
}

export function getContentHref(field?: Field | FieldId | null) {
  if (!field) return "/content"

  return `/content/${getFieldId(field)}`
}

export function getContentScopeHref({
  field,
  projectId,
  scope,
}: {
  field: Field | FieldId
  scope: FieldScopeCard | string
  projectId?: string | null
}) {
  const scopeId = typeof scope === "string" ? scope : scope.id

  return withProjectQuery(`/content/${getFieldId(field)}/scope/${scopeId}`, projectId)
}

export function getProjectScope(project: Project, field: Field) {
  return field.scopeCards?.find((scope) => scope.category === project.category) ?? null
}

export function getProjectReturnHref(project: Project, field: Field) {
  if (projectReturnsToScopeHub(project, field)) {
    return getContentHref(field)
  }

  const scope = getProjectScope(project, field)

  if (scope) {
    return getContentScopeHref({
      field,
      scope,
      projectId: project.id,
    })
  }

  return withProjectQuery(getContentHref(field), project.id)
}

export function getPortfolioGalleryHref(project: Project, field: Field) {
  const params = new URLSearchParams({
    field: field.id,
  })

  if (!projectReturnsToScopeHub(project, field)) {
    params.set("project", project.id)
  }

  return `/?${params.toString()}#gallery`
}

export function getLegacyPortfolioTargetHref({
  allFilter,
  fields,
  hash = "",
  projects,
  search = "",
}: {
  allFilter: string
  fields: Field[]
  projects: Project[]
  search?: string
  hash?: string
}) {
  if (hash === "#fields" && !search) return null

  const routeState = resolvePortfolioRouteState({
    allFilter,
    fields,
    hash,
    projects,
    search,
  })

  if (!routeState.hasExplicitTarget) return null

  if (!routeState.selectedFieldId) return getContentHref()

  const field = fields.find((item) => item.id === routeState.selectedFieldId)
  if (!field) return getContentHref()

  if (!routeState.selectedProjectId) return getContentHref(field)

  const project = projects.find((item) => item.id === routeState.selectedProjectId)
  if (!project) return getContentHref(field)

  return getProjectReturnHref(project, field)
}

export function resolvePortfolioRouteState({
  allFilter,
  fields,
  hash = "",
  projects,
  search = "",
}: {
  allFilter: string
  fields: Field[]
  projects: Project[]
  search?: string
  hash?: string
}): PortfolioRouteState {
  const params = new URLSearchParams(search)
  const requestedProjectId = params.get("project")
  const requestedFieldId = params.get("field") as FieldId | null
  const requestedProject = requestedProjectId
    ? projects.find((project) => project.id === requestedProjectId) ?? null
    : null
  const requestedField = requestedProject
    ? fields.find((field) => field.id === requestedProject.fieldId) ?? null
    : requestedFieldId
      ? fields.find((field) => field.id === requestedFieldId) ?? null
      : null
  const hasExplicitTarget = Boolean(
    requestedProjectId || requestedFieldId || hash === "#gallery" || hash === "#fields",
  )

  if (!requestedField) {
    return {
      selectedFieldId: null,
      activeFilter: allFilter,
      selectedProjectId: null,
      targetSection: hasExplicitTarget ? "fields" : "cover",
      hasExplicitTarget,
    }
  }

  const returnsToScopeHub = Boolean(
    requestedProject && projectReturnsToScopeHub(requestedProject, requestedField),
  )
  const requestedFilter =
    requestedProject &&
    !returnsToScopeHub &&
    requestedField.filters.includes(requestedProject.category)
      ? requestedProject.category
      : allFilter
  const shouldSelectProject = Boolean(
    requestedProject &&
      !returnsToScopeHub &&
      (!requestedField.scopeCards?.length || requestedFilter !== allFilter),
  )

  return {
    selectedFieldId: requestedField.id,
    activeFilter: requestedFilter,
    selectedProjectId: shouldSelectProject && requestedProject ? requestedProject.id : null,
    targetSection: "gallery",
    hasExplicitTarget,
  }
}
