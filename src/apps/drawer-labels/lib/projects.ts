import type { DrawerLabel } from './pdf'

export type DrawerLabelsProject = {
  id: string
  name: string
  savedAt: string
  fontOptionId: string
  defaultColor: string
  labels: DrawerLabel[]
}

const STORAGE_KEY = 'drawer-labels.projects'

function isLabel(value: unknown): value is DrawerLabel {
  if (!value || typeof value !== 'object') {
    return false
  }
  const label = value as Partial<DrawerLabel>
  return (
    typeof label.id === 'string' &&
    typeof label.name === 'string' &&
    typeof label.color === 'string'
  )
}

function isProject(value: unknown): value is DrawerLabelsProject {
  if (!value || typeof value !== 'object') {
    return false
  }
  const project = value as Partial<DrawerLabelsProject>
  return (
    typeof project.id === 'string' &&
    typeof project.name === 'string' &&
    typeof project.savedAt === 'string' &&
    typeof project.fontOptionId === 'string' &&
    typeof project.defaultColor === 'string' &&
    Array.isArray(project.labels) &&
    project.labels.every(isLabel)
  )
}

export function loadSavedProjects(): DrawerLabelsProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter(isProject)
  } catch {
    return []
  }
}

export function persistSavedProjects(projects: DrawerLabelsProject[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function projectNameFromLabels(labels: DrawerLabel[]): string {
  const names = labels
    .map((label) => label.name.trim())
    .filter(Boolean)
    .slice(0, 3)
  if (names.length === 0) {
    return 'Untitled labels'
  }
  return names.join(', ')
}
