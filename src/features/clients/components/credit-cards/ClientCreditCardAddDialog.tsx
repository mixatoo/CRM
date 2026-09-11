import { useEffect, useRef, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import type { SubmitHandler } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import { CreditCard } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { CrmInputCell } from '@/design-system/layout/CrmPanel'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { useClientCreditCardMutations } from '@/features/clients/hooks/use-client-credit-card-mutations'
import {
  creditCardDigitsOnly,
  detectCreditCardBrandFromNumber,
  formatCreditCardCvvInput,
  formatCreditCardExpiryInput,
  formatCreditCardNumberInput,
  getCreditCardCvvMaxLength,
  isCreditCardExpiryComplete,
  isCreditCardNumberComplete,
  validateCreditCardCvvInput,
  validateCreditCardNumberInput,
} from '@/domain/entities/client-credit-card-input'
import {
  parseClientCreditCardExpiry,
  type ClientCreditCardBrand,
} from '@/domain/entities/client-credit-card'
import type { ClientCreditCardInput } from '@/domain/entities/client-credit-card'
import { useDatabaseReady } from '@/app/providers'
import { cn } from '@/shared/utils/cn'

const BRANDS: Array<{ value: ClientCreditCardBrand; label: string }> = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'amex', label: 'Amex' },
  { value: 'discover', label: 'Discover' },
  { value: 'other', label: 'Other' },
]

const CARD_FIELD_CLASS =
  'font-mono tabular-nums [direction:ltr] [unicode-bidi:plaintext] tracking-[0.08em]'

type CreditCardFormValues = {
  cardName?: string
  brand: ClientCreditCardBrand
  cardNumber: string
  expiry: string
  cvv: string
  isActive: boolean
}

interface ClientCreditCardAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  defaultIsActive?: boolean
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-subtle)]">
        {title}
      </h3>
      {children}
    </section>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-[11px] text-[var(--color-danger)]">{message}</p>
}

function brandLabel(brand: ClientCreditCardBrand): string {
  return BRANDS.find((item) => item.value === brand)?.label ?? 'Card'
}

