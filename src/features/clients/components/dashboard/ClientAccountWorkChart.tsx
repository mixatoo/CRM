import { useId, useMemo } from 'react'
import type { ClientActivityPeriodPoint } from '@/features/clients/utils/client-dashboard-analytics'
import { Skeleton } from '@/design-system/components/Skeleton'
import { useChartPointHover } from '@/features/clients/components/dashboard/client-dashboard-behavior'
import { dashboardPanelMutedClassName, dashboardSegmentButtonClassName, dashboardSegmentedRailClassName } from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'

type ActivityGranularity = 'month' | 'year'
export type ClientAccountWorkChartVariant = 'revenue' | 'trips'

type ChartSize = 'sm' | 'md' | 'lg'

export type { ChartSize }

const CHART_PRESETS: Record<
  ChartSize,
  {
    height: number
    padding: { top: number; right: number; bottom: number; left: number }
    pointStep: number
    minPlotWidth: number
    gridRatios: number[]
    shell: string
    labelOffset: number
    labelClass: string
    barRx: number
    barMax: number
    barMin: number
    lineWidth: number
    activeHalo: number
    activeDot: number
    dot: number
    skeleton: string
  }
> = {
  sm: {
    height: 72,
    padding: { top: 4, right: 4, bottom: 11, left: 4 },
    pointStep: 24,
    minPlotWidth: 200,
    gridRatios: [1],
    shell: 'px-2 py-1',
    labelOffset: 9,
    labelClass: 'text-[8px]',
    barRx: 3,
    barMax: 18,
    barMin: 8,
    lineWidth: 1.75,
    activeHalo: 5,
    activeDot: 3,
    dot: 2.5,
    skeleton: 'h-[4.5rem]',
  },
  md: {
    height: 128,
    padding: { top: 8, right: 6, bottom: 18, left: 6 },
    pointStep: 32,
    minPlotWidth: 220,
    gridRatios: [0.5, 1],
    shell: 'px-2.5 py-1.5',
    labelOffset: 13,
    labelClass: 'text-[9px]',
    barRx: 4,
    barMax: 24,
    barMin: 10,
    lineWidth: 2,
    activeHalo: 6,
    activeDot: 3.5,
    dot: 3,
    skeleton: 'h-[8rem]',
  },
  lg: {
    height: 168,
    padding: { top: 10, right: 8, bottom: 22, left: 8 },
    pointStep: 40,
    minPlotWidth: 320,
    gridRatios: [0.25, 0.5, 0.75, 1],
    shell: 'px-3 py-2',
    labelOffset: 16,
    labelClass: 'text-[9px]',
    barRx: 6,
    barMax: 30,
    barMin: 12,
    lineWidth: 2.25,
    activeHalo: 8,
    activeDot: 4.5,
    dot: 3.5,
    skeleton: 'h-[10.5rem]',
  },
}

interface ClientAccountWorkChartProps {
  monthlySeries: ClientActivityPeriodPoint[]
  yearlySeries: ClientActivityPeriodPoint[]
  currency: string
  maskFinancials?: boolean
  isLoading?: boolean
  granularity?: ActivityGranularity
  variant?: ClientAccountWorkChartVariant
  /** @deprecated use size="md" */
  compact?: boolean
  size?: ChartSize
}

interface ChartPoint extends ClientActivityPeriodPoint {
  x: number
  y: number
  barX: number
  barWidth: number
  barHeight: number
}

function shouldShowChartLabel(index: number, total: number): boolean {
  if (total <= 6) return true
  if (total <= 12) return index % 2 === 0 || index === total - 1
  return index % 3 === 0 || index === total - 1
}

