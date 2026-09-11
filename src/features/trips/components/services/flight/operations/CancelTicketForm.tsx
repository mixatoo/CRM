import { useEffect, useMemo, useState } from 'react'
import type { CancellationTransactionData, FlightTicket } from '@/domain/flight/types'
import { computeCancellationPreview } from '@/domain/flight/ticket'
import { validateCancellationData } from '@/domain/flight/transitions'
import { roundCurrency } from '@/domain/currency'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { layout } from '@/design-system/tokens/layout'
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
  OperationYesNoToggle,
  computeAmountFromRate,
  inferRatePercent,
  operationFormShellClassName,
  operationWorksheetCardClassName,
  operationWorksheetPaneClassName,
  snapshotRowGridClassName,
  type PricingValueMode,
  type WaterfallLine,
} from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

const REFUNDABLE_HINTS = {
  true: 'Client receives a refund based on selling price minus cancellation charges.',
  false: 'Ticket is cancelled with no refund to the client.',
} as const

interface CancelTicketFormProps {
  ticket: FlightTicket
  seed?: CancellationTransactionData
  onSubmit: (data: CancellationTransactionData) => void
  onValidityChange?: (valid: boolean) => void
}

type CancelChargeKey = 'cancellationPenalty' | 'supplierFees' | 'agencyFees'

