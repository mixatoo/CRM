import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/design-system/components/Button'
import type { FlightTicket } from '@/domain/flight/types'
import {
  validateTicketOperation,
  type TicketOperation,
  type TicketOperationContext,
} from '@/domain/flight/transitions'
import { FlightDrawer, FlightModal } from '@/features/trips/components/services/flight/FlightDrawer'
import { IssueTicketForm } from '@/features/trips/components/services/flight/operations/IssueTicketForm'
import { RefundTicketForm } from '@/features/trips/components/services/flight/operations/RefundTicketForm'
import { ReissueTicketForm } from '@/features/trips/components/services/flight/operations/ReissueTicketForm'
import { VoidTicketForm } from '@/features/trips/components/services/flight/operations/VoidTicketForm'
import { CancelTicketForm } from '@/features/trips/components/services/flight/operations/CancelTicketForm'
import { PaymentForm } from '@/features/trips/components/services/flight/operations/PaymentForm'
import { cn } from '@/shared/utils/cn'

export type FlightOperationType = TicketOperation

const OPERATION_CONFIRM_LABELS: Partial<Record<FlightOperationType, string>> = {
  issue: 'Issue ticket',
  void: 'Void ticket',
  refund: 'Confirm refund',
  partial_refund: 'Confirm refund',
  reissue: 'Reissue ticket',
  cancel: 'Cancel ticket',
  client_payment: 'Record payment',
  supplier_payment: 'Record payment',
}

function formatTicketDescription(ticket: FlightTicket): string {
  const parts = [ticket.route?.trim(), ticket.pnr?.trim() && `PNR ${ticket.pnr.trim()}`, ticket.ticketNumber?.trim()]
    .filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : 'Ticket'
}

const OPERATION_TITLES: Record<FlightOperationType, string> = {
  issue: 'Issue Ticket',
  refund: 'Refund Ticket',
  partial_refund: 'Partial Refund',
  reissue: 'Reissue Ticket',
  void: 'Void Ticket',
  cancel: 'Cancel Ticket',
  client_payment: 'Receive Client Payment',
  supplier_payment: 'Pay Supplier',
}

interface FlightOperationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operation: FlightOperationType | null
  ticket: FlightTicket | null
  operationSeed?: unknown
  onConfirm: (operation: FlightOperationType, data: unknown) => void
  isPending?: boolean
  operationContext?: TicketOperationContext
}

function OperationBlockedBanner({ message }: { message: string }) {
  return (
    <div
      className="mb-3 rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-muted)] px-3 py-2 text-xs text-[var(--color-danger)]"
      role="alert"
    >
      {message}
    </div>
  )
}

function OperationFormBody({
  operation,
  ticket,
  operationSeed,
  onConfirm,
  onIssueValidityChange,
  onReissueValidityChange,
  onRefundValidityChange,
  onVoidValidityChange,
  onCancelValidityChange,
  onFormValidityChange,
}: {
  operation: FlightOperationType
  ticket: FlightTicket
  operationSeed?: unknown
  onConfirm: (operation: FlightOperationType, data: unknown) => void
  onIssueValidityChange?: (valid: boolean) => void
  onReissueValidityChange?: (valid: boolean) => void
  onRefundValidityChange?: (valid: boolean) => void
  onVoidValidityChange?: (valid: boolean) => void
  onCancelValidityChange?: (valid: boolean) => void
  onFormValidityChange?: (valid: boolean) => void
}) {
  if (operation === 'issue') {
    return (
      <IssueTicketForm
        ticket={ticket}
        seed={operationSeed as import('@/domain/flight/types').IssueTransactionData | undefined}
        onSubmit={(data) => onConfirm(operation, data)}
        onValidityChange={onIssueValidityChange}
      />
    )
  }
  if (operation === 'refund' || operation === 'partial_refund') {
    return (
      <RefundTicketForm
        ticket={ticket}
        partial={operation === 'partial_refund'}
        seed={operationSeed as import('@/domain/flight/types').RefundTransactionData | undefined}
        onSubmit={(data) => onConfirm(operation, data)}
        onValidityChange={onRefundValidityChange}
      />
    )
  }
  if (operation === 'reissue') {
    return (
      <ReissueTicketForm
        ticket={ticket}
        seed={operationSeed as import('@/domain/flight/types').ReissueTransactionData | undefined}
        onSubmit={(data) => onConfirm(operation, data)}
        onValidityChange={onReissueValidityChange}
      />
    )
  }
  if (operation === 'void') {
    return (
      <VoidTicketForm
        ticket={ticket}
        seed={operationSeed as import('@/domain/flight/types').VoidTransactionData | undefined}
        onSubmit={(data) => onConfirm(operation, data)}
        onValidityChange={onVoidValidityChange}
      />
    )
  }
  if (operation === 'cancel') {
    return (
      <CancelTicketForm
        ticket={ticket}
        seed={operationSeed as import('@/domain/flight/types').CancellationTransactionData | undefined}
        onSubmit={(data) => onConfirm(operation, data)}
        onValidityChange={onCancelValidityChange}
      />
    )
  }
  if (operation === 'client_payment') {
    return (
      <PaymentForm
        ticket={ticket}
        type="client"
        seed={operationSeed as import('@/domain/flight/types').PaymentTransactionData | undefined}
        onSubmit={(data) => onConfirm(operation, data)}
        onValidityChange={onFormValidityChange}
      />
    )
  }
  if (operation === 'supplier_payment') {
    return (
      <PaymentForm
        ticket={ticket}
        type="supplier"
        seed={operationSeed as import('@/domain/flight/types').PaymentTransactionData | undefined}
        onSubmit={(data) => onConfirm(operation, data)}
        onValidityChange={onFormValidityChange}
      />
    )
  }
  return null
}