export function ClientAccountWorkChart({
  monthlySeries,
  yearlySeries,
  currency,
  maskFinancials = false,
  isLoading,
  granularity = 'month',
  variant = 'revenue',
  compact,
  size: sizeProp,
}: ClientAccountWorkChartProps) {
  const size: ChartSize = sizeProp ?? (compact === false ? 'lg' : compact === true ? 'md' : 'md')
  const preset = CHART_PRESETS[size]
  const accentGradientId = useId().replace(/:/g, '')
  const series = granularity === 'month' ? monthlySeries : yearlySeries
  const chartHeight = preset.height
  const padding = preset.padding
  const pointStep = preset.pointStep
  const minPlotWidth = preset.minPlotWidth
  const isDense = size !== 'lg'

  const maxValue = useMemo(() => {
    const values = series.map((point) => (variant === 'revenue' ? point.revenue : point.tripCount))
    return Math.max(1, ...values)
  }, [series, variant])

  const hasActivity = series.some((point) => point.tripCount > 0 || point.revenue > 0)
  const barStep = series.length > 0 ? Math.max(minPlotWidth, series.length * pointStep) / series.length : pointStep
  const plotWidth = Math.max(minPlotWidth, series.length * pointStep)
  const plotHeight = chartHeight - padding.top - padding.bottom
  const chartWidth = plotWidth + padding.left + padding.right
  const baseY = padding.top + plotHeight

  const formatRevenue = (value: number) =>
    maskFinancials
      ? '••••'
      : value.toLocaleString(undefined, { maximumFractionDigits: 0 })

  const points = useMemo<ChartPoint[]>(() => {
    if (series.length === 0) return []

    const lineStep = series.length > 1 ? plotWidth / (series.length - 1) : 0

    return series.map((point, index) => {
      const value = variant === 'revenue' ? point.revenue : point.tripCount
      const y = padding.top + plotHeight - (value / maxValue) * plotHeight
      const x = padding.left + (series.length > 1 ? index * lineStep : plotWidth / 2)
      const barWidth = Math.min(preset.barMax, Math.max(preset.barMin, barStep * 0.62))
      const barX = padding.left + index * barStep + (barStep - barWidth) / 2

      return {
        ...point,
        x,
        y,
        barX,
        barWidth,
        barHeight: baseY - y,
      }
    })
  }, [series, plotWidth, plotHeight, maxValue, variant, barStep, baseY, preset.barMax, preset.barMin, padding.top])

  const { activeKey, activePoint, setActiveKey, clearActive } = useChartPointHover(points)

  const linePath = useMemo(() => {
    if (points.length === 0 || variant !== 'trips') return ''
    return `M ${points.map((point) => `${point.x},${point.y}`).join(' L ')}`
  }, [points, variant])

  const chartLabel = variant === 'revenue' ? 'Revenue bar chart' : 'Trip volume line chart'

  if (isLoading) {
    return <ChartSkeleton size={size} />
  }

  if (!hasActivity) {
    return (
      <div className={cn(preset.shell, 'text-center text-[11px] text-[var(--color-muted)]')}>
        No activity in this period.
      </div>
    )
  }

  return (
    <div className={preset.shell} onMouseLeave={clearActive}>
      {isDense && activePoint ? (
        <p className="mb-1 truncate text-[10px] text-[var(--color-muted)]">
          <span className="font-medium text-[var(--color-foreground)]">{activePoint.label}</span>
          {' · '}
          {variant === 'revenue'
            ? `${formatRevenue(activePoint.revenue)} ${currency}`
            : `${activePoint.tripCount} trips`}
        </p>
      ) : null}

      {!isDense ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
          <span className="inline-flex items-center gap-2">
            <span
              className={cn(
                variant === 'revenue' ? 'h-3 w-3 rounded-sm bg-[var(--color-accent)]' : 'h-0.5 w-4 bg-[var(--color-success)]',
              )}
              aria-hidden
            />
            {variant === 'revenue' ? 'Revenue bars' : 'Trip line'}
          </span>
          {activePoint ? (
            <span className="font-medium text-[var(--color-foreground)]">
              {activePoint.label}:{' '}
              {variant === 'revenue'
                ? `${formatRevenue(activePoint.revenue)} ${currency}`
                : `${activePoint.tripCount} trips`}
            </span>
          ) : (
            <span>{variant === 'revenue' ? 'Bar chart' : 'Line chart'}</span>
          )}
        </div>
      ) : null}

      <div className={cn(!isDense && 'rounded-[var(--radius-md)] p-3', !isDense && dashboardPanelMutedClassName, 'overflow-x-auto')}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="block w-full"
          style={{ height: chartHeight, minWidth: chartWidth }}
          role="img"
          aria-label={chartLabel}
        >
          <defs>
            <linearGradient id={accentGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          {preset.gridRatios.map((ratio) => {
            const y = padding.top + plotHeight * (1 - ratio)
            return (
              <line
                key={ratio}
                x1={padding.left}
                x2={chartWidth - padding.right}
                y1={y}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth={1}
                strokeDasharray={ratio === 1 ? undefined : '3 3'}
              />
            )
          })}

          {variant === 'revenue'
            ? points.map((point, index) => {
                const active = activeKey === point.key
                return (
                  <g key={point.key} onMouseEnter={() => setActiveKey(point.key)} className="cursor-pointer">
                    <rect
                      x={point.barX}
                      y={point.y}
                      width={point.barWidth}
                      height={point.barHeight}
                      rx={preset.barRx}
                      fill={active ? `url(#${accentGradientId})` : 'var(--color-accent)'}
                      opacity={active ? 1 : 0.82}
                    />
                    <text
                      x={point.barX + point.barWidth / 2}
                      y={baseY + preset.labelOffset}
                      textAnchor="middle"
                      className={cn('fill-[var(--color-muted)]', preset.labelClass)}
                    >
                      {shouldShowChartLabel(index, points.length) ? point.label : ''}
                    </text>
                  </g>
                )
              })
            : (
              <>
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--color-success)"
                  strokeWidth={preset.lineWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((point, index) => {
                  const active = activeKey === point.key
                  return (
                    <g key={point.key} onMouseEnter={() => setActiveKey(point.key)} className="cursor-pointer">
                      {active ? (
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={preset.activeHalo}
                          className="fill-[var(--color-success-muted)] stroke-[var(--color-success)]"
                          strokeWidth={1.25}
                        />
                      ) : null}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={active ? preset.activeDot : preset.dot}
                        className="fill-[var(--color-surface)] stroke-[var(--color-success)]"
                        strokeWidth={active ? 1.75 : 1.5}
                      />
                      <text
                        x={point.x}
                        y={baseY + preset.labelOffset}
                        textAnchor="middle"
                        className={cn('fill-[var(--color-muted)]', preset.labelClass)}
                      >
                        {shouldShowChartLabel(index, points.length) ? point.label : ''}
                      </text>
                    </g>
                  )
                })}
              </>
            )}
        </svg>
      </div>
    </div>
  )
}

