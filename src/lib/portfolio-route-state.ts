import type { Field, FieldId, Project, SectionId } from "@/data/portfolio"

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

export function getPortfolioGalleryHref(project: Project, field: Field) {
  const params = new URLSearchParams({
    field: field.id,
  })

  if (!projectReturnsToScopeHub(project, field)) {
    params.set("project", project.id)
  }

  return `/?${params.toString()}#gallery`
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
  const hasExplicitTarget = Boolean(requestedProjectId || requestedFieldId || hash === "#gallery")

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
