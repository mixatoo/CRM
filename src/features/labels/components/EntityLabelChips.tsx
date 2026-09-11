import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Label } from '@/domain/entities/label'
import { resolveLabelColorVisual } from '@/domain/entities/label'
import { cn } from '@/shared/utils/cn'

const CHIP_SIZE = 'h-[1.375rem] min-w-0 max-w-[7.5rem]'
const CHIP_GAP_PX = 4

const OVERFLOW_CHIP_CLASS =
  'inline-flex h-[1.375rem] items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-1.5 text-[10px] font-medium text-[var(--color-muted)]'

interface EntityLabelChipsProps {
  labels: Label[]
  maxVisible?: number
  fitContainer?: boolean
  getLabelHref?: (label: Label) => string | undefined
  className?: string
  emptyLabel?: string
  showEmpty?: boolean
  nowrap?: boolean
}

function LabelChip({ label, href }: { label: Label; href?: string }) {
  const visual = resolveLabelColorVisual(label.color)
  const title = label.description ? `${label.name} — ${label.description}` : label.name
  const chipClassName = cn(
    'inline-flex items-center justify-center rounded-[var(--radius-sm)] border px-1.5 text-center text-[10px] font-medium leading-none',
    CHIP_SIZE,
    visual.shell,
    visual.text,
    href && 'cursor-pointer transition-opacity hover:opacity-80',
  )

  if (href) {
    return (
      <Link
        to={href}
        data-label-chip=""
        title={title}
        aria-label={`View records with label ${label.name}`}
        className={chipClassName}
      >
        <span className="truncate">{label.name}</span>
      </Link>
    )
  }

  return (
    <span data-label-chip="" title={title} className={chipClassName}>
      <span className="truncate">{label.name}</span>
    </span>
  )
}

function computeFitVisibleCount(
  containerWidth: number,
  chipWidths: number[],
  measureOverflowWidth: (overflow: number) => number,
): number {
  if (chipWidths.length === 0 || containerWidth <= 0) return chipWidths.length

  const totalWidth =
    chipWidths.reduce((sum, width) => sum + width, 0) + CHIP_GAP_PX * Math.max(chipWidths.length - 1, 0)
  if (totalWidth <= containerWidth) return chipWidths.length

  for (let visible = chipWidths.length - 1; visible >= 1; visible -= 1) {
    const chipsWidth =
      chipWidths.slice(0, visible).reduce((sum, width) => sum + width, 0) +
      CHIP_GAP_PX * Math.max(visible - 1, 0)
    const overflowWidth = measureOverflowWidth(chipWidths.length - visible)
    const rowWidth = chipsWidth + CHIP_GAP_PX + overflowWidth
    if (rowWidth <= containerWidth) return visible
  }

  return 1
}

export function EntityLabelChips({
  labels,
  maxVisible = 2,
  fitContainer = false,
  getLabelHref,
  className,
  emptyLabel = '—',
  showEmpty = true,
  nowrap = false,
}: EntityLabelChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const overflowMeasureRef = useRef<HTMLSpanElement>(null)
  const [fitVisibleCount, setFitVisibleCount] = useState(labels.length)

  useLayoutEffect(() => {
    if (!fitContainer || labels.length === 0) return

    const container = containerRef.current
    const measure = measureRef.current
    const overflowMeasure = overflowMeasureRef.current
    if (!container || !measure || !overflowMeasure) return

    const recompute = () => {
      const chipWidths = Array.from(measure.querySelectorAll('[data-label-chip]')).map(
        (element) => element.getBoundingClientRect().width,
      )

      const nextVisible = computeFitVisibleCount(container.clientWidth, chipWidths, (overflow) => {
        overflowMeasure.textContent = `+${overflow}`
        return overflowMeasure.getBoundingClientRect().width
      })

      setFitVisibleCount((current) => (current === nextVisible ? current : nextVisible))
    }

    recompute()

    const observer = new ResizeObserver(recompute)
    observer.observe(container)

    return () => observer.disconnect()
  }, [fitContainer, labels])

  if (labels.length === 0) {
    if (!showEmpty) return null
    return <span className="text-xs text-[var(--color-subtle)]">{emptyLabel}</span>
  }

  const resolvedMaxVisible = fitContainer ? fitVisibleCount : maxVisible
  const visible = labels.slice(0, resolvedMaxVisible)
  const overflow = labels.length - visible.length

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex min-w-0 items-center gap-1',
        nowrap ? 'flex-nowrap overflow-hidden' : 'flex-wrap',
        className,
      )}
    >
      {fitContainer ? (
        <div
          ref={measureRef}
          className="pointer-events-none invisible absolute left-0 top-0 flex items-center gap-1"
          aria-hidden
        >
          {labels.map((label) => (
            <LabelChip key={label.id} label={label} href={getLabelHref?.(label)} />
          ))}
          <span ref={overflowMeasureRef} className={OVERFLOW_CHIP_CLASS}>
            +0
          </span>
        </div>
      ) : null}

      {visible.map((label) => (
        <LabelChip key={label.id} label={label} href={getLabelHref?.(label)} />
      ))}
      {overflow > 0 ? (
        <span
          className={OVERFLOW_CHIP_CLASS}
          title={labels
            .slice(resolvedMaxVisible)
            .map((label) => label.name)
            .join(', ')}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  )
}
