import { Link } from 'react-router-dom'
import { BarChart3, TrendingUp, Wallet, Building2 } from 'lucide-react'
import { Page } from '@/design-system/layout/Page'
import { PageHeader } from '@/design-system/layout/PageHeader'
import { TravelCard } from '@/design-system/layout/TravelCard'
import { CrmPanel } from '@/design-system/layout/CrmPanel'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { TripStageBadge } from '@/features/trips/components/list/TripStageBadge'
import { useReportsData } from '@/features/reports/hooks/use-reports-data'
import { shouldMaskFinancials } from '@/domain/policies/permissions'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { layout } from '@/design-system/tokens/layout'
import { tableCellClass, tableHeadClass } from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'

export function ReportsPage() {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const maskFinancials = shouldMaskFinancials(role)
  const { data, isLoading } = useReportsData()

  return (
    <Page className="min-w-0">
      <PageHeader
        title="Reports"
        description="Cross-trip operational and financial summaries across your portfolio."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BarChart3}
          label="Active trips"
          value={isLoading ? '…' : String(data?.activeTripCount ?? 0)}
          hint={`${data?.tripCount ?? 0} total`}
        />
        <StatCard
          icon={TrendingUp}
          label="Portfolio margin"
          value={maskFinancials ? '••••' : formatAmount(data?.financial.totalMargin)}
          hint="Active trips only"
        />
        <StatCard
          icon={Wallet}
          label="Open receivables"
          value={maskFinancials ? '••••' : formatAmount(data?.financial.openReceivables)}
          hint="Unpaid invoices"
        />
        <StatCard
          icon={Building2}
          label="Supplier exposure"
          value={maskFinancials ? '••••' : formatAmount(data?.financial.supplierExposure)}
          hint="Outstanding payables"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CrmPanel title="Pipeline by stage">
          {isLoading ? (
            <p className="px-4 py-6 text-xs text-[var(--color-muted)]">Loading pipeline…</p>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {(data?.pipeline ?? []).map((row) => (
                <div key={row.stage} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <TripStageBadge stage={row.stage} />
                  <span className="text-sm font-semibold tabular-nums text-[var(--color-foreground)]">{row.count}</span>
                </div>
              ))}
            </div>
          )}
        </CrmPanel>

        <CrmPanel title="Collections & disbursements">
          <div className="grid gap-3 px-4 py-4 sm:grid-cols-2">
            <Metric label="Client receipts" value={maskFinancials ? '••••' : formatAmount(data?.financial.inbound)} />
            <Metric label="Supplier payments" value={maskFinancials ? '••••' : formatAmount(data?.financial.outbound)} />
            <Metric label="Total selling" value={maskFinancials ? '••••' : formatAmount(data?.financial.totalSelling)} />
            <Metric label="Total cost" value={maskFinancials ? '••••' : formatAmount(data?.financial.totalCost)} />
          </div>
        </CrmPanel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <CrmPanel title="Top trips by margin">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-sm">
              <thead>
                <tr>
                  <th className={tableHeadClass('left')}>Trip</th>
                  <th className={tableHeadClass('right')}>Margin</th>
                  <th className={tableHeadClass('center')} aria-label="Open" />
                </tr>
              </thead>
              <tbody>
                {(data?.topTrips ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-xs text-[var(--color-muted)]">
                      No active trips to rank.
                    </td>
                  </tr>
                ) : (
                  data?.topTrips.map((trip) => (
                    <tr key={trip.id} className="border-b border-[var(--color-border)] last:border-0">
                      <td className={tableCellClass('left')}>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{trip.name}</p>
                          <p className="font-mono text-xs text-[var(--color-accent)]">{trip.reference}</p>
                        </div>
                      </td>
                      <td className={tableCellClass('right')}>
                        {maskFinancials ? (
                          '••••'
                        ) : (
                          <AccountingAmount amount={trip.margin} currency={trip.currency} className="min-w-0 justify-end" />
                        )}
                      </td>
                      <td className={tableCellClass('center')}>
                        <Link to={`/trips/${trip.id}/revenue`} className="text-xs font-medium text-[var(--color-accent)] hover:underline">
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CrmPanel>

        <CrmPanel title="Supplier exposure by name">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[24rem] text-sm">
              <thead>
                <tr>
                  <th className={tableHeadClass('left')}>Supplier</th>
                  <th className={tableHeadClass('right')}>Service cost</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topSuppliers ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-xs text-[var(--color-muted)]">
                      No supplier-linked services yet.
                    </td>
                  </tr>
                ) : (
                  data?.topSuppliers.map((row) => (
                    <tr key={row.name} className="border-b border-[var(--color-border)] last:border-0">
                      <td className={tableCellClass('left', { extra: 'truncate font-medium' })} title={row.name}>
                        {row.name}
                      </td>
                      <td className={tableCellClass('right')}>
                        {maskFinancials ? (
                          '••••'
                        ) : (
                          <AccountingAmount amount={row.exposure} currency="EGP" className="min-w-0 justify-end" />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CrmPanel>
      </div>
    </Page>
  )
}

function formatAmount(value: number | undefined) {
  if (value == null) return '—'
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof BarChart3
  label: string
  value: string
  hint: string
}) {
  return (
    <TravelCard contentClassName="px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-muted)]/50 text-[var(--color-accent)]">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className={cn(layout.statLabel, 'mb-1')}>{label}</p>
          <p className="text-base font-semibold text-[var(--color-foreground)]">{value}</p>
          <p className="mt-0.5 text-[10px] text-[var(--color-muted)]">{hint}</p>
        </div>
      </div>
    </TravelCard>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--color-foreground)]">{value}</p>
    </div>
  )
}
