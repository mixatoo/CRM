import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileWarning,
  Plane,
  XCircle,
} from 'lucide-react'
import type { Client } from '@/domain/entities/client'
import type { ClientDashboardMetrics } from '@/features/clients/hooks/use-client-dashboard'
import { Skeleton } from '@/design-system/components/Skeleton'
import { ClientAccountWorkChart } from '@/features/clients/components/dashboard/ClientAccountWorkChart'
import {
  dashboardCrmMetricHintClassName,
  dashboardCrmMetricLabelClassName,
  dashboardCrmMetricValueClassName,
  dashboardCrmPanelSubtitleClassName,
  dashboardCrmPanelTitleClassName,
  dashboardCrmSectionEyebrowClassName,
  dashboardSegmentButtonClassName,
  dashboardSegmentedRailClassName,
} from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'

const DASH = '—'

interface ClientModernDashboardProps {
  client: Client
  metrics?: ClientDashboardMetrics
  isLoading?: boolean
  maskFinancials?: boolean
}

type BriefView = 'attention' | 'activity'
type ControlLens = 'queue' | 'quality' | 'pulse'

interface AttentionItem {
  id: string
  severity: 'high' | 'medium' | 'low'
  title: string
  detail: string
  href: string
  icon: typeof AlertTriangle
  metric: string
}

interface VitalSignal {
  id: string
  title: string
  cue: string
  weight: number
  score: number
  posture: 'steady' | 'soft' | 'tight'
}

interface VitalBoardData {
  score: number
  grade: 'A' | 'B' | 'C' | 'D'
  headline: string
  summary: string
  tone: 'good' | 'fair' | 'risk'
  signals: VitalSignal[]
}

type VitalMode = 'snapshot' | 'mix' | 'drill'

function signalPosture(score: number): VitalSignal['posture'] {
  if (score >= 75) return 'steady'
  if (score >= 50) return 'soft'
  return 'tight'
}

function computeVitalBoard(metrics?: ClientDashboardMetrics): VitalBoardData {
  if (!metrics) {
    return {
      score: 0,
      grade: 'D',
      headline: 'Unscored',
      summary: 'Not enough ledger activity to grade this account yet.',
      tone: 'fair',
      signals: [],
    }
  }

  const collection = metrics.collectionRatePercent ?? 0
  const win = metrics.winRatePercent ?? 50
  const outstandingPressure =
    metrics.totalRevenue > 0
      ? Math.max(0, 100 - (metrics.outstandingBalance / metrics.totalRevenue) * 100)
      : metrics.outstandingBalance > 0
        ? 40
        : 100
  const invoiceHealth =
    metrics.openInvoices + metrics.closedInvoices > 0
      ? (metrics.closedInvoices / (metrics.openInvoices + metrics.closedInvoices)) * 100
      : 70
  const bookingHealth =
    metrics.confirmedBookings + metrics.cancelledBookings > 0
      ? (metrics.confirmedBookings / (metrics.confirmedBookings + metrics.cancelledBookings)) * 100
      : 70

  const signals: VitalSignal[] = [
    {
      id: 'cash',
      title: 'Cash intake',
      cue: 'How reliably billed amounts convert to collected cash.',
      weight: 0.3,
      score: collection,
      posture: signalPosture(collection),
    },
    {
      id: 'close',
      title: 'Close rate',
      cue: 'Share of trip opportunities that finish as won work.',
      weight: 0.2,
      score: win,
      posture: signalPosture(win),
    },
    {
      id: 'exposure',
      title: 'Open exposure',
      cue: 'Outstanding balance pressure relative to lifetime revenue.',
      weight: 0.25,
      score: outstandingPressure,
      posture: signalPosture(outstandingPressure),
    },
    {
      id: 'billing',
      title: 'Billing closeout',
      cue: 'Closed invoices versus the open billing queue.',
      weight: 0.15,
      score: invoiceHealth,
      posture: signalPosture(invoiceHealth),
    },
    {
      id: 'service',
      title: 'Service hold',
      cue: 'Confirmed bookings held versus cancelled service lines.',
      weight: 0.1,
      score: bookingHealth,
      posture: signalPosture(bookingHealth),
    },
  ]

  const score = Math.round(signals.reduce((sum, s) => sum + s.score * s.weight, 0))
  const tone = score >= 75 ? 'good' : score >= 50 ? 'fair' : 'risk'
  const grade: VitalBoardData['grade'] =
    score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D'
  const headline =
    tone === 'good' ? 'Stable account' : tone === 'fair' ? 'Needs steering' : 'Pressure rising'
  const weakest = [...signals].sort((a, b) => a.score - b.score)[0]
  const summary =
    tone === 'good'
      ? 'Core commercial signals are holding. Keep the current operating rhythm.'
      : weakest
        ? `${weakest.title} is the softest lever right now — prioritize that lane first.`
        : 'Review commercial posture before expanding exposure.'

  return { score, grade, headline, summary, tone, signals }
}

