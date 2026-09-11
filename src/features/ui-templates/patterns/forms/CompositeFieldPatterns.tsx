import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { AmountInput } from '@/design-system/components/AmountInput'
import { EmbeddedFormDatePicker } from '@/design-system/components/DatePickerField'
import { Input } from '@/design-system/components/Input'
import {
  OperationCostEntryModeField,
  type OperationCostEntryMode,
} from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'
import {
  compositeFieldClassName,
  formFieldPrefixClassName,
  formInputAmountClassName,
  formInputClassName,
  formInputMonoClassName,
} from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'
import { PatternBlock } from '@/features/ui-templates/patterns/_shared/PatternBlock'
import { cn } from '@/shared/utils/cn'

const COST_ENTRY_HINTS: Record<OperationCostEntryMode, string> = {
  inclusive: 'Tax is included in the supplier cost you enter',
  exclusive: 'Tax is added on top of the supplier cost you enter',
}

export function CompositeFieldPatterns() {
  const [issueDate, setIssueDate] = useState('')
  const [ticketNumber, setTicketNumber] = useState('')
  const [amount, setAmount] = useState(0)
  const [costMode, setCostMode] = useState<OperationCostEntryMode>('inclusive')

  return (
    <div className="space-y-6">
      <PatternBlock
        title="Composite prefix row"
        description="h-8 bordered row with muted prefix label — used in invoices, payments, and ticket operations."
        path="src/features/trips/components/services/flight/operations/operation-worksheet-ui.tsx"
      >
        <div className="max-w-sm space-y-3">
          <div className={compositeFieldClassName}>
            <span className={formFieldPrefixClassName}>Date</span>
            <div className="min-w-0 flex-1">
              <EmbeddedFormDatePicker
                value={issueDate}
                onChange={setIssueDate}
                aria-label="Issue date"
                inputClassName={cn(formInputClassName, 'pr-7 pl-2 tabular-nums')}
              />
            </div>
          </div>

          <div className={compositeFieldClassName}>
            <span className={formFieldPrefixClassName}>
              <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <EmbeddedFormDatePicker
                value={issueDate}
                onChange={setIssueDate}
                aria-label="Service date"
                inputClassName={cn(formInputClassName, 'pr-7 pl-2 tabular-nums')}
              />
            </div>
          </div>

          <div className={compositeFieldClassName}>
            <span className={formFieldPrefixClassName}>Ticket</span>
            <Input
              value={ticketNumber}
              onChange={(event) => setTicketNumber(event.target.value.toUpperCase())}
              placeholder="176-1234567890"
              className={cn(formInputClassName, formInputMonoClassName)}
            />
          </div>

          <div className={compositeFieldClassName}>
            <span className={formFieldPrefixClassName}>Amount</span>
            <AmountInput
              value={amount}
              onChange={setAmount}
              decimals={2}
              className={cn(formInputClassName, formInputAmountClassName)}
            />
          </div>
        </div>
      </PatternBlock>

      <PatternBlock
        title="OperationCostEntryModeField"
        description="Yes/No question with mode-dependent caption — refund, reissue, and issue worksheets."
        path="src/features/trips/components/services/flight/operations/operation-worksheet-ui.tsx — OperationCostEntryModeField"
      >
        <div className="max-w-md">
          <OperationCostEntryModeField
            question="Is supplier tax included in the cost?"
            value={costMode}
            onChange={setCostMode}
            hints={COST_ENTRY_HINTS}
          />
        </div>
      </PatternBlock>
    </div>
  )
}
