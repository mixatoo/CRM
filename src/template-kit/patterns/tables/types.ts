import type { TripStage } from '../stubs/domain-entities'

export interface TemplateListRow {
  id: string
  reference: string
  date: string
  client: string
  persons: number
  destination: string
  cost: number
  currency: string
  stage: TripStage
  owner: string
}

export type TemplateSortField = 'reference' | 'date' | 'client' | 'persons' | 'destination' | 'cost' | 'stage' | 'owner'

export type TemplateSortDir = 'asc' | 'desc'