function buildAttention(
  metrics: ClientDashboardMetrics | undefined,
  currency: string,
  base: string,
  mask: boolean,
  money: (v: number | undefined) => string,
): AttentionItem[] {
  const outstanding = metrics?.outstandingBalance ?? 0
  const openInvoices = metrics?.openInvoices ?? 0
  const openTrips = metrics?.openTrips ?? 0
  const cancelled = metrics?.cancelledBookings ?? 0
  const confirmed = metrics?.confirmedBookings ?? 0
  const bookingTotal = confirmed + cancelled
  const cancelRate = bookingTotal > 0 ? Math.round((cancelled / bookingTotal) * 100) : 0

  return [
    {
      id: 'outstanding',
      severity: outstanding <= 0 ? 'low' : outstanding > (metrics?.totalCollected ?? 0) ? 'high' : 'medium',
      title: 'Outstanding balance',
      metric:
        outstanding <= 0
          ? 'Clear'
          : mask
            ? '••••'
            : `${money(outstanding)} ${currency}`,
      detail: outstanding <= 0 ? 'No balance due' : 'Still due on open invoices',
      href: `${base}/invoices`,
      icon: CircleDollarSign,
    },
    {
      id: 'open-invoices',
      severity: openInvoices <= 0 ? 'low' : openInvoices >= 3 ? 'high' : 'medium',
      title: 'Open invoices',
      metric: String(openInvoices),
      detail: openInvoices <= 0 ? 'All invoices settled' : 'Needs follow-up or payment allocation',
      href: `${base}/invoices`,
      icon: FileWarning,
    },
    {
      id: 'open-trips',
      severity: openTrips <= 0 ? 'low' : openTrips >= 5 ? 'medium' : 'low',
      title: 'Trips in progress',
      metric: String(openTrips),
      detail: openTrips <= 0 ? 'No active trips right now' : 'Active pipeline — keep stages moving',
      href: `${base}/trips`,
      icon: Plane,
    },
    {
      id: 'cancellations',
      severity: cancelled <= 0 ? 'low' : cancelRate >= 25 ? 'high' : 'medium',
      title: 'Cancelled bookings',
      metric: String(cancelled),
      detail:
        cancelled <= 0
          ? 'No cancelled service bookings'
          : cancelRate > 0
            ? `${cancelRate}% of service bookings cancelled`
            : 'Review service cancellations',
      href: `${base}/services`,
      icon: XCircle,
    },
  ]
}

