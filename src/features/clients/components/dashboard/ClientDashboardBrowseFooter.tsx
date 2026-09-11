import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import {
  clientProfileFooterClassName,
  clientProfileFooterInnerClassName,
} from '@/features/clients/components/profile/client-profile-browse-ui'

interface ClientDashboardBrowseFooterProps {
  isFirstStep: boolean
  isLastStep: boolean
  onBack: () => void
  onNext: () => void
  sectionLabel?: string
  stepIndex?: number
  stepCount?: number
}

export function ClientDashboardBrowseFooter({
  isFirstStep,
  isLastStep,
  onBack,
  onNext,
  sectionLabel,
  stepIndex,
  stepCount,
}: ClientDashboardBrowseFooterProps) {
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
          {stepMeta ? (
            <span className="text-[10px] tabular-nums text-[var(--color-subtle)]">{stepMeta}</span>
          ) : null}
        </div>

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
      </div>
    </footer>
  )
}
