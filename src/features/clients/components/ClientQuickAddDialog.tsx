import { useEffect, useId, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowLeft, ArrowRight, Mail, Phone } from 'lucide-react'
import { CloseButton } from '@/design-system/components/CloseButton'
import {
  isClientIdentityComplete,
  normalizeClientFormInput,
  type ClientType,
} from '@/domain/entities/client'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { requiredFieldControlProps } from '@/design-system/components/FieldLabel'
import { applyTitleCaseOnBlur } from '@/features/clients/components/client-form-shared'
import { IndividualNameFields } from '@/features/clients/components/IndividualNameFields'
import { ClientTypeField, FormField } from '@/features/clients/components/client-form-ui'
import { EMPTY_CLIENT_FORM } from '@/features/clients/components/ClientProfileFields'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import { cn } from '@/shared/utils/cn'
import {
  focusFirstFocusable,
  focusFirstInvalid,
  handleFormEnterAdvance,
} from '@/shared/utils/form-keyboard'

const QUICK_ADD_TYPE_KEY = 'egyliere:quick-add-client-type'

type QuickAddStep = 'identity' | 'contact'

interface ClientQuickAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending?: boolean
  onSubmit: (input: ClientFormInput) => void
  onOpenFullForm?: () => void
}

function readLastClientType(): ClientType {
  try {
    const stored = sessionStorage.getItem(QUICK_ADD_TYPE_KEY)
    if (stored === 'individual' || stored === 'corporate') return stored
  } catch {
    /* ignore */
  }
  return 'individual'
}

function rememberClientType(type: ClientType) {
  try {
    sessionStorage.setItem(QUICK_ADD_TYPE_KEY, type)
  } catch {
    /* ignore */
  }
}

const STEPS: { id: QuickAddStep; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'contact', label: CRM_LABELS.communication },
]