export function ClientModernDashboard({
  client,
  metrics,
  isLoading,
  maskFinancials = false,
}: ClientModernDashboardProps) {
  const [view, setView] = useState<BriefView>('attention')
  const [vitalMode, setVitalMode] = useState<VitalMode>('snapshot')
  const [focusSignal, setFocusSignal] = useState<string | null>(null)
  const [controlLens, setControlLens] = useState<ControlLens>('queue')
  const currency = metrics?.reportingCurrency ?? client.preferredCurrency ?? 'EGP'
  const base = `/clients/${client.id}`

  const formatMoney = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const money = (value: number | undefined) =>
    maskFinancials ? '••••' : value != null ? formatMoney(value) : DASH

  const vital = useMemo(() => computeVitalBoard(metrics), [metrics])

  useEffect(() => {
    setVitalMode('snapshot')
    setFocusSignal(null)
    setControlLens('queue')
  }, [client.id, metrics?.totalRevenue, metrics?.outstandingBalance])

  useEffect(() => {
    if (vitalMode !== 'drill' || vital.signals.length === 0) return
    if (!focusSignal || !vital.signals.some((s) => s.id === focusSignal)) {
      setFocusSignal(vital.signals[0]?.id ?? null)
    }
  }, [vitalMode, vital.signals, focusSignal])

  const attention = useMemo(
    () => buildAttention(metrics, currency, base, maskFinancials, money),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metrics, currency, base, maskFinancials],
  )

  const confirmed = metrics?.confirmedBookings ?? 0
  const cancelled = metrics?.cancelledBookings ?? 0
  const bookingTotal = Math.max(1, confirmed + cancelled)
  const confirmedPct = Math.round((confirmed / bookingTotal) * 100)
  const cancelledPct = Math.round((cancelled / bookingTotal) * 100)
  const hotCount = attention.filter((item) => item.severity === 'high').length

  const chartProps = {
    monthlySeries: metrics?.activityByMonth ?? [],
    yearlySeries: metrics?.activityByYear ?? [],
    currency,
    maskFinancials,
    isLoading,
    granularity: 'month' as const,
    size: 'md' as const,
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-bg)] lg:flex-row">
      {/* Vital column */}
      <aside className="flex max-h-[min(42dvh,16rem)] min-h-0 w-full shrink-0 flex-col overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] sm:max-h-[min(50dvh,20rem)] lg:h-full lg:max-h-none lg:w-[300px] lg:min-w-[280px] lg:max-w-[320px] lg:border-b-0 lg:border-r">
        <VitalBoard
          data={vital}
          mode={vitalMode}
          onModeChange={setVitalMode}
          focusSignal={focusSignal}
          onFocusSignal={setFocusSignal}
          isLoading={isLoading}
        />
      </aside>

      {/* Main brief */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--color-bg)]">
        <div className="z-10 flex shrink-0 flex-col gap-2 border-b border-[var(--color-border)]/75 bg-[var(--color-surface)] px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-4">
          <div className={cn(dashboardSegmentedRailClassName, 'w-full sm:w-auto')} role="tablist" aria-label="Brief view">
            {(
              [
                { id: 'attention', label: 'Needs attention' },
                { id: 'activity', label: 'Activity' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={view === tab.id}
                onClick={() => setView(tab.id)}
                className={cn(dashboardSegmentButtonClassName(view === tab.id), 'min-h-7 flex-1 px-2.5 sm:flex-none')}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]" aria-label="Account shortcuts">
            <Link to={`${base}/trips`} className="inline-flex min-h-7 items-center font-medium text-[var(--color-accent)] hover:underline">
              All trips
            </Link>
            <Link to={`${base}/invoices`} className="inline-flex min-h-7 items-center font-medium text-[var(--color-muted)] hover:text-[var(--color-accent)]">
              Invoices
            </Link>
            <Link to={`${base}/payments`} className="inline-flex min-h-7 items-center font-medium text-[var(--color-muted)] hover:text-[var(--color-accent)]">
              Payments
            </Link>
          </nav>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-[var(--color-bg)]">
          {view === 'attention' ? (
            <div
              key="attention"
              className="animate-fade-in flex h-full min-h-0 flex-col overflow-hidden bg-[var(--color-surface)]"
            >
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)]/75 bg-[var(--color-surface-muted)]/25 px-3 py-2.5 sm:px-4">
                <div className="min-w-0">
                  <p className={dashboardCrmSectionEyebrowClassName}>Control panel</p>
                  <h3 className={dashboardCrmPanelTitleClassName}>Account operations</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {hotCount > 0 ? (
                    <span className="rounded-[var(--radius-sm)] bg-[var(--color-danger-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-danger)]">
                      {hotCount} hot
                    </span>
                  ) : (
                    <span className="rounded-[var(--radius-sm)] bg-[var(--color-success-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-success)]">
                      Clear lane
                    </span>
                  )}
                  <div className={dashboardSegmentedRailClassName} role="tablist" aria-label="Control lens">
                    {(
                      [
                        { id: 'queue', label: 'Queue' },
                        { id: 'quality', label: 'Quality' },
                        { id: 'pulse', label: 'Pulse' },
                      ] as const
                    ).map((lens) => (
                      <button
                        key={lens.id}
                        type="button"
                        role="tab"
                        aria-selected={controlLens === lens.id}
                        onClick={() => setControlLens(lens.id)}
                        className={dashboardSegmentButtonClassName(controlLens === lens.id)}
                      >
                        {lens.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                {controlLens === 'queue' ? (
                  <ul className="grid h-full min-h-0 grid-cols-1 gap-px overflow-hidden bg-[var(--color-border)] sm:grid-cols-2 xl:grid-cols-4">
                    {isLoading
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <li key={i} className="min-h-0 bg-[var(--color-surface)] p-3">
                            <Skeleton className="h-full min-h-[8rem] w-full rounded-[var(--radius-md)]" />
                          </li>
                        ))
                      : attention.map((item, index) => (
                          <ControlQueueCell key={item.id} item={item} index={index} />
                        ))}
                  </ul>
                ) : controlLens === 'quality' ? (
                  <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={dashboardCrmPanelTitleClassName}>Booking quality</h4>
                      <span className={cn(dashboardCrmMetricHintClassName, 'tabular-nums')}>
                        {confirmed + cancelled} services
                      </span>
                    </div>
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]/70 ring-1 ring-inset ring-[var(--color-border)]/50">
                      <div
                        className="h-full bg-[var(--color-success)] transition-[width] duration-500"
                        style={{ width: `${confirmedPct}%` }}
                      />
                      <div
                        className="h-full bg-[var(--color-danger)] transition-[width] duration-500"
                        style={{ width: `${cancelledPct}%` }}
                      />
                    </div>
                    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex min-h-0 flex-col justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]/25 p-4 ring-1 ring-[var(--color-border)]/60">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" aria-hidden />
                          <p className={dashboardCrmMetricLabelClassName}>Confirmed services</p>
                        </div>
                        <p className={cn(dashboardCrmMetricValueClassName, 'mt-2 text-2xl sm:text-3xl')}>
                          {isLoading ? '…' : confirmed}
                        </p>
                        <p className={cn(dashboardCrmMetricHintClassName, 'mt-1 tabular-nums')}>{confirmedPct}%</p>
                      </div>
                      <div className="flex min-h-0 flex-col justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]/25 p-4 ring-1 ring-[var(--color-border)]/60">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-[var(--color-danger)]" aria-hidden />
                          <p className={dashboardCrmMetricLabelClassName}>Cancelled services</p>
                        </div>
                        <p className={cn(dashboardCrmMetricValueClassName, 'mt-2 text-2xl sm:text-3xl')}>
                          {isLoading ? '…' : cancelled}
                        </p>
                        <p className={cn(dashboardCrmMetricHintClassName, 'mt-1 tabular-nums')}>{cancelledPct}%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid h-full min-h-0 grid-cols-2 gap-px overflow-hidden bg-[var(--color-border)] sm:grid-cols-4">
                    <ControlPulseCell
                      label="Won trips"
                      value={isLoading ? '…' : String(metrics?.closedTrips ?? 0)}
                      tone="success"
                    />
                    <ControlPulseCell
                      label="Lost trips"
                      value={isLoading ? '…' : String(metrics?.lostTrips ?? 0)}
                      tone="danger"
                    />
                    <ControlPulseCell
                      label="Win rate"
                      value={
                        isLoading
                          ? '…'
                          : metrics?.winRatePercent == null
                            ? DASH
                            : `${metrics.winRatePercent.toFixed(0)}%`
                      }
                      tone="accent"
                    />
                    <ControlPulseCell
                      label="Collected"
                      value={isLoading ? '…' : money(metrics?.totalCollected)}
                      hint={currency}
                      tone="neutral"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              key="activity"
              className="animate-fade-in flex h-full min-h-0 flex-col overflow-hidden bg-[var(--color-surface)]"
            >
              <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)] px-3 py-2.5 sm:px-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Last 12 months</h3>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    Revenue bars and trip volume for this account
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-muted)]">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  Monthly
                </span>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-px overflow-hidden bg-[var(--color-border)] xl:grid-cols-2">
                <div className="flex min-h-0 flex-col overflow-hidden bg-[var(--color-surface)]">
                  <div className="shrink-0 border-b border-[var(--color-border)] px-3 py-2 sm:px-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]">
                      Revenue
                    </p>
                  </div>
                  <div className="min-h-0 flex-1 overflow-auto px-2 py-3 sm:px-3">
                    <ClientAccountWorkChart {...chartProps} variant="revenue" />
                  </div>
                </div>

                <div className="flex min-h-0 flex-col overflow-hidden bg-[var(--color-surface)]">
                  <div className="shrink-0 border-b border-[var(--color-border)] px-3 py-2 sm:px-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]">
                      Trip starts
                    </p>
                  </div>
                  <div className="min-h-0 flex-1 overflow-auto px-2 py-3 sm:px-3">
                    <ClientAccountWorkChart {...chartProps} variant="trips" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
    </div>
  )
}

