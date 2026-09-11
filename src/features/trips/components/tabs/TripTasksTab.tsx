import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Circle } from 'lucide-react'
import type { Trip } from '@/domain/entities'
import { tripTotalSelling } from '@/domain/entities/trip'
import { CrmPanel } from '@/design-system/layout/CrmPanel'
import { useTripInvoices } from '@/features/trips/hooks/use-trip-invoices'
import { useTripServices } from '@/features/trips/hooks/use-trip-services'
import { formatInvoiceMoney } from '@/features/trips/utils/invoice-document'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface TripTasksTabProps {
  trip: Trip
}

type TaskPriority = 'high' | 'medium' | 'low'

interface OperationalTask {
  id: string
  title: string
  detail: string
  priority: TaskPriority
  done: boolean
  href?: string
  hrefLabel?: string
}

const PRIORITY_CLASS: Record<TaskPriority, string> = {
  high: 'border-[var(--color-danger)]/30 bg-[var(--color-danger-muted)]/30',
  medium: 'border-[var(--color-warning)]/30 bg-[var(--color-warning-muted)]/25',
  low: 'border-[var(--color-border)] bg-[var(--color-surface)]',
}

export function TripTasksTab({ trip }: TripTasksTabProps) {
  const { data: invoices = [], isLoading: invoicesLoading } = useTripInvoices(trip.id)
  const { data: services = [], isLoading: servicesLoading } = useTripServices(trip.id)

  const tasks = useMemo(() => {
    const items: OperationalTask[] = []
    const base = `/trips/${trip.id}`
    const selling = tripTotalSelling(trip)
    const clientBalance = Math.max(0, selling - (trip.clientPaidAmount ?? 0))

    if (clientBalance > 0.01) {
      items.push({
        id: 'client-balance',
        title: 'Collect outstanding client balance',
        detail: `${formatInvoiceMoney(clientBalance, trip.currency)} remaining on ${formatInvoiceMoney(selling, trip.currency)} selling total.`,
        priority: 'high',
        done: false,
        href: `${base}/payments`,
        hrefLabel: 'Open payments',
      })
    }

    if (trip.supplierBalanceDue > 0.01) {
      items.push({
        id: 'supplier-balance',
        title: 'Settle supplier payables',
        detail: `${formatInvoiceMoney(trip.supplierBalanceDue, trip.currency)} supplier balance due on this trip.`,
        priority: 'high',
        done: false,
        href: `${base}/revenue`,
        hrefLabel: 'Review revenue',
      })
    }

    const draftInvoices = invoices.filter((invoice) => invoice.status === 'draft')
    if (draftInvoices.length > 0) {
      items.push({
        id: 'draft-invoices',
        title: `Send ${draftInvoices.length} draft invoice${draftInvoices.length === 1 ? '' : 's'}`,
        detail: draftInvoices.map((invoice) => invoice.number).join(', '),
        priority: 'medium',
        done: false,
        href: `${base}/documents`,
        hrefLabel: 'Open documents',
      })
    }

    const overdueInvoices = invoices.filter((invoice) => {
      if (invoice.status === 'paid' || invoice.status === 'void') return false
      const due = new Date(invoice.dueDate)
      if (Number.isNaN(due.getTime())) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      due.setHours(0, 0, 0, 0)
      return due < today
    })
    if (overdueInvoices.length > 0) {
      items.push({
        id: 'overdue-invoices',
        title: `Follow up on ${overdueInvoices.length} overdue invoice${overdueInvoices.length === 1 ? '' : 's'}`,
        detail: overdueInvoices.map((invoice) => invoice.number).join(', '),
        priority: 'high',
        done: false,
        href: `${base}/documents`,
        hrefLabel: 'View invoices',
      })
    }

    const proposalServices = services.filter((service) => service.status === 'proposal')
    if (proposalServices.length > 0) {
      items.push({
        id: 'proposal-services',
        title: `Confirm ${proposalServices.length} proposed service${proposalServices.length === 1 ? '' : 's'}`,
        detail: proposalServices
          .slice(0, 4)
          .map((service) => service.name)
          .join(' · ')
          .concat(proposalServices.length > 4 ? '…' : ''),
        priority: 'medium',
        done: false,
        href: `${base}/services`,
        hrefLabel: 'Open services',
      })
    }

    if (trip.stage === 'draft' || trip.stage === 'proposal') {
      items.push({
        id: 'advance-stage',
        title: 'Advance trip pipeline stage',
        detail: `Trip is currently in “${trip.stage}”. Move to the next stage when the proposal is ready.`,
        priority: 'low',
        done: false,
        href: `${base}/dashboard`,
        hrefLabel: 'Dashboard',
      })
    }

    if (items.length === 0) {
      items.push({
        id: 'all-clear',
        title: 'No open operational tasks',
        detail: 'Collections, supplier payables, and service confirmations look up to date for this trip.',
        priority: 'low',
        done: true,
      })
    }

    return items
  }, [invoices, services, trip])

  const openCount = tasks.filter((task) => !task.done).length
  const isLoading = invoicesLoading || servicesLoading

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <CrmPanel title="Operational checklist">
        <p className={cn('border-b border-[var(--color-border)] px-4 py-2.5', layout.caption)}>
          {isLoading
            ? 'Loading trip data…'
            : `${openCount} open item${openCount === 1 ? '' : 's'} · auto-generated from finance and services`}
        </p>
        <ul className="divide-y divide-[var(--color-border)]">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={cn(
                'flex flex-col gap-3 border-l-[3px] px-4 py-3 sm:flex-row sm:items-start sm:justify-between',
                PRIORITY_CLASS[task.priority],
              )}
            >
              <div className="flex min-w-0 gap-3">
                {task.done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                ) : task.priority === 'high' ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-muted)]" />
                )}
                <div className="min-w-0">
                  <div className={cn(layout.entityTitle, 'text-sm')}>{task.title}</div>
                  <p className={cn('mt-1 break-words', layout.caption)}>{task.detail}</p>
                </div>
              </div>
              {task.href && task.hrefLabel ? (
                <Link
                  to={task.href}
                  className="shrink-0 text-xs font-medium text-[var(--color-accent)] hover:underline sm:pt-0.5"
                >
                  {task.hrefLabel}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </CrmPanel>
    </div>
  )
}
