import { useEffect, useMemo, useState } from 'react'
import type { FlightTicket, RefundTransactionData } from '@/domain/flight/types'
import { computeRefundPreview } from '@/domain/flight/ticket'
import { getRemainingRefundableAmount, validateRefundData } from '@/domain/flight/transitions'
import { roundCurrency } from '@/domain/currency'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { cn } from '@/shared/utils/cn'
import { EmbeddedFormDatePicker } from '@/design-system/components/DatePickerField'
import { useOperationForm } from '@/features/trips/components/services/flight/operations/OperationFormFields'
import { parseIssueRoute } from '@/features/trips/components/services/flight/operations/IssueTicketForm'
import {
  OperationClientAmountQuestionRow,
  OperationClientChargeSection,
  OperationCostEntryModeField,
  OperationCostGridQuestionField,
  OperationFieldCompact,
  OperationMoneyFieldCompact,
  OperationPricingGroup,
  OperationSnapshotAmount,
  OperationSnapshotFlowMetrics,
  OperationSnapshotPanel,
  OperationSnapshotWaterfall,
  OperationTicketRibbon,
  OperationWorksheetSection,
  compositeFieldClassName,
  computeAmountFromRate,
  formFieldPrefixClassName,
  formInputClassName,
  inferRatePercent,
  operationFormShellClassName,
  operationWorksheetCardClassName,
  operationWorksheetPaneClassName,
  snapshotRowGridClassName,
  type OperationCostEntryMode,
  type PricingValueMode,
  type WaterfallLine,
} from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

const REFUND_COST_ENTRY_HINTS: Record<OperationCostEntryMode, string> = {
  inclusive: 'Enter the full refund amount from the airline in one field (taxes included).',
  exclusive: 'Split into fare refund, tax refund, airline penalty, and supplier fees.',
}

interface RefundTicketFormProps {
  ticket: FlightTicket
  partial?: boolean
  seed?: RefundTransactionData
  onSubmit: (data: RefundTransactionData) => void
  onValidityChange?: (valid: boolean) => void
}

type RefundChargeKey = 'airlinePenalty' | 'supplierFees' | 'agencyFees'

