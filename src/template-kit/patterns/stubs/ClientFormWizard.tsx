import { useState, type Dispatch, type SetStateAction } from 'react'
import { Button } from '../../primitives/components/Button'
import {
  ClientFormStepSidebar,
  ClientProfileFieldsStub,
  getClientFormStepOrder,
  getClientFormSteps,
  type ClientFormStepId,
} from './client-form-ui'
import type { ClientFormInput } from './use-client-mutations'
import { cn } from '../../primitives/utils/cn'

export function createClientFormChangeHandlers(setForm: Dispatch<SetStateAction<ClientFormInput>>) {
  const onChange = <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }
  const onPatch = (patch: Partial<ClientFormInput>) => {
    setForm((current) => ({ ...current, ...patch }))
  }
  return { onChange, onPatch }
}

export function ClientFormWizard({
  form,
  onChange,
  onPatch,
  onSubmit,
  onCancel,
  className,
}: {
  form: ClientFormInput
  onChange: <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => void
  onPatch: (patch: Partial<ClientFormInput>) => void
  onSubmit: () => void
  onCancel?: () => void
  className?: string
}) {
  void onPatch
  const steps = getClientFormSteps(form.type)
  const order = getClientFormStepOrder(form.type)
  const [step, setStep] = useState<ClientFormStepId>('basics')
  const [visited, setVisited] = useState<Set<ClientFormStepId>>(() => new Set(['basics']))

  const goNext = () => {
    const index = order.indexOf(step)
    const next = order[index + 1]
    if (!next) return
    setStep(next)
    setVisited((current) => new Set([...current, next]))
  }

  return (
    <div className={cn('flex min-h-0 flex-1', className)}>
      <ClientFormStepSidebar steps={steps} current={step} visited={visited} onSelect={setStep} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-auto p-4">
          <ClientProfileFieldsStub form={form} onChange={onChange} step={step} />
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] px-4 py-3">
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          {step !== order[order.length - 1] ? (
            <Button type="button" onClick={goNext}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={onSubmit}>
              Save client
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