function VitalBoard({
  data,
  mode,
  onModeChange,
  focusSignal,
  onFocusSignal,
  isLoading,
}: {
  data: VitalBoardData
  mode: VitalMode
  onModeChange: (mode: VitalMode) => void
  focusSignal: string | null
  onFocusSignal: (id: string) => void
  isLoading?: boolean
}) {
  const active = focusSignal ? data.signals.find((s) => s.id === focusSignal) ?? null : null
  const weakest = useMemo(
    () => [...data.signals].sort((a, b) => a.score - b.score)[0] ?? null,
    [data.signals],
  )
  const strongest = useMemo(
    () => [...data.signals].sort((a, b) => b.score - a.score)[0] ?? null,
    [data.signals],
  )
  const toneText =
    data.tone === 'good'
      ? 'text-[var(--color-success)]'
      : data.tone === 'fair'
        ? 'text-[var(--color-warning)]'
        : 'text-[var(--color-danger)]'
  const toneBadge =
    data.tone === 'good'
      ? 'bg-[var(--color-success-muted)] text-[var(--color-success)]'
      : data.tone === 'fair'
        ? 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]'
        : 'bg-[var(--color-danger-muted)] text-[var(--color-danger)]'
  const modes: Array<{ id: VitalMode; label: string }> = [
    { id: 'snapshot', label: 'Snap' },
    { id: 'mix', label: 'Mix' },
    { id: 'drill', label: 'Drill' },
  ]

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden border-0 bg-[var(--color-surface)]">
      <div className="shrink-0 border-b border-[var(--color-border)]/75 bg-[var(--color-surface-muted)]/25 px-3 pb-3 pt-3 sm:px-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={dashboardCrmSectionEyebrowClassName}>Vital board</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-10 w-16" />
            ) : (
              <div className="mt-1.5 flex items-end gap-2.5">
                <span className={cn('text-2xl font-bold leading-none tabular-nums tracking-tight sm:text-3xl', toneText)}>
                  {data.grade}
                </span>
                <div className="pb-0.5">
                  <p className={cn(dashboardCrmMetricValueClassName, 'text-sm')}>
                    {data.score}
                    <span className="font-medium text-[var(--color-muted)]">/100</span>
                  </p>
                  <p className={cn(dashboardCrmPanelSubtitleClassName, 'mt-0')}>{data.headline}</p>
                </div>
              </div>
            )}
          </div>
          <span
            className={cn(
              'rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.07em]',
              toneBadge,
            )}
          >
            {isLoading ? '…' : data.tone === 'good' ? 'Clear' : data.tone === 'fair' ? 'Watch' : 'Alert'}
          </span>
        </div>

        <div className={cn(dashboardSegmentedRailClassName, 'mt-3 w-full')} role="tablist" aria-label="Vital board mode">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={mode === item.id}
              onClick={() => onModeChange(item.id)}
              className={cn(dashboardSegmentButtonClassName(mode === item.id), 'min-h-7 flex-1')}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
            <Skeleton className="min-h-0 flex-1 w-full rounded-[var(--radius-md)]" />
            <Skeleton className="min-h-0 flex-1 w-full rounded-[var(--radius-md)]" />
          </div>
        ) : mode === 'snapshot' ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-3">
            <p className={cn(dashboardCrmPanelSubtitleClassName, 'mt-0 leading-relaxed')}>{data.summary}</p>
            <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
              <div className="flex min-h-0 flex-col justify-between rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]/25 p-2.5 ring-1 ring-[var(--color-border)]/60">
                <p className={dashboardCrmMetricLabelClassName}>Strongest</p>
                <div>
                  <p className="truncate text-[11px] font-medium text-[var(--color-foreground)]">
                    {strongest?.title ?? DASH}
                  </p>
                  <p className={cn(dashboardCrmMetricValueClassName, 'mt-0.5 text-sm text-[var(--color-accent)]')}>
                    {strongest ? Math.round(strongest.score) : DASH}
                  </p>
                </div>
              </div>
              <div className="flex min-h-0 flex-col justify-between rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]/25 p-2.5 ring-1 ring-[var(--color-border)]/60">
                <p className={dashboardCrmMetricLabelClassName}>Softest</p>
                <div>
                  <p className="truncate text-[11px] font-medium text-[var(--color-foreground)]">
                    {weakest?.title ?? DASH}
                  </p>
                  <p className={cn(dashboardCrmMetricValueClassName, 'mt-0.5 text-sm text-[var(--color-warning)]')}>
                    {weakest ? Math.round(weakest.score) : DASH}
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (weakest) {
                  onFocusSignal(weakest.id)
                  onModeChange('drill')
                }
              }}
              className="mt-auto inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)]/80 bg-[var(--color-surface)] px-3 py-2 text-[11px] font-medium text-[var(--color-foreground)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
            >
              Drill softest signal
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        ) : mode === 'mix' ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-3">
            <p className="shrink-0 text-xs text-[var(--color-muted)]">
              Composition of the vital grade by weighted contribution.
            </p>
            <div className="flex h-2 shrink-0 overflow-hidden rounded-full bg-[var(--color-surface-muted)] ring-1 ring-inset ring-[var(--color-border)]/50">
              {data.signals.map((signal, index) => {
                const share = Math.max(4, Math.round(signal.score * signal.weight))
                const fills = [
                  'bg-[var(--color-accent)]',
                  'bg-[var(--color-success)]',
                  'bg-[var(--color-warning)]',
                  'bg-[var(--color-accent)]/45',
                  'bg-[var(--color-danger)]',
                ]
                return (
                  <button
                    key={signal.id}
                    type="button"
                    title={signal.title}
                    onClick={() => {
                      onFocusSignal(signal.id)
                      onModeChange('drill')
                    }}
                    className={cn('h-full transition-opacity hover:opacity-80', fills[index % fills.length])}
                    style={{ width: `${share}%` }}
                    aria-label={`${signal.title} mix`}
                  />
                )
              })}
            </div>
            <ul className="flex min-h-0 flex-1 flex-col justify-between gap-0.5">
              {data.signals.map((signal, index) => {
                const fills = [
                  'bg-[var(--color-accent)]',
                  'bg-[var(--color-success)]',
                  'bg-[var(--color-warning)]',
                  'bg-[var(--color-accent)]/45',
                  'bg-[var(--color-danger)]',
                ]
                return (
                  <li key={signal.id} className="min-h-0 flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        onFocusSignal(signal.id)
                        onModeChange('drill')
                      }}
                      className="flex h-full w-full items-center gap-2 rounded-[var(--radius-md)] px-1.5 py-1 text-left transition-colors hover:bg-[var(--color-surface-muted)]/70"
                    >
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', fills[index % fills.length])} />
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--color-foreground)]">
                        {signal.title}
                      </span>
                      <span className="text-[10px] tabular-nums text-[var(--color-muted)]">
                        {(signal.weight * 100).toFixed(0)}%
                      </span>
                      <span className="w-7 text-right text-xs font-semibold tabular-nums text-[var(--color-foreground)]">
                        {Math.round(signal.score)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div
              className="flex min-h-0 flex-1 flex-col justify-between gap-0.5 overflow-y-auto overscroll-contain border-b border-[var(--color-border)] px-2 py-2"
              role="tablist"
              aria-label="Vital signals"
            >
              {data.signals.map((signal, index) => {
                const selected = active?.id === signal.id
                return (
                  <button
                    key={signal.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => onFocusSignal(signal.id)}
                    className={cn(
                      'group flex min-h-0 flex-1 items-center gap-2 rounded-[var(--radius-md)] px-2 py-1 text-left transition-colors',
                      selected
                        ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/20'
                        : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]/80 hover:text-[var(--color-foreground)]',
                    )}
                  >
                    <span
                      className={cn(
                        'w-4 shrink-0 text-[10px] font-medium tabular-nums',
                        selected ? 'text-[var(--color-accent)]/70' : 'text-[var(--color-subtle)]',
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate text-xs font-medium',
                        selected ? 'text-[var(--color-accent)]' : 'text-[var(--color-foreground)]',
                      )}
                    >
                      {signal.title.split(' ')[0]}
                    </span>
                    <span
                      className={cn(
                        'h-1 w-10 overflow-hidden rounded-full',
                        selected ? 'bg-[var(--color-accent)]/20' : 'bg-[var(--color-surface-muted)]',
                      )}
                      aria-hidden
                    >
                      <span
                        className={cn(
                          'block h-full rounded-full transition-[width] duration-300',
                          selected ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-foreground)]/25',
                        )}
                        style={{ width: `${Math.min(100, Math.max(8, signal.score))}%` }}
                      />
                    </span>
                    <span
                      className={cn(
                        'w-6 shrink-0 text-right text-xs font-semibold tabular-nums',
                        selected ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]',
                      )}
                    >
                      {Math.round(signal.score)}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="max-h-[7.5rem] shrink-0 overflow-y-auto overscroll-contain px-3 py-2.5 [scrollbar-gutter:stable]">
              {active ? (
                <div className="animate-fade-in space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={cn(dashboardCrmPanelTitleClassName, 'truncate')}>{active.title}</p>
                    <p className={cn(dashboardCrmMetricValueClassName, 'shrink-0 text-lg text-[var(--color-accent)] sm:text-xl')}>
                      {Math.round(active.score)}
                    </p>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]/70 ring-1 ring-inset ring-[var(--color-border)]/50">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, active.score))}%` }}
                    />
                  </div>

                  <div className={cn('flex items-center justify-between gap-3', dashboardCrmMetricHintClassName)}>
                    <span>
                      Weight{' '}
                      <span className="font-semibold tabular-nums text-[var(--color-foreground)]">
                        {(active.weight * 100).toFixed(0)}%
                      </span>
                    </span>
                    <span>
                      Share{' '}
                      <span className="font-semibold tabular-nums text-[var(--color-foreground)]">
                        +{Math.round(active.score * active.weight)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'font-medium capitalize',
                        active.posture === 'steady'
                          ? 'text-[var(--color-success)]'
                          : active.posture === 'soft'
                            ? 'text-[var(--color-warning)]'
                            : 'text-[var(--color-danger)]',
                      )}
                    >
                      {active.posture}
                    </span>
                  </div>
                </div>
              ) : (
                <p className={dashboardCrmPanelSubtitleClassName}>Pick a signal.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function ControlQueueCell({ item, index }: { item: AttentionItem; index: number }) {
  const Icon = item.icon
  return (
    <li className="min-h-0 bg-[var(--color-surface)]">
      <Link
        to={item.href}
        className="group flex h-full min-h-0 flex-col gap-3 p-3.5 transition-colors hover:bg-[var(--color-surface-muted)]/30 sm:p-4"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={cn(dashboardCrmMetricHintClassName, 'w-5 tabular-nums')}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)]',
                item.severity === 'high'
                  ? 'bg-[var(--color-danger-muted)] text-[var(--color-danger)]'
                  : item.severity === 'medium'
                    ? 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]'
                    : 'bg-[var(--color-success-muted)] text-[var(--color-success)]',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]" aria-hidden />
        </div>
        <div className="mt-auto min-w-0">
          <p className={dashboardCrmMetricLabelClassName}>{item.title}</p>
          <p className={cn(dashboardCrmMetricValueClassName, 'mt-1 text-base sm:text-lg')}>{item.metric}</p>
          <p className={cn(dashboardCrmMetricHintClassName, 'mt-1 line-clamp-2 leading-snug')}>{item.detail}</p>
        </div>
      </Link>
    </li>
  )
}

function ControlPulseCell({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint?: string
  tone: 'success' | 'danger' | 'accent' | 'neutral'
}) {
  const valueClass =
    tone === 'success'
      ? 'text-[var(--color-success)]'
      : tone === 'danger'
        ? 'text-[var(--color-danger)]'
        : tone === 'accent'
          ? 'text-[var(--color-accent)]'
          : 'text-[var(--color-foreground)]'

  return (
    <div className="flex min-h-0 flex-col justify-center bg-[var(--color-surface)] px-3 py-4 sm:px-4 sm:py-5">
      <p className={dashboardCrmMetricLabelClassName}>{label}</p>
      <p className={cn(dashboardCrmMetricValueClassName, 'mt-1.5 text-xl sm:text-2xl', valueClass)}>{value}</p>
      {hint ? <p className={cn(dashboardCrmMetricHintClassName, 'mt-1')}>{hint}</p> : null}
    </div>
  )
}
