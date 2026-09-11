import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from 'react'
import { isClientIdentityComplete, normalizeClientFormInput } from '@/domain/entities/client'
import { canNavigateToClientFormStep } from '@/features/clients/components/client-form-step-completion'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import {
  CLIENT_FORM_STICKY_BAR,
  ClientFormStepSidebar,
  getClientFormStepOrder,
  getClientFormSteps,
  type ClientFormStepId,
} from '@/features/clients/components/client-form-ui'
import { ClientProfileFields } from '@/features/clients/components/ClientProfileFields'
import { ClientFormWizardFooter } from '@/features/clients/components/ClientFormWizardFooter'
import { ClientFormWizardCrmProvider } from '@/features/clients/components/client-form-wizard-ui'
import {
  hasSlaValidationErrors,
  validateSlaAgreement,
  type SlaValidationErrors,
} from '@/features/clients/components/sla/sla-validation'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import { focusFirstFocusable, focusFirstInvalid, handleFormEnterAdvance } from '@/shared/utils/form-keyboard'
import { cn } from '@/shared/utils/cn'

function stepIndex(order: ClientFormStepId[], step: ClientFormStepId) {
  return order.indexOf(step)
}

function isBasicsValid(form: ClientFormInput) {
  return isClientIdentityComplete(form)
}

export type ClientFormWizardProps = {
  form: ClientFormInput
  onChange: <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => void
  onPatch: (patch: Partial<ClientFormInput>) => void
  mode?: 'create' | 'edit'
  isPending?: boolean
  onSubmit: () => void
  onCancel?: () => void
  showStatus?: boolean
  showJoinedAt?: boolean
  className?: string
  formFieldsRef?: RefObject<HTMLDivElement | null>
  footerHint?: ReactNode
  autoFocusStep?: boolean
}

