import { useEffect, useMemo, useState } from 'react'
import type { FlightTicket, VoidTransactionData } from '@/domain/flight/types'
import { computeVoidPreview } from '@/domain/flight/ticket'
import { validateVoidData } from '@/domain/flight/transitions'
import { roundCurrency } from '@/domain/currency'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { cn } from '@/shared/utils/cn'
import { useOperationForm } from '@/features/trips/components/services/flight/operations/OperationFormFields'
import { parseIssueRoute } from '@/features/trips/components/services/flight/operations/IssueTicketForm'
import {
  OperationClientAmountQuestionRow,
  OperationClientChargeSection,
  OperationCostGridQuestionField,
  OperationPricingGroup,
  OperationSnapshotAmount,
  OperationSnapshotFlowMetrics,
  OperationSnapshotPanel,
  OperationSnapshotWaterfall,
  OperationTicketRibbon,
  OperationWorksheetSection,
  computeAmountFromRate,
  inferRatePercent,
  operationFormShellClassName,
  operationWorksheetCardClassName,
  operationWorksheetPaneClassName,
  snapshotRowGridClassName,
  type PricingValueMode,
  type WaterfallLine,
} from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

interface VoidTicketFormProps {
  ticket: FlightTicket
  seed?: VoidTransactionData
  onSubmit: (data: VoidTransactionData) => void
  onValidityChange?: (valid: boolean) => void
}

type VoidChargeKey = 'voidFee' | 'supplierFee' | 'agencyFee'

function buildVoidWaterfallLines(
  charges: Pick<VoidTransactionData, 'voidFee' | 'supplierFee' | 'agencyFee'>,
  originalProfit: number,
  profitLoss: number,
): WaterfallLine[] {
  const steps: WaterfallLine[] = []

  if (originalProfit !== 0) {
    steps.push({
      id: 'original-profit',
      label: 'Original ticket profit',
      amount: originalProfit,
      tone: originalProfit >= 0 ? 'credit' : 'debit',
      signed: true,
      showLoss: originalProfit < 0,
      kind: 'step',
    })
  }

  if (charges.voidFee > 0) {
    steps.push({
      id: 'void-fee',
      label: 'Void fee',
      amount: charges.voidFee,
      tone: 'debit',
      signed: true,
      kind: 'step',
    })
  }

  if (charges.supplierFee > 0) {
    steps.push({
      id: 'supplier-fee',
      label: 'Supplier fee',
      amount: charges.supplierFee,
      tone: 'debit',
      signed: true,
      kind: 'step',
    })
  }

  if (charges.agencyFee > 0) {
    steps.push({
      id: 'agency-fee',
      label: 'Agency fee',
      amount: charges.agencyFee,
      tone: 'debit',
      signed: true,
      kind: 'step',
    })
  }

  steps.push({
    id: 'net',
    label: 'Net result',
    amount: profitLoss,
    tone: profitLoss >= 0 ? 'credit' : 'debit',
    showLoss: profitLoss < 0,
    kind: 'total',
  })

  return steps
}

function useVoidChargeField(initialEnabled: boolean, initialValue: number, baseForPercent: number) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [mode, setMode] = useState<PricingValueMode>('amount')
  const [ratePercent, setRatePercent] = useState(() =>
    inferRatePercent(Math.abs(baseForPercent), Math.abs(initialValue)),
  )

  return {
    enabled,
    setEnabled,
    mode,
    setMode,
    ratePercent,
    setRatePercent,
  }
}

