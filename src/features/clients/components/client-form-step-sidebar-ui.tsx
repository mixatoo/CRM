import { useEffect, useRef } from 'react'
import { Check, Lock, type LucideIcon } from 'lucide-react'
import {
  isClientFormStepComplete,
  resolveClientFormStepStatus,
  type ClientFormStepId,
  type ClientFormStepStatus,
} from '@/features/clients/components/client-form-step-completion'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import { cn } from '@/shared/utils/cn'

type StepMeta = {
  id: ClientFormStepId
  label: string
  description: string
  icon: LucideIcon
}

type ClientFormStepSidebarProps = {
  step: ClientFormStepId
  steps: StepMeta[]
  order: ClientFormStepId[]
  form: ClientFormInput
  visitedSteps: Set<ClientFormStepId>
  onStepChange: (step: ClientFormStepId) => void
  canGoToStep: (stepId: ClientFormStepId) => boolean
  layout?: 'vertical' | 'horizontal'
  headerTitle?: string
  /** Form wizard keeps the full header chrome; client profile browse uses a slimmer header. */
  mode?: 'form' | 'browse'
}

const STEP_SHORT_LABELS: Partial<Record<ClientFormStepId, string>> = {
  basics: 'Profile',
  contact: CRM_LABELS.communication,
  financial: 'Finance',
  'service-fees': 'Fees',
  'credit-cards': 'Cards',
  membership: 'Member',
  sla: 'SLA',
  commercial: 'Commercial',
}

function stepShortLabel(item: StepMeta): string {
  return STEP_SHORT_LABELS[item.id] ?? item.label.split(' ')[0] ?? item.label
}

function SegmentedProgress({
  steps,
  step,
  form,
}: {
  steps: StepMeta[]
  step: ClientFormStepId
  form: ClientFormInput
}) {
  return (
    <div
      className="flex gap-0.5"
      role="progressbar"
      aria-label="Form sections progress"
      aria-valuenow={steps.filter((item) => isClientFormStepComplete(form, item.id)).length}
      aria-valuemin={0}
      aria-valuemax={steps.length}
    >
      {steps.map((item) => {
        const complete = isClientFormStepComplete(form, item.id)
        const current = item.id === step

        return (
          <span
            key={item.id}
            className={cn(
              'h-0.5 flex-1 rounded-full transition-colors duration-300',
              complete
                ? 'bg-[var(--color-accent)]'
                : current
                  ? 'bg-[var(--color-accent)]/50'
                  : 'bg-[var(--color-border)]',
            )}
            aria-hidden
          />
        )
      })}
    </div>
  )
}

function SidebarHeader({
  steps,
  step,
  form,
  compact = false,
  headerTitle,
  mode = 'form',
}: {
  steps: StepMeta[]
  step: ClientFormStepId
  form: ClientFormInput
  compact?: boolean
  headerTitle?: string
  mode?: 'form' | 'browse'
}) {
  const current = steps.find((item) => item.id === step)
  const currentIndex = steps.findIndex((item) => item.id === step)
  const isBrowse = mode === 'browse'

  return (
    <header className={cn('shrink-0 space-y-2', compact ? 'pb-2' : 'pb-3')}>
      {!isBrowse ? (
        <div
          className={cn(
            'flex items-baseline gap-2',
            headerTitle ? 'justify-between' : 'justify-end',
          )}
        >
          {headerTitle ? (
            <p className="text-[11px] font-semibold text-[var(--color-foreground)]">{headerTitle}</p>
          ) : null}
          <span className="text-[10px] tabular-nums text-[var(--color-subtle)]">
            {currentIndex + 1}/{steps.length}
          </span>
        </div>
      ) : null}

      {!isBrowse ? <SegmentedProgress steps={steps} step={step} form={form} /> : null}

      {current && !isBrowse ? (
        <div className="pt-0.5">
          <p className="text-[13px] font-semibold leading-snug text-[var(--color-foreground)]">{current.label}</p>
          {!compact ? (
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[var(--color-muted)]">
              {current.description}
            </p>
          ) : null}
        </div>
      ) : null}
    </header>
  )
}

function StepSectionIcon({
  icon: Icon,
  selected,
  locked,
  className,
}: {
  icon: LucideIcon
  selected: boolean
  locked: boolean
  className?: string
}) {
  return (
    <span className={cn('flex shrink-0 items-center justify-center', className)} aria-hidden>
      <Icon
        className={cn(
          'h-3.5 w-3.5',
          selected ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]',
          locked && 'opacity-40',
        )}
      />
    </span>
  )
}

