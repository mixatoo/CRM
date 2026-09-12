import {
  TRANSFER_PIPELINE_STAGES,
  TRANSFER_STAGE_LABELS,
  TRANSFER_TERMINAL_STAGES,
  resolveTransferPipelineAnchor,
  type TransferPipelineStage,
  type TransferStage,
} from '@/domain/entities/transfer'
import { RecordPipeline } from '@/design-system/components/RecordPipeline'
import { TRIP_STAGE_VISUAL } from '@/features/trips/components/list/trip-stage-styles'

const TRANSFER_SHORT_LABELS: Record<string, string> = {
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

interface TransferProgressBarProps {
  stage: TransferStage
  lastPipelineStage?: TransferPipelineStage
  onStageChange?: (stage: TransferStage) => void
  disabled?: boolean
}

export function TransferProgressBar({
  stage,
  lastPipelineStage,
  onStageChange,
  disabled = false,
}: TransferProgressBarProps) {
  const anchorStage = resolveTransferPipelineAnchor({ stage, lastPipelineStage })

  return (
    <RecordPipeline
      stages={[...TRANSFER_PIPELINE_STAGES]}
      stage={stage}
      anchorStage={anchorStage}
      terminalStages={[...TRANSFER_TERMINAL_STAGES]}
      outcomes={[
        { id: 'closed', label: TRANSFER_STAGE_LABELS.closed },
        { id: 'lost', label: TRANSFER_STAGE_LABELS.lost, danger: true },
      ]}
      labels={TRANSFER_STAGE_LABELS}
      shortLabels={TRANSFER_SHORT_LABELS}
      visuals={TRIP_STAGE_VISUAL}
      onStageChange={onStageChange ? (next) => onStageChange(next as TransferStage) : undefined}
      entityLabel="Transfer"
      ariaLabel="Transfer workflow pipeline"
      disabled={disabled}
    />
  )
}