export function VoidTicketForm({ ticket, seed, onSubmit, onValidityChange }: VoidTicketFormProps) {
  const currency = ticket.pricing.currency
  const supplierCostBase = ticket.pricing.supplierCost
  const sellingPrice = ticket.pricing.sellingPrice
  const originalProfit = ticket.pricing.profit

  const { values, set } = useOperationForm(
    seed ?? {
      voidFee: 0,
      supplierFee: 0,
      agencyFee: 0,
      profitLoss: 0,
      status: 'completed' as const,
      notes: '',
    },
    seed ? `seed-${ticket.id}` : ticket.id,
  )

  const voidField = useVoidChargeField(false, 0, supplierCostBase)
  const supplierField = useVoidChargeField(false, 0, supplierCostBase)
  const agencyField = useVoidChargeField(false, 0, supplierCostBase)

  const resolvedCharges = useMemo(
    () => ({
      voidFee: voidField.enabled ? values.voidFee : 0,
      supplierFee: supplierField.enabled ? values.supplierFee : 0,
      agencyFee: agencyField.enabled ? values.agencyFee : 0,
    }),
    [
      voidField.enabled,
      supplierField.enabled,
      agencyField.enabled,
      values.voidFee,
      values.supplierFee,
      values.agencyFee,
    ],
  )

  const preview = useMemo(() => computeVoidPreview(ticket, resolvedCharges), [ticket, resolvedCharges])
  const merged = useMemo(() => ({ ...values, ...resolvedCharges, ...preview }), [values, resolvedCharges, preview])
  const totalFees = resolvedCharges.voidFee + resolvedCharges.supplierFee + resolvedCharges.agencyFee

  const canSubmit = useMemo(() => validateVoidData(ticket, merged).ok, [ticket, merged])

  useEffect(() => {
    onValidityChange?.(canSubmit)
  }, [canSubmit, onValidityChange])

  const [origin, destination] = parseIssueRoute(ticket)
  const [breakdownOpen, setBreakdownOpen] = useState(false)

  const waterfallLines = buildVoidWaterfallLines(resolvedCharges, originalProfit, preview.profitLoss)
  const hasStepLines = waterfallLines.some((line) => line.kind === 'step')
  const previewReady = totalFees > 0 || originalProfit !== 0

  useEffect(() => {
    if (hasStepLines) setBreakdownOpen(true)
  }, [hasStepLines])

  const setAmount = (key: VoidChargeKey, value: number) => {
    set(key, roundCurrency(value))
  }

  const makeEnabledHandler = (field: ReturnType<typeof useVoidChargeField>, key: VoidChargeKey) => {
    return (enabled: boolean) => {
      field.setEnabled(enabled)
      if (!enabled) setAmount(key, 0)
    }
  }

  const makeModeHandler = (
    field: ReturnType<typeof useVoidChargeField>,
    key: VoidChargeKey,
    base: number,
  ) => {
    return (mode: PricingValueMode) => {
      if (mode === field.mode) return
      if (mode === 'percent') {
        const rate = inferRatePercent(base, values[key])
        field.setRatePercent(rate)
        setAmount(key, computeAmountFromRate(base, rate))
      }
      field.setMode(mode)
    }
  }

  const makeRateHandler = (
    field: ReturnType<typeof useVoidChargeField>,
    key: VoidChargeKey,
    base: number,
  ) => {
    return (rate: number) => {
      field.setRatePercent(rate)
      setAmount(key, computeAmountFromRate(base, rate))
    }
  }

  const profitPositive = preview.profitLoss >= 0

  return (
    <form
      id="flight-op-form"
      className={operationFormShellClassName}
      onSubmit={(e) => {
        e.preventDefault()
        if (!canSubmit) return
        onSubmit(merged)
      }}
    >
      <OperationTicketRibbon ticket={ticket} origin={origin} destination={destination} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className={operationWorksheetPaneClassName}>
          <div className={operationWorksheetCardClassName}>
            <OperationWorksheetSection idPrefix="void" step="1" title="Void details">
              <div className="space-y-4">
                <OperationPricingGroup label="Ticket economics">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)]/90 bg-[var(--color-surface-muted)]/30 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">
                        Selling price
                      </p>
                      <p className="mt-1 font-mono text-[15px] font-semibold tabular-nums text-[var(--color-foreground)]">
                        {currency} {sellingPrice.toFixed(2)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">Reversed on void</p>
                    </div>
                    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)]/90 bg-[var(--color-surface-muted)]/30 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">
                        Original profit
                      </p>
                      <p
                        className={cn(
                          'mt-1 font-mono text-[15px] font-semibold tabular-nums',
                          originalProfit >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
                        )}
                      >
                        {currency} {originalProfit.toFixed(2)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">Before void charges</p>
                    </div>
                  </div>
                </OperationPricingGroup>
              </div>
            </OperationWorksheetSection>

            <OperationWorksheetSection idPrefix="void" step="2" title={`Charges · ${currency}`}>
              <div className="space-y-4">
                <OperationPricingGroup label="Costs paid to airline and supplier">
                  <div className="grid grid-cols-2 gap-3">
                    <OperationCostGridQuestionField
                      question="Void fee?"
                      ariaLabel="Add void fee"
                      amountName="Void fee"
                      enabled={voidField.enabled}
                      onEnabledChange={makeEnabledHandler(voidField, 'voidFee')}
                      mode={voidField.mode}
                      onModeChange={makeModeHandler(voidField, 'voidFee', supplierCostBase)}
                      value={values.voidFee}
                      ratePercent={voidField.ratePercent}
                      onValueChange={(v) => setAmount('voidFee', v)}
                      onRateChange={makeRateHandler(voidField, 'voidFee', supplierCostBase)}
                      currency={currency}
                    />
                    <OperationCostGridQuestionField
                      question="Supplier fee?"
                      ariaLabel="Add supplier fee"
                      amountName="Supplier fee"
                      enabled={supplierField.enabled}
                      onEnabledChange={makeEnabledHandler(supplierField, 'supplierFee')}
                      mode={supplierField.mode}
                      onModeChange={makeModeHandler(supplierField, 'supplierFee', supplierCostBase)}
                      value={values.supplierFee}
                      ratePercent={supplierField.ratePercent}
                      onValueChange={(v) => setAmount('supplierFee', v)}
                      onRateChange={makeRateHandler(supplierField, 'supplierFee', supplierCostBase)}
                      currency={currency}
                    />
                  </div>
                </OperationPricingGroup>

                <OperationClientChargeSection>
                  <div className="space-y-2.5">
                    <OperationClientAmountQuestionRow
                      question="Agency fee?"
                      ariaLabel="Add agency fee"
                      amountName="Agency fee"
                      enabled={agencyField.enabled}
                      onEnabledChange={makeEnabledHandler(agencyField, 'agencyFee')}
                      mode={agencyField.mode}
                      onModeChange={makeModeHandler(agencyField, 'agencyFee', supplierCostBase)}
                      value={values.agencyFee}
                      ratePercent={agencyField.ratePercent}
                      onValueChange={(v) => setAmount('agencyFee', v)}
                      onRateChange={makeRateHandler(agencyField, 'agencyFee', supplierCostBase)}
                      currency={currency}
                      prominent
                    />
                  </div>
                </OperationClientChargeSection>
              </div>
            </OperationWorksheetSection>

            <OperationWorksheetSection idPrefix="void" step="3" title="Notes" defaultExpanded={false}>
              <NotesTextarea
                value={values.notes ?? ''}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="OPTIONAL INTERNAL NOTE…"
                className="min-h-[72px] resize-y border-[var(--color-border)] uppercase leading-relaxed placeholder:uppercase"
              />
            </OperationWorksheetSection>
          </div>
        </div>

        <OperationSnapshotPanel
          title="Void snapshot"
          subtitle="Live economics for this void"
          currency={currency}
          previewReady={previewReady}
          emptyTitle="No charges yet"
          emptyDescription="Add void charges to preview the ticket economics."
        >
          <div
            className={cn(
              'rounded-[var(--radius-md)] border px-3 py-3',
              profitPositive
                ? 'border-[var(--color-success)]/20 bg-[var(--color-success-muted)]/35'
                : 'border-[var(--color-danger)]/20 bg-[var(--color-danger-muted)]/35',
            )}
          >
            <div className={snapshotRowGridClassName}>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  Net result
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">Profit / loss after void</p>
              </div>
              <OperationSnapshotAmount
                currency={currency}
                amount={preview.profitLoss}
                tone={profitPositive ? 'credit' : 'debit'}
                size="lg"
              />
            </div>
          </div>

          <OperationSnapshotFlowMetrics
            currency={currency}
            inAmount={sellingPrice}
            inTitle="Selling price reversed"
            inHint="Credit from voiding the ticket"
            outAmount={totalFees}
            outTitle="Void charges"
            outHint="Fees paid on void"
          />

          <OperationSnapshotWaterfall
            currency={currency}
            lines={waterfallLines}
            open={breakdownOpen}
            onToggle={() => setBreakdownOpen((value) => !value)}
          />
        </OperationSnapshotPanel>
      </div>
    </form>
  )
}