export function ClientFormWizard({
  form,
  onChange,
  onPatch,
  mode = 'create',
  isPending = false,
  onSubmit,
  onCancel,
  showStatus = false,
  showJoinedAt = false,
  className,
  formFieldsRef: formFieldsRefProp,
  footerHint,
  autoFocusStep = true,
}: ClientFormWizardProps) {
  const isEdit = mode === 'edit'
  const internalFieldsRef = useRef<HTMLDivElement>(null)
  const formFieldsRef = formFieldsRefProp ?? internalFieldsRef
  const [step, setStep] = useState<ClientFormStepId>('basics')
  const [visitedSteps, setVisitedSteps] = useState<Set<ClientFormStepId>>(() => new Set(['basics']))
  const [showNameHint, setShowNameHint] = useState(false)
  const [showSlaErrors, setShowSlaErrors] = useState(false)
  const [slaErrors, setSlaErrors] = useState<SlaValidationErrors>({})

  const stepOrder = useMemo(
    () => getClientFormStepOrder(form.type, { includeCreditCards: false, includeServiceFees: false }),
    [form.type],
  )
  const formSteps = useMemo(
    () => getClientFormSteps(form.type, { includeCreditCards: false, includeServiceFees: false }),
    [form.type],
  )

  useEffect(() => {
    setVisitedSteps((current) => {
      if (current.has(step)) return current
      const next = new Set(current)
      next.add(step)
      return next
    })
  }, [step])

  useEffect(() => {
    const order = getClientFormStepOrder(form.type, { includeCreditCards: false, includeServiceFees: false })
    if (!order.includes(step)) {
      setStep('basics')
    }
  }, [form.type, step])

  useEffect(() => {
    if (!autoFocusStep) return
    const frame = requestAnimationFrame(() => focusFirstFocusable(formFieldsRef.current))
    return () => cancelAnimationFrame(frame)
  }, [autoFocusStep, step, form.type, formFieldsRef])

  const focusIdentityErrors = useCallback(() => {
    if (focusFirstInvalid(formFieldsRef.current)) return
    focusFirstFocusable(formFieldsRef.current)
  }, [formFieldsRef])

  const canSubmit = isBasicsValid(form) && !isPending
  const isLastStep = step === stepOrder[stepOrder.length - 1]
  const isFirstStep = step === stepOrder[0]

  const validateSlaStep = useCallback((): boolean => {
    const errors = validateSlaAgreement(form.slaAgreement)
    setSlaErrors(errors)
    if (hasSlaValidationErrors(errors)) {
      setShowSlaErrors(true)
      if (step !== 'sla') setStep('sla')
      requestAnimationFrame(() => focusFirstInvalid(formFieldsRef.current))
      return false
    }
    setShowSlaErrors(false)
    return true
  }, [form.slaAgreement, step, formFieldsRef])

  const setField = useCallback(
    <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => {
      onChange(key, value)
      if (key === 'firstName' || key === 'lastName' || key === 'middleName' || key === 'company') {
        setShowNameHint(false)
      }
      if (key === 'slaAgreement') {
        setShowSlaErrors(false)
      }
    },
    [onChange],
  )

  const patchForm = useCallback(
    (patch: Partial<ClientFormInput>) => {
      onPatch(patch)
      if ('firstName' in patch || 'lastName' in patch || 'middleName' in patch || 'company' in patch) {
        setShowNameHint(false)
      }
      if ('slaAgreement' in patch) {
        setShowSlaErrors(false)
      }
    },
    [onPatch],
  )

  const handleSubmit = () => {
    if (!canSubmit) {
      if (!isBasicsValid(form)) {
        setShowNameHint(true)
        focusIdentityErrors()
      }
      return
    }
    if (!validateSlaStep()) return
    onSubmit()
  }

  const goNext = () => {
    if (isLastStep) {
      handleSubmit()
      return
    }
    if (step === 'basics' && !isBasicsValid(form)) {
      setShowNameHint(true)
      focusIdentityErrors()
      return
    }
    if (step === 'sla' && !validateSlaStep()) return
    const next = stepOrder[stepIndex(stepOrder, step) + 1]
    if (next) setStep(next)
  }

  const goBack = () => {
    const prev = stepOrder[stepIndex(stepOrder, step) - 1]
    if (prev) setStep(prev)
  }

  const canGoToStep = (next: ClientFormStepId) =>
    canNavigateToClientFormStep(next, step, stepOrder, form, visitedSteps)

  const stepNavProps = {
    step,
    steps: formSteps,
    order: stepOrder,
    form,
    visitedSteps,
    canGoToStep,
    headerTitle: CRM_LABELS.newAccount,
    onStepChange: (next: ClientFormStepId) => {
      if (canGoToStep(next)) {
        setStep(next)
        return
      }
      if (!isBasicsValid(form)) {
        setShowNameHint(true)
        setStep('basics')
        focusIdentityErrors()
      }
    },
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && onCancel && !event.defaultPrevented) {
      const target = event.target as HTMLElement
      if (!target.closest('[data-date-picker-popover]') && !target.closest('[role="listbox"]')) {
        event.preventDefault()
        onCancel()
        return
      }
    }

    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      goNext()
      return
    }

    if (event.altKey && event.key === 'ArrowLeft' && !isFirstStep) {
      event.preventDefault()
      goBack()
      return
    }

    handleFormEnterAdvance(event, formFieldsRef.current, goNext)
  }

  const formContentShellClassName = 'mx-auto w-full max-w-xl px-4 py-2.5'

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden', className)} onKeyDown={handleKeyDown}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:grid md:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] md:items-stretch">
        <aside className="hidden h-full min-h-0 w-[var(--sidebar-width)] shrink-0 flex-col overflow-hidden border-r border-[var(--color-border)] py-4 pr-4 pl-3 md:flex">
          <ClientFormStepSidebar {...stepNavProps} layout="vertical" />
        </aside>

        <div ref={formFieldsRef} className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className={formContentShellClassName}>
            <div className="mb-3 border-b border-[var(--color-border)] pb-3 md:hidden">
              <ClientFormStepSidebar {...stepNavProps} layout="horizontal" />
            </div>
            <ClientFormWizardCrmProvider>
              <ClientProfileFields
                form={form}
                onChange={setField}
                onPatch={patchForm}
                layout="step"
                step={step}
                showStatus={showStatus}
                showJoinedAt={showJoinedAt}
                showNameHint={showNameHint && step === 'basics'}
                showSlaErrors={showSlaErrors}
                slaErrors={slaErrors}
                lockClientType={isEdit}
              />
            </ClientFormWizardCrmProvider>
          </div>
        </div>
      </div>

      <footer
        className={cn(
          'shrink-0 border-t border-[var(--color-border)] py-3',
          CLIENT_FORM_STICKY_BAR,
        )}
      >
        {footerHint ? <div className="px-4 pb-2">{footerHint}</div> : null}
        <ClientFormWizardFooter
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isPending={isPending}
          canSubmit={canSubmit}
          submitLabel={isEdit ? 'Save changes' : 'Create client'}
          onBack={goBack}
          onNext={goNext}
          onSaveNow={handleSubmit}
          onCancel={onCancel}
        />
      </footer>
    </div>
  )
}

export function createClientFormChangeHandlers(setForm: Dispatch<SetStateAction<ClientFormInput>>) {
  const onChange = <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'type' && value !== current.type) {
        return normalizeClientFormInput({ ...next, type: value as ClientFormInput['type'] })
      }
      return next
    })
  }

  const onPatch = (patch: Partial<ClientFormInput>) => {
    setForm((current) => normalizeClientFormInput({ ...current, ...patch }))
  }

  return { onChange, onPatch }
}
