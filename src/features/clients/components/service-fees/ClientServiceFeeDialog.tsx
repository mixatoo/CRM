import { useEffect, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import type { SubmitHandler } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import { Percent } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { AmountInput } from '@/design-system/components/AmountInput'
import { CrmInputCell } from '@/design-system/layout/CrmPanel'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { useClientServiceFeeMutations } from '@/features/clients/hooks/use-client-service-fee-mutations'
import type { ClientServiceFee, ClientServiceFeeType } from '@/domain/entities/client-service-fee'
import { CLIENT_SERVICE_FEE_TYPE_LABELS } from '@/domain/entities/client-service-fee'
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS, type ServiceCategory } from '@/domain/entities/trip'
import { buildCurrencyOptions, getCurrencyName } from '@/domain/currency'
import { SegmentedField } from '@/features/clients/components/client-form-ui'
import { useDatabaseReady } from '@/app/providers'

const CATEGORY_OPTIONS = [
  { value: '', label: 'Custom service' },
  ...SERVICE_CATEGORIES.map((category) => ({
    value: category,
    label: SERVICE_CATEGORY_LABELS[category],
  })),
]

const CURRENCY_OPTIONS = buildCurrencyOptions().map((option) => ({
  value: option.value,
  label: option.value,
  description: getCurrencyName(option.value),
}))

type ServiceFeeFormValues = {
  category: ServiceCategory | ''
  serviceName: string
  feeType: ClientServiceFeeType
  feeValue: number
  currency: string
  notes?: string
}

interface ClientServiceFeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  fee?: ClientServiceFee | null
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

function feeToFormValues(fee: ClientServiceFee): ServiceFeeFormValues {
  return {
    category: fee.category ?? '',
    serviceName: fee.serviceName,
    feeType: fee.feeType,
    feeValue: fee.feeValue,
    currency: fee.currency?.trim() || 'EGP',
    notes: fee.notes ?? '',
  }
}

const EMPTY_VALUES: ServiceFeeFormValues = {
  category: '',
  serviceName: '',
  feeType: 'percentage',
  feeValue: 0,
  currency: 'EGP',
  notes: '',
}

export function ClientServiceFeeDialog({
  open,
  onOpenChange,
  clientId,
  fee,
}: ClientServiceFeeDialogProps) {
  const dbReady = useDatabaseReady()
  const isEditing = Boolean(fee)
  const { createFee, updateFee, isPending } = useClientServiceFeeMutations(clientId)
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceFeeFormValues>({
    defaultValues: EMPTY_VALUES,
  })

  const feeType = watch('feeType')
  const category = watch('category')

  useEffect(() => {
    if (!open) return
    reset(fee ? feeToFormValues(fee) : EMPTY_VALUES)
  }, [open, reset, fee])

  useEffect(() => {
    if (!open || isEditing) return
    if (category) {
      setValue('serviceName', SERVICE_CATEGORY_LABELS[category as ServiceCategory])
    }
  }, [category, isEditing, open, setValue])

  const onSubmit: SubmitHandler<ServiceFeeFormValues> = (values) => {
    if (!dbReady) return

    const payload = {
      clientId,
      serviceName: values.serviceName,
      category: values.category || undefined,
      feeType: values.feeType,
      feeValue: values.feeValue,
      currency: values.feeType === 'fixed' ? values.currency : undefined,
      notes: values.notes?.trim() || undefined,
    }

    if (isEditing && fee) {
      updateFee.mutate(
        { id: fee.id, input: payload },
        { onSuccess: () => onOpenChange(false) },
      )
      return
    }

    createFee.mutate(payload, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[min(42rem,calc(100dvh-1.5rem))] w-[min(36rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none">
          <header className="flex items-start gap-3 border-b border-[var(--color-border)] px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-muted)]">
              <Percent className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </span>
            <div className="min-w-0">
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                {isEditing ? 'Edit service fee' : 'Add service fee'}
              </Dialog.Title>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                Set the agency commission or markup for a service this account uses.
              </p>
            </div>
          </header>

          <form className="space-y-5 px-4 py-4" onSubmit={handleSubmit(onSubmit)}>
            <FormSection title="Service">
              <CrmInputCell label="Service category">
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <FormPicklist
                      value={field.value}
                      onChange={field.onChange}
                      options={CATEGORY_OPTIONS}
                      panelTitle="Service category"
                      ariaLabel="Service category"
                      disabled={isPending}
                      searchable
                      searchPlaceholder="Search categories…"
                    />
                  )}
                />
              </CrmInputCell>
              <CrmInputCell label="Service name">
                <Input
                  {...register('serviceName', { required: true })}
                  placeholder="e.g. Flight booking"
                  disabled={isPending}
                  error={Boolean(errors.serviceName)}
                />
              </CrmInputCell>
            </FormSection>

            <FormSection title="Fee">
              <CrmInputCell label="Fee type">
                <Controller
                  name="feeType"
                  control={control}
                  render={({ field }) => (
                    <SegmentedField
                      aria-label="Fee type"
                      value={field.value}
                      disabled={isPending}
                      onChange={field.onChange}
                      options={(['percentage', 'fixed'] as const).map((type) => ({
                        value: type,
                        label: CLIENT_SERVICE_FEE_TYPE_LABELS[type],
                      }))}
                    />
                  )}
                />
              </CrmInputCell>

              {feeType === 'percentage' ? (
                <CrmInputCell label="Percentage">
                  <div className="relative">
                    <Controller
                      name="feeValue"
                      control={control}
                      rules={{ required: true, min: 0, max: 100 }}
                      render={({ field }) => (
                        <AmountInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isPending}
                          decimals={2}
                          min={0}
                          dir="ltr"
                          className="pr-8"
                        />
                      )}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]">
                      %
                    </span>
                  </div>
                </CrmInputCell>
              ) : (
                <CrmInputCell label="Fixed amount">
                  <div className="flex h-9 items-stretch overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20">
                    <div className="w-[6.75rem] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-muted)]/40">
                      <Controller
                        name="currency"
                        control={control}
                        render={({ field }) => (
                          <FormPicklist
                            value={field.value}
                            onChange={field.onChange}
                            options={CURRENCY_OPTIONS}
                            variant="ghost"
                            size="md"
                            fullWidth
                            searchable
                            searchPlaceholder="Search…"
                            panelTitle="Currency"
                            ariaLabel="Fee currency"
                            disabled={isPending}
                            panelClassName="!w-[20rem]"
                            className="h-full rounded-none"
                          />
                        )}
                      />
                    </div>
                    <Controller
                      name="feeValue"
                      control={control}
                      rules={{ required: true, min: 0.01 }}
                      render={({ field }) => (
                        <AmountInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isPending}
                          decimals={2}
                          dir="ltr"
                          className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 text-left font-mono tabular-nums shadow-none focus-visible:ring-0"
                        />
                      )}
                    />
                  </div>
                </CrmInputCell>
              )}

              <CrmInputCell label="Notes">
                <Input
                  {...register('notes')}
                  placeholder="Optional context for your team"
                  disabled={isPending}
                />
              </CrmInputCell>
            </FormSection>

            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Add service fee'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
