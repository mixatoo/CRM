import { useMemo } from 'react'
import { resolveClientPaymentCurrencies, clientPrimaryLabel, type Client } from '@/domain/entities/client'
import { Input } from '@/design-system/components/Input'
import { FormPicklist, type FormPicklistOption } from '@/design-system/components/FormPicklist'
import { FormDatePicker } from '@/design-system/components/DatePickerField'
import { FormField } from '@/features/clients/components/client-form-ui'
import { ClientDirectoryPicklist } from '@/features/clients/components/ClientDirectoryPicklist'
import { TripTypeField } from '@/features/trips/components/trip-form-ui'
import type { TripFormStepId } from '@/features/trips/components/trip-form-ui'
import type { TripFormInput } from '@/features/trips/utils/create-trip'
import { useTripFilterOptions } from '@/features/trips/hooks/use-trip-filter-options'
import { cn } from '@/shared/utils/cn'

const CURRENCY_PRESETS = ['EGP', 'USD', 'EUR', 'GBP', 'SAR', 'AED'] as const

interface TripProfileFieldsProps {
  form: TripFormInput
  onChange: <K extends keyof TripFormInput>(key: K, value: TripFormInput[K]) => void
  step: TripFormStepId
  defaultOwnerName?: string
}

function TripBasicsFields({
  form,
  onChange,
  ownerOptions,
}: {
  form: TripFormInput
  onChange: TripProfileFieldsProps['onChange']
  ownerOptions: FormPicklistOption[]
}) {
  return (
    <div className="space-y-4">
      <FormField label="Trip name" required hint="Shown in lists, workspace header, and documents">
        <Input
          value={form.name}
          onChange={(event) => onChange('name', event.target.value)}
          placeholder="e.g. Nile Cruise — Luxor to Aswan"
          autoFocus
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Destination">
          <Input
            value={form.destination}
            onChange={(event) => onChange('destination', event.target.value)}
            placeholder="Cairo"
          />
        </FormField>
        <FormField label="Branch">
          <Input
            value={form.branch}
            onChange={(event) => onChange('branch', event.target.value)}
            placeholder="HQ"
          />
        </FormField>
      </div>

      <FormField label="Owner" required>
        <FormPicklist
          value={form.ownerName}
          onChange={(value) => onChange('ownerName', value)}
          options={ownerOptions}
          placeholder="Select owner"
          panelTitle="Trip owner"
          ariaLabel="Trip owner"
        />
      </FormField>

      <FormField label="Trip type">
        <TripTypeField value={form.tripType} onChange={(value) => onChange('tripType', value)} />
      </FormField>
    </div>
  )
}

function TripClientFields({
  form,
  onChange,
}: {
  form: TripFormInput
  onChange: TripProfileFieldsProps['onChange']
}) {
  const handleClientSelect = (client: Client | null) => {
    if (!client) {
      onChange('mainContactName', '')
      onChange('mainContactEmail', '')
      return
    }
    onChange('mainContactName', clientPrimaryLabel(client))
    onChange('mainContactEmail', client.email ?? '')
    const paymentCurrencies = resolveClientPaymentCurrencies(client)
    const tripCurrency = paymentCurrencies[0] ?? client.preferredCurrency?.trim()
    if (tripCurrency) {
      onChange('currency', tripCurrency.toUpperCase())
    }
  }

  return (
    <div className="space-y-4">
      <FormField label="Client" hint="Pick a record from the global clients directory">
        <ClientDirectoryPicklist
          value={form.clientId}
          onChange={(clientId) => onChange('clientId', clientId)}
          onClientSelect={handleClientSelect}
        />
      </FormField>

      {form.clientId ? (
        <>
          <FormField label="Contact name">
            <Input
              value={form.mainContactName}
              onChange={(event) => onChange('mainContactName', event.target.value)}
              placeholder="Filled from client record"
            />
          </FormField>
          <FormField label="Contact email">
            <Input
              type="email"
              value={form.mainContactEmail}
              onChange={(event) => onChange('mainContactEmail', event.target.value)}
              placeholder="Filled from client record"
            />
          </FormField>
        </>
      ) : (
        <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 px-3 py-2.5 text-[11px] text-[var(--color-muted)]">
          Select a client to link this trip to the directory. Contact details will fill in automatically.
        </p>
      )}
    </div>
  )
}

function TripScheduleFields({
  form,
  onChange,
}: {
  form: TripFormInput
  onChange: TripProfileFieldsProps['onChange']
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Start date">
          <FormDatePicker
            value={form.startDate}
            onChange={(value) => onChange('startDate', value)}
            max={form.endDate || undefined}
            aria-label="Start date"
          />
        </FormField>
        <FormField label="End date">
          <FormDatePicker
            value={form.endDate}
            onChange={(value) => onChange('endDate', value)}
            min={form.startDate || undefined}
            aria-label="End date"
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Adults">
          <Input
            type="number"
            min={0}
            value={form.adults}
            onChange={(event) => onChange('adults', Number(event.target.value) || 0)}
          />
        </FormField>
        <FormField label="Minors">
          <Input
            type="number"
            min={0}
            value={form.minors}
            onChange={(event) => onChange('minors', Number(event.target.value) || 0)}
          />
        </FormField>
      </div>

      <FormField label="Currency" hint="Default for services and invoices on this trip">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {CURRENCY_PRESETS.map((currency) => (
              <button
                key={currency}
                type="button"
                onClick={() => onChange('currency', currency)}
                className={cn(
                  'rounded-[var(--radius-sm)] border px-2 py-1 text-[11px] font-medium tabular-nums transition-colors',
                  form.currency === currency
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/40 text-[var(--color-accent)]'
                    : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)]',
                )}
              >
                {currency}
              </button>
            ))}
          </div>
          <Input
            value={form.currency}
            onChange={(event) => onChange('currency', event.target.value.toUpperCase())}
            placeholder="Custom ISO code"
            className="max-w-[8rem] font-mono text-xs uppercase"
          />
        </div>
      </FormField>
    </div>
  )
}

export function TripProfileFields({ form, onChange, step, defaultOwnerName }: TripProfileFieldsProps) {
  const { data: filterOptions } = useTripFilterOptions()
  const ownerOptions = useMemo(() => {
    const names = Array.from(
      new Set([form.ownerName, defaultOwnerName, ...(filterOptions?.owners.map((item) => item.value) ?? [])].filter(Boolean)),
    ) as string[]
    return names.map((name) => ({ value: name, label: name }))
  }, [filterOptions?.owners, form.ownerName, defaultOwnerName])

  if (step === 'basics') {
    return <TripBasicsFields form={form} onChange={onChange} ownerOptions={ownerOptions} />
  }
  if (step === 'client') {
    return <TripClientFields form={form} onChange={onChange} />
  }
  return <TripScheduleFields form={form} onChange={onChange} />
}
