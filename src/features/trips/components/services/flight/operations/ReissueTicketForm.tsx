import { useEffect, useMemo, useState } from 'react'
import type { FlightTicket, ReissueTransactionData } from '@/domain/flight/types'
import { computeReissuePreview } from '@/domain/flight/ticket'
import { validateReissueData } from '@/domain/flight/transitions'
import { roundCurrency } from '@/domain/currency'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { cn } from '@/shared/utils/cn'
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
  OperationTicketNumberField,
  OperationTicketRibbon,
  OperationWorksheetSection,
  computeAmountFromRate,
  inferRatePercent,
  operationFormShellClassName,
  operationWorksheetCardClassName,
  operationWorksheetPaneClassName,
  snapshotRowGridClassName,
  type OperationCostEntryMode,
  type PricingValueMode,
  type WaterfallLine,
} from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

const REISSUE_COST_ENTRY_HINTS: Record<OperationCostEntryMode, string> = {
  inclusive: 'Enter the full airline reissue amount in one field (taxes included).',
  exclusive: 'Split into fare difference, tax difference, reissue penalty, and supplier fees.',
}

interface ReissueTicketFormProps {
  ticket: FlightTicket
  seed?: ReissueTransactionData
  onSubmit: (data: ReissueTransactionData) => void
  onValidityChange?: (valid: boolean) => void
}

type ReissueChargeKey = 'fareDifference' | 'taxDifference' | 'reissuePenalty' | 'supplierFees' | 'agencyFees'

function buildReissueWaterfallLines(
  charges: Pick<
    ReissueTransactionData,
    'fareDifference' | 'taxDifference' | 'reissuePenalty' | 'supplierFees' | 'agencyFees'
  >,
  profit: number,
): WaterfallLine[] {
  const steps: WaterfallLine[] = []

  if (charges.fareDifference !== 0) {
    steps.push({
      id: 'fare',
      label: 'Fare difference',
      amount: charges.fareDifference,
      tone: charges.fareDifference >= 0 ? 'credit' : 'debit',
      signed: true,
      showLoss: charges.fareDifference < 0,
      kind: 'step',
    })
  }

  if (charges.taxDifference !== 0) {
    steps.push({
      id: 'tax',
      label: 'Tax difference',
      amount: charges.taxDifference,
      tone: charges.taxDifference >= 0 ? 'credit' : 'debit',
      signed: true,
      showLoss: charges.taxDifference < 0,
      kind: 'step',
    })
  }

  if (charges.reissuePenalty > 0) {
    steps.push({
      id: 'penalty',
      label: 'Reissue penalty',
      amount: charges.reissuePenalty,
      tone: 'credit',
      signed: true,
      kind: 'step',
    })
  }

  if (charges.supplierFees > 0) {
    steps.push({
      id: 'supplier',
      label: 'Supplier fees',
      amount: charges.supplierFees,
      tone: 'credit',
      signed: true,
      kind: 'step',
    })
  }

  if (charges.agencyFees > 0) {
    steps.push({
      id: 'agency',
      label: 'Agency fees',
      amount: charges.agencyFees,
      tone: 'credit',
      signed: true,
      kind: 'step',
    })
  }

  steps.push({
    id: 'net',
    label: 'Net result',
    amount: profit,
    tone: profit >= 0 ? 'credit' : 'debit',
    showLoss: profit < 0,
    kind: 'total',
  })

  return steps
}

function useReissueChargeField(
  initialEnabled: boolean,
  initialValue: number,
  baseForPercent: number,
  allowNegative = false,
) {
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
    allowNegative,
  }
}