export function ClientQuickAddDialog({
  open,
  onOpenChange,
  isPending,
  onSubmit,
  onOpenFullForm,
}: ClientQuickAddDialogProps) {
  const formId = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const formFieldsRef = useRef<HTMLFormElement>(null)
  const [step, setStep] = useState<QuickAddStep>('identity')
  const [form, setForm] = useState<ClientFormInput>(EMPTY_CLIENT_FORM)
  const [showNameHint, setShowNameHint] = useState(false)

  useEffect(() => {
    if (!open) return
    const lastType = readLastClientType()
    setForm(normalizeClientFormInput({ ...EMPTY_CLIENT_FORM, type: lastType }))
    setShowNameHint(false)
    setStep('identity')
    const timer = window.setTimeout(() => focusFirstFocusable(formFieldsRef.current), 40)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open || step !== 'contact') return
    const timer = window.setTimeout(() => focusFirstFocusable(formFieldsRef.current), 40)
    return () => window.clearTimeout(timer)
  }, [open, step])

  const setField = <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'type' && value !== current.type) {
        rememberClientType(value as ClientType)
        return normalizeClientFormInput({ ...next, type: value as ClientType })
      }
      return next
    })
    if (key === 'firstName' || key === 'lastName' || key === 'middleName' || key === 'company' || key === 'displayName') {
      setShowNameHint(false)
    }
  }

  const patchForm = (patch: Partial<ClientFormInput>) => {
    setForm((current) => normalizeClientFormInput({ ...current, ...patch }))
    if (
      'firstName' in patch ||
      'lastName' in patch ||
      'middleName' in patch ||
      'company' in patch ||
      'displayName' in patch
    ) {
      setShowNameHint(false)
    }
  }

  const isCorporate = form.type === 'corporate'
  const identityReady = isClientIdentityComplete(form)
  const stepIndex = step === 'identity' ? 0 : 1

  const handleSubmit = () => {
    if (isPending || !identityReady) return
    onSubmit(normalizeClientFormInput(form))
  }

  const goToContact = () => {
    if (!identityReady) {
      setShowNameHint(true)
      if (!focusFirstInvalid(formFieldsRef.current)) {
        nameRef.current?.focus()
      }
      return
    }
    setStep('contact')
  }

  const handlePrimaryAction = () => {
    if (step === 'identity') {
      goToContact()
      return
    }
    handleSubmit()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (step === 'contact') {
        event.preventDefault()
        setStep('identity')
      }
      return
    }

    handleFormEnterAdvance(event, formFieldsRef.current, handlePrimaryAction)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            'animate-fade-in fixed left-1/2 top-1/2 z-[601] w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 outline-none',
            'rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl',
          )}
          onKeyDown={handleKeyDown}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => {
            if (step === 'contact') {
              event.preventDefault()
              setStep('identity')
            }
          }}
        >
          <header className="border-b border-[var(--color-border)] px-4 pb-3 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                  {CRM_LABELS.quickAddAccount}
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 text-[11px] text-[var(--color-muted)]">
                  {step === 'identity' ? 'Who are you adding?' : 'Add contact details or skip'}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <CloseButton variant="elevated" />
              </Dialog.Close>
            </div>

            <div className="mt-4 flex items-center gap-2" aria-hidden>
              {STEPS.map((item, index) => (
                <div key={item.id} className="flex flex-1 items-center gap-2">
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                      index <= stepIndex
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-surface-muted)] text-[var(--color-muted)]',
                    )}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-medium',
                      index === stepIndex ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted)]',
                    )}
                  >
                    {item.label}
                  </span>
                  {index < STEPS.length - 1 ? (
                    <span
                      className={cn(
                        'h-px flex-1',
                        index < stepIndex ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]',
                      )}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </header>

          <form
            id={formId}
            ref={formFieldsRef}
            className="px-4 py-4"
            onSubmit={(event) => {
              event.preventDefault()
              handlePrimaryAction()
            }}
          >
            {step === 'identity' ? (
              <div className="space-y-4">
                <FormField label="Account type" stacked>
                  <ClientTypeField
                    value={form.type}
                    onChange={(value) => setField('type', value)}
                    disabled={isPending}
                  />
                </FormField>

                {isCorporate ? (
                  <FormField label="Company name" required>
                    <Input
                      ref={nameRef}
                      value={form.company ?? ''}
                      onChange={(event) => setField('company', event.target.value)}
                      onBlur={() => applyTitleCaseOnBlur(form.company ?? '', (value) => setField('company', value))}
                      disabled={isPending}
                      {...requiredFieldControlProps(form.company, showNameHint, 'Acme Holdings')}
                    />
                  </FormField>
                ) : (
                  <IndividualNameFields
                    form={form}
                    onChange={setField}
                    onPatch={patchForm}
                    disabled={isPending}
                    layout="form"
                    firstNameRef={nameRef}
                    showNameHint={showNameHint}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <FormField label="Email">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-subtle)]" />
                    <Input
                      ref={emailRef}
                      type="email"
                      value={form.email ?? ''}
                      onChange={(event) => setField('email', event.target.value)}
                      placeholder={isCorporate ? 'billing@company.com' : 'traveler@email.com'}
                      disabled={isPending}
                      className="pl-8"
                    />
                  </div>
                </FormField>
                <FormField label="Phone">
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-subtle)]" />
                    <Input
                      type="tel"
                      value={form.phone ?? ''}
                      onChange={(event) => setField('phone', event.target.value)}
                      placeholder="+20 100 000 0000"
                      disabled={isPending}
                      className="pl-8"
                    />
                  </div>
                </FormField>
                <p className="text-[11px] text-[var(--color-muted)]">
                  Leave blank and create now if contact is not ready.
                </p>
              </div>
            )}
          </form>

          <footer className="space-y-2 border-t border-[var(--color-border)] px-4 py-3">
            <div className="flex items-center gap-2">
              {step === 'contact' ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => setStep('identity')}
                  disabled={isPending}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Button>
              ) : (
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost" size="sm">
                    Cancel
                  </Button>
                </Dialog.Close>
              )}

              <Button
                type="submit"
                form={formId}
                size="sm"
                className="ml-auto gap-1.5"
                disabled={isPending}
              >
                {step === 'identity' ? (
                  <>
                    Continue
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                ) : isPending ? (
                  'Creating…'
                ) : (
                  'Create client'
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between gap-2">
              {step === 'contact' ? (
                <button
                  type="button"
                  className="text-[11px] font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  onClick={handleSubmit}
                  disabled={isPending || !identityReady}
                >
                  Skip contact & create
                </button>
              ) : (
                <span className="text-[10px] text-[var(--color-subtle)]">Enter to continue</span>
              )}

              {onOpenFullForm ? (
                <button
                  type="button"
                  className="text-[11px] font-medium text-[var(--color-accent)] hover:underline"
                  onClick={() => {
                    onOpenChange(false)
                    onOpenFullForm()
                  }}
                >
                  Full form
                </button>
              ) : null}
            </div>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
