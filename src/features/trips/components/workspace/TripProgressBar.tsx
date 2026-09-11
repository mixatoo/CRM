import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  TRIP_PIPELINE_STAGES,
  TRIP_STAGE_LABELS,
  TRIP_TERMINAL_STAGES,
  isTripPipelineStage,
  isTripTerminalStage,
  resolveTripPipelineAnchor,
  type TripPipelineStage,
  type TripStage,
  type TripTerminalStage,
} from '@/domain/entities'
import { TRIP_STAGE_VISUAL } from '@/features/trips/components/list/trip-stage-styles'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { TravelCard } from '@/design-system/layout/TravelCard'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface TripProgressBarProps {
  stage: TripStage
  lastPipelineStage?: TripPipelineStage
  onStageChange?: (stage: TripStage) => void
}

export function TripProgressBar({ stage, lastPipelineStage, onStageChange }: TripProgressBarProps) {
  const [lostConfirmOpen, setLostConfirmOpen] = useState(false)
  const isLost = stage === 'lost'
  const isClosed = stage === 'closed'
  const isOutcome = isTripTerminalStage(stage)
  const anchorStage = resolveTripPipelineAnchor({ stage, lastPipelineStage })
  const anchorIndex = TRIP_PIPELINE_STAGES.indexOf(anchorStage)
  const pipelineIndex = isTripPipelineStage(stage) ? TRIP_PIPELINE_STAGES.indexOf(stage) : anchorIndex

  function handleOutcome(outcome: TripTerminalStage) {
    if (stage === outcome) {
      onStageChange?.(outcome === 'closed' ? 'recent' : anchorStage)
      return
    }
    if (outcome === 'lost') {
      setLostConfirmOpen(true)
      return
    }
    onStageChange?.(outcome)
  }

  return (
    <>
      <TravelCard contentClassName="px-3 py-2 sm:px-4">
        <div className={cn(layout.scrollX, layout.hideScrollbar)}>
          <div
            className="inline-flex min-w-full items-stretch overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/35"
            role="toolbar"
            aria-label="Trip stage"
          >
            {TRIP_PIPELINE_STAGES.map((step, index) => {
              const isCurrent = isLost
                ? step === anchorStage
                : !isOutcome && step === stage
              const isCompleted = isClosed
                ? true
                : isLost
                  ? index < anchorIndex
                  : index < pipelineIndex
              const visual = TRIP_STAGE_VISUAL[step]

              return (
                <Segment
                  key={step}
                  label={TRIP_STAGE_LABELS[step]}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  muted={isLost && index > anchorIndex}
                  activeClass={cn(visual.shell, visual.text)}
                  onClick={() => onStageChange?.(step)}
                />
              )
            })}

            <span aria-hidden className="w-px shrink-0 bg-[var(--color-border)]" />

            <OutcomeMenu stage={stage} onSelect={handleOutcome} />
          </div>
        </div>
      </TravelCard>

      <ConfirmDialog
        open={lostConfirmOpen}
        onOpenChange={setLostConfirmOpen}
        entityType="Trip"
        title="Mark trip as lost?"
        description="The trip will be marked lost at its current pipeline stage."
        confirmLabel="Mark as lost"
        variant="danger"
        onConfirm={() => {
          onStageChange?.('lost')
          setLostConfirmOpen(false)
        }}
      />
    </>
  )
}

const SEGMENT_BUTTON_CLASS =
  'relative flex min-w-[4.5rem] flex-1 items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors'

function OutcomeMenu({
  stage,
  onSelect,
}: {
  stage: TripStage
  onSelect: (outcome: TripTerminalStage) => void
}) {
  const isOutcome = isTripTerminalStage(stage)
  const label = isOutcome ? TRIP_STAGE_LABELS[stage] : 'End trip'
  const activeVisual = isOutcome ? TRIP_STAGE_VISUAL[stage] : null

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            SEGMENT_BUTTON_CLASS,
            'outline-none',
            activeVisual
              ? cn('shadow-sm', activeVisual.shell, activeVisual.text)
              : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-foreground)]',
          )}
          aria-label="Set trip to closed or lost"
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-[500] min-w-[9rem] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg"
          align="end"
          sideOffset={6}
        >
          {TRIP_TERMINAL_STAGES.map((outcome) => {
            const visual = TRIP_STAGE_VISUAL[outcome]
            const isActive = stage === outcome

            return (
              <DropdownMenu.Item
                key={outcome}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-xs outline-none focus:bg-[var(--color-surface-muted)]',
                  isActive && cn('font-semibold', visual.text),
                )}
                onSelect={() => onSelect(outcome)}
              >
                <span>{TRIP_STAGE_LABELS[outcome]}</span>
                {isActive ? <Check className="h-3.5 w-3.5" /> : null}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function Segment({
  label,
  isCompleted,
  isCurrent,
  muted,
  activeClass,
  onClick,
}: {
  label: string
  isCompleted: boolean
  isCurrent: boolean
  muted?: boolean
  activeClass: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isCurrent ? 'step' : undefined}
      title={label}
      className={cn(
        SEGMENT_BUTTON_CLASS,
        'border-r border-[var(--color-border)]',
        isCurrent && cn('z-[1] shadow-sm', activeClass),
        isCompleted && !isCurrent && 'bg-[var(--color-accent-muted)]/25 text-[var(--color-accent)]',
        !isCompleted && !isCurrent && 'text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-foreground)]',
        muted && 'opacity-45',
      )}
    >
      {isCompleted && !isCurrent ? <Check className="h-3 w-3 shrink-0 stroke-[2.5]" /> : null}
      <span className="truncate">{label}</span>
    </button>
  )
}
