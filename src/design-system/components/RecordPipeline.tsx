import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Flag } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { TravelCard } from '@/design-system/layout/TravelCard'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

export interface RecordPipelineOutcome {
  id: string
  label: string
  danger?: boolean
}

export interface RecordPipelineStageVisual {
  shell: string
  text: string
}

export interface RecordPipelineProps {
  /** In-progress rail stages (excludes terminal outcomes). */
  stages: string[]
  /** Current stage id (pipeline or terminal). */
  stage: string
  /** Anchor used when stage is terminal (lost/closed). */
  anchorStage?: string
  /** Terminal outcome ids that map to the Closed rail node. */
  terminalStages: string[]
  outcomes: RecordPipelineOutcome[]
  labels: Record<string, string>
  shortLabels?: Record<string, string>
  visuals: Record<string, RecordPipelineStageVisual>
  /** Stages that cannot be set manually. */
  autoLockedStages?: string[]
  autoLockHint?: (stageId: string) => string
  onStageChange?: (stage: string) => void
  entityLabel?: string
  ariaLabel?: string
  disabled?: boolean
  className?: string
}

export function RecordPipeline({
  stages,
  stage,
  anchorStage,
  terminalStages,
  outcomes,
  labels,
  shortLabels = {},
  visuals,
  autoLockedStages = [],
  autoLockHint,
  onStageChange,
  entityLabel = 'Record',
  ariaLabel = 'Workflow pipeline',
  disabled = false,
  className,
}: RecordPipelineProps) {
  const [dangerOutcome, setDangerOutcome] = useState<RecordPipelineOutcome | null>(null)

  const isTerminal = terminalStages.includes(stage)
  const railStages = useMemo(() => [...stages, '__closed__'], [stages])
  const anchor = anchorStage && stages.includes(anchorStage) ? anchorStage : stages[0] ?? stage
  const pipelineIndex = isTerminal ? stages.indexOf(anchor) : stages.indexOf(stage)
  const safePipelineIndex = Math.max(pipelineIndex, 0)
  const closedIndex = railStages.length - 1
  const displayIndex = isTerminal ? closedIndex : safePipelineIndex
  const stepNum = displayIndex + 1
  const stepTotal = railStages.length
  const progressPct = Math.max(0, Math.min(100, Math.round((stepNum / stepTotal) * 100)))

  const nowLabel = labels[stage] ?? stage
  const nowVisual = visuals[stage] ?? visuals[anchor]
  const prevStage = !isTerminal && safePipelineIndex > 0 ? stages[safePipelineIndex - 1] : null
  const nextStage =
    !isTerminal && safePipelineIndex >= 0 && safePipelineIndex < stages.length - 1
      ? stages[safePipelineIndex + 1]
      : null
  const atCloseGate = !isTerminal && nextStage == null

  const isAuto = (id: string) => autoLockedStages.includes(id)
  const canPick = (id: string) => !disabled && !(isAuto(id) && id !== stage)

  function selectStage(next: string) {
    if (!onStageChange || disabled) return
    if (next === '__closed__') return
    if (isAuto(next) && next !== stage) return
    onStageChange(next)
  }

  function selectOutcome(outcome: RecordPipelineOutcome) {
    if (!onStageChange || disabled) return
    if (stage === outcome.id) {
      onStageChange(anchor)
      return
    }
    if (outcome.danger) {
      setDangerOutcome(outcome)
      return
    }
    onStageChange(outcome.id)
  }

  return (
    <>
      <TravelCard className={className} contentClassName="px-3 py-2.5 sm:px-4">
        <div
          className={cn(
            'flex flex-col gap-2.5 lg:flex-row lg:items-stretch lg:gap-3',
            layout.hideScrollbar,
          )}
          role="group"
          aria-label={ariaLabel}
        >
          <JumpMenu
            nowLabel={nowLabel}
            stepNum={stepNum}
            stepTotal={stepTotal}
            progressPct={progressPct}
            nowVisual={nowVisual}
            disabled={disabled}
            railStages={railStages}
            stage={stage}
            isTerminal={isTerminal}
            safePipelineIndex={safePipelineIndex}
            labels={labels}
            shortLabels={shortLabels}
            isAuto={isAuto}
            autoLockHint={autoLockHint}
            canPick={canPick}
            onSelectStage={selectStage}
          />

          <div className={cn('min-w-0 flex-1', layout.scrollX, layout.hideScrollbar)}>
            <div className="inline-flex min-w-full items-stretch gap-1.5">
              {railStages.map((railId, index) => {
                const isClosedNode = railId === '__closed__'
                const isCurrent = isClosedNode ? isTerminal : !isTerminal && railId === stage
                const isPassed = isTerminal
                  ? !isClosedNode && index <= safePipelineIndex
                  : index < safePipelineIndex
                const autoLocked = !isClosedNode && isAuto(railId) && !isCurrent
                const visual = isClosedNode
                  ? isTerminal
                    ? visuals[stage]
                    : undefined
                  : visuals[railId]
                const label = isClosedNode
                  ? isTerminal
                    ? (shortLabels[stage] ?? labels[stage] ?? 'Closed')
                    : 'Closed'
                  : (shortLabels[railId] ?? labels[railId] ?? railId)
                const title = isClosedNode
                  ? isTerminal
                    ? (labels[stage] ?? stage)
                    : 'Choose closed outcome'
                  : autoLocked
                    ? (autoLockHint?.(railId) ?? labels[railId] ?? railId)
                    : (labels[railId] ?? railId)

                return (
                  <button
                    key={railId}
                    type="button"
                    disabled={disabled || autoLocked || (isClosedNode && !onStageChange)}
                    aria-current={isCurrent ? 'step' : undefined}
                    title={title}
                    onClick={() => {
                      if (isClosedNode) return
                      selectStage(railId)
                    }}
                    className={cn(
                      'relative flex min-w-[3.75rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-md)] border px-1.5 py-1.5 text-[10px] font-semibold tracking-wide uppercase transition-colors',
                      isCurrent && visual
                        ? cn('z-[1] shadow-sm', visual.shell, visual.text)
                        : null,
                      isPassed && !isCurrent && 'border-[var(--color-accent)]/30 bg-[var(--color-accent-muted)]/30 text-[var(--color-accent)]',
                      !isPassed && !isCurrent && 'border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-foreground)]',
                      autoLocked && 'opacity-55',
                      isClosedNode && !isTerminal && 'border-dashed',
                    )}
                  >
                    {isPassed && !isCurrent ? <Check className="h-3 w-3 stroke-[2.5]" /> : null}
                    <em className="not-italic truncate">{label}</em>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              disabled={disabled || !prevStage || isAuto(prevStage)}
              title={
                prevStage
                  ? isAuto(prevStage)
                    ? (autoLockHint?.(prevStage) ?? `Back to ${labels[prevStage]}`)
                    : `Back to ${labels[prevStage] ?? prevStage}`
                  : undefined
              }
              onClick={() => prevStage && selectStage(prevStage)}
              className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 text-xs font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            {isTerminal || atCloseGate ? (
              <OutcomeMenu
                stage={stage}
                isTerminal={isTerminal}
                outcomes={outcomes}
                labels={labels}
                visuals={visuals}
                disabled={disabled}
                onSelect={selectOutcome}
              />
            ) : (
              <button
                type="button"
                disabled={disabled || !nextStage || isAuto(nextStage)}
                title={
                  nextStage
                    ? isAuto(nextStage)
                      ? (autoLockHint?.(nextStage) ?? `Next: ${labels[nextStage]}`)
                      : `Next: ${labels[nextStage] ?? nextStage}`
                    : undefined
                }
                onClick={() => nextStage && selectStage(nextStage)}
                className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-accent)] bg-[var(--color-accent)] px-2.5 text-xs font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </TravelCard>

      <ConfirmDialog
        open={dangerOutcome != null}
        onOpenChange={(open) => {
          if (!open) setDangerOutcome(null)
        }}
        entityType={entityLabel}
        title={`Mark as ${dangerOutcome?.label ?? 'closed'}?`}
        description={`The ${entityLabel.toLowerCase()} will leave the active pipeline at its current stage.`}
        confirmLabel={dangerOutcome?.label ?? 'Confirm'}
        variant="danger"
        onConfirm={() => {
          if (dangerOutcome) onStageChange?.(dangerOutcome.id)
          setDangerOutcome(null)
        }}
      />
    </>
  )
}

function JumpMenu({
  nowLabel,
  stepNum,
  stepTotal,
  progressPct,
  nowVisual,
  disabled,
  railStages,
  stage,
  isTerminal,
  safePipelineIndex,
  labels,
  shortLabels,
  isAuto,
  autoLockHint,
  canPick,
  onSelectStage,
}: {
  nowLabel: string
  stepNum: number
  stepTotal: number
  progressPct: number
  nowVisual?: RecordPipelineStageVisual
  disabled: boolean
  railStages: string[]
  stage: string
  isTerminal: boolean
  safePipelineIndex: number
  labels: Record<string, string>
  shortLabels: Record<string, string>
  isAuto: (id: string) => boolean
  autoLockHint?: (stageId: string) => string
  canPick: (id: string) => boolean
  onSelectStage: (id: string) => void
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex w-full min-w-[10.5rem] flex-col gap-1 rounded-[var(--radius-md)] border px-2.5 py-2 text-left outline-none transition-colors lg:w-[12.5rem]',
            nowVisual
              ? cn(nowVisual.shell, nowVisual.text)
              : 'border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 text-[var(--color-foreground)]',
            'hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/25 disabled:opacity-50',
          )}
          aria-label={`Current stage ${nowLabel}, step ${stepNum} of ${stepTotal}`}
        >
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-semibold">{nowLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
          </span>
          <span className="h-1.5 overflow-hidden rounded-full bg-black/10">
            <span
              className="block h-full rounded-full bg-current opacity-80 transition-[width]"
              style={{ width: `${progressPct}%` }}
            />
          </span>
          <span className="flex justify-between text-[10px] font-medium opacity-80">
            <span>
              {stepNum} / {stepTotal}
            </span>
            <span>{progressPct}%</span>
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-[500] max-h-[min(24rem,70vh)] w-[16rem] overflow-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg"
          align="start"
          sideOffset={6}
        >
          <div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-[var(--color-muted)] uppercase">
            Stages
          </div>
          {railStages.map((railId, index) => {
            const isClosedNode = railId === '__closed__'
            const isHere = isClosedNode ? isTerminal : !isTerminal && railId === stage
            const isDone = isTerminal
              ? !isClosedNode && index <= safePipelineIndex
              : index < safePipelineIndex
            const autoLocked = !isClosedNode && isAuto(railId) && !isHere
            const label = isClosedNode
              ? isTerminal
                ? (labels[stage] ?? 'Closed')
                : 'Closed'
              : (labels[railId] ?? railId)
            const state = isHere ? 'Now' : isDone ? 'Done' : autoLocked ? 'Auto' : `${index + 1}/${stepTotal}`

            return (
              <DropdownMenu.Item
                key={railId}
                disabled={isClosedNode || !canPick(railId)}
                title={autoLocked ? autoLockHint?.(railId) : undefined}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-xs outline-none focus:bg-[var(--color-surface-muted)] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45',
                  isHere && 'font-semibold text-[var(--color-accent)]',
                )}
                onSelect={() => {
                  if (!isClosedNode) onSelectStage(railId)
                }}
              >
                <span className="w-4 shrink-0 text-[10px] text-[var(--color-muted)]">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate">{label}</span>
                <span className="shrink-0 text-[10px] text-[var(--color-muted)]">
                  {isClosedNode && !isTerminal ? shortLabels.__closed__ ?? 'End' : state}
                </span>
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function OutcomeMenu({
  stage,
  isTerminal,
  outcomes,
  labels,
  visuals,
  disabled,
  onSelect,
}: {
  stage: string
  isTerminal: boolean
  outcomes: RecordPipelineOutcome[]
  labels: Record<string, string>
  visuals: Record<string, RecordPipelineStageVisual>
  disabled: boolean
  onSelect: (outcome: RecordPipelineOutcome) => void
}) {
  const active = isTerminal ? outcomes.find((item) => item.id === stage) : null
  const visual = active ? visuals[active.id] : null

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'inline-flex h-9 items-center gap-1 rounded-[var(--radius-md)] border px-2.5 text-xs font-semibold transition-colors disabled:opacity-40',
            visual
              ? cn(visual.shell, visual.text)
              : 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white hover:opacity-90',
          )}
          aria-label="Set closed outcome"
        >
          <Flag className="h-3.5 w-3.5" />
          <span>{active ? (labels[active.id] ?? active.label) : 'Close'}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-[500] min-w-[10rem] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg"
          align="end"
          sideOffset={6}
        >
          <div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-[var(--color-muted)] uppercase">
            Close as
          </div>
          {outcomes.map((outcome) => {
            const isOn = stage === outcome.id
            const outcomeVisual = visuals[outcome.id]
            return (
              <DropdownMenu.Item
                key={outcome.id}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-xs outline-none focus:bg-[var(--color-surface-muted)]',
                  isOn && outcomeVisual ? cn('font-semibold', outcomeVisual.text) : null,
                )}
                onSelect={() => onSelect(outcome)}
              >
                <span>{outcome.label}</span>
                {isOn ? <Check className="h-3.5 w-3.5" /> : null}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