function buildRefundWaterfallLines(
  refundAmount: number,
  fareRefund: number,
  taxRefund: number,
  mode: OperationCostEntryMode,
  charges: Pick<RefundTransactionData, 'airlinePenalty' | 'supplierFees' | 'agencyFees'>,
  profitLoss: number,
): WaterfallLine[] {
  const steps: WaterfallLine[] = []

  if (mode === 'exclusive') {
    if (fareRefund !== 0) {
      steps.push({
        id: 'fare',
        label: 'Fare refund',
        amount: fareRefund,
        tone: 'credit',
        signed: true,
        kind: 'step',
      })
    }
    if (taxRefund !== 0) {
      steps.push({
        id: 'tax',
        label: 'Tax refund',
        amount: taxRefund,
        tone: 'credit',
        signed: true,
        kind: 'step',
      })
    }
  } else if (refundAmount !== 0) {
    steps.push({
      id: 'gross',
      label: 'Gross refund from airline',
      amount: refundAmount,
      tone: 'credit',
      signed: true,
      kind: 'step',
    })
  }

  if (charges.airlinePenalty > 0) {
    steps.push({
      id: 'penalty',
      label: 'Airline penalty',
      amount: charges.airlinePenalty,
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

function useRefundChargeField(initialEnabled: boolean, initialValue: number, baseForPercent: number) {
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

function RefundDateField({
  value,
  onChange,
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
}) {
  return (
    <div className={compositeFieldClassName}>
      <span className={formFieldPrefixClassName}>Date</span>
      <div className="min-w-0 flex-1">
        <EmbeddedFormDatePicker
          value={value}
          onChange={onChange}
          aria-label={ariaLabel}
          inputClassName={cn(formInputClassName, 'pr-7 pl-2 tabular-nums')}
        />
      </div>
    </div>
  )
}

export function RefundTicketForm({ ticket, partial = false, seed, onSubmit, onValidityChange }: RefundTicketFormProps) {
  const today = new Date().toISOString().slice(0, 10)
  const currency = ticket.pricing.currency
  const supplierCostBase = ticket.pricing.supplierCost
  const maxRefundable = getRemainingRefundableAmount(ticket)

  const { values, set } = useOperationForm(
    seed ?? {
      refundRequestDate: today,
      refundProcessedDate: today,
      refundAmount: partial ? Math.min(maxRefundable, ticket.pricing.sellingPrice / 2) : maxRefundable,
      airlinePenalty: 0,
      supplierFees: 0,
      agencyFees: 0,
      netRefund: 0,
      profitLoss: 0,
      status: 'processed' as const,
      notes: '',
    },
    seed ? `seed-${ticket.id}` : ticket.id,
  )

  const penaltyField = useRefundChargeField(false, 0, supplierCostBase)
  const supplierField = useRefundChargeField(false, 0, supplierCostBase)
  const agencyField = useRefundChargeField(false, 0, supplierCostBase)
  const [taxRefund, setTaxRefund] = useState(0)
  const [refundCostMode, setRefundCostMode] = useState<OperationCostEntryMode>('inclusive')

  const handleRefundCostModeChange = (mode: OperationCostEntryMode) => {
    if (mode === refundCostMode) return
    if (mode === 'inclusive') {
      set('refundAmount', roundCurrency(values.refundAmount + taxRefund))
      setTaxRefund(0)
      set('airlinePenalty', 0)
      set('supplierFees', 0)
      penaltyField.setEnabled(false)
      supplierField.setEnabled(false)
    }
    setRefundCostMode(mode)
  }

  const resolvedRefundAmount = useMemo(
    () =>
      refundCostMode === 'inclusive'
        ? values.refundAmount
        : roundCurrency(values.refundAmount + taxRefund),
    [refundCostMode, values.refundAmount, taxRefund],
  )

  const resolvedCharges = useMemo(
    () => ({
      refundAmount: resolvedRefundAmount,
      airlinePenalty:
        refundCostMode === 'exclusive' && penaltyField.enabled ? values.airlinePenalty : 0,
      supplierFees:
        refundCostMode === 'exclusive' && supplierField.enabled ? values.supplierFees : 0,
      agencyFees: agencyField.enabled ? values.agencyFees : 0,
    }),
    [
      resolvedRefundAmount,
      refundCostMode,
      penaltyField.enabled,
      supplierField.enabled,
      agencyField.enabled,
      values.airlinePenalty,
      values.supplierFees,
      values.agencyFees,
    ],
  )

  const preview = useMemo(() => computeRefundPreview(ticket, resolvedCharges), [ticket, resolvedCharges])
  const merged = useMemo(
    () => ({ ...values, ...resolvedCharges, ...preview }),
    [values, resolvedCharges, preview],
  )

  const canSubmit = useMemo(() => validateRefundData(ticket, merged, partial).ok, [ticket, merged, partial])

  useEffect(() => {
    onValidityChange?.(canSubmit)
  }, [canSubmit, onValidityChange])

  const [origin, destination] = parseIssueRoute(ticket)
  const [breakdownOpen, setBreakdownOpen] = useState(false)

  const fareRefund = refundCostMode === 'exclusive' ? values.refundAmount : 0
  const waterfallLines = buildRefundWaterfallLines(
    resolvedRefundAmount,
    fareRefund,
    refundCostMode === 'exclusive' ? taxRefund : 0,
    refundCostMode,
    resolvedCharges,
    preview.profitLoss,
  )
  const hasStepLines = waterfallLines.some((line) => line.kind === 'step')
  const previewReady =
    resolvedRefundAmount > 0 ||
    resolvedCharges.airlinePenalty > 0 ||
    resolvedCharges.supplierFees > 0 ||
    resolvedCharges.agencyFees > 0

  useEffect(() => {
    if (hasStepLines) setBreakdownOpen(true)
  }, [hasStepLines])

  const setAmount = (key: RefundChargeKey, value: number) => {
    set(key, roundCurrency(value))
  }

  const makeEnabledHandler = (field: ReturnType<typeof useRefundChargeField>, key: RefundChargeKey) => {
    return (enabled: boolean) => {
      field.setEnabled(enabled)
      if (!enabled) setAmount(key, 0)
    }
  }

  const makeModeHandler = (
    field: ReturnType<typeof useRefundChargeField>,
    key: RefundChargeKey,
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
    field: ReturnType<typeof useRefundChargeField>,
    key: RefundChargeKey,
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
            <OperationWorksheetSection idPrefix="refund" step="1" title="Refund details">
              <div className="space-y-4">
                <OperationPricingGroup label="Dates">
                  <div className="grid grid-cols-2 gap-3">
                    <OperationFieldCompact label="Request date">
                      <RefundDateField
                        value={values.refundRequestDate}
                        onChange={(v) => set('refundRequestDate', v)}
                        ariaLabel="Refund request date"
                      />
                    </OperationFieldCompact>
                    <OperationFieldCompact label="Processed date">
                      <RefundDateField
                        value={values.refundProcessedDate ?? today}
                        onChange={(v) => set('refundProcessedDate', v)}
                        ariaLabel="Refund processed date"
                      />
                    </OperationFieldCompact>
                  </div>
                </OperationPricingGroup>
                {partial ? (
                  <p className="text-[12px] text-[var(--color-muted)]">
                    Partial refund — max refundable: {currency} {maxRefundable.toFixed(2)}
                  </p>
                ) : (
                  <p className="text-[12px] text-[var(--color-muted)]">
                    Remaining refundable: {currency} {maxRefundable.toFixed(2)}
                  </p>
                )}
              </div>
            </OperationWorksheetSection>

            <OperationWorksheetSection idPrefix="refund" step="2" title={`Pricing · ${currency}`}>
              <div className="space-y-4">
                <OperationPricingGroup label="Refund from airline">
                  <OperationCostEntryModeField
                    question="Airline refund includes taxes"
                    value={refundCostMode}
                    onChange={handleRefundCostModeChange}
                    hints={REFUND_COST_ENTRY_HINTS}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {refundCostMode === 'inclusive' ? (
                      <OperationMoneyFieldCompact
                        className="col-span-2"
                        label={partial ? 'Refund amount (incl. taxes)' : 'Total refund amount (incl. taxes)'}
                        labelClassName="whitespace-nowrap text-[11px] leading-tight"
                        value={values.refundAmount}
                        onChange={(v) => {
                          set('refundAmount', roundCurrency(v))
                          setTaxRefund(0)
                        }}
                        currency={currency}
                      />
                    ) : (
                      <>
                        <OperationMoneyFieldCompact
                          label="Fare refund"
                          value={values.refundAmount}
                          onChange={(v) => set('refundAmount', roundCurrency(v))}
                          currency={currency}
                        />
                        <OperationMoneyFieldCompact
                          label="Tax refund"
                          value={taxRefund}
                          onChange={(v) => setTaxRefund(roundCurrency(v))}
                          currency={currency}
                        />
                        <OperationCostGridQuestionField
                          question="Airline penalty?"
                          ariaLabel="Add airline penalty"
                          amountName="Airline penalty"
                          enabled={penaltyField.enabled}
                          onEnabledChange={makeEnabledHandler(penaltyField, 'airlinePenalty')}
                          mode={penaltyField.mode}
                          onModeChange={makeModeHandler(penaltyField, 'airlinePenalty', supplierCostBase)}
                          value={values.airlinePenalty}
                          ratePercent={penaltyField.ratePercent}
                          onValueChange={(v) => setAmount('airlinePenalty', v)}
                          onRateChange={makeRateHandler(penaltyField, 'airlinePenalty', supplierCostBase)}
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
                      </>
                    )}
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

            <OperationWorksheetSection idPrefix="refund" step="3" title="Notes" defaultExpanded={false}>
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
          title={partial ? 'Partial refund snapshot' : 'Refund snapshot'}
          subtitle="Live economics for this refund"
          currency={currency}
          previewReady={previewReady}
          emptyTitle="No pricing yet"
          emptyDescription="Enter refund amounts to preview the ticket economics."
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
                <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">Profit / loss on ticket</p>
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
            inAmount={resolvedRefundAmount}
            inTitle="Refund from airline"
            inHint="Gross amount credited by airline"
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
