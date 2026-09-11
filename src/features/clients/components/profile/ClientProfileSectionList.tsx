import { useEffect, useRef } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ClientFormStepId } from '@/features/clients/components/client-form-step-completion'
import { isClientFormStepComplete } from '@/features/clients/components/client-form-step-completion'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import {
  clientProfileListHeaderClassName,
  clientProfileListItemClassName,
  clientProfileListItemIconClassName,
  clientProfileListItemLabelClassName,
  clientProfileListNavClassName,
} from '@/features/clients/components/profile/client-profile-browse-ui'
import { cn } from '@/shared/utils/cn'

type StepMeta = {
  id: ClientFormStepId
  label: string
  icon: LucideIcon
}

interface ClientProfileSectionListProps {
  steps: StepMeta[]
  step: ClientFormStepId
  form: ClientFormInput
  onStepChange: (step: ClientFormStepId) => void
  className?: string
}

export function ClientProfileSectionList({
  steps,
  step,
  form,
  onStepChange,
  className,
}: ClientProfileSectionListProps) {
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    itemRefs.current[step]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [step])

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <p className={clientProfileListHeaderClassName}>Sections</p>
      <nav aria-label="Profile sections" className={clientProfileListNavClassName}>
        {steps.map((item) => {
          const isActive = item.id === step
          const isComplete = isClientFormStepComplete(form, item.id)

          return (
            <button
              key={item.id}
              ref={(node) => {
                itemRefs.current[item.id] = node
              }}
              type="button"
              aria-current={isActive ? 'step' : undefined}
              onClick={() => onStepChange(item.id)}
              className={clientProfileListItemClassName(isActive)}
            >
              <span className={clientProfileListItemIconClassName(isActive, isComplete)}>
                {isComplete && !isActive ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                ) : (
                  <item.icon className="h-3.5 w-3.5" aria-hidden />
                )}
              </span>
              <span className={clientProfileListItemLabelClassName(isActive)}>{item.label}</span>
              <ChevronRight
                className={cn(
                  'hidden h-3.5 w-3.5 shrink-0 text-[var(--color-subtle)] transition-opacity md:block',
                  isActive ? 'text-[var(--color-accent)] opacity-100' : 'opacity-0 group-hover:opacity-60',
                )}
                aria-hidden
              />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