function buildCancelWaterfallLines(
  isRefundable: boolean,
  sellingPrice: number,
  charges: Pick<CancellationTransactionData, 'cancellationPenalty' | 'supplierFees' | 'agencyFees'>,
  profitLoss: number,
): WaterfallLine[] {
  const steps: WaterfallLine[] = []

  if (isRefundable && sellingPrice > 0) {
    steps.push({
      id: 'base',
      label: 'Refundable base',
      amount: sellingPrice,
      tone: 'credit',
      signed: true,
      kind: 'step',
    })
  }

  if (charges.cancellationPenalty > 0) {
    steps.push({
      id: 'penalty',
      label: 'Cancellation penalty',
      amount: charges.cancellationPenalty,
      tone: 'debit',
      signed: true,
      kind: 'step',
    })
  }

  if (charges.supplierFees > 0) {
    steps.push({
      id: 'supplier',
      label: 'Supplier fees',
      amount: charges.supplierFees,
      tone: 'debit',
      signed: true,
      kind: 'step',
    })
  }

  if (charges.agencyFees > 0) {
    steps.push({
      id: 'agency',
      label: 'Agency fees',
      amount: charges.agencyFees,
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

function useCancelChargeField(initialEnabled: boolean, initialValue: number, baseForPercent: number) {
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

export function CancelTicketForm({ ticket, seed, onSubmit, onValidityChange }: CancelTicketFormProps) {
  const currency = ticket.pricing.currency
  const supplierCostBase = ticket.pricing.supplierCost
  const sellingPrice = ticket.pricing.sellingPrice
  const originalProfit = ticket.pricing.profit

  const { values, set } = useOperationForm(
    seed ?? {
      isRefundable: true,
      cancellationPenalty: 0,
      supplierFees: 0,
      agencyFees: 0,
      netRefund: 0,
      profitLoss: 0,
      notes: '',
    },
    seed ? `seed-${ticket.id}` : ticket.id,
  )

  const penaltyField = useCancelChargeField(false, 0, supplierCostBase)
  const supplierField = useCancelChargeField(false, 0, supplierCostBase)
  const agencyField = useCancelChargeField(false, 0, supplierCostBase)

  const handleRefundableChange = (refundable: boolean) => {
    if (values.isRefundable === refundable) return
    if (!refundable) {
      set('cancellationPenalty', 0)
      set('supplierFees', 0)
      set('agencyFees', 0)
      penaltyField.setEnabled(false)
      supplierField.setEnabled(false)
      agencyField.setEnabled(false)
    }
    set('isRefundable', refundable)
  }

  const resolvedCharges = useMemo(
    () => ({
      isRefundable: values.isRefundable,
      cancellationPenalty:
        values.isRefundable && penaltyField.enabled ? values.cancellationPenalty : 0,
      supplierFees: values.isRefundable && supplierField.enabled ? values.supplierFees : 0,
      agencyFees: values.isRefundable && agencyField.enabled ? values.agencyFees : 0,
    }),
    [
      values.isRefundable,
      penaltyField.enabled,
      supplierField.enabled,
      agencyField.enabled,
      values.cancellationPenalty,
      values.supplierFees,
      values.agencyFees,
    ],
  )

  const preview = useMemo(() => computeCancellationPreview(ticket, resolvedCharges), [ticket, resolvedCharges])
  const merged = useMemo(() => ({ ...values, ...resolvedCharges, ...preview }), [values, resolvedCharges, preview])

  const canSubmit = useMemo(() => validateCancellationData(merged).ok, [merged])

  useEffect(() => {
    onValidityChange?.(canSubmit)
  }, [canSubmit, onValidityChange])

  const [origin, destination] = parseIssueRoute(ticket)
  const [breakdownOpen, setBreakdownOpen] = useState(false)

  const waterfallLines = buildCancelWaterfallLines(
    resolvedCharges.isRefundable,
    sellingPrice,
    resolvedCharges,
    preview.profitLoss,
  )
  const hasStepLines = waterfallLines.some((line) => line.kind === 'step')
  const previewReady =
    resolvedCharges.isRefundable ||
    resolvedCharges.cancellationPenalty > 0 ||
    resolvedCharges.supplierFees > 0 ||
    resolvedCharges.agencyFees > 0 ||
    originalProfit !== 0

  useEffect(() => {
    if (hasStepLines) setBreakdownOpen(true)
  }, [hasStepLines])

  const setAmount = (key: CancelChargeKey, value: number) => {
    set(key, roundCurrency(value))
  }

  const makeEnabledHandler = (field: ReturnType<typeof useCancelChargeField>, key: CancelChargeKey) => {
    return (enabled: boolean) => {
      field.setEnabled(enabled)
      if (!enabled) setAmount(key, 0)
    }
  }

  const makeModeHandler = (
    field: ReturnType<typeof useCancelChargeField>,
    key: CancelChargeKey,
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
    field: ReturnType<typeof useCancelChargeField>,
    key: CancelChargeKey,
    base: number,
  ) => {
    return (rate: number) => {
      field.setRatePercent(rate)
      setAmount(key, computeAmountFromRate(base, rate))
    }
  }

  const profitPositive = preview.profitLoss >= 0
  const refundableBase = resolvedCharges.isRefundable ? sellingPrice : 0

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
            <OperationWorksheetSection idPrefix="cancel" step="1" title="Cancellation details">
              <div className="space-y-4">
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <p className="text-[13px] font-medium text-[var(--color-foreground)]">Refundable ticket?</p>
                    <OperationYesNoToggle
                      value={values.isRefundable}
                      onChange={handleRefundableChange}
                      ariaLabel="Refundable ticket"
                    />
                  </div>
                  <p className={cn(layout.caption, 'mt-1.5 leading-snug')}>
                    {REFUNDABLE_HINTS[String(values.isRefundable) as 'true' | 'false']}
                  </p>
                </div>

                <OperationPricingGroup label="Ticket economics">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)]/90 bg-[var(--color-surface-muted)]/30 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">
                        Selling price
                      </p>
                      <p className="mt-1 font-mono text-[15px] font-semibold tabular-nums text-[var(--color-foreground)]">
                        {currency} {sellingPrice.toFixed(2)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">
                        {values.isRefundable ? 'Refundable base' : 'No refund on cancel'}
                      </p>
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
                      <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">Before cancellation</p>
                    </div>
                  </div>
                </OperationPricingGroup>
              </div>
            </OperationWorksheetSection>

            {values.isRefundable ? (
              <OperationWorksheetSection idPrefix="cancel" step="2" title={`Charges · ${currency}`}>
                <div className="space-y-4">
                  <OperationPricingGroup label="Deductions from refund">
                    <div className="grid grid-cols-2 gap-3">
                      <OperationCostGridQuestionField
                        question="Cancellation penalty?"
                        ariaLabel="Add cancellation penalty"
                        amountName="Cancellation penalty"
                        enabled={penaltyField.enabled}
                        onEnabledChange={makeEnabledHandler(penaltyField, 'cancellationPenalty')}
                        mode={penaltyField.mode}
                        onModeChange={makeModeHandler(penaltyField, 'cancellationPenalty', supplierCostBase)}
                        value={values.cancellationPenalty}
                        ratePercent={penaltyField.ratePercent}
                        onValueChange={(v) => setAmount('cancellationPenalty', v)}
                        onRateChange={makeRateHandler(penaltyField, 'cancellationPenalty', supplierCostBase)}
                        currency={currency}
                      />
                      <OperationCostGridQuestionField
                        question="Supplier fees?"
                        ariaLabel="Add supplier fees"
                        amountName="Supplier fees"
                        enabled={supplierField.enabled}
                        onEnabledChange={makeEnabledHandler(supplierField, 'supplierFees')}
                        mode={supplierField.mode}
                        onModeChange={makeModeHandler(supplierField, 'supplierFees', supplierCostBase)}
                        value={values.supplierFees}
                        ratePercent={supplierField.ratePercent}
                        onValueChange={(v) => setAmount('supplierFees', v)}
                        onRateChange={makeRateHandler(supplierField, 'supplierFees', supplierCostBase)}
                        currency={currency}
                      />
                    </div>
                  </OperationPricingGroup>

                  <OperationClientChargeSection>
                    <div className="space-y-2.5">
                      <OperationClientAmountQuestionRow
                        question="Agency fees?"
                        ariaLabel="Add agency fees"
                        amountName="Agency fees"
                        enabled={agencyField.enabled}
                        onEnabledChange={makeEnabledHandler(agencyField, 'agencyFees')}
                        mode={agencyField.mode}
                        onModeChange={makeModeHandler(agencyField, 'agencyFees', supplierCostBase)}
                        value={values.agencyFees}
                        ratePercent={agencyField.ratePercent}
                        onValueChange={(v) => setAmount('agencyFees', v)}
                        onRateChange={makeRateHandler(agencyField, 'agencyFees', supplierCostBase)}
                        currency={currency}
                        prominent
                      />
                    </div>
                  </OperationClientChargeSection>
                </div>
              </OperationWorksheetSection>
            ) : null}

            <OperationWorksheetSection
              idPrefix="cancel"
              step={values.isRefundable ? '3' : '2'}
              title="Notes"
              defaultExpanded={false}
            >
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
          title="Cancellation snapshot"
          subtitle="Live economics for this cancellation"
          currency={currency}
          previewReady={previewReady}
          emptyTitle="No economics yet"
          emptyDescription="Review cancellation settings to preview the ticket economics."
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
                <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">Profit / loss after cancellation</p>
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
            inAmount={refundableBase}
            inTitle="Refundable base"
            inHint={values.isRefundable ? 'Selling price available to refund' : 'Non-refundable cancellation'}
            outAmount={preview.netRefund}
            outTitle="Client receives"
            outHint="Net refund after deductions"
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
