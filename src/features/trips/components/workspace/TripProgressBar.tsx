import {
  TRIP_PIPELINE_STAGES,
  TRIP_STAGE_LABELS,
  TRIP_TERMINAL_STAGES,
  resolveTripPipelineAnchor,
  type TripPipelineStage,
  type TripStage,
} from '@/domain/entities'
import { RecordPipeline } from '@/design-system/components/RecordPipeline'
import { TRIP_STAGE_VISUAL } from '@/features/trips/components/list/trip-stage-styles'

const TRIP_SHORT_LABELS: Record<string, string> = {
  draft: 'Draft',
  proposal: 'Proposal',
  negotiation: 'Negot.',
  confirmed: 'Conf.',
  upcoming: 'Upcom.',
  active: 'Active',
  recent: 'Recent',
  closed: 'Closed',
  lost: 'Lost',
}

const TRIP_AUTO_STAGES = ['upcoming', 'active', 'recent'] as const

interface TripProgressBarProps {
  stage: TripStage
  lastPipelineStage?: TripPipelineStage
  onStageChange?: (stage: TripStage) => void
  disabled?: boolean
}

export function TripProgressBar({
  stage,
  lastPipelineStage,
  onStageChange,
  disabled = false,
}: TripProgressBarProps) {
  const anchorStage = resolveTripPipelineAnchor({ stage, lastPipelineStage })

  return (
    <RecordPipeline
      stages={[...TRIP_PIPELINE_STAGES]}
      stage={stage}
      anchorStage={anchorStage}
      terminalStages={[...TRIP_TERMINAL_STAGES]}
      outcomes={[
        { id: 'closed', label: TRIP_STAGE_LABELS.closed },
        { id: 'lost', label: TRIP_STAGE_LABELS.lost, danger: true },
      ]}
      labels={TRIP_STAGE_LABELS}
      shortLabels={TRIP_SHORT_LABELS}
      visuals={TRIP_STAGE_VISUAL}
      autoLockedStages={[...TRIP_AUTO_STAGES]}
      autoLockHint={(id) => {
        if (id === 'upcoming') return 'Upcoming is automatic based on trip dates'
        if (id === 'active') return 'Active is automatic when the trip start date is reached'
        if (id === 'recent') return 'Recent is automatic after the trip end date'
        return ''
      }}
      onStageChange={onStageChange ? (next) => onStageChange(next as TripStage) : undefined}
      entityLabel="Trip"
      ariaLabel="Trip workflow pipeline"
      disabled={disabled}
    />
  )
}