export function ClientAccountWorkChartControls({
  granularity,
  onGranularityChange,
  variant = 'default',
}: {
  granularity: ActivityGranularity
  onGranularityChange: (value: ActivityGranularity) => void
  variant?: 'default' | 'section'
}) {
  return (
    <div
      className={cn(
        'inline-flex',
        variant === 'section'
          ? dashboardSegmentedRailClassName
          : 'rounded-[var(--radius-md)] border border-[var(--color-border)] p-0.5',
      )}
      role="group"
      aria-label="Chart period"
    >
      {(['month', 'year'] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onGranularityChange(value)}
          className={
            variant === 'section'
              ? dashboardSegmentButtonClassName(granularity === value)
              : cn(
                  'rounded-[calc(var(--radius-md)-2px)] px-3 py-1 text-xs font-medium transition-colors',
                  granularity === value
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
                )
          }
        >
          {value === 'month' ? 'Month' : 'Year'}
        </button>
      ))}
    </div>
  )
}

function ChartSkeleton({ size = 'md' }: { size?: ChartSize }) {
  const preset = CHART_PRESETS[size]
  return (
    <div className={preset.shell}>
      <Skeleton className={cn('w-full rounded-[var(--radius-sm)]', preset.skeleton)} />
    </div>
  )
}

export type { ActivityGranularity }
