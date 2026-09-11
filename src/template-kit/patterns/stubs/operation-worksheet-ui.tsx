import type { ReactNode } from 'react'
import { Input } from '../../primitives/components/Input'
import { FormField } from './client-form-ui'
import type { ClientFormInput } from './use-client-mutations'

export function FinancialFieldsBlock({
  form,
  onChange,
}: {
  form: ClientFormInput
  onChange: <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Preferred currency">
        <Input value={form.preferredCurrency} onChange={(e) => onChange('preferredCurrency', e.target.value)} />
      </FormField>
      <FormField label="Billing account">
        <div className="flex gap-2">
          {(['prepaid', 'credit'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange('billingAccount', option)}
              className="rounded-[var(--radius-md)] border px-3 py-1.5 text-xs capitalize"
            >
              {option}
            </button>
          ))}
        </div>
      </FormField>
      {form.billingAccount === 'credit' ? (
        <FormField label="Credit limit">
          <Input
            type="number"
            value={form.creditLimit ?? ''}
            onChange={(e) => onChange('creditLimit', Number(e.target.value) || undefined)}
          />
        </FormField>
      ) : null}
    </div>
  )
}

export function MembershipTermEditor({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: {
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Start date">
        <Input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} />
      </FormField>
      <FormField label="End date">
        <Input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} />
      </FormField>
    </div>
  )
}

export function membershipStartToIso(value: string): string {
  return value.trim()
}

export type OperationCostEntryMode = 'inclusive' | 'exclusive'

export const clientChargeControlHeightClassName = 'h-8'

export const formFieldPrefixClassName =
  'shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 px-2.5 text-xs font-medium text-[var(--color-muted)]'

export const formInputClassName = 'min-w-0 flex-1 border-0 bg-transparent px-2.5 text-sm outline-none'

export const formInputMonoClassName = 'font-mono tracking-wide uppercase'

export const formInputAmountClassName = 'font-mono tabular-nums leading-tight text-right'

export const compositeFieldClassName = `relative flex ${clientChargeControlHeightClassName} items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20`

export function OperationCostEntryModeField({
  value,
  onChange,
}: {
  value: OperationCostEntryMode
  onChange: (value: OperationCostEntryMode) => void
}) {
  return (
    <div className="flex gap-2">
      {(['inclusive', 'exclusive'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className="rounded-[var(--radius-md)] border px-2.5 py-1 text-xs capitalize"
        >
          {mode}
        </button>
      ))}
    </div>
  )
}

export function TripInfoBar({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </div>
  )
}

export function TripProgressBar({ stage }: { stage: string }) {
  return (
    <div className="h-2 rounded-full bg-[var(--color-surface-muted)]">
      <div className="h-full w-1/2 rounded-full bg-[var(--color-accent)]" title={stage} />
    </div>
  )
}

export function TripWorkspaceNav({ tabs }: { tabs: string[] }) {
  return (
    <div className="flex gap-1 border-b border-[var(--color-border)] px-2">
      {tabs.map((tab) => (
        <button key={tab} type="button" className="px-3 py-2 text-xs capitalize text-[var(--color-muted)]">
          {tab}
        </button>
      ))}
    </div>
  )
}
