export interface FacetListOption {
  value: string
  count: number
  activeCount?: number
}

export interface SortMenuOption<T extends string = string> {
  field: T
  label: string
}

export type SortDirection = 'asc' | 'desc'
