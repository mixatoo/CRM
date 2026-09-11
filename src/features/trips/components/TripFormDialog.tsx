import { useCallback, useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react'
import { CloseButton } from '@/design-system/components/CloseButton'
import { Button } from '@/design-system/components/Button'
import {
  TRIP_FORM_STEPS,
  TRIP_FORM_STICKY_BAR,
  TripFormPreview,
  TripFormStepNav,
  type TripFormStepId,
} from '@/features/trips/components/trip-form-ui'
import { TripProfileFields } from '@/features/trips/components/TripProfileFields'
import type { Client } from '@/domain/entities/client'
import { tripFormDefaults, type TripFormInput } from '@/features/trips/utils/create-trip'
import { cn } from '@/shared/utils/cn'

interface TripFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultOwner?: { name: string; id: string } | null
  defaultClient?: Client | null
  isPending?: boolean
  onSubmit: (input: TripFormInput) => void
}

const STEP_ORDER: TripFormStepId[] = ['basics', 'client', 'schedule']

function stepIndex(step: TripFormStepId) {
  return STEP_ORDER.indexOf(step)
}

function isBasicsValid(form: TripFormInput) {
  return form.name.trim().length > 0 && form.ownerName.trim().length > 0
}

function completedStepsFor(form: TripFormInput, currentStep: TripFormStepId): Set<TripFormStepId> {
  const completed = new Set<TripFormStepId>()
  const currentIdx = stepIndex(currentStep)
  if (currentIdx > 0 && isBasicsValid(form)) completed.add('basics')
  if (currentIdx > 1) completed.add('client')
  return completed
}

export function TripFormDialog({
  open,
  onOpenChange,
  defaultOwner,
  defaultClient,
  isPending,
  onSubmit,
}: TripFormDialogProps) {
  const [form, setForm] = useState<TripFormInput>(() => tripFormDefaults(defaultOwner, defaultClient))
  const [step, setStep] = useState<TripFormStepId>('basics')

  useEffect(() => {
    if (!open) return
    setForm(tripFormDefaults(defaultOwner, defaultClient))
    setStep('basics')
  }, [open, defaultOwner, defaultClient])

  const canSubmit = isBasicsValid(form) && !isPending
  const stepNumber = stepIndex(step) + 1
  const isLastStep = step === 'schedule'
  const isFirstStep = step === 'basics'
  const currentStepMeta = TRIP_FORM_STEPS.find((item) => item.id === step)!
  const completedSteps = useMemo(() => completedStepsFor(form, step), [form, step])

  const setField = useCallback(<K extends keyof TripFormInput>(key: K, value: TripFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }, [])

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit(form)
  }

  const goNext = () => {
    if (isLastStep) {
      handleSubmit()
      return
    }
    if (step === 'basics' && !isBasicsValid(form)) return
    const next = STEP_ORDER[stepIndex(step) + 1]
    if (next) setStep(next)
  }

  const goBack = () => {
    const prev = STEP_ORDER[stepIndex(step) - 1]
    if (prev) setStep(prev)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    const target = event.target as HTMLElement
    if (target.tagName === 'TEXTAREA') return
    event.preventDefault()
    goNext()
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            'fixed inset-y-0 right-0 z-[601] flex w-full flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none',
            'max-w-[min(40rem,calc(100vw-1rem))]',
            'max-sm:inset-0 max-sm:max-w-none',
          )}
          onKeyDown={handleKeyDown}
        >
          <header className={cn('shrink-0 border-b border-[var(--color-border)] px-4 py-3', TRIP_FORM_STICKY_BAR)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-muted)]/50 text-[var(--color-accent)]">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">New trip</Dialog.Title>
                </div>
                <Dialog.Description className="mt-1 text-xs font-normal text-[var(--color-muted)]">
                  Step {stepNumber} of {STEP_ORDER.length}
                  {' · '}
                  {currentStepMeta.description}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <CloseButton variant="elevated" />
              </Dialog.Close>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
            <aside className="hidden w-[13.5rem] shrink-0 flex-col gap-3 border-b border-[var(--color-border)] p-3 lg:flex lg:border-b-0 lg:border-r">
              <TripFormStepNav
                step={step}
                onStepChange={(next) => {
                  if (next === 'basics' || isBasicsValid(form) || stepIndex(next) <= stepIndex(step)) {
                    setStep(next)
                  }
                }}
                completedSteps={completedSteps}
              />
              <TripFormPreview form={form} />
            </aside>

            <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-[var(--color-border)] p-2 lg:hidden">
              {TRIP_FORM_STEPS.map((item, index) => {
                const selected = step === item.id
                const disabled = item.id !== 'basics' && !isBasicsValid(form) && stepIndex(item.id) > stepIndex(step)
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setStep(item.id)}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium',
                      selected
                        ? 'bg-[var(--color-accent-muted)]/45 text-[var(--color-accent)]'
                        : 'text-[var(--color-muted)]',
                    )}
                  >
                    <span className="tabular-nums">{index + 1}</span>
                    {item.label}
                  </button>
                )
              })}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="mb-4 lg:hidden">
                <TripFormPreview form={form} />
              </div>
              <TripProfileFields
                form={form}
                onChange={setField}
                step={step}
                defaultOwnerName={defaultOwner?.name}
              />
            </div>
          </div>

          <footer
            className={cn(
              'flex shrink-0 items-center justify-between gap-2 border-t border-[var(--color-border)] px-4 py-3',
              TRIP_FORM_STICKY_BAR,
            )}
          >
            <div className="min-w-0">
              {!isFirstStep ? (
                <Button type="button" variant="ghost" size="sm" onClick={goBack} className="gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Button>
              ) : (
                <span className="hidden text-[11px] text-[var(--color-muted)] sm:inline">Press Enter to continue</span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost" size="sm">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="button"
                size="sm"
                disabled={(!isLastStep && step === 'basics' && !isBasicsValid(form)) || (isLastStep && !canSubmit)}
                onClick={goNext}
                className="gap-1"
              >
                {isPending ? (
                  'Saving…'
                ) : isLastStep ? (
                  'Create trip'
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