export function ClientCreditCardAddDialog({
  open,
  onOpenChange,
  clientId,
  defaultIsActive = false,
}: ClientCreditCardAddDialogProps) {
  const dbReady = useDatabaseReady()
  const { createCard, isPending } = useClientCreditCardMutations(clientId)
  const brandLockedRef = useRef(false)
  const cardNumberRef = useRef<HTMLInputElement>(null)
  const expiryRef = useRef<HTMLInputElement>(null)
  const cvvRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreditCardFormValues>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      cardName: '',
      brand: 'visa',
      cardNumber: '',
      expiry: '',
      cvv: '',
      isActive: defaultIsActive,
    },
  })

  const brand = watch('brand')
  const cardNumber = watch('cardNumber')
  const expiry = watch('expiry')
  const cvv = watch('cvv')
  const detectedBrand = detectCreditCardBrandFromNumber(creditCardDigitsOnly(cardNumber))

  const canSave =
    isCreditCardNumberComplete(cardNumber, brand) &&
    isCreditCardExpiryComplete(expiry) &&
    validateCreditCardCvvInput(cvv, brand) === true

  useEffect(() => {
    if (!open) return
    brandLockedRef.current = false
    reset({
      cardName: '',
      brand: 'visa',
      cardNumber: '',
      expiry: '',
      cvv: '',
      isActive: defaultIsActive,
    })
  }, [open, reset, defaultIsActive])

  const applyCardNumber = (
    raw: string,
    onChange: (value: string) => void,
    focusNext = false,
  ) => {
    const digits = creditCardDigitsOnly(raw)
    const detected = detectCreditCardBrandFromNumber(digits)
    const formatBrand = detected !== 'other' ? detected : getValues('brand')

    if (digits.length === 0) {
      brandLockedRef.current = false
    }

    if (!brandLockedRef.current && detected !== 'other') {
      setValue('brand', detected, { shouldValidate: true })
    }

    const formatted = formatCreditCardNumberInput(raw, formatBrand)
    onChange(formatted)

    if (focusNext && isCreditCardNumberComplete(formatted, getValues('brand'))) {
      expiryRef.current?.focus()
    }
  }

  const onSubmit: SubmitHandler<CreditCardFormValues> = (values) => {
    if (!dbReady) return

    const parsedExpiry = parseClientCreditCardExpiry(values.expiry)
    if (!parsedExpiry) return

    const payload: ClientCreditCardInput = {
      clientId,
      cardName: values.cardName?.trim() || undefined,
      brand: values.brand,
      cardNumber: values.cardNumber,
      expMonth: parsedExpiry.expMonth,
      expYear: parsedExpiry.expYear,
      cvv: values.cvv,
      isActive: values.isActive,
    }

    createCard.mutate(payload, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 max-h-[min(42rem,calc(100dvh-1.5rem))] w-[min(36rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none"
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            cardNumberRef.current?.focus()
          }}
        >
          <header className="flex items-start gap-3 border-b border-[var(--color-border)] px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-muted)]">
              <CreditCard className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </span>
            <div className="min-w-0">
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                Add credit card
              </Dialog.Title>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                Card details are stored for charging this account.
              </p>
            </div>
          </header>

          <form className="space-y-5 px-4 py-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormSection title="Card details">
              <CrmInputCell label="Card number">
                <Controller
                  name="cardNumber"
                  control={control}
                  rules={{
                    validate: (value) => validateCreditCardNumberInput(value, getValues('brand')),
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      ref={(node) => {
                        field.ref(node)
                        cardNumberRef.current = node
                      }}
                      value={field.value}
                      onChange={(event) => applyCardNumber(event.target.value, field.onChange)}
                      onPaste={(event) => {
                        event.preventDefault()
                        applyCardNumber(event.clipboardData.getData('text'), field.onChange, true)
                      }}
                      onBlur={field.onBlur}
                      inputMode="numeric"
                      placeholder={brand === 'amex' ? '3782 822463 10005' : '4111 1111 1111 1111'}
                      disabled={isPending}
                      autoComplete="cc-number"
                      error={Boolean(errors.cardNumber)}
                      className={CARD_FIELD_CLASS}
                    />
                  )}
                />
                {detectedBrand !== 'other' ? (
                  <p className="text-[11px] text-[var(--color-muted)]">
                    Detected: <span className="font-medium text-[var(--color-foreground)]">{brandLabel(detectedBrand)}</span>
                  </p>
                ) : null}
                <FieldError message={errors.cardNumber?.message} />
              </CrmInputCell>

              <div className="grid gap-3 sm:grid-cols-2">
                <CrmInputCell label="Expiry date">
                  <Controller
                    name="expiry"
                    control={control}
                    rules={{
                      required: 'Expiry is required',
                      validate: (value) => (parseClientCreditCardExpiry(value) ? true : 'Use MM/YY format'),
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        ref={(node) => {
                          field.ref(node)
                          expiryRef.current = node
                        }}
                        value={field.value}
                        onChange={(event) => {
                          const next = formatCreditCardExpiryInput(event.target.value, field.value)
                          field.onChange(next)
                          if (isCreditCardExpiryComplete(next)) {
                            cvvRef.current?.focus()
                          }
                        }}
                        inputMode="numeric"
                        placeholder="MM/YY"
                        maxLength={5}
                        disabled={isPending}
                        autoComplete="cc-exp"
                        error={Boolean(errors.expiry)}
                        className={CARD_FIELD_CLASS}
                      />
                    )}
                  />
                  <FieldError message={errors.expiry?.message} />
                </CrmInputCell>

                <CrmInputCell label="CVV">
                  <Controller
                    name="cvv"
                    control={control}
                    rules={{
                      validate: (value) => validateCreditCardCvvInput(value, getValues('brand')),
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        ref={(node) => {
                          field.ref(node)
                          cvvRef.current = node
                        }}
                        value={field.value}
                        onChange={(event) =>
                          field.onChange(formatCreditCardCvvInput(event.target.value, getValues('brand')))
                        }
                        type="password"
                        inputMode="numeric"
                        placeholder={brand === 'amex' ? '1234' : '123'}
                        maxLength={getCreditCardCvvMaxLength(brand)}
                        disabled={isPending}
                        autoComplete="cc-csc"
                        error={Boolean(errors.cvv)}
                        className={CARD_FIELD_CLASS}
                      />
                    )}
                  />
                  <FieldError message={errors.cvv?.message} />
                </CrmInputCell>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <CrmInputCell label="Card name">
                  <Input
                    {...register('cardName')}
                    placeholder="e.g. Primary card"
                    disabled={isPending}
                    autoComplete="cc-name"
                  />
                </CrmInputCell>
                <CrmInputCell label="Card type">
                  <Controller
                    name="brand"
                    control={control}
                    render={({ field }) => (
                      <FormPicklist
                        value={field.value}
                        onChange={(value) => {
                          brandLockedRef.current = true
                          field.onChange(value)
                          const currentNumber = getValues('cardNumber')
                          if (currentNumber) {
                            setValue(
                              'cardNumber',
                              formatCreditCardNumberInput(currentNumber, value as ClientCreditCardBrand),
                              { shouldValidate: true },
                            )
                          }
                          const currentCvv = getValues('cvv')
                          if (currentCvv) {
                            setValue(
                              'cvv',
                              formatCreditCardCvvInput(currentCvv, value as ClientCreditCardBrand),
                              { shouldValidate: true },
                            )
                          }
                          void trigger(['cardNumber', 'cvv'])
                        }}
                        options={BRANDS.map((item) => ({ value: item.value, label: item.label }))}
                        panelTitle="Card type"
                        ariaLabel="Credit card type"
                        disabled={isPending}
                      />
                    )}
                  />
                </CrmInputCell>
              </div>
            </FormSection>

            <label
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-surface-muted)]/30',
                isPending && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]/20"
                {...register('isActive')}
                disabled={isPending}
              />
              <span>Set as primary card for charging</span>
            </label>

            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isPending || !canSave}>
                {isPending ? 'Saving…' : 'Save card'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
