import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import {
  clientProfileFooterClassName,
  clientProfileFooterInnerClassName,
} from '@/features/clients/components/profile/client-profile-browse-ui'

interface ClientProfileBrowseFooterProps {
  isFirstStep: boolean
  isLastStep: boolean
  onBack: () => void
  onNext: () => void
  onSaveNow?: () => void
  isSaving?: boolean
  unsavedCount?: number
  canSave?: boolean
  sectionLabel?: string
  stepIndex?: number
  stepCount?: number
}

function unsavedChangesLabel(count: number) {
  return count === 1 ? '1 unsaved change' : `${count} unsaved changes`
}

export function ClientProfileBrowseFooter({
  isFirstStep,
  isLastStep,
  onBack,
  onNext,
  onSaveNow,
  isSaving = false,
  unsavedCount = 0,
  canSave = false,
  sectionLabel,
  stepIndex,
  stepCount,
}: ClientProfileBrowseFooterProps) {
  const statusMessage = isSaving
    ? 'Saving…'
    : unsavedCount > 0
      ? unsavedChangesLabel(unsavedCount)
      : null

  const saveDisabled = !onSaveNow || !canSave || isSaving

  const stepMeta =
    stepIndex !== undefined && stepCount !== undefined && stepCount > 0
      ? `${stepIndex + 1} / ${stepCount}`
      : null

  return (
    <footer className={clientProfileFooterClassName}>
      <div className={clientProfileFooterInnerClassName}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isFirstStep}
          className="hidden h-8 gap-1.5 px-2 sm:inline-flex"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isFirstStep}
          className="h-8 w-8 p-0 sm:hidden"
          aria-label="Previous section"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 text-center">
          {sectionLabel ? (
            <span className="truncate text-xs font-medium text-[var(--color-foreground)]">{sectionLabel}</span>
          ) : null}
          <span className="inline-flex items-center gap-2 text-[10px] text-[var(--color-subtle)]">
            {stepMeta ? <span className="tabular-nums">{stepMeta}</span> : null}
            {statusMessage ? (
              <span className="inline-flex items-center gap-1" aria-live="polite">
                {!isSaving && unsavedCount > 0 ? (
                  <Check className="h-2.5 w-2.5 text-[var(--color-success)]" strokeWidth={3} aria-hidden />
                ) : null}
                {statusMessage}
              </span>
            ) : null}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isLastStep}
            onClick={onNext}
            className="hidden h-8 gap-1.5 sm:inline-flex"
          >
            Next
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLastStep}
            onClick={onNext}
            className="h-8 w-8 p-0 sm:hidden"
            aria-label="Next section"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" disabled={saveDisabled} onClick={onSaveNow} className="h-8">
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </footer>
  )
}