export function ReissueTicketForm({ ticket, seed, onSubmit, onValidityChange }: ReissueTicketFormProps) {
  const currency = ticket.pricing.currency
  const supplierCostBase = ticket.pricing.supplierCost

  const { values, set } = useOperationForm(
    seed ?? {
      oldTicketNumber: ticket.ticketNumber,
      newTicketNumber: '',
      fareDifference: 0,
      taxDifference: 0,
      reissuePenalty: 0,
      supplierFees: 0,
      agencyFees: 0,
      amountToCollect: 0,
      amountToPay: 0,
      profit: 0,
      status: 'completed' as const,
      notes: '',
    },
    seed ? `seed-${ticket.id}` : ticket.id,
  )

  const penaltyField = useReissueChargeField(false, 0, supplierCostBase)
  const supplierField = useReissueChargeField(false, 0, supplierCostBase)
  const agencyField = useReissueChargeField(false, 0, supplierCostBase)
  const [reissueCostMode, setReissueCostMode] = useState<OperationCostEntryMode>(() =>
    values.taxDifference !== 0 ? 'exclusive' : 'inclusive',
  )

  const handleReissueCostModeChange = (mode: OperationCostEntryMode) => {
    if (mode === reissueCostMode) return
    if (mode === 'inclusive') {
      set('fareDifference', roundCurrency(values.fareDifference + values.taxDifference))
      set('taxDifference', 0)
      set('reissuePenalty', 0)
      set('supplierFees', 0)
      penaltyField.setEnabled(false)
      supplierField.setEnabled(false)
    }
    setReissueCostMode(mode)
  }

  const resolvedCharges = useMemo(
    () => ({
      fareDifference: values.fareDifference,
      taxDifference: reissueCostMode === 'exclusive' ? values.taxDifference : 0,
      reissuePenalty:
        reissueCostMode === 'exclusive' && penaltyField.enabled ? values.reissuePenalty : 0,
      supplierFees:
        reissueCostMode === 'exclusive' && supplierField.enabled ? values.supplierFees : 0,
      agencyFees: agencyField.enabled ? values.agencyFees : 0,
    }),
    [
      reissueCostMode,
      penaltyField.enabled,
      supplierField.enabled,
      agencyField.enabled,
      values.fareDifference,
      values.taxDifference,
      values.reissuePenalty,
      values.supplierFees,
      values.agencyFees,
    ],
  )

  const preview = useMemo(() => computeReissuePreview(ticket, resolvedCharges), [ticket, resolvedCharges])
  const merged = useMemo(() => ({ ...values, ...resolvedCharges, ...preview }), [values, resolvedCharges, preview])

  const newTicketMissing = !values.newTicketNumber.trim()
  const sameTicketNumber =
    values.newTicketNumber.trim().length > 0 &&
    values.newTicketNumber.trim() === values.oldTicketNumber.trim()

  const canSubmit = useMemo(() => validateReissueData(ticket, merged).ok, [ticket, merged])

  useEffect(() => {
    onValidityChange?.(canSubmit)
  }, [canSubmit, onValidityChange])

  const [origin, destination] = parseIssueRoute(ticket)
  const [breakdownOpen, setBreakdownOpen] = useState(false)

  const waterfallLines = buildReissueWaterfallLines(resolvedCharges, preview.profit)
  const hasStepLines = waterfallLines.some((line) => line.kind === 'step')
  const previewReady =
    values.fareDifference !== 0 ||
    values.taxDifference !== 0 ||
    resolvedCharges.reissuePenalty > 0 ||
    resolvedCharges.supplierFees > 0 ||
    resolvedCharges.agencyFees > 0

  useEffect(() => {
    if (hasStepLines) setBreakdownOpen(true)
  }, [hasStepLines])

  const setAmount = (key: ReissueChargeKey, value: number) => {
    set(key, roundCurrency(value))
  }

  const makeEnabledHandler = (field: ReturnType<typeof useReissueChargeField>, key: ReissueChargeKey) => {
    return (enabled: boolean) => {
      field.setEnabled(enabled)
      if (!enabled) setAmount(key, 0)
    }
  }

  const makeModeHandler = (
    field: ReturnType<typeof useReissueChargeField>,
    key: ReissueChargeKey,
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
    field: ReturnType<typeof useReissueChargeField>,
    key: ReissueChargeKey,
    base: number,
  ) => {
    return (rate: number) => {
      field.setRatePercent(rate)
      setAmount(key, computeAmountFromRate(base, rate))
    }
  }

  const profitPositive = preview.profit >= 0

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
            <OperationWorksheetSection idPrefix="reissue" step="1" title="Ticket">
              <div className="space-y-4">
                <OperationPricingGroup label="Ticket details">
                  <div className="grid grid-cols-2 gap-3">
                    <OperationFieldCompact label="Current ticket">
                      <OperationTicketNumberField value={values.oldTicketNumber} readOnly />
                    </OperationFieldCompact>
                    <OperationFieldCompact label="New ticket">
                      <OperationTicketNumberField
                        value={values.newTicketNumber}
                        onChange={(v) => set('newTicketNumber', v)}
                        invalid={newTicketMissing || sameTicketNumber}
                        placeholder="176-1234567891"
                      />
                    </OperationFieldCompact>
                  </div>
                  {sameTicketNumber ? (
                    <p className="mt-2 text-[12px] text-[var(--color-warning)]">
                      New ticket number must differ from the current number.
                    </p>
                  ) : null}
                </OperationPricingGroup>
              </div>
            </OperationWorksheetSection>

            <OperationWorksheetSection idPrefix="reissue" step="2" title={`Pricing · ${currency}`}>
              <div className="space-y-4">
                <OperationPricingGroup label="Costs paid to airline and supplier">
                  <OperationCostEntryModeField
                    question="Reissue airline cost includes taxes"
                    value={reissueCostMode}
                    onChange={handleReissueCostModeChange}
                    hints={REISSUE_COST_ENTRY_HINTS}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {reissueCostMode === 'inclusive' ? (
                      <OperationMoneyFieldCompact
                        className="col-span-2"
                        label="Total airline reissue cost (incl. taxes)"
                        labelClassName="whitespace-nowrap text-[11px] leading-tight"
                        value={values.fareDifference}
                        onChange={(v) => {
                          setAmount('fareDifference', v)
                          set('taxDifference', 0)
                        }}
                        currency={currency}
                        allowNegative
                      />
                    ) : (
                      <>
                        <OperationMoneyFieldCompact
                          label="Fare difference"
                          value={values.fareDifference}
                          onChange={(v) => setAmount('fareDifference', v)}
                          currency={currency}
                          allowNegative
                        />
                        <OperationMoneyFieldCompact
                          label="Tax difference"
                          value={values.taxDifference}
                          onChange={(v) => setAmount('taxDifference', v)}
                          currency={currency}
                          allowNegative
                        />
                        <OperationCostGridQuestionField
                          question="Reissue penalty?"
                          ariaLabel="Add reissue penalty"
                          amountName="Reissue penalty"
                          enabled={penaltyField.enabled}
                          onEnabledChange={makeEnabledHandler(penaltyField, 'reissuePenalty')}
                          mode={penaltyField.mode}
                          onModeChange={makeModeHandler(penaltyField, 'reissuePenalty', supplierCostBase)}
                          value={values.reissuePenalty}
                          ratePercent={penaltyField.ratePercent}
                          onValueChange={(v) => setAmount('reissuePenalty', v)}
                          onRateChange={makeRateHandler(penaltyField, 'reissuePenalty', supplierCostBase)}
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

            <OperationWorksheetSection idPrefix="reissue" step="3" title="Notes" defaultExpanded={false}>
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
          title="Reissue snapshot"
          subtitle="Live economics for this reissue"
          currency={currency}
          previewReady={previewReady}
          emptyTitle="No pricing yet"
          emptyDescription="Enter reissue charges to preview the ticket economics."
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
              </div>
              <OperationSnapshotAmount
                currency={currency}
                amount={preview.profit}
                tone={profitPositive ? 'credit' : 'debit'}
                size="lg"
              />
            </div>
          </div>

          <OperationSnapshotFlowMetrics
            currency={currency}
            outAmount={preview.amountToPay}
            outTitle="Agency pays"
            outHint="Paid to airline, supplier, or client"
            inAmount={preview.amountToCollect}
            inTitle="Client pays"
            inHint="Amount to collect from client"
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