export function FlightOperationModal({
  open,
  onOpenChange,
  operation,
  ticket,
  operationSeed,
  onConfirm,
  isPending,
  operationContext,
}: FlightOperationModalProps) {
  const [issueCanSubmit, setIssueCanSubmit] = useState(false)
  const [formCanSubmit, setFormCanSubmit] = useState(true)
  const [reissueCanSubmit, setReissueCanSubmit] = useState(false)
  const [refundCanSubmit, setRefundCanSubmit] = useState(false)
  const [voidCanSubmit, setVoidCanSubmit] = useState(false)
  const [cancelCanSubmit, setCancelCanSubmit] = useState(false)

  useEffect(() => {
    if (!open) {
      setIssueCanSubmit(false)
      setFormCanSubmit(true)
      setReissueCanSubmit(false)
      setRefundCanSubmit(false)
      setVoidCanSubmit(false)
      setCancelCanSubmit(false)
    }
  }, [open])

  const operationGate = useMemo(() => {
    if (!operation || !ticket) return null
    return validateTicketOperation(ticket, operation, operationContext)
  }, [operation, ticket, operationContext])

  if (!operation || !ticket) return null

  const title = operationSeed ? `Correct ${OPERATION_TITLES[operation]}` : OPERATION_TITLES[operation]
  const confirmLabel = OPERATION_CONFIRM_LABELS[operation] ?? 'Confirm'
  const blocked = operationGate && !operationGate.ok
  const blockedMessage = blocked ? operationGate.error.message : undefined
  const confirmDisabled =
    isPending ||
    blocked ||
    (operation === 'issue'
      ? !issueCanSubmit
      : operation === 'reissue'
        ? !reissueCanSubmit
        : operation === 'refund' || operation === 'partial_refund'
          ? !refundCanSubmit
          : operation === 'void'
            ? !voidCanSubmit
            : operation === 'cancel'
              ? !cancelCanSubmit
              : !formCanSubmit)

  const footer = (
    <>
      <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
        Cancel
      </Button>
      <Button type="submit" form="flight-op-form" size="sm" disabled={confirmDisabled} title={blockedMessage}>
        {isPending ? 'Saving…' : confirmLabel}
      </Button>
    </>
  )

  const body = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {blockedMessage ? <OperationBlockedBanner message={blockedMessage} /> : null}
      <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden', blocked && 'pointer-events-none opacity-60')}>
        <OperationFormBody
          operation={operation}
          ticket={ticket}
          operationSeed={operationSeed}
          onConfirm={onConfirm}
          onIssueValidityChange={operation === 'issue' ? setIssueCanSubmit : undefined}
          onReissueValidityChange={operation === 'reissue' ? setReissueCanSubmit : undefined}
          onRefundValidityChange={
            operation === 'refund' || operation === 'partial_refund' ? setRefundCanSubmit : undefined
          }
          onVoidValidityChange={operation === 'void' ? setVoidCanSubmit : undefined}
          onCancelValidityChange={operation === 'cancel' ? setCancelCanSubmit : undefined}
          onFormValidityChange={
            operation !== 'issue' &&
            operation !== 'reissue' &&
            operation !== 'refund' &&
            operation !== 'partial_refund' &&
            operation !== 'void' &&
            operation !== 'cancel'
              ? setFormCanSubmit
              : undefined
          }
        />
      </div>
    </div>
  )

  if (
    operation === 'issue' ||
    operation === 'reissue' ||
    operation === 'refund' ||
    operation === 'partial_refund' ||
    operation === 'void' ||
    operation === 'cancel'
  ) {
    return (
      <FlightDrawer
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        footer={footer}
        width="xl"
        embedBody
      >
        {body}
      </FlightDrawer>
    )
  }

  return (
    <FlightModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={formatTicketDescription(ticket)}
      footer={footer}
    >
      {body}
    </FlightModal>
  )
}
