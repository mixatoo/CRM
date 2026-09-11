import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/design-system/components/Button'

type ClientFormWizardFooterProps = {
  isFirstStep: boolean
  isLastStep: boolean
  isPending: boolean
  canSubmit: boolean
  submitLabel?: string
  onBack: () => void
  onNext: () => void
  onSaveNow: () => void
  onCancel?: () => void
}

export function ClientFormWizardFooter({
  isFirstStep,
  isLastStep,
  isPending,
  canSubmit,
  submitLabel = 'Create client',
  onBack,
  onNext,
  onSaveNow,
  onCancel,
}: ClientFormWizardFooterProps) {
  return (
    <div className="grid w-full grid-cols-3 items-center gap-3 px-4">
      <div className="flex justify-start">
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isFirstStep || isPending}
          className="gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={isLastStep || isPending}
          onClick={onNext}
          className="gap-1"
        >
          Next
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex justify-end">
        <Button type="button" size="sm" disabled={!canSubmit || isPending} onClick={onSaveNow}>
          {isPending ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </div>
  )
}
