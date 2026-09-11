import type { TripStage } from '@/domain/entities'

export const TRIP_STAGE_CHIP_SIZE = 'h-6 w-[6.5rem]'

export interface TripStageVisual {
  shell: string
  text: string
  tabActive: string
  navActive: string
}

type StageKey =
  | 'draft'
  | 'proposal'
  | 'negotiation'
  | 'confirmed'
  | 'upcoming'
  | 'active'
  | 'recent'
  | 'closed'
  | 'lost'

function stageVisual(key: StageKey): TripStageVisual {
  return {
    shell: `trip-stage-shell-${key} border`,
    text: `trip-stage-text-${key}`,
    tabActive: `trip-stage-tab-${key} border`,
    navActive: `trip-stage-nav-${key} border-b`,
  }
}

/** Semantic palette per stage — badges, filters, progress bar, and list views. */
export const TRIP_STAGE_VISUAL: Record<TripStage, TripStageVisual> = {
  draft: stageVisual('draft'),
  proposal: stageVisual('proposal'),
  negotiation: stageVisual('negotiation'),
  confirmed: stageVisual('confirmed'),
  upcoming: stageVisual('upcoming'),
  active: stageVisual('active'),
  recent: stageVisual('recent'),
  closed: stageVisual('closed'),
  lost: stageVisual('lost'),
}