function VerticalStepItem({
  item,
  status,
  selected,
  locked,
  onSelect,
  buttonRef,
  mode = 'form',
}: {
  item: StepMeta
  status: ClientFormStepStatus
  selected: boolean
  locked: boolean
  onSelect: () => void
  buttonRef?: (node: HTMLButtonElement | null) => void
  mode?: 'form' | 'browse'
}) {
  const statusIcon =
    mode === 'browse' ? (
      <StepSectionIcon icon={item.icon} selected={selected} locked={locked} className="h-4 w-4" />
    ) : (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
        {locked ? (
          <Lock className="h-3 w-3" />
        ) : status === 'complete' ? (
          <Check className="h-3 w-3 text-[var(--color-success)]" strokeWidth={2.5} />
        ) : selected ? (
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-border-strong)]" />
        )}
      </span>
    )

  const labelButtonClassName = cn(
    'truncate text-left text-xs transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/20 focus-visible:ring-offset-1',
    selected
      ? 'font-semibold text-[var(--color-accent)]'
      : locked
        ? 'cursor-not-allowed opacity-40'
        : status === 'complete'
          ? 'font-normal text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
          : 'font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
  )

  if (mode === 'browse') {
    return (
      <button
        ref={buttonRef}
        type="button"
        disabled={locked}
        aria-current={selected ? 'step' : undefined}
        aria-label={`${item.label}${status === 'complete' ? ', complete' : status === 'optional' ? ', optional' : ''}${locked ? ', locked' : ''}`}
        onClick={onSelect}
        className={cn(
          'flex w-full items-center gap-2 border-l-2 py-1.5 pl-2.5 pr-1 text-left transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/20 focus-visible:ring-offset-1',
          selected
            ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
            : locked
              ? 'cursor-not-allowed border-transparent opacity-40'
              : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
        )}
      >
        <StepSectionIcon icon={item.icon} selected={selected} locked={locked} className="h-4 w-4" />
        <span className={cn('min-w-0 flex-1 truncate text-xs', selected ? 'font-semibold' : 'font-medium')}>
          {item.label}
        </span>
      </button>
    )
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={locked}
      aria-current={selected ? 'step' : undefined}
      aria-label={`${item.label}${status === 'complete' ? ', complete' : status === 'optional' ? ', optional' : ''}${locked ? ', locked' : ''}`}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 border-l-2 py-1.5 pl-2.5 pr-1 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/20 focus-visible:ring-offset-1',
        selected
          ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
          : locked
            ? 'cursor-not-allowed border-transparent opacity-40'
            : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
      )}
    >
      {statusIcon}

      <span
        className={cn(
          'min-w-0 flex-1 truncate text-xs',
          selected ? 'font-semibold' : status === 'complete' ? 'font-normal' : 'font-medium',
        )}
      >
        {item.label}
      </span>
    </button>
  )
}

function HorizontalStepChip({
  item,
  status,
  selected,
  locked,
  onSelect,
  buttonRef,
  mode = 'form',
}: {
  item: StepMeta
  status: ClientFormStepStatus
  selected: boolean
  locked: boolean
  onSelect: () => void
  buttonRef?: (node: HTMLButtonElement | null) => void
  mode?: 'form' | 'browse'
}) {
  const statusBadge =
    mode === 'browse' ? (
      <span
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full border transition-colors',
          selected
            ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
            : 'border-[var(--color-border)] text-[var(--color-muted)]',
          locked && 'opacity-40',
        )}
        aria-hidden
      >
        <item.icon className="h-3 w-3" />
      </span>
    ) : (
      <span
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full border transition-colors',
          selected
            ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
            : status === 'complete'
              ? 'border-[var(--color-success)]/50 text-[var(--color-success)]'
              : 'border-[var(--color-border)] text-[var(--color-subtle)]',
        )}
        aria-hidden
      >
        {locked ? (
          <Lock className="h-2.5 w-2.5" />
        ) : status === 'complete' ? (
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </span>
    )

  const label = stepShortLabel(item)
  const labelClassName = cn(
    'max-w-[4rem] truncate text-[10px] transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/20',
    selected ? 'font-semibold text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
    locked && 'cursor-not-allowed opacity-40',
  )

  if (mode === 'browse') {
    return (
      <button
        ref={buttonRef}
        type="button"
        disabled={locked}
        aria-current={selected ? 'step' : undefined}
        aria-label={`${item.label}${status === 'complete' ? ', complete' : status === 'optional' ? ', optional' : ''}${locked ? ', locked' : ''}`}
        onClick={onSelect}
        className={cn(
          'flex shrink-0 flex-col items-center gap-1 border-b-2 px-2.5 pb-2 pt-1 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/20 focus-visible:ring-offset-1',
          locked && 'cursor-not-allowed opacity-40',
          selected
            ? 'border-[var(--color-accent)] text-[var(--color-foreground)]'
            : 'border-transparent text-[var(--color-muted)] hover:border-[var(--color-border)] hover:text-[var(--color-foreground)]',
        )}
      >
        <item.icon className={cn('h-3.5 w-3.5', selected ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]')} />
        <span className={cn('max-w-[4.25rem] truncate text-[10px] font-medium', selected && 'text-[var(--color-foreground)]')}>
          {label}
        </span>
      </button>
    )
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={locked}
      aria-current={selected ? 'step' : undefined}
      aria-label={`${item.label}${status === 'complete' ? ', complete' : status === 'optional' ? ', optional' : ''}${locked ? ', locked' : ''}`}
      onClick={onSelect}
      className={cn(
        'flex shrink-0 flex-col items-center gap-1 px-1 py-0.5 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/20',
        locked && 'opacity-40',
      )}
    >
      {statusBadge}
      <span
        className={cn(
          'max-w-[4rem] truncate text-[10px]',
          selected ? 'font-semibold text-[var(--color-accent)]' : 'text-[var(--color-muted)]',
        )}
      >
        {label}
      </span>
    </button>
  )
}

function VerticalStepSidebar({
  step,
  steps,
  order,
  form,
  visitedSteps,
  onStepChange,
  canGoToStep,
  headerTitle,
  mode = 'form',
}: ClientFormStepSidebarProps) {
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    itemRefs.current[step]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [step])

  return (
    <div className="flex h-full min-h-0 flex-col">
      {mode !== 'browse' ? (
        <SidebarHeader
          steps={steps}
          step={step}
          form={form}
          headerTitle={headerTitle}
          mode={mode}
        />
      ) : null}

      <nav
        aria-label="Form sections"
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain pt-1 [scrollbar-width:thin]"
      >
        {steps.map((item) => {
          const status = resolveClientFormStepStatus(item.id, step, order, form, visitedSteps)
          const selected = step === item.id
          const locked = !canGoToStep(item.id)

          return (
            <VerticalStepItem
              key={item.id}
              item={item}
              status={status}
              selected={selected}
              locked={locked}
              onSelect={() => onStepChange(item.id)}
              mode={mode}
              buttonRef={(node) => {
                itemRefs.current[item.id] = node
              }}
            />
          )
        })}
      </nav>
    </div>
  )
}

function HorizontalStepSidebar({
  step,
  steps,
  order,
  form,
  visitedSteps,
  onStepChange,
  canGoToStep,
  headerTitle,
  mode = 'form',
}: ClientFormStepSidebarProps) {
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    itemRefs.current[step]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [step])

  return (
    <div>
      {mode !== 'browse' ? (
        <SidebarHeader
          steps={steps}
          step={step}
          form={form}
          compact
          headerTitle={headerTitle}
          mode={mode}
        />
      ) : null}

      <nav
        aria-label="Form sections"
        className={cn(
          'mt-2 flex justify-between gap-0.5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          mode === 'browse' && 'gap-1 border-b border-[var(--color-border)] pb-px',
        )}
      >
        {steps.map((item) => {
          const status = resolveClientFormStepStatus(item.id, step, order, form, visitedSteps)
          const selected = step === item.id
          const locked = !canGoToStep(item.id)

          return (
            <HorizontalStepChip
              key={item.id}
              item={item}
              status={status}
              selected={selected}
              locked={locked}
              onSelect={() => onStepChange(item.id)}
              mode={mode}
              buttonRef={(node) => {
                itemRefs.current[item.id] = node
              }}
            />
          )
        })}
      </nav>
    </div>
  )
}

export function ClientFormStepSidebar({
  layout = 'vertical',
  ...props
}: ClientFormStepSidebarProps) {
  if (layout === 'horizontal') {
    return <HorizontalStepSidebar {...props} />
  }

  return <VerticalStepSidebar {...props} />
}
